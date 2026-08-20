export type ComparableDraft = {
  id: number;
  programName: string;
  status: string;
  audience: string;
  contentPlan: string;
  generatedDraft: string;
  disclosure: string;
};

const comparisonFields = [
  { key: "status", label: "Status" },
  { key: "audience", label: "Zielgruppe" },
  { key: "contentPlan", label: "Inhaltsplan" },
  { key: "generatedDraft", label: "Entwurfstext" },
  { key: "disclosure", label: "Offenlegung" },
] as const;

export function summarizeDraftDifferences(left: ComparableDraft, right: ComparableDraft) {
  return comparisonFields
    .filter((field) => left[field.key] !== right[field.key])
    .map((field) => field.label);
}

export function reconcileSelectedDraftIds(current: number[], availableIds: readonly number[]) {
  const available = new Set(availableIds);
  const next = current.filter((id) => available.has(id));
  return next.length === current.length ? current : next;
}
