-- Für ein NEUES Supabase-Projekt. Im SQL Editor einmal vollständig ausführen.
-- Keine Schlüssel, E-Mails oder Passwörter in dieser Datei speichern.
begin;
create table if not exists public.museum_members (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.museum_members enable row level security;
revoke all on public.museum_members from anon, authenticated;
grant select on public.museum_members to authenticated;
drop policy if exists "members_read_self" on public.museum_members;
create policy "members_read_self" on public.museum_members for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.memories (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 150),
 caption text not null default '',
 location text not null default '',
 taken_on date,
 image_path text not null unique,
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
alter table public.memories enable row level security;
revoke all on public.memories from anon, authenticated;
grant select on public.memories to authenticated;
drop policy if exists "members_read_memories" on public.memories;
create policy "members_read_memories" on public.memories for select to authenticated
 using (exists (select 1 from public.museum_members where user_id = (select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('memories','memories',false,5242880,array['image/jpeg','image/png','image/webp'])
 on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "museum_members_read_photos" on storage.objects;
create policy "museum_members_read_photos" on storage.objects for select to authenticated
 using (bucket_id = 'memories' and exists (select 1 from public.museum_members where user_id = (select auth.uid())));
-- Keine Upload-/Update-/Delete-Rechte für Besucher. Verwaltung nur im Dashboard.
commit;
