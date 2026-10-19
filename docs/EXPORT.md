# Excel-Export: Business-Case-Vorlage

Stand 19.10.2026. Der Button „Download Business Case (Excel)“ am Spielende erzeugt
`GRND_business_case_<klasse>.xlsx`.

## Befund vor dem Umbau

Das Blatt „Your Model“ war nur für SaaS korrekt. Bei Consumer, Deep-Tech, Marketplace und Service
zeigten die Formeln auf falsche Zellen, weil die Annahmen ab Zeile 5 standen, die Formeln aber
`B2…B9` erwarteten. Nachgerechnet mit `formulas` (Python): Consumer startete mit €25 Cash und €0
Umsatz, Deep-Tech und Marketplace hatten 192 bzw. 240 `#DIV/0!`-Zellen, Service rechnete mit
Billionen Kunden. Die Szenario-Ergebnisse waren feste Zahlen aus JavaScript, keine Formeln, und
reagierten nicht auf geänderte Annahmen.

## Aufbau jetzt

| Blatt | Inhalt |
|---|---|
| Start here | Anleitung, Farbcode, Grenzen des Modells |
| Summary | Umsatz M12/24/36 und Jahre 1–3, EBITDA, Break-even-Monat, niedrigster Cash, Cash-out-Monat, Finanzierungslücke, empfohlene Runde, Unit Economics — alle drei Szenarien nebeneinander |
| Inputs | Treiber × Pessimistic/Base/Optimistic, aktive Spalte, Einheit, Evidenz (Green/Yellow/Red, wie im Revenue Model Canvas), Quelle, Hinweis, Wert aus dem eigenen GRND-Lauf; Einstellungsplan (8 Zeilen), Finanzierungsplan (6 Zeilen) |
| Unit Economics | LTV auf Deckungsbeitrag, CAC, LTV:CAC, Payback u. a. pro Szenario, Ampel für das aktive Szenario |
| Monthly Plan | 36 Monate für das in `Inputs!C3` gewählte Szenario |
| Calc Pessimistic/Base/Optimistic | dieselbe Planung je Szenario (ausgeblendet, speist Summary) |
| Benchmarks, Glossary | unverändert aus `classExportConfigs.js` |
| Game — … | Plan vs. Realität, Umsatzverlauf, Entscheidungen aus dem Spiel (Anhang) |

Code: `src/export/businessCase.js` (Aufbau, gemeinsame P&L- und Cash-Spalten),
`src/export/businessCaseModels.js` (Erlöslogik je Klasse). Aus `classExportConfigs.js` entfernt:
`assumptions`, `modelHeaders`, `buildMonthRow`, `scenarioInputs`, `computeScenarioResult` u. a.

Das Modell ist eine monatliche Cash-Rechnung auf Deckungsbeitragsbasis: Umsatz − variable Kosten −
Akquise − Team & Fixkosten + Finanzierung = Cash. Keine Steuern, USt, Abschreibungen oder
Zahlungsziele.

## Prüfen

```
node scripts/export-sample.mjs /tmp/grnd_xlsx      # eine Datei pro Klasse aus einem simulierten Lauf
pip install formulas openpyxl
python3 scripts/check_business_case.py /tmp/grnd_xlsx/service.xlsx
```

Ergebnis 19.10.: alle fünf Klassen ohne Formelfehler. Umschalten auf „Pessimistic“ in `Inputs!C3`
ergibt im Monthly Plan denselben Cash in M36 wie „Calc Pessimistic“ (SaaS, Marketplace geprüft).
Export im Browser (Vite-Dev, Consumer und Deep-Tech) läuft ohne Fehler.

## Offen

- Die Datei enthält keine vorberechneten Werte. Excel, Numbers und Google Sheets rechnen beim
  Öffnen (`fullCalcOnLoad`); Vorschauen wie macOS Quick Look oder Mail-Anhänge zeigen leere Zellen.
- Keine Diagramme (ExcelJS kann keine erzeugen); die Anleitung erklärt, wie man sie einfügt.
