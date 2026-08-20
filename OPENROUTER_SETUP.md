# OpenRouter: sichere Einrichtung im Autonomous Income Blueprint

Der Schlüssel `OPENROUTER_API_KEY` wird ausschließlich als **serverseitiges Geheimnis** hinterlegt. Er wird nie an React-Komponenten, Browser-Speicher, Versionsverwaltung, Chatnachrichten oder Protokolle weitergegeben. Das Dashboard erhält lediglich den nicht-sensiblen Status, ob eine Konfiguration vorhanden ist.

| Bereich | Vorgabe |
|---|---|
| Ablage | Sichere Projekt-Geheimnisverwaltung mit dem Namen `OPENROUTER_API_KEY` |
| Nutzung | Ausschließlich im Servermodul `server/openrouter.ts` |
| Browser | Keine Schlüsselübertragung; nur `configured`, Modellname und Entwurfsmodus |
| Tests | Serverseitiger Modellkatalog-Test ohne Ausgabe des Schlüsselwerts |
| Freigabe | KI erstellt nur Entwürfe; externe Bewerbungen bleiben ein separater, bestätigungspflichtiger Schritt |

Für die Einrichtung wird der Schlüssel in der sicheren Eingabekarte des Projekts hinterlegt. Danach validiert der Test `server/openrouter.secret.test.ts` die serverseitige Authentifizierung über den Modellkatalog. Ein fehlgeschlagener Test bedeutet, dass der Schlüssel neu hinterlegt oder geprüft werden muss.

> Der Assistent darf keine Reichweite, Erfahrung, Genehmigungen, Umsätze oder Partnerschaften erfinden. Jeder Entwurf muss vor einer externen Nutzung fachlich und rechtlich geprüft werden.
