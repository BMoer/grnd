# GRND - Style Guide

## Haltung

GRND ist Grind, Grund, Gründen. Vier Buchstaben ohne Vokale, wie ein Rohbau ohne Putz. 

Es steht in einer doppelten Tradition. Von Bauhaus nimmt es die Klarheit: Form aus Funktion, kein Ornament, die Tabelle als Werkstück. Von Spielen wie RimWorld nimmt es das Herz: hinter jeder Zahl steckt eine Geschichte, hinter jeder Metrik ein Mensch der eine Entscheidung getroffen hat. Die Synthese ist: Bauhaus-Klarheit mit menschlicher Wärme. Sauberes Layout, aber Texte die nach echten Menschen klingen. Funktionale Farben, aber ein Grundton der nach Werkstatt riecht statt nach Krankenhaus.

Übersetzt auf Unternehmertum: Ein Startup bauen ist Handwerk. Du arbeitest mit Material (Markt, Kunden, Geld), du hast einen Entwurf (Annahmen, Forecast, Business Model), und dann triffst du auf die Realität. Der Hobel rutscht ab, die Farbe läuft, der CAC ist doppelt so hoch wie geplant. Du passt an. Du lernst. Du baust weiter.

GRND ist kein Silicon-Valley-Fantasiespiel. Es ist eine europäische Werkstatt, in der Gründen als kreative Disziplin ernst genommen wird. Die Ästhetik kommt nicht aus Hacker-Kultur und nicht aus Corporate-SaaS, sondern aus Gestaltung und Erzählung.

---

## 1. Visual Identity

### 1.1 Design-Prinzipien

**Klarheit über Dekoration.** Jedes visuelle Element muss eine Funktion haben. Kein Schatten der nur gut aussieht. Kein Gradient der nichts kommuniziert. Wenn ein Element entfernt werden kann ohne dass Information verloren geht, entferne es.

**Farbe trägt Information.** Farbe ist nie dekorativ. Rot heißt Gefahr. Blau heißt Plan. Schwarz heißt Fakt. Gelb heißt Achtung. Wenn etwas bunt ist, muss es einen Grund haben.

**Die Tabelle ist das Werkstück.** Das Financial Model ist das zentrale Objekt des Spiels. Zahlen sind nicht langweilig, sie sind das Material aus dem Startups gemacht sind. Sorgfältig gesetzt, gut lesbar, mit Respekt behandelt.

**Warm, nicht steril.** Bauhaus war nie kalt. Die Werkstätten in Weimar und Dessau waren voller Licht, Holz, Farbe. Unser Hell-Thema ist nicht Krankenhaus-Weiß, es ist Atelier-Hell. Papier, Beton, Tageslicht.

**Hinter jeder Zahl ein Mensch.** (RimWorld-Prinzip) Das Interface ist clean, aber die Texte haben Persönlichkeit. Ein Event liest sich nicht wie eine System-Notification, sondern wie der Eintrag in einem Gründertagebuch. Die Preset-Characters haben ein Gesicht, nicht durch Illustration (text-based), sondern durch Schreibstil, Backstory, und spezifische Details. Wenn ein Board-Mitglied Feedback gibt, klingt es nach einer Person mit Meinungen, nicht nach einem Algorithmus. Die Zahlen im Interface sind Bauhaus-klar. Die Worte drumherum sind menschlich-warm.

### 1.2 Farbsystem

```
HINTERGRÜNDE
  Canvas:          #F5F0EB    (warmes Papier-Weiß, der Grundton)
  Surface:         #EDEAE4    (leicht abgesetzt, Karten/Panels)
  Raised:          #E3DFD8    (erhöhte Elemente, aktive Karten)
  Border:          #D1CCC4    (subtile Trennlinien)

TEXT
  Primary:         #1A1A1A    (fast-Schwarz, Tusche)
  Secondary:       #5C5850    (gedämpft, für Beschreibungen)
  Muted:           #9C9689    (zurückgenommen, Labels, Timestamps)

FUNKTIONALE FARBEN (Bauhaus-Primärfarben, leicht entsättigt)
  Rot:             #D64045    (Gefahr, Cash low, Forecast-Miss, Tod)
  Blau:            #2D5DA1    (Plan, Forecast, Annahmen, dein Entwurf)
  Gelb:            #E8A838    (Achtung, Warnung, World Events)
  
ZUSATZFARBEN
  Schwarz:         #1A1A1A    (Fakten, Actuals, bewiesene Zahlen)
  Grün:            #3A8A5C    (Validiert, über Forecast, Wachstum)
  
KLASSEN-FARBEN (je eine, klar unterscheidbar)
  SaaS:            #3A8A5C    (Grün - Wachstum, Recurring)
  Marketplace:     #7B5EA7    (Violett - Verbindung, zwei Seiten)
  Service:         #D68C45    (Bernstein - Handwerk, Wärme)
  Deep-Tech:       #2D5DA1    (Blau - Forschung, Tiefe)
  Consumer:        #D64045    (Rot - Energie, Geschwindigkeit)
  API/Platform:    #5C5850    (Graphit - Infrastruktur, Backend)
```

Farben werden nie als Flächen eingesetzt (kein roter Hintergrund, kein blauer Block). Farbe erscheint als: Linien, Akzente, Text-Farbe, Graph-Linien, Rahmen, geometrische Formen. Der Canvas bleibt immer warm-hell.

### 1.3 Typographie

```
HEADLINES / DISPLAY
  Font:     "Outfit" (modern geometric, Bauhaus-Erbe ohne Retro-Kitsch)
  Weights:  700 (Headlines), 600 (Sub-Headlines)
  Tracking: -0.02em (Headlines), 0 (Sub)
  
  Alternativ: "DM Sans" als Fallback
  
ZAHLEN / DATEN / TABELLEN
  Font:     "Space Mono" (klar, technisch, aber nicht Hacker)
  Weight:   400 (Tabellenwerte), 700 (hervorgehobene Werte)
  Features: tabular-nums (damit Zahlen sauber untereinander stehen)
  
  Die Mono-Schrift ist NUR für Zahlen, Metriken und die Tabelle.
  Nie für Fließtext oder Event-Beschreibungen.
  
BODY / NARRATIVE
  Font:     "Outfit" (400)
  Oder:     "DM Sans" (400)
  Zeilenhöhe: 1.6
  
  Event-Texte, Feedback, Board-Kommentare, alles Narrative.

LABELS / METADATA
  Font:     "Outfit" (500)
  Size:     11px
  Transform: uppercase
  Tracking:  0.08em
  Color:     Muted (#9C9689)
```

Keine Handschrift-Fonts. Keine Serif-Fonts. Keine Retro-Fonts. Die Typographie ist modern-geometrisch, in der Tradition von Futura und den Bauhaus-Typographen, aber nicht als historisches Zitat.

### 1.4 Geometrie und Formen

**Klassen-Logos sind geometrische Grundformen.** Keine Illustrationen, keine Icons, keine Cliparts. Reine Form, gefüllt mit der Klassenfarbe.

```
SaaS (CloudKitchen):        ● Kreis        (Recurring, Zyklus, Loop)
Marketplace (SwapCircle):    △ Dreieck      (Drei Seiten: Supply, Demand, Platform)
Service (StrategyForge):     ■ Quadrat      (Solide, stabil, gebaut)
Deep-Tech (NanoSense):       ⬡ Hexagon      (Molekular, Wissenschaft, Struktur)
Consumer (GlowUp):           ◆ Raute        (Dynamisch, gekippt, Energie)
API/Platform (DataPipe):     ▬ Rechteck     (Baustein, Infrastruktur, Stack)
```

Diese Formen erscheinen: als Logo auf dem Klassen-Auswahlscreen, als kleines Badge neben dem Klassennamen im Header, in den Graphen als Datenpunkt-Marker, als dezentes Hintergrund-Element auf dem Board Meeting Screen.

**Rahmen und Linien:** 1px solid, Farbe `Border`. Keine abgerundeten Ecken über 4px. Keine Schatten. Keine Blur-Effekte. Trennlinien sind ehrlich - sie trennen, und das sehen sie auch so aus.

**Raster:** 8px Grundraster. Alle Abstände sind Vielfache von 8. Kein Chaos, kein "sieht ungefähr richtig aus". Das Raster ist sichtbar in der Sorgfalt des Layouts.

### 1.5 Graphs und Datenvisualisierung

**Forecast vs. Actual (Hauptgraph):**
- Forecast-Linie: Blau (#2D5DA1), gestrichelt, 1.5px
- Actual-Linie: Klassenfarbe, durchgezogen, 2px
- Fläche zwischen den Linien: leicht eingefärbt (rot wenn Actual < Forecast, grün wenn darüber)
- Keine Grid-Lines. Nur eine dezente horizontale Null-Linie.
- Achsenbeschriftungen in Space Mono, Muted-Farbe.

**Unit Economics Graph (sekundär):**
- Einzelne Linie in Klassenfarbe
- Target-Linie (z.B. LTV:CAC = 3) als dünne schwarze Horizontale
- Datenpunkte als kleine geometrische Formen der Klasse

**Allgemeine Graph-Regeln:**
- Nie mehr als 3 Linien in einem Graph
- Keine 3D-Effekte, keine Schlagschatten auf Graphen
- Keine Legende wenn nur 1-2 Linien (direkt beschriften)
- Animierte Linie die sich zeichnet (wie ein Stift auf Papier)
- Hintergrund: Canvas-Farbe, kein eigener Graph-Hintergrund

### 1.6 Layout-Zonen

Das Layout hat drei Modi:

**Game Mode:**
```
┌──────────────────────────────────────────────────┐
│ Header (Klasse, Monat, AP, Runway)               │
├─────────────────────────┬────────────────────────┤
│                         │                        │
│  Spielfeld              │  Business Model        │
│  (Events, Entscheidungen│  (Tabelle, scrollbar)  │
│   Feedback, Log)        │                        │
│                         │                        │
│  ← Hier passiert das    │  ← Hier sieht man     │
│    Handwerk             │    was es bewirkt      │
│                         │                        │
└─────────────────────────┴────────────────────────┘

Split: 55% / 45%
Mobile: Stacked, Spielfeld oben, Tabelle als ausklappbares Panel unten
```

**Board Meeting Mode:**
```
┌──────────────────────────────────────────────────┐
│ Header (Board Meeting Q2, Klasse)                │
├──────────────────────────────────────────────────┤
│                                                  │
│  Forecast vs. Actual Graph (volle Breite)        │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Forecast vs. Actual Tabelle (volle Breite)      │
│  Plan-Spalten in Blau, Actual in Schwarz         │
│  Delta >20% hervorgehoben                        │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Board Feedback (Text)                           │
│  Unit Economics Graph (kleiner, rechts)           │
│                                                  │
│  [Forecast anpassen]  [Weiter spielen]           │
│                                                  │
└──────────────────────────────────────────────────┘

Volle Breite. Kein Split. Die Analyse braucht Raum.
```

**Setup Mode (Annahmen-Slider):**
```
┌──────────────────────────────────────────────────┐
│ Klassen-Steckbrief (Logo, Story, Key Facts)      │
├──────────────────────────────────────────────────┤
│                                                  │
│  Deine Annahmen                                  │
│                                                  │
│  Monthly Price        ●────────────○   €49       │
│  Expected Churn       ○──●─────────    5%        │
│  Target CAC           ───●─────────    €80       │
│  ...                                             │
│                                                  │
│  [Vorschau: Dein 24-Monats-Forecast]             │
│  (kleiner Graph der live reagiert)               │
│                                                  │
│  [Start]                                         │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 2. Text Voice

### 2.1 Grundton

Die Stimme des Spiels ist ein erfahrener Gründer der jetzt anderen zuschaut. Trocken, direkt, gelegentlich trocken-witzig. Nie zynisch, nie herablassend. Die Stimme weiß, dass Scheitern normal ist. Sie verurteilt nicht, sie dokumentiert. Wie ein Handwerksmeister der einem Lehrling zuschaut: "Siehst du, hier hast du zu viel Druck gegeben. Das Holz ist gesplittert. Nächstes Mal weniger Kraft, mehr Geduld."

Aber, und hier kommt die RimWorld-Dimension: Die Stimme hat auch Empathie. Sie kennt den Schmerz eines leeren Bankkontos, die Stille nach einem verlorenen Kunden, den Moment in dem du um 23 Uhr allein vor deinem Laptop sitzt und nicht weißt ob du morgen weitermachst. Events dürfen berühren. Feedback darf wehtun. Die Nüchternheit der Zahlen und die Menschlichkeit der Situation existieren nebeneinander, genau wie im echten Gründeralltag.

### 2.2 Do's

**Kurz.** Events und Feedback in 2-3 Sätzen. Kein Absatz wo ein Satz reicht. Jedes Wort muss sich seinen Platz verdienen.

**Konkret.** Nie "die Dinge laufen schlecht". Immer "Dein CAC ist bei €140. Dein LTV ist bei €87. Du verlierst €53 pro Kunde." Die Zahlen SIND die Story.

**Nüchtern, nicht emotionslos.** Fakten führen, Emotionen begleiten. Es ist ok, einen toten Run mit einem Satz zu kommentieren der wehtut. Es ist ok, dass ein Event sich anfühlt wie ein echter Moment. Was NICHT ok ist: künstliche Dramatisierung, aufgesetzte Empathie, oder Trost der nicht verdient ist. Der Unterschied zwischen echtem Gefühl und Manipulation ist: Echtes Gefühl kommt aus der Spezifik der Situation, nicht aus rhetorischen Tricks.

**Zweite Person.** "Du hast...", "Dein CAC...", "Deine Entscheidung...". Nie dritte Person, nie Passiv. Der Spieler ist der Gründer.

**Konsequenzen, nicht Urteile.** Nie "Das war eine schlechte Entscheidung." Immer "Dein Churn stieg auf 12%. Die Kunden die du gewonnen hast, blieben nicht." Der Spieler zieht die Schlüsse selbst.

### 2.3 Don'ts

**Kein Startup-Jargon als Selbstzweck.** Wenn ein Begriff vorkommt (PMF, CAC, LTV), dann weil er die präziseste Beschreibung ist. Nicht weil er smart klingt.

**Keine Motivational Quotes.** Kein "Every failure is a lesson." Kein "The journey matters." Das Spiel zeigt, es erklärt nicht.

**Keine Silicon-Valley-Romantik.** Kein "Disrupt the industry." Kein "Change the world." Die Startups im Spiel verkaufen Software an Restaurants und Sensoren an Lebensmittelhersteller. Das ist ehrliche Arbeit, keine Heldenreise.

**Kein Sarkasmus.** Trockener Humor ja ("Du hast Confetti-Animationen zu einem Produkt hinzugefügt, das niemand braucht."), Sarkasmus nein ("Wow, toll gemacht, du Genie."). Der Unterschied: Trockener Humor beschreibt die Realität präzise und die Absurdität ergibt sich von selbst. Sarkasmus wertet ab.

**Keine AI-Slop-Formulierungen:**
- "Here's the thing..."
- "Let's dive in..."
- "It's worth noting..."
- "In today's world..."
- "Game-changer"
- "Leverage", "synergy", "circle back"
- Jede Formulierung die nach einem LinkedIn-Post klingt

**Keine normativen Bewertungen.** Das Spiel sagt nie "Die richtige Antwort wäre gewesen...". Es zeigt Konsequenzen. Der Spieler entscheidet was richtig ist.

### 2.4 Textformate und Längen

```
EVENT-TITEL:           3-6 Wörter. Klar, kein Clickbait.
                       Gut:    "The Pricing Question"
                       Schlecht: "What Happens Next Will Shock You"
                       
EVENT-BESCHREIBUNG:    2-3 Sätze. Situation, Kontext, Spannung.
                       Nie mehr als 40 Wörter.
                       
CHOICE-TEXT:           1 Satz. Was du tust, nicht warum.
                       Gut:    "Charge €99/mo from day one."
                       Schlecht: "Decide to go with a premium pricing 
                                strategy that targets serious users."
                       
FEEDBACK-TEXT:         2-4 Sätze. Was passiert ist, was sich ändert,
                       was das bedeutet.
                       Erste Satz: Fakt. Zweiter: Konsequenz. 
                       Dritter (optional): Implikation.
                       
BOARD-FEEDBACK:        1-3 Sätze pro Board-Mitglied. In Character.
                       Advisor: wohlwollend-direkt.
                       Angel: neugierig-bohrend.
                       Lead Investor: zahlengetrieben-knapp.
                       
WORLD-EVENT-TEXT:      2 Sätze. Was passiert, wie es dich betrifft.

GAME-OVER-TEXT:        1-2 Sätze. Nüchtern. Kein Trost, kein Spott.
                       "Month 7. Cash hit zero. Your LTV never 
                       caught up with your CAC."
                       
WIN-TEXT:              2-3 Sätze. Anerkennung ohne Euphorie.
                       "Revenue exceeds burn for the third month.
                       Customers refer other customers. Something
                       is working. Now the real work begins."
```

### 2.5 Sprache

Alles Englisch. Kein Denglisch, kein Code-Switching. Europäischer Kontext (€, GDPR, EU-Grants) aber englische Sprache.

Begriffe die immer technisch korrekt verwendet werden:
- Revenue (nicht "income" oder "sales")
- Burn Rate (nicht "expenses" oder "spending")
- Churn (nicht "customer loss")
- CAC (nicht "acquisition cost" ohne das C)
- Runway (nicht "months of cash left" - außer als Erklärung)

---

## 3. UI/UX Regeln

### 3.1 Interaktionen

**Entscheidungen sind Buttons, keine Links.** Jede Choice ist ein klar abgegrenzter Button mit sichtbarem Rand. Hover-State: Rand wird Klassenfarbe. Kein Farb-Fill bei Hover (zu laut).

**AP-Kosten stehen direkt am Button.** Rechts aligned, in Muted-Farbe. "[A] Charge €99/mo from day one.  ·  1 AP"

**Slider haben Live-Feedback.** Während der Spieler am Annahmen-Slider zieht, aktualisiert sich der kleine Forecast-Graph in Echtzeit. Die Zahl neben dem Slider zeigt den aktuellen Wert in Space Mono.

**Keine Modals.** Nie. Board Meetings sind ein Screen-Wechsel, kein Overlay. World Events sind ein Banner oben im Event-Bereich, kein Popup. Modals unterbrechen Flow und fühlen sich nach Enterprise-Software an.

**Keine Tooltips für kritische Information.** Wenn etwas wichtig ist, steht es im Interface. Tooltips für nette Zusatzinfos ("LTV = Lifetime Value, berechnet als ARPU / Churn"), nie für spielentscheidende Daten.

### 3.2 Feedback und Transitions

**Zahlenänderungen sind sichtbar.** Wenn sich ein Wert in der Tabelle ändert, kurze Animation: alter Wert → neuer Wert, mit Farbblitz (grün bei Verbesserung, rot bei Verschlechterung). Dauer: 300ms. Kein Bouncing, kein Overshooting. Einfacher Übergang.

**Neue Tabellenzeile erscheint sanft.** Wenn ein neuer Monat dazukommt, slided die Zeile von unten ein. Dauer: 200ms.

**Board Meeting Transition:** Kurzer Fade (400ms) vom Game Mode zum Board Meeting. Kein aufwändiger Übergang. Der Wechsel soll sich anfühlen wie: Werkzeug hinlegen, Schritt zurücktreten, hinschauen.

**Graph-Linien zeichnen sich.** Wenn der Forecast vs. Actual Graph erscheint, zeichnet sich die Linie von links nach rechts, wie ein Stift auf Papier. Dauer: 800ms für die volle Linie.

### 3.3 Responsive / Mobile

Das Spiel muss auf Telefonen funktionieren (Workshop-Teilnehmer auf dem Handy).

**Mobile Layout:**
- Game Mode: Einspaltiges Layout. Event-Bereich oben, volle Breite. Tabelle als ausklappbares Panel unten (Tap to expand/collapse, Default: collapsed). Mini-Summary-Bar immer sichtbar: Cash | MRR | Runway.
- Board Meeting: Einspaltiges Layout. Graph oben, Tabelle (horizontal scrollbar), Feedback unten.
- Setup: Slider vertikal gestapelt, Forecast-Graph über den Slidern.

**Touch-Targets:** Minimum 44px Höhe für alle interaktiven Elemente. Choice-Buttons haben großzügiges Padding (14px 16px mindestens).

### 3.4 Loading und Empty States

**Kein Spinner.** Nie. Wenn etwas lädt (Excel-Export generieren), zeige einen Fortschrittsbalken mit konkreter Aktion: "Generating financial model..." → "Adding formulas..." → "Done."

**Leere Tabelle zu Spielstart:** Die Tabelle zeigt die Header und eine einzige Zeile (Month 0, Starting Cash, alles andere "-" oder 0). Nicht leer, nicht mit Platzhalter-Daten. Nur der ehrliche Startpunkt.

**Kein Onboarding-Tutorial.** Das Spiel erklärt sich durch Spielen. Der erste Event-Text gibt genug Kontext. Wenn ein Spieler nicht weiß was CAC bedeutet, lernt er es indem er es im Spiel erlebt, nicht durch ein Tooltip.

### 3.5 Was das Spiel NICHT ist

**Kein Dashboard.** Es sieht nicht aus wie Stripe oder Amplitude. Es hat Tabellen und Graphen, aber die Ästhetik ist Werkstatt, nicht SaaS-Dashboard.

**Kein Terminal.** Kein dunkler Hintergrund, keine grüne Schrift, kein ">" Prompt. Wir sind nicht in einem Hacker-Film.

**Kein Pitch Deck.** Keine Slides, keine Bullet Points, keine "Key Takeaways"-Boxen. Das Spiel präsentiert nicht, es zeigt.

**Kein Gamification-Layer.** Keine Achievements, keine Badges, keine Streaks, keine XP-Punkte. Das Spiel selbst ist das Spiel. Die Metrics im Business Model sind das Scoring-System. Dein MRR IST dein Score.

---

## 4. Ton-Beispiele

### 4.1 Event

```
THE QUIET EXODUS

People are leaving. Not dramatically - no angry emails, no public
complaints. They just stop logging in. You check the dashboard at 
midnight, hoping the number changed. It didn't.
```

Nicht:
```
⚠️ CHURN ALERT! 🚨

Oh no! Your users are churning at an alarming rate! This could be 
a critical threat to your startup's success. Let's explore what 
you can do about this challenging situation!
```

### 4.2 Choice

```
[A] Call every churned user and ask why.                    · 2 AP
[B] Build an onboarding flow with tutorials.                · 1 AP
[C] Switch to annual plans to lock them in.                 · 1 AP
```

Nicht:
```
[A] 📞 Reach out to churned users for valuable feedback!    
[B] 🛠️ Improve the user experience with better onboarding!  
[C] 📋 Implement annual subscriptions for better retention!  
```

### 4.3 Feedback

```
8 out of 15 replied. Same pattern: they solved their acute 
problem and didn't need you anymore. Your retention model 
assumes ongoing use. The data says otherwise. 

The two who were most honest said they felt guilty cancelling
because the product was good. Just not good enough to keep paying
for something they don't need every day.
```

Nicht:
```
Great news - you got valuable feedback! 8 users shared their 
thoughts with you. The key insight is that your product might 
be solving a one-time problem rather than an ongoing need. 
This is actually a really common challenge for SaaS startups!
```

### 4.4 Board Meeting Feedback

```
SELF-REVIEW (Q1, no investors):
"CAC is 37% above forecast. Pipeline thinner than expected. 
The price point holds but acquisition is the bottleneck. 
Something about the channel isn't right."

ANGEL (Q2):
"Your LTV:CAC is at 1.4. I've seen this pattern before - 
usually means the channel is wrong, not the product. Where 
are your customers actually coming from? Not where you think 
they're coming from. Where the data says they are."

LEAD INVESTOR (Q3):
"You forecasted €8K MRR by month 9. You're at €3.2K. 
I need a revised plan by next board meeting. And I need 
to understand what changed from last quarter's optimism."
```

### 4.5 Game Over

```
Month 11. Cash: €0.

Your LTV reached €340 in the last month. CAC was at €95.
The economics were starting to work. The runway wasn't long
enough to find out if they'd hold.

Mira is updating her LinkedIn. Jonas is already sketching 
the next idea on a napkin.
```

Nicht:
```
💀 GAME OVER 💀

Unfortunately, your startup has run out of funding! 
But don't worry - every failure is a learning opportunity! 
Why not try again with different assumptions?
```

### 4.6 Win

```
Month 16. Revenue exceeds burn for the third consecutive month.

Customers refer other customers. Your forecast from month 1 
was wrong about almost everything - but the building you built 
is better than the one you drew. It usually is.

Somewhere in Berlin, a restaurant owner tells another restaurant
owner about a tool that changed how she runs inventory. She 
doesn't know your name. She knows your product. That's PMF.
```

---

## 5. Zusammenfassung der Regeln

### Visual
1. Helles, warmes Theme. Kein Dark Mode.
2. Farbe nur funktional: Rot = Gefahr, Blau = Plan, Schwarz = Fakt, Gelb = Achtung, Grün = Validiert.
3. Bauhaus-Geometrie für Klassen-Logos. Keine Illustrationen.
4. Space Mono nur für Zahlen. Outfit/DM Sans für alles andere.
5. Keine Schatten, keine Gradienten, keine abgerundeten Ecken >4px.
6. 8px Grundraster. Keine Ausnahmen.

### Text
7. Kurz. 2-3 Sätze pro Element. Jedes Wort muss sich seinen Platz verdienen.
8. Konkret. Zahlen statt Adjektive. "CAC: €140" statt "acquisition is expensive".
9. Konsequenzen, nicht Urteile. Das Spiel zeigt, der Spieler bewertet.
10. Kein Startup-Jargon als Dekoration. Kein Motivational Speak. Kein Sarkasmus.
11. Keine Emojis im Spieltext. Nie.
12. Zweite Person ("Du", "Dein"), nie Passiv.

### UX
13. Keine Modals. Nie.
14. Keine Tooltips für kritische Info.
15. Kein Onboarding-Tutorial. Das Spiel erklärt sich selbst.
16. Keine Gamification (Badges, Achievements, XP). Die Business-Metriken sind das Scoring.
17. Mobile-first Layout. Touch-Targets ≥44px.
18. Zahlen-Animationen: 300ms, kein Bounce. Graph-Linien: 800ms draw.
