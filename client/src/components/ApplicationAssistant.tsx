import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  KeyRound,
  Loader2,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type ApplicationAssistantProps = {
  open: boolean;
  onClose: () => void;
};

const channelOptions = ["Blog / Website", "Newsletter", "YouTube", "Instagram", "LinkedIn"];

function parseList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function ApplicationAssistant({ open, onClose }: ApplicationAssistantProps) {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const statusQuery = trpc.assistant.status.useQuery(undefined, { staleTime: 30_000 });
  const draftsQuery = trpc.assistant.listDrafts.useQuery(undefined, { enabled: isAuthenticated });
  const [programName, setProgramName] = useState("Everflow-Demo-Netzwerk");
  const [programCategory, setProgramCategory] = useState("Software & Tools");
  const [website, setWebsite] = useState("");
  const [audience, setAudience] = useState("");
  const [contentPlan, setContentPlan] = useState("");
  const [channels, setChannels] = useState<string[]>(["Blog / Website"]);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [disclosureConfirmed, setDisclosureConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);

  const generateMutation = trpc.assistant.generateDraft.useMutation({
    onSuccess: (result) => {
      setActiveDraftId(result.draft?.id ?? null);
      setError("");
      void utils.assistant.listDrafts.invalidate();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const statusMutation = trpc.assistant.setDraftStatus.useMutation({
    onSuccess: (draft) => {
      setActiveDraftId(draft?.id ?? null);
      void utils.assistant.listDrafts.invalidate();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const drafts = draftsQuery.data ?? [];
  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === activeDraftId) ?? drafts[0],
    [activeDraftId, drafts],
  );

  const selectProgram = (value: string) => {
    if (value === "Everflow-Demo-Netzwerk") {
      setProgramCategory("Software & Tools");
    } else if (value === "Impact-Programm-Katalog") {
      setProgramCategory("Marktplatz");
    } else {
      setProgramCategory("E-Commerce");
    }
    setProgramName(value);
  };

  const toggleChannel = (channel: string) => {
    setChannels((current) => current.includes(channel)
      ? current.filter((item) => item !== channel)
      : [...current, channel]);
  };

  const canGenerate = Boolean(
    isAuthenticated
    && website.trim()
    && audience.trim().length >= 12
    && contentPlan.trim().length >= 20
    && channels.length > 0
    && reviewConfirmed
    && disclosureConfirmed
    && statusQuery.data?.configured,
  );

  const createDraft = () => {
    setError("");
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    generateMutation.mutate({
      programName,
      programCategory,
      website,
      audience,
      promotionChannels: channels,
      contentPlan,
    });
  };

  if (!open) return null;

  const risks = selectedDraft ? parseList(selectedDraft.riskNotes) : [];
  const steps = selectedDraft ? parseList(selectedDraft.nextSteps) : [];

  return (
    <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label="Bewerbungsassistent">
      <button className="assistant-scrim" aria-label="Assistent schließen" onClick={onClose} />
      <section className="assistant-sheet">
        <header className="assistant-header">
          <div>
            <div className="assistant-eyebrow"><Sparkles size={13} /> OPENROUTER / ENTWURFSMODUS</div>
            <h2>Bewerbungsassistent</h2>
            <p>Erstellt einen prüfbaren Entwurf. Er sendet keine Bewerbung und eröffnet keine Konten.</p>
          </div>
          <button className="assistant-close" onClick={onClose} aria-label="Assistent schließen"><X size={19} /></button>
        </header>

        <div className="assistant-security-strip">
          <LockKeyhole size={15} />
          <span>OpenRouter-Schlüssel bleibt auf dem Server. Browser und Entwurf sehen ihn nie.</span>
          <span className={`assistant-config ${statusQuery.data?.configured ? "assistant-config-ready" : ""}`}>
            <i />{statusQuery.data?.configured ? "verbunden" : "nicht konfiguriert"}
          </span>
        </div>

        {!isAuthenticated && !loading && (
          <div className="assistant-login-card">
            <KeyRound size={19} />
            <div><strong>Anmeldung erforderlich</strong><p>Entwürfe werden nur in Ihrem geschützten Arbeitsraum gespeichert.</p></div>
            <button onClick={() => startLogin()}>Anmelden <ArrowUpRight size={14} /></button>
          </div>
        )}

        <div className="assistant-body">
          <div className="assistant-form-column">
            <div className="assistant-section-title"><span>01 /</span><h3>Programm & Profil</h3></div>
            <label className="assistant-field"><span>PROGRAMM</span><div className="select-wrap"><select value={programName} onChange={(event) => selectProgram(event.target.value)}><option>Everflow-Demo-Netzwerk</option><option>Impact-Programm-Katalog</option><option>Awin-Programm-Katalog</option></select><ChevronDown size={15} /></div></label>
            <label className="assistant-field"><span>WEBSITE ODER PROFIL</span><input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://ihre-seite.de" type="url" /></label>
            <label className="assistant-field"><span>ZIELGRUPPE</span><textarea value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Wen erreichen Sie? Nennen Sie Thema, Sprache und Interesse – ohne unbestätigte Kennzahlen." rows={3} /></label>
            <label className="assistant-field"><span>KANÄLE</span><div className="channel-grid">{channelOptions.map((channel) => <button key={channel} type="button" className={`channel-option ${channels.includes(channel) ? "channel-selected" : ""}`} onClick={() => toggleChannel(channel)}><span>{channels.includes(channel) && <Check size={12} />}</span>{channel}</button>)}</div></label>
            <label className="assistant-field"><span>INHALTSPLAN</span><textarea value={contentPlan} onChange={(event) => setContentPlan(event.target.value)} placeholder="Wie soll das Programm transparent und nützlich vorgestellt werden?" rows={4} /></label>

            <div className="confirmation-block">
              <label><input type="checkbox" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} /><span>Ich prüfe alle Angaben, bevor sie extern verwendet werden.</span></label>
              <label><input type="checkbox" checked={disclosureConfirmed} onChange={(event) => setDisclosureConfirmed(event.target.checked)} /><span>Eine sichtbare Affiliate-Offenlegung ist vorgesehen.</span></label>
            </div>

            {error && <div className="assistant-error"><AlertTriangle size={15} />{error}</div>}
            {!statusQuery.data?.configured && <div className="assistant-error assistant-warning"><KeyRound size={15} />OpenRouter ist noch nicht erreichbar. Hinterlegen Sie den Schlüssel in den Projekteinstellungen.</div>}

            <button className="assistant-generate" disabled={!canGenerate || generateMutation.isPending} onClick={createDraft}>
              {generateMutation.isPending ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
              {generateMutation.isPending ? "Entwurf wird erstellt …" : "Prüfbaren Entwurf erzeugen"}
            </button>
          </div>

          <div className="assistant-result-column">
            <div className="assistant-section-title"><span>02 /</span><h3>Entwurf prüfen</h3></div>
            {draftsQuery.isLoading ? <div className="assistant-empty"><Loader2 className="spin" size={18} />Entwürfe werden geladen …</div> : selectedDraft ? (
              <article className="generated-draft-card">
                <div className="draft-card-top"><span className={`draft-status draft-${selectedDraft.status}`}><i />{selectedDraft.status === "approved" ? "intern freigegeben" : "Entwurf"}</span><span>{new Date(selectedDraft.updatedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                <h4>{selectedDraft.programName}</h4>
                <p className="draft-boundary"><ShieldCheck size={14} />Entwurf gespeichert · keine Bewerbung versendet</p>
                <section><span className="draft-label">BEWERBUNGSENTWURF</span><p className="draft-content">{selectedDraft.generatedDraft}</p></section>
                <section className="disclosure-section"><span className="draft-label">OFFENLEGUNG</span><p>{selectedDraft.disclosure}</p></section>
                <section className="draft-list-section"><span className="draft-label">PRÜFPUNKTE</span><ul>{risks.map((risk) => <li key={risk}><AlertTriangle size={13} />{risk}</li>)}</ul></section>
                <section className="draft-list-section"><span className="draft-label">NÄCHSTE SCHRITTE</span><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
                {selectedDraft.status === "draft" && <div className="draft-actions"><button className="draft-archive" onClick={() => statusMutation.mutate({ id: selectedDraft.id, status: "archived" })}>Verwerfen</button><button className="draft-approve" onClick={() => statusMutation.mutate({ id: selectedDraft.id, status: "approved" })}>{statusMutation.isPending ? "Aktualisiert …" : "Intern freigeben"}<Check size={14} /></button></div>}
              </article>
            ) : (
              <div className="assistant-empty"><FileText size={25} /><strong>Kein Entwurf gespeichert</strong><p>Füllen Sie links das Profil aus. Der Assistent erzeugt anschließend einen Entwurf zur Prüfung.</p></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
