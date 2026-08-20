import { describe, expect, it } from "vitest";
import { summarizeWorkspace } from "./workspaceSummary";

describe("summarizeWorkspace", () => {
  it("zeigt ohne gespeicherte Unterlagen einen sicheren Einstieg", () => {
    const summary = summarizeWorkspace([]);

    expect(summary).toMatchObject({ total: 0, drafts: 0, approved: 0, archived: 0 });
    expect(summary.nextAction.title).toBe("Ersten Entwurf vorbereiten");
  });

  it("priorisiert einen offenen Entwurf vor allen anderen Zuständen", () => {
    const summary = summarizeWorkspace([
      { status: "draft", programName: "Everflow-Demo-Netzwerk", updatedAt: new Date("2026-08-20T08:44:00Z") },
      { status: "approved", programName: "Impact-Programm-Katalog", updatedAt: new Date("2026-08-19T08:44:00Z") },
    ]);

    expect(summary).toMatchObject({ total: 2, drafts: 1, approved: 1, archived: 0 });
    expect(summary.nextAction).toMatchObject({ title: "Entwurf intern prüfen" });
  });

  it("führt bei ausschließlich freigegebenen Unterlagen zur Dokumentation", () => {
    const summary = summarizeWorkspace([
      { status: "approved", programName: "Awin-Programm-Katalog", updatedAt: new Date("2026-08-20T08:44:00Z") },
    ]);

    expect(summary).toMatchObject({ total: 1, drafts: 0, approved: 1, archived: 0 });
    expect(summary.nextAction.title).toBe("Freigaben dokumentieren");
  });
});
