import {
  ArrowUpRight,
  Check,
  FileCheck2,
  Link2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect } from "react";

export type CatalogProgram = {
  name: string;
  category: string;
  status: string;
  tone: "amber" | "ink";
  mark: string;
  summary: string;
  reviewFocus: string;
  disclosure: string;
  nextStep: string;
};

type ProgramDetailSheetProps = {
  program: CatalogProgram | null;
  onClose: () => void;
  onOpenAssistant: () => void;
};

export function ProgramDetailSheet({ program, onClose, onOpenAssistant }: ProgramDetailSheetProps) {
  useEffect(() => {
    if (!program) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, program]);

  if (!program) return null;

  const steps = [
    { icon: Check, label: "Katalogeintrag", detail: "Programm im Simulations-Katalog erfasst.", tone: "complete" },
    { icon: FileCheck2, label: "Profilabgleich", detail: program.reviewFocus, tone: program.status === "Entwurf" ? "current" : "pending" },
    { icon: LockKeyhole, label: "Interne Freigabe", detail: "Bleibt eine bewusste Entscheidung im geschützten Arbeitsraum.", tone: "pending" },
    { icon: Link2, label: "Externe Nutzung", detail: "Nicht automatisiert und nicht Teil dieser Ansicht.", tone: "muted" },
  ];

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-label={`Programmdetails: ${program.name}`}>
      <button className="detail-scrim" aria-label="Programmdetails schließen" onClick={onClose} />
      <section className="detail-sheet">
        <header className="detail-header">
          <div>
            <div className="assistant-eyebrow"><ShieldCheck size={13} /> PROGRAMM / SIMULATIONS-KATALOG</div>
            <div className="detail-title-row"><span className={`program-monogram monogram-${program.tone}`}>{program.mark}</span><div><h2>{program.name}</h2><p>{program.category} · Status: {program.status}</p></div></div>
          </div>
          <button className="assistant-close" onClick={onClose} aria-label="Programmdetails schließen"><X size={19} /></button>
        </header>

        <div className="detail-boundary"><LockKeyhole size={15} /><span>Diese Ansicht fasst Kataloginformationen zusammen. Sie bewirbt sich nicht, erstellt keine Konten und erzeugt keine Live-Links.</span></div>

        <div className="detail-body">
          <section className="detail-lead">
            <span className="detail-label">PROGRAMMÜBERBLICK</span>
            <p>{program.summary}</p>
            <div className="detail-info-grid">
              <div><span>PRÜFFOKUS</span><strong>{program.reviewFocus}</strong></div>
              <div><span>OFFENLEGUNG</span><strong>{program.disclosure}</strong></div>
              <div><span>NÄCHSTER SCHRITT</span><strong>{program.nextStep}</strong></div>
            </div>
          </section>

          <section className="detail-rail-section">
            <div className="assistant-section-title"><span>01 /</span><h3>Prüfpfad</h3></div>
            <div className="detail-steps">
              {steps.map(({ icon: Icon, label, detail, tone }) => <div className={`detail-step detail-step-${tone}`} key={label}><span><Icon size={14} /></span><div><strong>{label}</strong><p>{detail}</p></div></div>)}
            </div>
          </section>

          <section className="detail-action-card">
            <div><span className="detail-label">KLARE HANDLUNGSGRENZE</span><h3>Erst prüfen, dann entscheiden.</h3><p>Ein Entwurf kann vorbereitet werden; jede externe Verwendung bleibt ausdrücklich außerhalb des automatisierten Ablaufs.</p></div>
            <button onClick={() => { onClose(); onOpenAssistant(); }}>Entwurf vorbereiten <ArrowUpRight size={15} /></button>
          </section>
        </div>
      </section>
    </div>
  );
}
