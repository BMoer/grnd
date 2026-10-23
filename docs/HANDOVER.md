# Handover — GRND

Stand: 2026-10-23 (nach dem Workshop). Repo am 19.10. aus `_archive/` nach `~/Projekte/GRND` zurückgeholt, Einsatz im
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

## Workshop 23.10.2026: Befunde

Einsatz in einem Accelerator-Workshop, 9 Teams am Vormittag, 6 am Nachmittag, zwei Spielrunden,
20 beendete Läufe im Archiv. Kein Ausfall, keine JS-Fehler; Telemetrie, Dashboard,
Event-Injektion und Excel-Download liefen den ganzen Tag. Geprüft vorab: Export aller fünf
Klassen in Microsoft Excel geöffnet, Szenario-Umschalter, jede Eingabe auf ×1,5 / 0 / leer –
keine Fehlerzellen, Richtung plausibel.

1. **Service war zu großzügig.** Ein Lauf erreichte 2,7 Mio. € Cash und rund 400.000 € Umsatz im
   Monat: Preis per Board-Regler auf ~12.000 € pro Kunde und Monat bei ~26 h Lieferung
   (≈ 470 €/h), Kunden blieben trotzdem und wuchsen auf 33. **Behoben (lokal, nicht deployt):**
   `serviceEngine.js` bestraft einen Preis über 150 €/h (gemessen auf 40 h) bei Abschluss- und
   Wiederkaufrate. Nachgestellter Fall (Preis 12.000 €, 10 Personen): 6 statt ~30 Kunden.
   `npm run balance service 300`: mixed endRev 129k → 90k, smart 108k → 77k, Todesraten
   unverändert.
2. **Kaum jemand ändert die Annahmen.** 12 von 18 Teilnehmer-Läufen mit den Vorgaben, auch in
   Runde 2, obwohl die Folie „eine Sache ändern“ verlangte. Offen: Vor Runde 2 die Annahmen des
   letzten Laufs zeigen und eine Änderung verlangen (Pflichtfeld „What do you change, and why?“).
3. **Deep-Tech lehrt das Richtige.** Gewonnen haben nur Läufe mit niedrigem F&E-Burn; hohe
   Stückpreise bei hohem Burn starben vor der Zertifizierung. Nicht anfassen.
4. **Spielername = Login.** Viele gaben nur den Vornamen ein, dadurch im Dashboard nicht
   zuordenbar; gleiche Namen überschreiben sich. **Geändert (lokal):** Login fragt nach
   „First name and startup“. Offen: zweites Feld oder Eindeutigkeit prüfen.
5. **Dashboard zeigt nur Spieler im Spiel.** Wer bei Klasse/Gründer/Annahmen steht, fehlt.
   Offen: Telemetrie schon ab Login senden (`screen` mitschicken).
6. **Excel: Prozentfelder.** Wer „15%“ tippt, speichert 0,15 und das Modell rechnet mit 0,15 %
   (Umsatz Jahr 3 fällt bei SaaS von 75k auf 28k, ohne Fehlermeldung). Am Tag per Ansage
   umgangen. Offen: Prozentzellen als echtes Excel-Prozentformat und Formeln ohne `/100`.
7. Kleinere Randfälle im Export: Akquisekosten = 0 ergibt bei Consumer/Marketplace kein Wachstum
   statt unbegrenztem; Service-Auftragsdauer = 0 treibt den Umsatz auf ~2 Mio. €.
8. Eine Bug-Meldung aus dem Raum (Marketplace) kam inhaltlich nie an; Nachspielen der Klasse fand
   nichts.

## Offene Punkte (nächste Session)

- [ ] Änderungen aus Befund 1 und 4 deployen (nach OK).
- [ ] Befund 2: Annahmen-Vergleich vor Runde 2.
- [ ] Befund 5: Telemetrie ab Login.
- [ ] Befund 6: Prozentformat im Export.
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
