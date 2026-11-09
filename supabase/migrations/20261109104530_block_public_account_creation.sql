begin;
create or replace function public.activate_museum_invitation() returns trigger
language plpgsql security definer set search_path='' as $$
declare invited_role text;
begin
 if TG_OP='INSERT' then
   -- Only the Auth admin API can set raw_app_meta_data; user metadata is not trusted.
   if new.email_confirmed_at is null
      or (new.raw_app_meta_data->>'museum_provisioned') is distinct from 'true' then
     raise exception 'Public registration is disabled. An administrator must create museum accounts.';
   end if;
   if not exists(select 1 from public.museum_invitations where email=lower(new.email)) then
     raise exception 'Registration is restricted to invited museum accounts';
   end if;
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
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
commit;
