import { describe, expect, it } from "vitest";
import { reconcileSelectedDraftIds, summarizeDraftDifferences } from "./draftComparison";

const baseDraft = {
  id: 1,
  programName: "Everflow-Demo-Netzwerk",
  status: "draft",
  audience: "Deutschsprachige Tool-Nutzer",
  contentPlan: "Praxisorientierter Leitfaden",
  generatedDraft: "Ein transparenter Entwurf.",
  disclosure: "Dieser Beitrag enthält Affiliate-Links.",
};

describe("summarizeDraftDifferences", () => {
  it("meldet keine Unterschiede bei identischen Entwurfsständen", () => {
    expect(summarizeDraftDifferences(baseDraft, { ...baseDraft, id: 2 })).toEqual([]);
  });

  it("benennt nur die tatsächlich veränderten Vergleichsfelder", () => {
    expect(summarizeDraftDifferences(baseDraft, {
      ...baseDraft,
      id: 3,
      status: "approved",
      contentPlan: "Ausführlicher Vergleich mit Beispielen",
      generatedDraft: "Überarbeiteter transparenter Entwurf.",
    })).toEqual(["Status", "Inhaltsplan", "Entwurfstext"]);
  });

  it("behält die vorhandene Auswahlreferenz, wenn alle ausgewählten Entwürfe noch verfügbar sind", () => {
    const selected = [4, 9];

    expect(reconcileSelectedDraftIds(selected, [4, 9, 12])).toBe(selected);
  });

  it("entfernt nur Auswahlen, die nicht mehr in den Suchergebnissen enthalten sind", () => {
    expect(reconcileSelectedDraftIds([4, 9], [9, 12])).toEqual([9]);
  });
});
