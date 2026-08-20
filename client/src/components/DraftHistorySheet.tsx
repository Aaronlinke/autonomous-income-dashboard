import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, FileText, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DraftHistorySheetProps = {
  open: boolean;
  onClose: () => void;
};

const filters = [
  { value: "all", label: "Alle" },
  { value: "draft", label: "Entwurf" },
  { value: "approved", label: "Freigegeben" },
  { value: "archived", label: "Archiviert" },
] as const;

type DraftStatusFilter = (typeof filters)[number]["value"];

function parseChannels(value: string) {
  try {
    const channels = JSON.parse(value);
    return Array.isArray(channels) ? channels.map(String) : [];
  } catch {
    return [];
  }
}

function formatStatus(status: string) {
  return status === "approved" ? "intern freigegeben" : status === "archived" ? "archiviert" : "Entwurf";
}

export function DraftHistorySheet({ open, onClose }: DraftHistorySheetProps) {
  const { isAuthenticated, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<DraftStatusFilter>("all");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 220);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  const queryInput = useMemo(() => ({ query: debouncedSearch, status }), [debouncedSearch, status]);
  const historyQuery = trpc.assistant.searchDrafts.useQuery(queryInput, { enabled: open && isAuthenticated });
  const drafts = historyQuery.data ?? [];

  if (!open) return null;

  return (
    <div className="detail-overlay history-overlay" role="dialog" aria-modal="true" aria-label="Entwurfshistorie">
      <button className="detail-scrim" aria-label="Entwurfshistorie schließen" onClick={onClose} />
      <section className="detail-sheet history-sheet">
        <header className="detail-header">
          <div><div className="assistant-eyebrow"><FileText size={13} /> GESCHÜTZTER ARBEITSRAUM</div><h2>Entwurfshistorie</h2><p>Durchsuchen Sie eigene gespeicherte Entwürfe. Ergebnisse enthalten keine ausgelösten externen Aktionen.</p></div>
          <button className="assistant-close" onClick={onClose} aria-label="Entwurfshistorie schließen"><X size={19} /></button>
        </header>

        {!isAuthenticated && !loading ? (
          <div className="history-login"><FileText size={20} /><div><strong>Anmeldung erforderlich</strong><p>Ihre persönliche Entwurfshistorie wird ausschließlich in Ihrem geschützten Arbeitsraum geladen.</p></div><button onClick={() => startLogin()}>Anmelden</button></div>
        ) : (
          <div className="history-body">
            <div className="history-controls">
              <label className="history-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Programm, Kategorie, Website oder Entwurf durchsuchen" /></label>
              <div className="history-filter" aria-label="Status filtern"><SlidersHorizontal size={15} />{filters.map((filter) => <button key={filter.value} className={status === filter.value ? "filter-active" : ""} onClick={() => setStatus(filter.value)}>{filter.label}</button>)}</div>
            </div>

            {historyQuery.isLoading ? <div className="history-state"><Loader2 className="spin" size={19} />Historie wird geladen …</div> : historyQuery.isError ? <div className="history-state history-state-error"><AlertTriangle size={19} /><div><strong>Historie derzeit nicht erreichbar</strong><p>Ihre Entwürfe wurden nicht verändert. Versuchen Sie den Abgleich erneut.</p></div><button onClick={() => void historyQuery.refetch()}>Erneut abgleichen</button></div> : drafts.length > 0 ? (
              <div className="history-results">
                <div className="history-results-meta"><span>{drafts.length} {drafts.length === 1 ? "Treffer" : "Treffer"}</span><span>{debouncedSearch ? `Suche: „${debouncedSearch}“` : "Neueste Änderung zuerst"}</span></div>
                {drafts.map((draft) => <article className="history-draft" key={draft.id}>
                  <div className="history-draft-head"><span className={`draft-status draft-${draft.status}`}><i />{formatStatus(draft.status)}</span><time>{new Date(draft.updatedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}</time></div>
                  <h3>{draft.programName}</h3><p className="history-category">{draft.programCategory} · {draft.website}</p>
                  <p className="history-excerpt">{draft.generatedDraft}</p>
                  <div className="history-draft-foot"><span>{parseChannels(draft.promotionChannels).join(" · ") || "Keine Kanäle"}</span><span>gespeichert, nicht versendet</span></div>
                </article>)}
              </div>
            ) : <div className="history-state"><FileText size={25} /><strong>Keine passenden Entwürfe</strong><p>Ändern Sie die Suche oder den Statusfilter. Es wird nichts aus der Historie gelöscht.</p></div>}
          </div>
        )}
      </section>
    </div>
  );
}
