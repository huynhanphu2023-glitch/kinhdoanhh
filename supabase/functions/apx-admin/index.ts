import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return reply({ error: "Server environment is incomplete" }, 500);
    const bearer = request.headers.get("Authorization") || "";
    const token = bearer.replace(/^Bearer\s+/i, "");
    if (!token || token === bearer) return reply({ error: "Authentication required" }, 401);
    const authClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return reply({ error: "Invalid session" }, 401);
    const db = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: adminRow, error: adminError } = await db.from("apx_admin_users").select("user_id").eq("user_id", authData.user.id).maybeSingle();
    if (adminError || !adminRow) return reply({ error: "Admin permission required" }, 403);
    const { data: caller } = await db.from("apx_player_profiles").select("is_banned").eq("user_id", authData.user.id).maybeSingle();
    if (caller?.is_banned) return reply({ error: "Admin account is locked" }, 403);
    const input = await request.json();
    const action = String(input.action || "");
    const audit = async (name: string, target: string | null, detail: Record<string, unknown> = {}) => {
      const result = await db.from("apx_admin_audit").insert({ admin_id: authData.user!.id, action: name, target_user_id: target, detail });
      if (result.error) throw result.error;
    };
    const validTarget = () => typeof input.user_id === "string" && uuidPattern.test(input.user_id);

    if (action === "overview") {
      const cutoff = new Date(Date.now() - 120_000).toISOString();
      const [total, online, players, reports] = await Promise.all([
        db.from("apx_player_profiles").select("user_id", { count: "exact", head: true }),
        db.from("apx_player_profiles").select("user_id", { count: "exact", head: true }).gte("last_seen_at", cutoff),
        db.from("apx_player_profiles").select("user_id,character_id,display_name,avatar_url,is_banned,last_seen_at,created_at").order("created_at", { ascending: false }).limit(40),
        db.from("apx_player_reports").select("id,reporter_id,target_user_id,category,description,status,created_at").in("status", ["new", "reviewing"]).order("created_at", { ascending: false }).limit(50)
      ]);
      for (const result of [total, online, players, reports]) if (result.error) throw result.error;
      return reply({ total_accounts: total.count || 0, online_accounts: online.count || 0, players: players.data || [], reports: reports.data || [] });
    }
    if (!validTarget()) return reply({ error: "Valid user_id UUID required" }, 400);
    const targetId = input.user_id as string;
    if (action === "player") {
      const [profileResult, saveResult] = await Promise.all([
        db.from("apx_player_profiles").select("user_id,character_id,display_name,avatar_url,is_banned,last_seen_at,created_at").eq("user_id", targetId).maybeSingle(),
        db.from("apx_game_saves").select("game_state,revision,updated_at").eq("user_id", targetId).maybeSingle()
      ]);
      if (profileResult.error) throw profileResult.error;
      if (saveResult.error) throw saveResult.error;
      if (!profileResult.data) return reply({ error: "Player not found" }, 404);
      await audit("view_player", targetId);
      return reply({ player: { ...profileResult.data, ...(saveResult.data || {}) } });
    }
    if (action === "set_ban") {
      if (typeof input.banned !== "boolean") return reply({ error: "banned must be boolean" }, 400);
      if (targetId === authData.user.id && input.banned) return reply({ error: "Cannot lock your own admin account" }, 400);
      const result = await db.from("apx_player_profiles").update({ is_banned: input.banned }).eq("user_id", targetId).select("user_id").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return reply({ error: "Player not found" }, 404);
      await audit(input.banned ? "ban_player" : "unban_player", targetId);
      return reply({ ok: true });
    }
    if (action === "adjust_cash") {
      if (!Number.isSafeInteger(input.amount) || Math.abs(input.amount) > 1_000_000_000_000) return reply({ error: "Cash amount outside allowed range" }, 400);
      const { data: save, error } = await db.from("apx_game_saves").select("game_state,revision").eq("user_id", targetId).maybeSingle();
      if (error) throw error;
      if (!save) return reply({ error: "Player has no cloud save" }, 404);
      const state = save.game_state as Record<string, unknown>;
      const cash = Number(state.cash) || 0;
      const nextCash = cash + input.amount;
      if (!Number.isSafeInteger(nextCash) || nextCash < 0) return reply({ error: "Cash balance would be invalid" }, 400);
      state.cash = nextCash;
      const updated = await db.from("apx_game_saves").update({ game_state: state, revision: Number(save.revision) + 1, updated_at: new Date().toISOString() }).eq("user_id", targetId).eq("revision", save.revision).select("user_id").maybeSingle();
      if (updated.error) throw updated.error;
      if (!updated.data) return reply({ error: "Save changed concurrently; reload and retry" }, 409);
      await audit("adjust_cash", targetId, { delta: input.amount, resulting_cash: nextCash });
      return reply({ ok: true, cash: nextCash });
    }
    if (action === "adjust_inventory") {
      if (typeof input.item_id !== "string" || !/^[a-z0-9_-]{1,80}$/i.test(input.item_id)) return reply({ error: "Invalid inventory item id" }, 400);
      if (!Number.isSafeInteger(input.delta) || Math.abs(input.delta) > 1_000_000) return reply({ error: "Inventory change outside allowed range" }, 400);
      const { data: save, error } = await db.from("apx_game_saves").select("game_state,revision").eq("user_id", targetId).maybeSingle();
      if (error) throw error;
      if (!save) return reply({ error: "Player has no cloud save" }, 404);
      const state = save.game_state as Record<string, unknown>;
      const inventory = (state.inventory && typeof state.inventory === "object" ? state.inventory : {}) as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(inventory, input.item_id)) return reply({ error: "Item is not in this player's inventory" }, 404);
      const previous = Number(inventory[input.item_id]) || 0;
      const quantity = previous + input.delta;
      if (!Number.isSafeInteger(quantity) || quantity < 0) return reply({ error: "Inventory quantity would be invalid" }, 400);
      inventory[input.item_id] = quantity;
      state.inventory = inventory;
      const updated = await db.from("apx_game_saves").update({ game_state: state, revision: Number(save.revision) + 1, updated_at: new Date().toISOString() }).eq("user_id", targetId).eq("revision", save.revision).select("user_id").maybeSingle();
      if (updated.error) throw updated.error;
      if (!updated.data) return reply({ error: "Save changed concurrently; reload and retry" }, 409);
      await audit("adjust_inventory", targetId, { item_id: input.item_id, delta: input.delta, quantity });
      return reply({ ok: true, quantity });
    }
    if (action === "review_report") {
      if (!uuidPattern.test(String(input.report_id || ""))) return reply({ error: "Valid report_id required" }, 400);
      if (!["reviewing", "resolved", "rejected"].includes(input.status)) return reply({ error: "Invalid report status" }, 400);
      const result = await db.from("apx_player_reports").update({ status: input.status, reviewed_by: authData.user.id, resolution: String(input.resolution || "").slice(0, 2000), updated_at: new Date().toISOString() }).eq("id", input.report_id).select("id,target_user_id,status").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return reply({ error: "Report not found" }, 404);
      await audit("review_report", result.data.target_user_id, { report_id: result.data.id, status: result.data.status });
      return reply({ ok: true });
    }
    return reply({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("APX admin function error", error);
    return reply({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500);
  }
});
