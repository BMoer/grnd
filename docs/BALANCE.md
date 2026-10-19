# Balance — Stand 19.10.2026 (vor Elevator Modul 3, 23.10.)

## Wie gemessen wird

`npm run balance` (= `node scripts/balance.mjs [klasse|all] [runs]`) spielt komplette Partien mit
denselben Regeln wie der Browser. Store und Simulator importieren beide `src/engine/gameRules.js`:
Event-Pool, Ziehung, Startzustand, Monatsdruck, AP und Board-Folgen. Seed über `SEED=…`, Default 42.
Mit `--trace=key1,key2` und einem Spielertyp als drittem Argument wird eine Partie Monat für Monat
ausgegeben.

Spielertypen:

| Typ | Verhalten |
|---|---|
| passive | entscheidet nie, jedes Event fällt auf den Default, keine Board-Regler |
| random | zufällige leistbare Wahl (15 % Skip), dreht in 40 % der Boards einen zufälligen Regler |
| mixed | pro Entscheidung 50/50 smart oder random, Proxy für einen typischen Teilnehmer |
| smart | spielt jede Option 4–6 Monate voraus und nimmt die beste, sucht Board-Regler per Look-ahead; Obergrenze, kein realer Spieler |

`src/engine/classPlaytest.js` wurde gelöscht. Es wich vom Spiel ab: Es zog SaaS-only-Events wie
das Acqui-hire-Angebot auch für andere Klassen, kannte keine AP und keine Board-Meetings.

## Ergebnis (300 Läufe pro Zelle, Seed 42)

| Klasse | mixed tot | mixed PMF | random tot | random PMF | smart PMF | passive |
|---|---|---|---|---|---|---|
| SaaS | 20 % | 35 % | 79 % | 7 % | 88 % | 100 % tot |
| Consumer | 22 % | 49 % | 84 % | 1 % | 89 % | 100 % tot |
| Deep-Tech | 27 % | 59 % | 78 % | 17 % | 92 % | 100 % tot (M19) |
| Marketplace | 58 % | 38 % | 100 % | 0 % | 95 % | 100 % tot |
| Service | 1 % | 59 % | 8 % | 5 % | 99 % | 100 % überlebt ohne PMF |

**Vorher**, erster Lauf des Simulators gegen den April-Code (100 Läufe, ohne Board-Entscheidungen):
Service smart 3 % PMF. Marketplace smart 84 % tot und 0 % PMF. Deep-Tech: passive 100 % überlebt;
random erreicht seltener PMF als smart, stirbt aber an Ausgaben, die passive nie hat. Consumer: smart
27 % PMF bei unbegrenztem Umsatzwachstum.

## Was geändert wurde (Diff, nicht Absicht)

**Spielfluss**
- `src/engine/gameRules.js` (neu): Regeln aus `src/store.js` herausgezogen, damit Simulator und
  Browser identisch rechnen.
- `applyBoardOutcome`: Die Board-Belohnung „Revenue beat: -€300 burn“ hatte einen fixen Boden von
  €5.000 und *erhöhte* damit den Burn bei Consumer (€3.5K), Marketplace (€1.2K) und SaaS (€4.5K).
  Der Boden ist jetzt 50 % des klasseneigenen Start-Burns.
- `buildInitialState`: Der Preis aus dem Setup (aov / unitPrice / takeRate / avgProject) wird für
  alle Klassen in den Startzustand übernommen. Vorher galt das nur für SaaS; bei den anderen Klassen
  hatte der eingestellte Preis keine Wirkung auf die Simulation.

**Board-Regler** (`src/engine/boardLevers.js`, neu; `src/ui/BoardMeeting.jsx`)
Die „Strategic Adjustments“ waren für alle Klassen die SaaS-Regler (Preis €19–299/Monat usw.).
Außerhalb von SaaS wirkten sie kaum oder gar nicht. Jetzt pro Klasse:
- SaaS: unverändert (Preis, Team-Budget, Sales-Intensität, Support)
- Consumer: Preis pro Bestellung, Ad Spend, Retention-Budget, Team-Budget
- Deep-Tech: R&D-Budget, Gründerzeit beim Kunden (%), Stückpreis
- Marketplace: Take Rate, Marketing-Budget, Budget-Anteil Angebotsseite
- Service: Preis pro Kunde, Delivery-Team (Stunden; +160 h = +€4.5K Burn), Zeit für Produktisierung

Der „Revise Forecast“-Dialog startet bei Nicht-SaaS-Klassen jetzt mit den eigenen
Setup-Annahmen. Vorher wurden ihm SaaS-Felder übergeben.

**Consumer** (`consumerEngine.js`)
- Viraler Koeffizient wirkt auf die Neukunden des Vormonats, nicht mehr jeden Monat auf alle
  aktiven Kunden. Die alte Formel ließ den Kundenstamm unabhängig von den Unit Economics wachsen.
- LTV jetzt auf Deckungsbeitrag (AOV − COGS − Fulfillment − Gebühren) über die aktive Lebensdauer,
  nicht mehr Umsatz über 3 Monate.
- Preisaufschlag über €35 erhöht CAC und senkt die Wiederkaufrate. Neues Retention-Budget hebt
  Produkt und Wiederkaufrate und kostet Burn.
- PMF: Wiederkauf voll bei 22 % (war 25 %), viral voll bei 0,4 (war 0,5).

**Deep-Tech** (`deeptechEngine.js`, `classes/deeptech.js`, `events/deeptechDecisions.js`)
- Startkasse €120K statt €300K. Die €300K waren zusätzlich als Förderung verbucht, also doppelt.
- Event „Grant Extension“ buchte +€100K Kasse *und* +€100K Förderung → nur noch Förderung.
- Gründerzeit beim Kunden steuert Pilotgespräche und LOIs und bremst den Produktfortschritt.
  Ein schwacher Prototyp (Produkt < 30) halbiert die LOI-Konversion.
- R&D-Budget wird nicht mehr zur Korridormitte gezogen; Burn-Änderungen aus Events kommen jetzt an
  (vorher überschrieben, ohne Doppelzählung, wenn das Event rdBurn selbst setzt).
- Ein LOI wird nach der Zertifizierung mit 35 % pro Monat zu einem Erstauftrag über 5 Stück.
  Bruttomarge rechnet mit den Stück dieses Monats statt kumuliert. PMF-Verkaufsanteil voll bei
  15 Stück.
- Forecast: LOIs wurden monatlich auf 0 gerundet, akkumulieren jetzt.

**Marketplace** (`marketplaceEngine.js`, `classes/marketplace.js`)
- Bug: `prevSupply`/`prevDemand` wurden nie gespeichert. Die Wachstumskomponente des PMF (15 Punkte)
  war deshalb immer 0 und 85 praktisch unerreichbar.
- Neues Matching: Nachfrage stellt Anfragen, Angebot hat Kapazität. Liquidität = Füllrate ×
  Matchqualität, und die Matchqualität hängt von der Tiefe der Angebotsseite ab (Kaltstart,
  gesättigt bei 300 Anbietern). Wenig Liquidität erhöht die Nachfrage-Abwanderung, untätige
  Anbieter wandern ab, Mundpropaganda skaliert mit Transaktionen.
- Take Rate über 10 % erhöht die Anbieter-Abwanderung und den Abfluss am Plattform vorbei.
- Marketing-Budget €1.5K/Monat ist jetzt ein expliziter Startwert. Ab Monat 7 steigt der Burn
  um €2.3K, weil beide Gründer Vollzeit arbeiten (steht im Backstory-Text).
- PMF: Liquidität voll bei 50 %, Umsatz voll bei €10K/Monat (war €5K).

**Service** (`serviceEngine.js`)
- Wiederkehrende Kunden wurden jeden Monat als *neue* Kunden addiert, der Kundenstamm wuchs in die
  Hunderte. Jetzt endet monatlich ~25 % der Aufträge, die Wiederkaufrate senkt diesen Anteil.
- Preis wird nicht mehr zur Korridormitte zurückgezogen. Ein höherer Preis senkt die Abschlussrate.
- Arbeit über der Kapazität geht an Freelancer zu €80/h, was die Marge drückt. Die
  Burnout-Eskalation bleibt, über den Team-Regler gibt es aber jetzt einen Ausweg.
- Produktisierung (Regler, max. 50 %) kostet abrechenbare Gründerstunden und senkt später die
  Stunden pro Kunde (40 h → ~26 h).
- PMF: Produkt ist mit 25 Punkten das größte Gewicht (voll bei 85), Umsatz voll bei €40K,
  Wiederkauf voll bei 40 %.

## Offen / TODO

- **Board-Feedback ist klassenblind:** Sprecher (z. B. „Jonas“ bei Service), Delta-Tabelle und
  Texte nutzen SaaS-Metriken (MRR, Churn, CAC) für alle Klassen.
- **Excel-Export** (`src/export/classExportConfigs.js`) enthält eigene Formeln. Die sind noch nicht
  an die geänderte Consumer-Viralität/LTV, das Marketplace-Matching und die Service-Kundenlogik
  angeglichen.
- Service-Umsätze im Smart-Fall bis ~€100K/Monat sind hoch für eine Beratung mit max. 10 Personen.
- Die alten Playtest-Skripte (`testHarness.js`, `smartPlaytest.js`, `consumerPlaytest.js`,
  `deeptechPlaytest.js`) laufen weiterhin am Spielfluss vorbei; maßgeblich ist `scripts/balance.mjs`.
- Admin-Dashboard/Telemetrie: der KV-Store (`smart-filly-66502.upstash.io`) existiert nicht mehr
  (NXDOMAIN), `/api/telemetry` antwortet mit 500.
