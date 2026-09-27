-- APX account foundation. Creates only APX-prefixed tables and aborts if
-- any target name already exists; this migration never alters or drops old data.
do $$
begin
  if to_regclass('public.apx_player_profiles') is not null
     or to_regclass('public.apx_game_saves') is not null
     or to_regclass('public.apx_player_reports') is not null
     or to_regclass('public.apx_admin_users') is not null
     or to_regclass('public.apx_admin_audit') is not null
     or to_regclass('public.apx_player_profiles_last_seen_idx') is not null
     or to_regclass('public.apx_player_reports_status_created_idx') is not null
     or to_regprocedure('public.apx_provision_player_profile()') is not null then
    raise exception 'An APX account table/function already exists. Stop and inspect the existing schema before applying this migration.';
  end if;
end $$;

create table public.apx_player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  character_id uuid not null unique default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 40),
  avatar_url text,
  is_banned boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.apx_game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  game_state jsonb not null check (jsonb_typeof(game_state) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

create table public.apx_player_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('harassment','cheating','impersonation','other')),
  description text not null check (char_length(description) between 10 and 2000),
  status text not null default 'new' check (status in ('new','reviewing','resolved','rejected')),
  reviewed_by uuid references auth.users(id),
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.apx_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.apx_admin_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references auth.users(id),
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index apx_player_profiles_last_seen_idx on public.apx_player_profiles(last_seen_at desc);
create index apx_player_reports_status_created_idx on public.apx_player_reports(status, created_at desc);

create function public.apx_provision_player_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare chosen_name text;
begin
  chosen_name := nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '');
  if chosen_name is null then chosen_name := 'Người chơi'; end if;
  if char_length(chosen_name) > 40 then chosen_name := left(chosen_name, 40); end if;
  if char_length(chosen_name) < 2 then chosen_name := 'Người chơi'; end if;
  insert into public.apx_player_profiles(user_id, display_name) values (new.id, chosen_name);
  return new;
end;
$$;
create trigger apx_auth_user_profile_created after insert on auth.users
for each row execute function public.apx_provision_player_profile();

create function public.apx_user_can_play()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.apx_player_profiles p where p.user_id = (select auth.uid()) and p.is_banned = false);
$$;

create function public.apx_user_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.apx_admin_users a where a.user_id = (select auth.uid()));
$$;

create function public.apx_profile_not_banned()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.apx_player_profiles p where p.user_id = (select auth.uid()) and not p.is_banned);
$$;

alter table public.apx_player_profiles enable row level security;
alter table public.apx_game_saves enable row level security;
alter table public.apx_player_reports enable row level security;
alter table public.apx_admin_users enable row level security;
alter table public.apx_admin_audit enable row level security;

create policy apx_profile_read_self on public.apx_player_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy apx_profile_update_self on public.apx_player_profiles for update to authenticated using (user_id = (select auth.uid()) and public.apx_profile_not_banned()) with check (user_id = (select auth.uid()) and public.apx_profile_not_banned());
create policy apx_save_read_self on public.apx_game_saves for select to authenticated using (user_id = (select auth.uid()) and public.apx_user_can_play());
create policy apx_save_insert_self on public.apx_game_saves for insert to authenticated with check (user_id = (select auth.uid()) and public.apx_user_can_play());
create policy apx_save_update_self on public.apx_game_saves for update to authenticated using (user_id = (select auth.uid()) and public.apx_user_can_play()) with check (user_id = (select auth.uid()) and public.apx_user_can_play());
create policy apx_report_insert_self on public.apx_player_reports for insert to authenticated with check (reporter_id = (select auth.uid()) and public.apx_user_can_play());
create policy apx_report_read_self on public.apx_player_reports for select to authenticated using (reporter_id = (select auth.uid()));

revoke all on public.apx_admin_users, public.apx_admin_audit from anon, authenticated;
revoke all on function public.apx_provision_player_profile() from public, anon, authenticated;
revoke all on function public.apx_user_can_play() from public, anon, authenticated;
revoke all on function public.apx_user_is_admin() from public, anon, authenticated;
revoke all on function public.apx_profile_not_banned() from public, anon, authenticated;
grant execute on function public.apx_user_can_play() to authenticated;
grant execute on function public.apx_profile_not_banned() to authenticated;
revoke delete on public.apx_player_profiles, public.apx_game_saves, public.apx_player_reports from anon, authenticated;
revoke update on public.apx_game_saves from anon, authenticated;
grant select on public.apx_player_profiles to authenticated;
grant update (display_name, avatar_url, last_seen_at) on public.apx_player_profiles to authenticated;
grant select, insert, update (game_state, revision, updated_at) on public.apx_game_saves to authenticated;
grant select, insert on public.apx_player_reports to authenticated;

-- Assign the first Admin manually after verifying the intended auth UUID:
-- insert into public.apx_admin_users(user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
