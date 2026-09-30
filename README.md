# ZINAVIS Crew

Öffentliche Download-Seite für die Composer-Testgruppe. Enthält nur Website-Code, keine Programmquellen,
Samples, Zugangsdaten oder noch ungeprüfte Installer. Keine Analyse-Dienste, Cookies oder externen Schriften.

## Betrieb

- Hosting: kostenloses GitHub Pages, separates öffentliches Repository `TheBegger/zinavis-crew`.
- Downloads: später GitHub Release Assets oder öffentliche, geprüfte Cloud-Downloads.
- Samples: bestehende Synology-Gastfreigabe; die geprüfte Piano-Sammlung enthält WAV-Rohsamples.
- Feedback: vorbereitetes öffentliches GitHub Issue, das der Nutzer selbst prüft und sendet. GitHub-Konto nötig.
- Kein automatischer Library-Upload und kein Update-Client in der nativen App durch diese Website allein.

## Release freischalten

`releases.json` ist die einzige Quelle für Version und Download-Links. Bis zum geprüften Release bleibt
`status: preparing`, `version: null`, und jede Plattform `available: false`. Keine Schein-Downloads.

Für die Freigabe nach erfolgreichem Build, Kern- und Installationstest:

1. Den exakten geprüften Software-Commit sichern und pushen; daraus die Installer und das passende
   Quellcode-Paket gemäß bestehender `NOTICE.md` erzeugen. Keine lokale Developer-Kopie verteilen.
2. Assets veröffentlichen; jede Download-Adresse ohne Anmeldung auf Erreichbarkeit prüfen.
3. `status: published`, semantische `version`, `publishedAt`, `releaseNotesUrl`, `sourceUrl` setzen.
4. Nur geprüfte Plattformen auf `available: true` setzen. In deren `downloads` die HTTPS-Adressen
   `player`, `creator`, `kit` eintragen. Bei einem gemeinsamen Windows-Installer dürfen alle drei
   Adressen identisch sein: Die Programm-Auswahl erfolgt im Setup.
5. Website-Dateien in das Website-Repository synchronisieren, committen und pushen; Pages-Deployment prüfen.

Ein Fehler beim Laden/Validieren deaktiviert Download-Links. Die Website lädt Versionsdaten beim Öffnen
und auf Klick, mit echtem Ladefortschritt sofern Content-Length verfügbar ist, sonst unbestimmtem Balken.
Große Installer werden durch den Browser heruntergeladen und nutzen dessen Download-Fortschrittsanzeige.

## Entwicklung

Im Software-Repository: `node Tools/distribution/preview.mjs Website/crew 4317`.
Die öffentliche Seite besteht ausschließlich aus `index.html`, `styles.css`, `app.js`, `releases.json`
und `.nojekyll`; dieses README darf ebenfalls veröffentlicht werden.

Marke und Texte bleiben ZINAVIS zugeordnet. Keine zusätzliche Software-Lizenz durch die Website vergeben.
