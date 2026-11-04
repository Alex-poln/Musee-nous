begin;
create table if not exists public.museum_invitations (
 email text primary key check(email=lower(email)),
 role text not null check(role in ('admin','viewer')),
 created_at timestamptz not null default now()
);
alter table public.museum_invitations enable row level security;
revoke all on public.museum_invitations from public,anon,authenticated;
create or replace function public.activate_museum_invitation() returns trigger
language plpgsql security definer set search_path='' as $$
declare invited_role text;
begin
 if TG_OP='INSERT' and not exists(select 1 from public.museum_invitations where email=lower(new.email)) then
   raise exception 'Registration is restricted to invited museum accounts';
 end if;
 if new.email_confirmed_at is not null then
   delete from public.museum_invitations where email=lower(new.email) returning role into invited_role;
   if invited_role is not null then
     insert into public.museum_members(user_id,role) values(new.id,invited_role)
       on conflict(user_id) do update set role=excluded.role;
   end if;
 end if;
 return new;
end; $$;
revoke all on function public.activate_museum_invitation() from public,anon,authenticated;
create trigger activate_invited_museum_account after insert or update of email_confirmed_at,email on auth.users
for each row execute function public.activate_museum_invitation();
commit;
