/* Supabase auth, cloud saves, player reports and Admin UI.
   Admin operations are routed through a server function that rechecks role. */
(function () {
  "use strict";
  var config = window.APX_SUPABASE_CONFIG || {};
  var configured = Boolean(config.url && config.anonKey);
  var clientPromise = null;
  var client = null;
  var profile = null;
  var admin = false;
  var saveTimer = null;
  var heartbeat = null;
  var pageMessage = "";
  var needsBootstrapChoice = false;
  var selectedPlayer = null;
  var adminData = null;
  var esc = function (value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  var money = function (value) { return window.APXUI.money(Number(value) || 0); };
  function supabase() {
    if (!configured) return Promise.reject(new Error("Chưa cấu hình Supabase."));
    if (!clientPromise) clientPromise = import("https://esm.sh/@supabase/supabase-js@2").then(function (sdk) {
      client = sdk.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      client.auth.onAuthStateChange(function (event, session) {
        if (event === "SIGNED_OUT") { profile = null; admin = false; stopHeartbeat(); window.APXNav.render(); }
        if (event === "SIGNED_IN" && session) { syncAccount(false).catch(showError); }
      });
      return client;
    });
    return clientPromise;
  }
  function stopHeartbeat() { if (heartbeat) window.clearInterval(heartbeat); heartbeat = null; }
  async function markOnline() {
    if (!client || !profile) return;
    var result = await client.from("apx_player_profiles").update({ last_seen_at: new Date().toISOString() }).eq("user_id", profile.user_id);
    if (result.error && result.error.code !== "42501") throw result.error;
  }
  function startHeartbeat() { stopHeartbeat(); markOnline().catch(showError); heartbeat = window.setInterval(function () { markOnline().catch(function () {}); }, 45000); }
  function showError(error) { pageMessage = error && error.message ? error.message : String(error || "Đã xảy ra lỗi."); if (window.APXGame) { window.APXGame.render(); } }
  async function syncAccount(adoptLocal) {
    var db = await supabase();
    var auth = await db.auth.getSession();
    var session = auth.data && auth.data.session;
    if (!session) { profile = null; admin = false; return; }
    var profileResult = await db.from("apx_player_profiles").select("user_id,character_id,display_name,avatar_url,is_banned,last_seen_at,created_at").eq("user_id", session.user.id).single();
    if (profileResult.error) throw profileResult.error;
    profile = profileResult.data;
    if (profile.is_banned) { await db.auth.signOut(); throw new Error("Tài khoản này đang bị khóa. Hãy liên hệ quản trị viên."); }
    var saveResult = await db.from("apx_game_saves").select("game_state,revision,updated_at").eq("user_id", profile.user_id).maybeSingle();
    if (saveResult.error) throw saveResult.error;
    if (saveResult.data && saveResult.data.game_state) {
      needsBootstrapChoice = false;
      window.APXGame.loadCloudState(saveResult.data.game_state);
    } else if (adoptLocal) {
      pageMessage = "Tiến trình hiện tại trên thiết bị đã được chọn để lưu vào tài khoản.";
      await writeSave(window.APXGame.state);
      needsBootstrapChoice = false;
    } else {
      pageMessage = "Tài khoản chưa có bản lưu. Chọn tạo nhân vật mới hoặc nhập tiến trình đang có trên thiết bị này.";
      needsBootstrapChoice = true;
    }
    admin = await verifyAdmin();
    startHeartbeat();
    pageMessage = "Đã kết nối tài khoản và đồng bộ dữ liệu.";
    window.APXNav.render();
    window.APXGame.render();
  }
  async function verifyAdmin() {
    try {
      adminData = await adminCall("overview");
      return true;
    } catch (_) {
      return false;
    }
  }
  async function writeSave(state) {
    if (!client || !profile || !state) return;
    var current = await client.from("apx_game_saves").select("revision").eq("user_id", profile.user_id).maybeSingle();
    if (current.error) throw current.error;
    var revision = current.data ? Number(current.data.revision) || 0 : 0;
    var result = current.data
      ? await client.from("apx_game_saves").update({ game_state: state, revision: revision + 1, updated_at: new Date().toISOString() }).eq("user_id", profile.user_id).eq("revision", revision).select("user_id").maybeSingle()
      : await client.from("apx_game_saves").insert({ user_id: profile.user_id, game_state: state, revision: revision + 1, updated_at: new Date().toISOString() }).select("user_id").maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) throw new Error("Bản lưu vừa được cập nhật ở nơi khác; tải lại trước khi tiếp tục lưu.");
  }
  function queueSave(state) {
    if (!profile || !client) return;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      writeSave(state).then(function () { pageMessage = "Đã lưu lên tài khoản."; }).catch(function (error) { pageMessage = "Lưu lên đám mây lỗi: " + error.message; });
    }, 900);
  }
  async function adminCall(action, payload) {
    var db = await supabase();
    var result = await db.auth.getSession();
    var token = result.data && result.data.session && result.data.session.access_token;
    if (!token) throw new Error("Hãy đăng nhập trước.");
    var response = await fetch(config.url.replace(/\/$/, "") + "/functions/v1/" + encodeURIComponent(config.adminFunction || "apx-admin"), {
      method: "POST", headers: { "Content-Type": "application/json", apikey: config.anonKey, Authorization: "Bearer " + token },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(body.error || "Admin request bị từ chối.");
    return body;
  }
  function card(title, description, body) { return '<section class="panel apx-account-card"><div class="apx-account-card-head"><div><h2>' + title + '</h2><p>' + description + '</p></div></div>' + body + '</section>'; }
  function field(label, name, type, autocomplete, required) { return '<label class="apx-account-field"><span>' + label + '</span><input name="' + name + '" type="' + type + '" autocomplete="' + autocomplete + '" ' + (required ? "required" : "") + '></label>'; }
  function status() { return '<p class="apx-account-status" role="status">' + esc(pageMessage || (configured ? "Chưa đăng nhập. Tiến trình cục bộ vẫn tiếp tục hoạt động." : "Chưa cấu hình Supabase; game đang lưu trên thiết bị này.")) + '</p>'; }
  function authView() {
    return '<div class="page-heading"><span class="eyebrow">TÀI KHOẢN VÀ ĐỒNG BỘ</span><h1>Tài khoản người chơi</h1><p>Đăng ký để lưu nhân vật và tiến trình trên nhiều thiết bị.</p></div>' +
      (configured ? card("Đăng nhập", "Dùng email để khôi phục tiến trình", '<form data-form="login" class="apx-account-form">' + field("Email", "email", "email", "email", true) + field("Mật khẩu", "password", "password", "current-password", true) + '<button class="button button-primary" type="submit">Đăng nhập</button></form>') +
      card("Tạo tài khoản và nhân vật", "Tên nhân vật sẽ được tạo cùng ID duy nhất sau khi đăng ký thành công.", '<form data-form="signup" class="apx-account-form">' + field("Tên nhân vật", "display_name", "text", "nickname", true) + field("Email", "email", "email", "email", true) + field("Mật khẩu (ít nhất 8 ký tự)", "password", "password", "new-password", true) + '<button class="button button-primary" type="submit">Tạo tài khoản</button></form>') :
      card("Sẵn sàng nối Supabase", "Khi bạn có project, điền Project URL và public anon/publishable key trong js/supabase-config.js rồi triển khai migration và Edge Function.", '<a class="button" href="SUPABASE_SETUP.md" target="_blank" rel="noopener">Mở hướng dẫn kết nối</a>')) +
      (profile ? profileView() : "") + status();
  }
  function profileView() {
    if (!profile) return "";
    var avatar = profile.avatar_url ? '<img src="' + esc(profile.avatar_url) + '" alt="Ảnh đại diện">' : '<span>' + esc(profile.display_name.split(/\s+/).map(function (x) { return x[0]; }).slice(-2).join("").toLocaleUpperCase("vi-VN")) + '</span>';
    return (needsBootstrapChoice ? card("Chọn tiến trình cho tài khoản này", "Dữ liệu cục bộ sẽ không bị xóa. Bạn có thể sao chép tiến trình hiện tại lên tài khoản hoặc bắt đầu một game mới.", '<div class="apx-account-actions"><button class="button button-primary" data-action-account="adopt-local">Dùng tiến trình trên thiết bị</button><button class="button" data-action-account="new-game">Tạo game mới</button></div>') : "") + card("Hồ sơ của tôi", "ID nhân vật: " + esc(profile.character_id), '<div class="apx-account-profile"><div class="apx-account-avatar">' + avatar + '</div><div><strong>' + esc(profile.display_name) + '</strong><p>' + esc(profile.user_id) + '</p></div><button class="button" data-action-account="logout">Đăng xuất</button></div>' +
      '<form data-form="profile" class="apx-account-form">' + field("Tên hiển thị", "display_name", "text", "nickname", true) + field("URL ảnh đại diện (tùy chọn)", "avatar_url", "url", "url", false) + '<button class="button" type="submit">Lưu hồ sơ</button></form>');
  }
  function reportsView() {
    return '<div class="page-heading"><span class="eyebrow">AN TOÀN CỘNG ĐỒNG</span><h1>Báo cáo người chơi</h1><p>Gửi nội dung để quản trị viên xem xét.</p></div>' +
      card("Gửi báo cáo", "Chỉ tài khoản đã đăng nhập mới gửi được báo cáo.", '<form data-form="report" class="apx-account-form">' + field("ID người chơi bị báo cáo (nếu biết)", "target_user_id", "text", "off", false) + '<label class="apx-account-field"><span>Lý do</span><select name="category"><option value="harassment">Quấy rối</option><option value="cheating">Gian lận</option><option value="impersonation">Mạo danh</option><option value="other">Khác</option></select></label><label class="apx-account-field"><span>Mô tả</span><textarea name="description" rows="5" minlength="10" maxlength="2000" required></textarea></label><button class="button button-primary" type="submit">Gửi báo cáo</button></form>') + status();
  }
  function playerMarkup(player) {
    if (!player) return '<p>Chọn một tài khoản để xem thông tin.</p>';
    var save = player.game_state || {};
    var company = save.companyOperations || {};
    var inventory = save.inventory || {};
    var inventoryRows = Object.keys(inventory).map(function (id) { return '<div class="apx-admin-asset-row"><span>' + esc(id) + ' · SL ' + esc(inventory[id]) + '</span><form data-form="inventory" class="apx-admin-inline"><input type="hidden" name="item_id" value="' + esc(id) + '"><input type="number" name="delta" min="-1000000" max="1000000" step="1" placeholder="± số lượng" required><button class="button" type="submit">Cập nhật</button></form></div>'; }).join("");
    var assets = (save.character && Array.isArray(save.character.assets) ? save.character.assets : []).map(function (asset) { return '<li>' + esc(asset.name) + ' · ' + money(asset.currentValue) + '</li>'; }).join("");
    return '<div class="apx-admin-player"><h3>' + esc(player.display_name) + '</h3><p>ID tài khoản: ' + esc(player.user_id) + '</p><p>ID nhân vật: ' + esc(player.character_id) + '</p><p>Tiền cá nhân: ' + money(save.cash) + '</p><p>Ngân quỹ công ty: ' + money(save.treasury) + '</p><p>Bất động sản: ' + esc((save.buildings || []).join(", ") || "Chưa có") + '</p><p>Công ty: ' + esc(Object.keys(company.companies || {}).join(", ") || "Chưa có dữ liệu") + '</p><p>Tài sản cá nhân:</p><ul>' + (assets || '<li>Chưa có</li>') + '</ul><p>Trạng thái: <strong>' + (player.is_banned ? "Đang khóa" : "Đang hoạt động") + '</strong></p><h4>Tiền và vật phẩm</h4><div class="apx-admin-actions"><form data-form="cash" class="apx-admin-inline"><input type="number" name="amount" min="-1000000000000" max="1000000000000" step="1" placeholder="± tiền cá nhân" required><button class="button" type="submit">Điều chỉnh</button></form><button class="button" data-action-account="ban" data-user="' + esc(player.user_id) + '" data-banned="' + (!player.is_banned) + '">' + (player.is_banned ? "Mở khóa" : "Khóa tài khoản") + '</button></div><div class="apx-admin-assets">' + (inventoryRows || '<p>Không có vật phẩm trong kho.</p>') + '</div></div>';
  }
  function adminView() {
    return '<div class="page-heading"><span class="eyebrow">QUẢN TRỊ CÓ XÁC THỰC MÁY CHỦ</span><h1>Admin</h1><p>Mỗi yêu cầu đều được Edge Function kiểm tra quyền Admin.</p></div>' +
      '<div class="apx-admin-toolbar"><button class="button button-primary" data-action-account="admin-refresh">Tải số liệu</button><form data-form="player-search"><input name="user_id" placeholder="Dán UUID tài khoản để tìm" required><button class="button" type="submit">Tìm theo ID</button></form></div>' +
      (adminData ? '<div class="apx-admin-stats"><div class="panel"><small>TỔNG TÀI KHOẢN</small><strong>' + (adminData.total_accounts || 0) + '</strong></div><div class="panel"><small>ĐANG ONLINE · 2 PHÚT</small><strong>' + (adminData.online_accounts || 0) + '</strong></div></div>' : "") +
      card("Người chơi gần đây", "Tài khoản mới nhất; bấm xem để mở thông tin", '<div class="apx-admin-list">' + ((adminData && adminData.players) || []).map(function (p) { return '<button type="button" class="apx-admin-player-row" data-action-account="player" data-user="' + esc(p.user_id) + '"><strong>' + esc(p.display_name) + '</strong><small>' + esc(p.user_id) + '</small><span>' + (p.is_banned ? "Đã khóa" : "Hoạt động") + '</span></button>'; }).join("") + '</div>') +
      card("Chi tiết và quản lý", "Tài sản, tiền, trạng thái tài khoản", playerMarkup(selectedPlayer)) +
      card("Báo cáo cần xử lý", "Cập nhật trạng thái báo cáo", '<div class="apx-admin-list">' + (((adminData && adminData.reports) || []).map(function (r) { return '<article class="apx-admin-report"><strong>' + esc(r.category) + ' · ' + esc(r.status) + '</strong><p>' + esc(r.description) + '</p><small>Báo cáo ID ' + esc(r.id) + ' · người chơi ' + esc(r.target_user_id || "chưa xác định") + '</small><div><button class="button" data-action-account="review" data-report="' + esc(r.id) + '" data-status="reviewing">Đang xem xét</button> <button class="button" data-action-account="review" data-report="' + esc(r.id) + '" data-status="resolved">Đã xử lý</button> <button class="button" data-action-account="review" data-report="' + esc(r.id) + '" data-status="rejected">Từ chối</button></div></article>'; }).join("") || '<p>Không có báo cáo.</p>') + '</div>') + status();
  }
  function render(page) {
    if (page === "admin") return admin && profile ? adminView() : authView();
    if (page === "reports") return reportsView();
    return authView();
  }
  function getFormData(form) { return Object.fromEntries(new FormData(form).entries()); }
  async function handleSubmit(event) {
    var form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    var kind = form.dataset.form;
    var data = getFormData(form);
    try {
      pageMessage = "Đang xử lý…"; window.APXGame.render();
      var db = await supabase();
      if (kind === "signup") {
        var name = String(data.display_name || "").trim();
        if (name.length < 2 || name.length > 40) throw new Error("Tên nhân vật cần từ 2 đến 40 ký tự.");
        if (String(data.password).length < 8) throw new Error("Mật khẩu cần ít nhất 8 ký tự.");
        var sign = await db.auth.signUp({ email: data.email, password: data.password, options: { data: { display_name: name } } });
        if (sign.error) throw sign.error;
        if (sign.data.session) { await syncAccount(false); if (!profile) throw new Error("Tài khoản đã tạo; hệ thống đang chờ xác nhận email để cấp hồ sơ."); }
        pageMessage = sign.data.session ? "Đã tạo tài khoản. Chọn tạo tiến trình mới hoặc nhập save hiện có trên thiết bị." : "Đã gửi email xác nhận. Sau khi xác nhận và đăng nhập, nhân vật sẽ được tạo tự động.";
      } else if (kind === "login") {
        var login = await db.auth.signInWithPassword({ email: data.email, password: data.password });
        if (login.error) throw login.error;
        await syncAccount(false);
      } else if (kind === "profile") {
        var displayName = String(data.display_name || "").trim();
        if (displayName.length < 2 || displayName.length > 40) throw new Error("Tên hiển thị cần từ 2 đến 40 ký tự.");
        var updated = await db.from("apx_player_profiles").update({ display_name: displayName, avatar_url: String(data.avatar_url || "").trim() || null }).eq("user_id", profile.user_id).select("*").single();
        if (updated.error) throw updated.error;
        profile = updated.data;
        window.APXGame.state.character.profile.name = displayName; window.APXGame.state.character.profile.initials = displayName.split(/\s+/).slice(-2).map(function (x) { return x[0]; }).join("").toLocaleUpperCase("vi-VN");
        window.APXGame.state.character.profile.avatar = profile.avatar_url || "";
        window.APXGame.save();
        pageMessage = "Đã cập nhật hồ sơ.";
      } else if (kind === "report") {
        if (!profile) throw new Error("Hãy đăng nhập để gửi báo cáo.");
        var target = String(data.target_user_id || "").trim();
        if (target && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target)) throw new Error("ID người chơi phải là UUID hợp lệ.");
        var report = await db.from("apx_player_reports").insert({ reporter_id: profile.user_id, target_user_id: target || null, category: data.category, description: String(data.description || "").trim() });
        if (report.error) throw report.error;
        pageMessage = "Đã gửi báo cáo cho quản trị viên.";
      } else if (kind === "player-search") {
        selectedPlayer = await adminCall("player", { user_id: data.user_id.trim() });
        selectedPlayer = selectedPlayer.player;
      } else if (kind === "cash") {
        var amount = Number(data.amount);
        if (!Number.isSafeInteger(amount)) throw new Error("Số tiền phải là số nguyên an toàn.");
        await adminCall("adjust_cash", { user_id: selectedPlayer.user_id, amount: amount });
        selectedPlayer = (await adminCall("player", { user_id: selectedPlayer.user_id })).player;
        pageMessage = "Đã cập nhật số dư và ghi nhật ký quản trị.";
      } else if (kind === "inventory") {
        var delta = Number(data.delta);
        if (!Number.isSafeInteger(delta)) throw new Error("Số lượng phải là số nguyên.");
        await adminCall("adjust_inventory", { user_id: selectedPlayer.user_id, item_id: data.item_id, delta: delta });
        selectedPlayer = (await adminCall("player", { user_id: selectedPlayer.user_id })).player;
        pageMessage = "Đã cập nhật vật phẩm và ghi nhật ký quản trị.";
      }
    } catch (error) { pageMessage = error.message || "Không thể hoàn thành thao tác."; }
    window.APXGame.render();
  }
  async function handleClick(event) {
    var button = event.target.closest("[data-action-account]");
    if (!button) return;
    var action = button.dataset.actionAccount;
    try {
      if (action === "logout") { var db = await supabase(); await db.auth.signOut(); profile = null; admin = false; pageMessage = "Đã đăng xuất. Tiến trình trên thiết bị vẫn được giữ."; }
      else if (action === "adopt-local") { await syncAccount(true); }
      else if (action === "new-game") { window.APXGame.createAccountState(profile); await writeSave(window.APXGame.state); needsBootstrapChoice = false; pageMessage = "Đã tạo game mới cho tài khoản."; }
      else if (action === "admin-refresh") { adminData = await adminCall("overview"); }
      else if (action === "player") { selectedPlayer = (await adminCall("player", { user_id: button.dataset.user })).player; }
      else if (action === "ban") { await adminCall("set_ban", { user_id: button.dataset.user, banned: button.dataset.banned === "true" }); pageMessage = button.dataset.banned === "true" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản."; adminData = await adminCall("overview"); if (selectedPlayer) selectedPlayer = (await adminCall("player", { user_id: selectedPlayer.user_id })).player; }
      else if (action === "review") { await adminCall("review_report", { report_id: button.dataset.report, status: button.dataset.status, resolution: "Đã cập nhật từ bảng quản trị." }); pageMessage = "Đã cập nhật báo cáo."; adminData = await adminCall("overview"); }
    } catch (error) { pageMessage = error.message || "Thao tác bị từ chối."; }
    window.APXNav.render(); window.APXGame.render();
  }
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("click", handleClick);
  window.APXPages.account = render;
  window.APXAccount = {
    isConfigured: function () { return configured; },
    isAdmin: function () { return admin; },
    queueSave: queueSave,
    sync: syncAccount,
    render: render
  };
  window.APXNav.render();
  if (configured) supabase().then(function (db) { return db.auth.getSession(); }).then(function (result) {
    if (result.data && result.data.session) syncAccount(false).catch(function (error) { pageMessage = error.message; });
  }).catch(function (error) { pageMessage = error.message; });
})();
