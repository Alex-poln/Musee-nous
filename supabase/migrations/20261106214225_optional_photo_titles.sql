begin;
alter table public.memories drop constraint memories_title_check;
alter table public.memories add constraint memories_title_check check (char_length(title) <= 150);
commit;
