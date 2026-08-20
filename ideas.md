# Design-Brainstorming – Autonomous Income Blueprint Dashboard

## Ansatz 1: Signal Observatory

**Very Brief Intro:** Ein ruhiges, redaktionelles Kontrollzentrum mit warmem Papiergrund, tiefem Tintenblau und einem klaren Signalgrün. Die Oberfläche wirkt wie ein präzises Lagebild: vertrauenswürdig, fokussiert und erklärbar.

**Probability:** 0.07

## Ansatz 2: Midnight Relay

**Very Brief Intro:** Eine dunkle, technische Kommandozentrale mit gedämpften Cyan-Akzenten und präzisen Statuslinien. Der Bot wird als stiller, zuverlässiger Hintergrunddienst inszeniert, nicht als spektakuläre Blackbox.

**Probability:** 0.03

## Ansatz 3: Copper Ledger

**Very Brief Intro:** Eine markante Finanz- und Verlagsästhetik mit cremefarbenem Grund, Kupferdetails und kräftiger Grotesktypografie. Der Fokus liegt auf Fortschritt, Verantwortlichkeit und einem greifbaren Arbeitsfluss.

**Probability:** 0.09

# Gewählte Richtung: Signal Observatory

## Design Movement

**Swiss Editorial Modernism** trifft auf eine zeitgemäße Operations-Oberfläche. Strenge Informationshierarchie, sichtbare Zustände und ein bewusst analog wirkender Materialkontrast machen das System nachvollziehbar statt mystisch.

## Core Principles

1. **Signal vor Dekoration:** Jeder Akzent kommuniziert Zustand, Priorität oder nächste Aktion.
2. **Erklärbare Automatisierung:** Der Bot zeigt nicht nur Ergebnisse, sondern auch Freigaben, Quellen und Grenzen.
3. **Redaktionelle Ruhe:** Großzügige Ränder, markante Überschriften und kurze erklärende Texte reduzieren kognitive Last.
4. **Sicherheitsbewusste Dynamik:** Bewegung bestätigt Aktionen, verschleiert aber niemals, ob ein Vorgang simuliert oder live ist.

## Color Philosophy

Der Hintergrund ist ein warmes, leicht graues Papierweiß, damit Datenkarten nicht steril wirken. Tiefes Tintenblau bildet die Vertrauensfarbe für Navigation und Primärtext. Ein eigenes Signalgrün markiert bestätigte Zustände, während Bernstein ausschließlich für Freigaben, fehlende Schlüssel und Prüfungen reserviert bleibt. Ein gedämpftes Korallenrot bleibt Fehlern vorbehalten. Es gibt keine großflächigen Farbverläufe; Tiefe entsteht durch Material, Schatten und feine Linien.

## Layout Paradigm

Ein persistenter, schmaler Navigationsstreifen links verankert den Kontext. Der Hauptbereich arbeitet mit einer asymmetrischen "Lagebild zuerst, Details danach"-Komposition: oben ein Statusband, darunter ein breites Agenten-Panel und eine schmale rechte Spalte für Freigaben und Audit-Signale. Tabellen und Karten sind nicht überall gleich groß, sondern folgen ihrer Wichtigkeit.

## Signature Elements

1. **Signal Rail:** Eine vertikale Linie mit kleinen Zustandsmarkern, die den Ablauf Entdeckt → Entwurf → Freigabe → Link sichtbar macht.
2. **Paper grain:** Ein sehr dezentes, ausschließlich per CSS erzeugtes Körnungsmuster in großen Flächen.
3. **Stamped status:** Statuschips wirken wie präzise gesetzte redaktionelle Stempel, nicht wie beliebige Pillen.

## Interaction Philosophy

Jede Aktion beantwortet sofort drei Fragen: Was wurde ausgelöst? Ist es Simulation oder live? Was muss der Nutzer noch bestätigen? Buttons sind klar und konkret beschriftet; destruktive oder externe Aktionen bleiben hinter einer expliziten Freigabe. Hover-Zustände geben Tiefe, Fokuszustände bleiben deutlich sichtbar.

## Animation

Die Seite erscheint in kurzen 40–70-ms-Staffeln, damit die Informationshierarchie lesbar wird. Karten heben sich beim Hover nur um 2px und verändern Schatten/Border, nicht ihre Größe. Aktualisieren rotiert ausschließlich das Icon. Erfolgszustände erhalten einen kurzen Signal-Puls, der unter `prefers-reduced-motion` deaktiviert wird.

## Typography System

**Display:** Space Grotesk, 600–700, für große Lagebild-Überschriften und Zahlen. **Body:** IBM Plex Sans, 400–600, für lesbare Status- und Hilfstexte. Kleine Metadaten erscheinen in IBM Plex Mono, 500, mit leicht erhöhter Laufweite. H1 44/48, H2 24/30, Kartenwert 28/32, Body 15/24, Meta 11/16.

## Brand Essence

**Positioning:** Ein erklärbares Autonomie-Dashboard für Menschen, die Einkommensprozesse überwachen wollen, ohne die Kontrolle über Freigaben und Compliance abzugeben.

**Personality:** präzise, ruhig, verantwortungsvoll.

## Brand Voice

Überschriften sind knapp und sachlich. CTAs beschreiben die Handlung statt einen generischen Start zu versprechen. Microcopy sagt offen, ob etwas simuliert, blockiert oder bereit ist.

Beispielzeilen:

> „Automatisierung mit sichtbarer Verantwortung.“

> „Katalog prüfen – noch keine Bewerbung senden.“

## Wordmark & Logo

Das Markenzeichen ist ein grafisches **Signal-S**: zwei versetzte, eckige Linien bilden ein abstrahiertes S und zugleich einen Datenpfad. Kein ausgeschriebener Name im Icon. Die Wortmarke setzt „AUTONOMOUS“ in Space Grotesk mit weitem Tracking und „INCOME / BLUEPRINT“ als kleine Monospace-Zeile darunter.

## Signature Brand Color

**Signalgrün #A6E86B** – ein helles, nicht fluoreszierendes Grün, das Fortschritt und bestätigte Handlung markiert, ohne in eine Gaming- oder Neonästhetik abzurutschen.

## Style Decisions

- Die Oberfläche bleibt standardmäßig hell und nutzt Tintenblau, Papierweiß, Signalgrün und Bernstein als semantische Farben.
- Der Simulationsmodus wird immer sichtbar benannt; simulierte Links werden niemals als echte Einnahmen dargestellt.
- Keine generischen Fülltexte wie „Willkommen“ oder „Loslegen“; jede Beschriftung beschreibt den konkreten Systemzustand.
