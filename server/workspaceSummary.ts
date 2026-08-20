export type DraftWorkspaceItem = {
  status: "draft" | "approved" | "archived";
  programName: string;
  updatedAt: Date;
};

export type WorkspaceSummary = {
  total: number;
  drafts: number;
  approved: number;
  archived: number;
  nextAction: {
    title: string;
    detail: string;
    boundary: string;
  };
};

export function summarizeWorkspace(drafts: DraftWorkspaceItem[]): WorkspaceSummary {
  const counts = drafts.reduce(
    (summary, draft) => {
      summary.total += 1;
      summary[draft.status === "draft" ? "drafts" : draft.status === "approved" ? "approved" : "archived"] += 1;
      return summary;
    },
    { total: 0, drafts: 0, approved: 0, archived: 0 },
  );

  const latestDraft = drafts[0];

  if (counts.drafts > 0 && latestDraft) {
    return {
      ...counts,
      nextAction: {
        title: "Entwurf intern prüfen",
        detail: `${latestDraft.programName} wartet auf Ihre fachliche Prüfung und Bestätigung.`,
        boundary: "Keine Bewerbung oder Übertragung wird automatisch ausgelöst.",
      },
    };
  }

  if (counts.approved > 0 && latestDraft) {
    return {
      ...counts,
      nextAction: {
        title: "Freigaben dokumentieren",
        detail: `${counts.approved} intern freigegebene ${counts.approved === 1 ? "Unterlage ist" : "Unterlagen sind"} im Arbeitsraum abgelegt.`,
        boundary: "Eine externe Nutzung bleibt ein bewusst separater Schritt.",
      },
    };
  }

  return {
    ...counts,
    nextAction: {
      title: "Ersten Entwurf vorbereiten",
      detail: "Hinterlegen Sie Profil, Zielgruppe und Inhaltsplan, um einen prüfbaren Entwurf zu erzeugen.",
      boundary: "Der Assistent erstellt ausschließlich einen Entwurf und versendet nichts.",
    },
  };
}
