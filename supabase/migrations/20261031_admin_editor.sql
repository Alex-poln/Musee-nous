begin;
alter table public.museum_members add column if not exists role text not null default 'viewer' check (role in ('viewer','admin'));
-- Mitgliedschaften bleiben nur serverseitig verwaltbar. Kein Client kann sich hochstufen.
create or replace function public.is_museum_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.museum_members where user_id=(select auth.uid()) and role='admin');
$$;
revoke all on function public.is_museum_admin() from public,anon;
grant execute on function public.is_museum_admin() to authenticated;
create table if not exists public.museum_wings (
 id integer primary key check(id between 1 and 4),
 title text not null check(char_length(title) between 1 and 80)
);
insert into public.museum_wings(id,title) values (1,'Die ersten Kapitel'),(2,'Zusammen unterwegs'),(3,'Unser Sommer'),(4,'Ein Jahr mit dir') on conflict(id) do nothing;
create table if not exists public.museum_exhibitions (
 id uuid primary key default gen_random_uuid(),
 wing_id integer not null references public.museum_wings(id),
 title text not null check(char_length(title) between 1 and 100),
 sort_order integer not null default 0
);
alter table public.memories add column if not exists exhibition_id uuid references public.museum_exhibitions(id);
alter table public.memories add column if not exists frame_index integer check(frame_index between 0 and 11999);
create unique index if not exists memories_exhibition_frame_unique on public.memories(exhibition_id,frame_index);
alter table public.museum_wings enable row level security;
alter table public.museum_exhibitions enable row level security;
revoke all on public.museum_wings, public.museum_exhibitions from anon,authenticated;
grant select,insert,update on public.museum_exhibitions to authenticated;
grant select,update on public.museum_wings to authenticated;
grant insert,update on public.memories to authenticated;
create policy "members_read_wings" on public.museum_wings for select to authenticated using(exists(select 1 from public.museum_members where user_id=(select auth.uid())));
create policy "admins_update_wings" on public.museum_wings for update to authenticated using((select public.is_museum_admin())) with check((select public.is_museum_admin()));
create policy "members_read_exhibitions" on public.museum_exhibitions for select to authenticated using(exists(select 1 from public.museum_members where user_id=(select auth.uid())));
create policy "admins_create_exhibitions" on public.museum_exhibitions for insert to authenticated with check((select public.is_museum_admin()));
create policy "admins_update_exhibitions" on public.museum_exhibitions for update to authenticated using((select public.is_museum_admin())) with check((select public.is_museum_admin()));
create policy "admins_insert_memories" on public.memories for insert to authenticated with check((select public.is_museum_admin()));
create policy "admins_update_memories" on public.memories for update to authenticated using((select public.is_museum_admin())) with check((select public.is_museum_admin()));
create policy "admins_upload_photos" on storage.objects for insert to authenticated with check(bucket_id='memories' and (select public.is_museum_admin()));
-- Nur unreferenzierte Uploads dürfen beim Rollback entfernt werden; ausgestellte Dateien bleiben erhalten.
create policy "admins_cleanup_unused_photos" on storage.objects for delete to authenticated using(bucket_id='memories' and (select public.is_museum_admin()) and not exists(select 1 from public.memories where image_path=name));
commit;
