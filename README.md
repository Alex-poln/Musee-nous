# Musée de Nous

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

**Bedienung:** Handy: Joystick unten links zum Laufen, auf der Galerie wischen zum Umschauen, Foto antippen zum Öffnen. PC: WASD zum Laufen, mit gedrückter Maustaste umschauen; Pfeiltasten oben/unten laufen, links/rechts drehen. In der Fotoansicht kannst du weiterblättern. „Museumsplan“ funktioniert auch ohne 3D. Das Haus-Symbol bringt dich zum Eingang. Der Modus ist aus der Ich-Perspektive, ohne sichtbaren Avatar.

## 2. Dein Supabase-Projekt einrichten

Am besten ein **neues, separates Supabase-Projekt** verwenden. Das SQL ist auf ein neues Projekt ausgelegt; in einem bestehenden Projekt könnten andere, weiter gefasste Storage-Policies zusätzlichen Zugriff erlauben.

1. Unter https://supabase.com/dashboard ein Projekt erstellen. Das Datenbankpasswort bleibt bei dir; es wird für diese App nicht benötigt.
2. **SQL Editor → New query** öffnen. Den vollständigen Inhalt von `supabase/setup.sql` einfügen und **Run** klicken.
3. Das erstellt automatisch:
   - `museum_members`: die erlaubten Nutzer-IDs;
   - `memories`: Titel, Bildtext, Ort, Datum und Bildpfad;
   - privaten Storage-Bucket `memories`;
   - RLS-Regeln: nur freigegebene, angemeldete Nutzer dürfen lesen. Besucher dürfen nichts hochladen, ändern oder löschen.
4. Unter **Authentication → Providers / Sign In → Email** E-Mail/Passwort aktiv lassen. **Allow new users to sign up** deaktivieren (je nach Dashboard unter Authentication Settings / User Signups).
5. Unter **Authentication → Users → Add user → Create new user** einen Nutzer für deine Freundin mit E-Mail und starkem Passwort anlegen. **Auto Confirm User** aktivieren. Optional einen zweiten Nutzer für dich anlegen. Nicht „Invite user“ wählen, wenn du keine Einladungsmail senden möchtest.
6. Die UUID des erstellten Nutzers kopieren. Unter **Table Editor → museum_members → Insert row** in `user_id` einfügen. Für deinen eigenen Nutzer wiederholen. Keine weiteren Werte erforderlich.

**Wichtig:** Ein Auth-Nutzer allein bekommt noch keinen Zugriff. Erst der Eintrag in `museum_members` schaltet ihn frei. Deine Freundin braucht keinen Supabase-Dashboard-Account, nur den von dir angelegten App-Login.

## 3. Fotos und Texte hinzufügen

1. Fotos lokal auf etwa **1200–1600 Pixel längste Kante** verkleinern. JPG oder WebP empfohlen, idealerweise etwa 150–400 KB. HEIC vorher in JPG konvertieren. Der Bucket akzeptiert JPG, PNG und WebP bis 5 MiB pro Datei.
2. Unter **Storage → memories** hochladen. Bucket **privat lassen**. Einfache Namen verwenden, z. B. `paris.jpg`, `strand.jpg`. Eure Bilder niemals in das GitHub-Repo legen.
3. Unter **Table Editor → memories → Insert row** pro Foto eintragen:

| Feld | Beispiel | Bedeutung |
| --- | --- | --- |
| title | Unser Tag in Paris | Titel am Bild |
| caption | Mit dir würde ich mich hier immer wieder verlaufen. | Persönliche Erinnerung |
| location | Paris | Ortsangabe |
| taken_on | 2025-06-01 | Optionales Datum, sonst leer lassen |
| image_path | paris.jpg | Exakter Pfad im Bucket, keine URL |
| sort_order | 10 | Aufsteigende Reihenfolge |

`id` und `created_at` automatisch erzeugen lassen. Bei einem Unterordner heißt `image_path` beispielsweise `sommer/strand.jpg`.

Verwende eindeutige Reihenfolgen wie 10, 20, 30. Themenausstellungen und zusätzliche Räume wachsen automatisch mit der Anzahl eurer Bilder. Es wird jeweils nur der aktuelle Raum geladen.

Alternativ enthält `supabase/content-example.sql` zwei Beispielzeilen. Erst passende Bilder hochladen, Texte anpassen und dann das SQL ausführen. Persönliche Texte danach nicht versehentlich committen: am einfachsten direkt im Dashboard pflegen.

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

- Keine Registrierung in der Website, nur Login für angelegte Accounts.
- RLS schützt Datenbanktexte und den privaten Storage-Bucket zusätzlich mit einer Mitgliederliste.
- Bilder werden mit dem angemeldeten Nutzer heruntergeladen und als lokale Blob-URLs angezeigt. Es werden keine öffentlichen Bild-URLs oder signierten Freigabelinks erzeugt.
- Die Sitzung wird nicht dauerhaft in localStorage gespeichert. Nach Neuladen ist eine erneute Anmeldung nötig. „Abmelden“ entfernt Galerie und Blob-URLs aus der App.
- Bereits heruntergeladene Fotos kann eine berechtigte Person speichern oder fotografieren. Entzug der Mitgliedschaft verhindert neue Abrufe, löscht aber keine bereits geladenen Inhalte auf fremden Geräten.
- Es gibt keinen Upload-Adminbereich in der Website. Verwaltung erfolgt bewusst über dein Supabase-Dashboard.

## Tests und ehrlicher Prüfstand

```sh
npm test
npm run build
npm run preview
```

Bei der Erstellung wurden automatisierte Tests für Galeriegrößen (0 bis 100 Bilder), eindeutige Bildplätze und die Laufgrenzen sowie der Produktionsbuild ausgeführt. Die bereitgestellte Browser-Vorschauumgebung war nicht verfügbar; Optik, Touch-Steuerung und 3D sind deshalb hier nicht im Browser verifiziert. Es waren auch kein echtes Supabase-Projekt und keine Zugangsdaten vorhanden: SQL, RLS und Login sind vorbereitet, aber noch nicht gegen deine Instanz getestet. Das Projekt wird im Repository Alex-poln/Musee-nous verwaltet; den aktuellen Veröffentlichungsstatus zeigt der Actions-Tab.

Vor dem Geschenk diese kurze Abnahme durchführen:

- Demo am Desktop und auf dem Handy: bewegen, drehen, Bild öffnen, zurückblättern, Liste öffnen, schließen, verlassen.
- Erlaubter Nutzer: alle Fotos und Texte sichtbar.
- Ohne Anmeldung: keine privaten Fotos oder Texte abrufbar.
- Zusätzlicher Testnutzer **ohne** museum_members-Eintrag: Login kann gültig sein, aber Ausstellung muss gesperrt bleiben.
- Storage-Bucket auf „Private“ und öffentliche Registrierung auf „Off“ kontrollieren.
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
