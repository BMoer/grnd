# Handover — GRND

Stand: 2026-10-20. Repo am 19.10. aus `_archive/` nach `~/Projekte/GRND` zurückgeholt, Einsatz im
Workshop am Fr 23.10.2026.

## Was live / fertig

- **Prod = Commit `5e436b4`** auf `main`, ausgerollt am 19.10. über den Push nach GitHub (Vercel,
  grnd.moerzinger.eu). Smoke-Test auf der Live-Domain: Seite und `/admin` liefern 200, alter
  Admin-Schlüssel wird mit 401 abgewiesen, Telemetrie-POST und Abruf mit neuem Schlüssel
  funktionieren, neue Board-Regler und der Business-Case-Download sind im ausgelieferten Bundle.
- **Balancing aller fünf Klassen** samt klassenspezifischer Board-Regler, gemessen mit
  `npm run balance` — Zahlen und Diff in `docs/BALANCE.md`.
- **Board-Meeting klassenspezifisch** (Kennzahlen, Gründer als Sprecher).
- **Telemetrie/Admin:** neuer Upstash-Store `grnd-telemetry`, kein Fallback-Schlüssel mehr im
  Code. `ADMIN_KEY` steht nur in Vercel (Production) und in `.env.local`.
- **Excel-Export = Business-Case-Vorlage** — `docs/EXPORT.md`, Prüfskript
  `scripts/check_business_case.py`, Beispieldateien `scripts/export-sample.mjs`.

## prod ≠ live

- Keine Abweichung: `main` = Prod.
- Preview-Deployments (`vercel deploy` ohne `--prod`) bekommen `ADMIN_KEY` nicht automatisch;
  beim Testen `--env ADMIN_KEY=…` mitgeben, Zugriff über `vercel curl`.

## Offene Punkte (nächste Session)

- [ ] Eine Export-Datei einmal in echtem Excel öffnen (Neuberechnung beim Öffnen, Dropdowns,
      bedingte Formatierung). Nachgerechnet ist nur mit dem Python-Paket `formulas`.
- [ ] Nach dem Workshop am 23.10.: beobachtete Fehler und Spielerfeedback hier eintragen.
- [ ] Service-Umsätze im Smart-Fall (~€100K/Monat) für eine Beratung mit max. 10 Personen hoch.
- [ ] Alte Playtest-Skripte (`src/engine/testHarness.js`, `smartPlaytest.js`,
      `consumerPlaytest.js`, `deeptechPlaytest.js`) laufen am Spielfluss vorbei: anpassen oder
      löschen.
- [ ] Rest-Lint in nicht angefassten Dateien (u. a. bedingte `useMemo` in `CharacterScreen.jsx`
      und `SetupScreen.jsx`).

## Session-Log (letzte 3)

- **2026-10-19/20** — Aus dem Archiv geholt. Simulator `scripts/balance.mjs` gebaut, der die
  Browser-Regeln über `src/engine/gameRules.js` teilt. Engine-Fehler behoben: Consumer-Viralität,
  doppelt gezähltes Deep-Tech-Fördergeld, Marketplace-PMF-Wachstum nie gezählt,
  Service-Wiederkauf als Neukunden gezählt, Board-Burn-Boden. Board-Regler und -Kennzahlen je
  Klasse. Excel-Modell für 4 von 5 Klassen war falsch verdrahtet → durch Business-Case-Vorlage
  ersetzt. Telemetrie-Store neu, Admin-Schlüssel aus dem öffentlichen Code entfernt. Deployt und
  auf der Live-Domain geprüft.
