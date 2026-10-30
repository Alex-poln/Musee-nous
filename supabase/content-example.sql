-- BEISPIEL: Erst die Bilder mit diesen Namen in den privaten Bucket memories laden.
-- Texte hier anpassen und im SQL Editor ausführen. Persönliche Version NICHT committen.
insert into public.memories (title, caption, location, taken_on, image_path, sort_order)
values
 ('Unser Tag in Paris', 'Hier kommt eure persönliche Erinnerung hin.', 'Paris', '2025-06-01', 'paris.jpg', 10),
 ('Mein Lieblingskunstwerk', 'Du. Immer wieder du.', 'Bei dir', null, 'lieblingsfoto.jpg', 20)
on conflict (image_path) do update set title=excluded.title, caption=excluded.caption,
 location=excluded.location, taken_on=excluded.taken_on, sort_order=excluded.sort_order;
-- Das Foto mit der höchsten sort_order hängt am Ehrenplatz am Ende der Galerie.
