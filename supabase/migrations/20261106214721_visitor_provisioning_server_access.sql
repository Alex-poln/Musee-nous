-- The server may verify invitations; browser roles cannot read this table.
grant select on public.museum_members, public.museum_invitations to service_role;
