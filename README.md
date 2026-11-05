# Unser Louvre

## Version 2: ein ganzes Jahr im Museum

Du startest im Louvre-inspirierten Außenhof. Gehe auf den leuchtenden Kreis vor der Pyramide, um die große Eingangshalle zu betreten. Von dort führen vier Richtungen in die Quartale Januar–März, April–Juni, Juli–September und Oktober–Dezember. In jedem Flügel liegen Themenräume. Leuchtende Bodenflächen wechseln den Bereich; der Museumsplan erlaubt direkte Sprünge. Die Architektur ist ein stilisierter eigener Nachbau, kein maßstabsgetreues Louvre-Modell.

Die Demo enthält **320 Bildplätze**, 80 je Quartal. Beginn, Stadion, Mailand, Paris und Schweiz sind beispielhaft zugeordnet. Eure echten Bilder werden automatisch anhand von `taken_on` einem Quartal zugeordnet; `location` benennt die Mini-Ausstellung (z. B. Paris). Ohne Datum landet das Bild in Quartal 1, ohne Ortsangabe in „Unsere Erinnerungen“. Große Themen werden in Räume mit höchstens 12 Bildern aufgeteilt; Flügel zeigen je acht Türen pro Abschnitt. Die Reihenfolge innerhalb der Themen folgt `sort_order`.

Beim Login lädt die App nur die Bildtexte und Metadaten seitenweise. Erst im Themenraum lädt sie maximal zwölf Fotos, mit zwei gleichzeitigen Downloads. Im Browser werden Vorschauen verkleinert, der Cache hält maximal 24 Fotos. Beim Raumwechsel werden die alten 3D-Geometrien und Texturen freigegeben. Originalfotos vor dem Upload trotzdem auf maximal 1600 Pixel verkleinern, damit der Download schnell bleibt. Hunderte Fotos sind strukturell unterstützt; die tatsächliche Leistung hängt vom Gerät und den Bildgrößen ab.


Ein privates, begehbares Fotomuseum als Adventskalender-Geschenk. Louvre-inspirierte Galerie mit Glaspyramide, grünen Wänden, goldenen Rahmen und einem Ehrenplatz für euer Lieblingsfoto. Kein Nachbau des Louvre, keine externen Museumsfotos.

## 1. In zwei Minuten die Demo starten

1. Installiere **Node.js 22.12 oder neuer** (LTS) von https://nodejs.org/.
2. Entpacke die ZIP. Öffne in VS Code den Ordner **musee-nous** (darin liegt `package.json`).
3. Öffne **Terminal → Neues Terminal** und führe nacheinander aus:

```sh
npm install
npm run dev
```

4. Öffne die im Terminal angezeigte lokale Adresse, normalerweise `http://localhost:5173`.
5. Klicke **Demo-Ausstellung entdecken**. Dafür brauchst du kein Supabase.

Zum Beenden im Terminal **Strg+C**. Zum erneuten Start nur `npm run dev` ausführen. `index.html` nicht per Doppelklick öffnen. Die ZIP enthält den Quellcode, nicht `node_modules`; die erste Installation braucht Internet.

**Bedienung:** Standardmäßig läuft die persönliche Figur in Third Person durch das Museum. „Kamera: POV“ wechselt jederzeit in die Ich-Perspektive; beim Öffnen einer Erinnerung verschwindet die Figur automatisch. Handy: Joystick unten links zum Laufen, auf der Galerie wischen zum Umschauen, Foto antippen zum Öffnen. PC: WASD zum Laufen, mit gedrückter Maustaste umschauen; Pfeiltasten oben/unten laufen, links/rechts drehen. In der Fotoansicht kannst du weiterblättern. „Museumsplan“ funktioniert auch ohne 3D. Das Haus-Symbol bringt dich zum Eingang.

## 2. Adminzugang und Einrichtung

Das bestehende Projekt ist eingerichtet. Auf der Website „Zugang anlegen“ wählen, die freigegebene E-Mail und ein eigenes Passwort eingeben, E-Mail bestätigen und anmelden. Registrierungen ohne private Einladung werden abgewiesen. Das Passwort niemals ins Repository schreiben.

Für ein neues Supabase-Projekt zuerst `supabase/setup.sql`, danach die beiden Dateien unter `supabase/migrations/` in zeitlicher Reihenfolge ausführen. E-Mail/Passwort und Registrierungen aktiviert lassen; der Datenbanktrigger beschränkt neue Konten auf `museum_invitations`. Dort ausschließlich im Dashboard die gewünschte E-Mail in Kleinbuchstaben und die Rolle `admin` oder `viewer` eintragen. Nach Bestätigung wird die Einladung verbraucht und die Mitgliedschaft angelegt. Unter Authentication URL Configuration die eigene Website als Site URL setzen.

## 3. Museum direkt gestalten

Nach Admin-Anmeldung „Museum gestalten“ öffnen. Alle vier Gänge lassen sich benennen. Themenräume wie Anfang, Stadion, Mailand, Paris und Schweiz einem Quartal zuordnen, umbenennen oder verschieben. Rahmen in der 3D-Ansicht oder der Rahmenübersicht antippen, Foto auswählen, Titel und Text schreiben und speichern. Nach zwölf belegten Rahmen entsteht der nächste Raum. Bestehende Bilder können ersetzt werden; die frühere Datei bleibt privat als Sicherheitskopie gespeichert.

Uploads werden im Browser auf maximal 1600 Pixel verkleinert. Unterstützt der Browser ein HEIC-Original nicht, als JPEG exportieren. Fotos und persönliche Texte bleiben in Supabase, nicht in GitHub. Nur Admins dürfen Inhalte verändern. Die Demo zeigt weiterhin unabhängige Beispielmotive.

## 4. App mit Supabase verbinden

1. `.env.example` im Projektordner kopieren und die Kopie **`.env`** nennen.
2. Im Supabase-Dashboard unter **Project Settings → API / API Keys** die **Project URL** und den **Publishable Key** kopieren. Ein älterer `anon`-Key funktioniert ebenfalls.
3. In `.env` eintragen:

```dotenv
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=DEIN_PUBLISHABLE_KEY
```

4. Entwicklungsserver mit Strg+C beenden und `npm run dev` erneut starten.
5. Mit dem in Schritt 2 angelegten E-Mail/Passwort einloggen.

**Niemals** `service_role`, einen `sb_secret_...`-Key oder das Datenbankpasswort hier eintragen. Der Publishable/anon-Key wird absichtlich im Browser sichtbar; die Zugriffskontrolle erfolgt durch RLS. Passwörter und Nutzer-IDs gehören nicht in den Frontend-Code.

Du musst mir keine Zugangsdaten schicken. Alle benötigten Werte trägst du selbst lokal und später bei GitHub ein.

## 5. GitHub und kostenloser Website-Link

Die Dateien sind für GitHub Pages vorbereitet. Repository: https://github.com/Alex-poln/Musee-nous. Die Veröffentlichung wird durch GitHub Actions übernommen, sobald Pages aktiviert ist.

1. In VS Code **Quellcodeverwaltung → Repository initialisieren** wählen. Prüfe die Dateien vor dem ersten Commit. `.env`, `node_modules`, `dist` und `private-photos` sind ausgeschlossen. Keine privaten Fotos oder persönlichen SQL-Dateien committen.
2. Alles Gewünschte committen und **Publish to GitHub** wählen. Alternativ auf github.com ein leeres Repo erstellen und die dort gezeigten Push-Befehle verwenden. Für Pages ohne kostenpflichtige Zusatzfunktionen ein öffentliches Repo verwenden. Die privaten Inhalte bleiben in Supabase.
3. Der Branch muss **main** heißen. Falls nötig im Terminal `git branch -M main`.
4. Die Verbindung zu deinem Supabase-Projekt ist im Workflow bereits vorbereitet. Nur bei einem Projektwechsel unter **Settings → Secrets and variables → Actions → Variables** zwei Repository Variables anlegen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   Werte wie in deiner lokalen `.env`. Keine Service-Keys verwenden.
5. **Settings → Pages → Build and deployment → Source: GitHub Actions** auswählen.
6. Unter **Actions → Museum auf GitHub Pages → Run workflow** starten. Alternativ löst ein Push auf `main` den Workflow aus.
7. Wenn der Workflow grün ist, steht unter **Settings → Pages** der fertige HTTPS-Link. Er sieht normalerweise so aus: `https://DEIN-NAME.github.io/DEIN-REPO/`.
8. Diesen Link auf dem Handy öffnen und mit dem echten Login testen.

Der Workflow verwendet die vorbereitete öffentliche Supabase-Verbindung (Repository Variables können sie überschreiben), führt Tests und Build aus und lädt ausschließlich `dist` hoch. Relative Asset-Pfade funktionieren auch unter dem Repository-Unterpfad. Keine kostenpflichtige Server-App notwendig.

Wenn du die Variablen später änderst, den Workflow erneut ausführen: die Werte werden beim Build eingebaut. Ein lokaler erfolgreicher Login bedeutet nicht automatisch, dass die GitHub-Variablen gesetzt sind.

## 6. QR-Code und Geschenk

Den fertigen GitHub-Pages-Link in einen QR-Code umwandeln (z. B. mit der QR-Funktion deines Browsers) und ausdrucken. Passwort separat auf die Adventskalenderkarte schreiben; es nicht in die URL einbetten. Link, QR und Login vor dem Verschenken auf ihrem Gerätetyp testen. Supabase-Projekt kurz vor dem Geschenktag im Dashboard auf Erreichbarkeit prüfen; Tarife und Inaktivitätsregeln können sich ändern.

## Gestaltung anpassen

`src/config.js` enthält den öffentlichen Museumsnamen, Untertitel und Begrüßungssatz. Diese Texte stehen im öffentlichen Repo. Persönliche Erinnerungen ausschließlich in Supabase pflegen. Farben und Layout stehen in `src/style.css`, der 3D-Raum in `src/museum.js`. Die Demo verwendet selbst gezeichnete Motive, keine fremden Fotos. Für die Schrift lädt die Seite Google Fonts; ohne Verbindung greift die Systemschrift. Falls du keine externen Schriftanfragen möchtest, die erste `@import`-Zeile in `src/style.css` entfernen.

## Schutzmodell

- Registrierung ausschließlich für privat hinterlegte Einladungen; Rechte erst nach E-Mail-Bestätigung.
- RLS schützt Datenbanktexte und den privaten Storage-Bucket zusätzlich mit einer Mitgliederliste.
- Bilder werden mit dem angemeldeten Nutzer heruntergeladen und als lokale Blob-URLs angezeigt. Es werden keine öffentlichen Bild-URLs oder signierten Freigabelinks erzeugt.
- Die Sitzung wird nicht dauerhaft in localStorage gespeichert. Nach Neuladen ist eine erneute Anmeldung nötig. „Abmelden“ entfernt Galerie und Blob-URLs aus der App.
- Bereits heruntergeladene Fotos kann eine berechtigte Person speichern oder fotografieren. Entzug der Mitgliedschaft verhindert neue Abrufe, löscht aber keine bereits geladenen Inhalte auf fremden Geräten.
- Adminverwaltung in der Website; Rollen werden serverseitig geprüft.

## Tests und ehrlicher Prüfstand

```sh
npm test
npm run build
npm run preview
```

Bei der Erstellung wurden automatisierte Tests für Galeriegrößen (0 bis 100 Bilder), eindeutige Bildplätze und die Laufgrenzen sowie der Produktionsbuild ausgeführt. Der Live-Museumsplan wurde im Browser geprüft. Der Testbrowser hat WebGL deaktiviert; die 3D-Ansicht und Touch-Bewegung konnten hier deshalb nicht visuell abgenommen werden. Die Quartals- und Raumaufteilung ist außerdem für 1.000 Bilddatensätze automatisiert geprüft. Die Datenbank ist eingerichtet. Der vollständige Login und Foto-Upload mit einem echten Konto muss nach dessen E-Mail-Bestätigung getestet werden. Das Projekt wird im Repository Alex-poln/Musee-nous verwaltet; den aktuellen Veröffentlichungsstatus zeigt der Actions-Tab.

Vor dem Geschenk diese kurze Abnahme durchführen:

- Demo am Desktop und auf dem Handy: bewegen, drehen, Bild öffnen, zurückblättern, Liste öffnen, schließen, verlassen.
- Erlaubter Nutzer: alle Fotos und Texte sichtbar.
- Ohne Anmeldung: keine privaten Fotos oder Texte abrufbar.
- Zusätzlicher Testnutzer **ohne** museum_members-Eintrag: Login kann gültig sein, aber Ausstellung muss gesperrt bleiben.
- Storage-Bucket auf „Private“ und Einladungsbeschränkung kontrollieren.
- Abmelden, neu laden: wieder Login. Live-Link und QR-Code unabhängig vom lokalen Rechner testen.

## Häufige Probleme

| Problem | Lösung |
| --- | --- |
| npm wird nicht erkannt | Node.js installieren, VS Code neu öffnen |
| PowerShell blockiert npm.ps1 | Im VS-Code-Terminal „Command Prompt“ wählen oder `npm.cmd install` / `npm.cmd run dev` nutzen |
| Nur Demo, Login deaktiviert | `.env` anlegen, beide Werte setzen, Server neu starten |
| Anmeldung fehlgeschlagen | E-Mail/Passwort, bestätigten Nutzer und Auth-Konfiguration prüfen |
| Keine freigegebenen Erinnerungen | museum_members-UUID prüfen und mindestens eine memories-Zeile anlegen |
| Foto fehlt | Bucketname und image_path inklusive Groß-/Kleinschreibung prüfen |
| Upload abgelehnt | JPG/PNG/WebP verwenden, Dateigröße unter 5 MiB |
| GitHub-Workflow scheitert beim Konfigurationsschritt | Beide Repository Variables setzen, nicht nur die lokale .env |
| Live-Seite funktioniert lokal, aber nicht online | Pages auf GitHub Actions stellen, letzten Workflow prüfen |
| 3D langsam | Kleinere Bilder, weniger Fotos, anderen aktuellen Browser verwenden |
| Schwarze/fehlende 3D-Ansicht | WebGL/Hardwarebeschleunigung prüfen; über „Museumsplan“ ansehen |

## Technische Referenzen

- Private Supabase-Buckets: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Storage/RLS: https://supabase.com/docs/guides/storage/security/access-control
- Authentifizierte Downloads: https://supabase.com/docs/guides/storage/serving/downloads
- Vite / GitHub Pages: https://vite.dev/guide/static-deploy

Projekt: Vite, Three.js, Supabase JavaScript SDK, Vanilla JavaScript. Genaue Dependency-Versionen und reproduzierbare Installation stehen in `package-lock.json`.
