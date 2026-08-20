import { ComparableDraft, summarizeDraftDifferences } from "@/lib/draftComparison";
import { Check, Columns2, FileText, X } from "lucide-react";
import { useEffect } from "react";

type DraftComparisonSheetProps = {
  left: (ComparableDraft & { programCategory: string; website: string; updatedAt: Date }) | null;
  right: (ComparableDraft & { programCategory: string; website: string; updatedAt: Date }) | null;
  onClose: () => void;
};

function formatStatus(status: string) {
  return status === "approved" ? "intern freigegeben" : status === "archived" ? "archiviert" : "Entwurf";
}

function DraftColumn({ draft, label }: { draft: NonNullable<DraftComparisonSheetProps["left"]>; label: string }) {
  return (
    <article className="comparison-column">
      <div className="comparison-column-head"><span>{label}</span><time>{new Date(draft.updatedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}</time></div>
      <h3>{draft.programName}</h3><p className="comparison-category">{draft.programCategory} · {draft.website}</p>
      <dl className="comparison-metadata"><div><dt>STATUS</dt><dd>{formatStatus(draft.status)}</dd></div><div><dt>ZIELGRUPPE</dt><dd>{draft.audience}</dd></div><div><dt>INHALTSPLAN</dt><dd>{draft.contentPlan}</dd></div></dl>
      <section><span>ENTWURFSTEXT</span><p>{draft.generatedDraft}</p></section>
      <section className="comparison-disclosure"><span>OFFENLEGUNG</span><p>{draft.disclosure}</p></section>
    </article>
  );
}

export function DraftComparisonSheet({ left, right, onClose }: DraftComparisonSheetProps) {
  useEffect(() => {
    if (!left || !right) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [left, onClose, right]);

  if (!left || !right) return null;
  const differences = summarizeDraftDifferences(left, right);
  const sameProgram = left.programName === right.programName;

  return (
    <div className="comparison-overlay" role="dialog" aria-modal="true" aria-label="Entwürfe vergleichen">
      <button className="detail-scrim" aria-label="Vergleich schließen" onClick={onClose} />
      <section className="comparison-sheet">
        <header className="comparison-header"><div><div className="assistant-eyebrow"><Columns2 size={13} /> DIREKTVERGLEICH / GESPEICHERTE ENTWÜRFE</div><h2>Zwei Entwurfsstände im Vergleich</h2><p>{sameProgram ? "Beide ausgewählten Stände beziehen sich auf dasselbe Programm." : "Die ausgewählten Entwürfe stammen aus unterschiedlichen Programmkandidaten."}</p></div><button className="assistant-close" onClick={onClose} aria-label="Vergleich schließen"><X size={19} /></button></header>
        <div className="comparison-summary"><FileText size={16} /><div><strong>{differences.length === 0 ? "In den verglichenen Feldern gibt es keinen Unterschied." : `${differences.length} Unterschiede erkannt: ${differences.join(", ")}.`}</strong><span>Der Vergleich ändert keinen Entwurf und löst keine externe Aktion aus.</span></div></div>
        <div className="comparison-grid"><DraftColumn draft={left} label="ENTWURFSSTAND A" /><DraftColumn draft={right} label="ENTWURFSSTAND B" /></div>
        <footer className="comparison-footer"><Check size={15} />Vergleich dient der internen Prüfung. Gespeicherte Entwürfe bleiben unverändert.</footer>
      </section>
    </div>
  );
}
