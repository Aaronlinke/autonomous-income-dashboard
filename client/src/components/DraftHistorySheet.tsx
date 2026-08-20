import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { reconcileSelectedDraftIds } from "@/lib/draftComparison";
import { DraftComparisonSheet } from "@/components/DraftComparisonSheet";
import { AlertTriangle, Check, FileText, GitCompareArrows, Loader2, Save, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
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
  const [filterName, setFilterName] = useState("");
  const [selectedDraftIds, setSelectedDraftIds] = useState<number[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [filterFeedback, setFilterFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

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
  const savedFiltersQuery = trpc.assistant.listSavedFilters.useQuery(undefined, { enabled: open && isAuthenticated });
  const utils = trpc.useUtils();
  const saveFilterMutation = trpc.assistant.saveDraftFilter.useMutation({
    onSuccess: () => {
      setFilterName("");
      setFilterFeedback({ tone: "success", text: "Filtervorlage wurde im geschützten Arbeitsraum gespeichert." });
      void utils.assistant.listSavedFilters.invalidate();
    },
    onError: (error) => setFilterFeedback({ tone: "error", text: error.message }),
  });
  const deleteFilterMutation = trpc.assistant.deleteSavedFilter.useMutation({
    onSuccess: () => {
      setFilterFeedback({ tone: "success", text: "Filtervorlage wurde entfernt." });
      void utils.assistant.listSavedFilters.invalidate();
    },
    onError: (error) => setFilterFeedback({ tone: "error", text: error.message }),
  });
  const drafts = historyQuery.data ?? [];
  const hasSavedFilterLoadError = savedFiltersQuery.isError;
  const visibleFilterFeedback = filterFeedback;
  const selectedDrafts = drafts.filter((draft) => selectedDraftIds.includes(draft.id));

  useEffect(() => {
    setSelectedDraftIds((current) => reconcileSelectedDraftIds(current, drafts.map((draft) => draft.id)));
  }, [drafts]);

  if (!open) return null;

  const toggleDraftSelection = (id: number) => {
    setSelectedDraftIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : current.length < 2 ? [...current, id] : [current[1], id]);
  };

  const applySavedFilter = (filter: { query: string; status: DraftStatusFilter }) => {
    setSearch(filter.query);
    setDebouncedSearch(filter.query);
    setStatus(filter.status);
    setSelectedDraftIds([]);
  };

  const saveCurrentFilter = () => {
    setFilterFeedback(null);
    saveFilterMutation.mutate({ name: filterName, query: search.trim(), status });
  };

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

            <div className="saved-filter-panel">
              <div className="saved-filter-intro"><span><Save size={14} /> FILTERVORLAGEN</span><p>Speichern Sie Textsuche und Status nur für Ihren Arbeitsraum.</p></div>
              <div className="save-filter-form"><input value={filterName} onChange={(event) => setFilterName(event.target.value)} placeholder="Filtername, z. B. offene Prüfungen" maxLength={80} /><button onClick={saveCurrentFilter} disabled={!filterName.trim() || saveFilterMutation.isPending}>{saveFilterMutation.isPending ? "Speichert …" : "Filter speichern"}</button></div>
              {hasSavedFilterLoadError && <div className="saved-filter-error"><AlertTriangle size={14} /><span>Filtervorlagen konnten nicht geladen werden.</span><button onClick={() => void savedFiltersQuery.refetch()}>Erneut laden</button></div>}
              {visibleFilterFeedback && <div className={`saved-filter-feedback saved-filter-feedback-${visibleFilterFeedback.tone}`}>{visibleFilterFeedback.tone === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}{visibleFilterFeedback.text}</div>}
              {savedFiltersQuery.data && savedFiltersQuery.data.length > 0 && <div className="saved-filter-list">{savedFiltersQuery.data.map((filter) => <div className="saved-filter-chip" key={filter.id}><button onClick={() => applySavedFilter(filter)}><strong>{filter.name}</strong><span>{filter.status === "all" ? "alle Status" : formatStatus(filter.status)}{filter.query ? ` · ${filter.query}` : ""}</span></button><button className="saved-filter-delete" aria-label={`${filter.name} löschen`} onClick={() => deleteFilterMutation.mutate({ id: filter.id })}><Trash2 size={13} /></button></div>)}</div>}
            </div>

            {historyQuery.isLoading ? <div className="history-state"><Loader2 className="spin" size={19} />Historie wird geladen …</div> : historyQuery.isError ? <div className="history-state history-state-error"><AlertTriangle size={19} /><div><strong>Historie derzeit nicht erreichbar</strong><p>Ihre Entwürfe wurden nicht verändert. Versuchen Sie den Abgleich erneut.</p></div><button onClick={() => void historyQuery.refetch()}>Erneut abgleichen</button></div> : drafts.length > 0 ? (
              <div className="history-results">
                <div className="history-results-meta"><span>{drafts.length} {drafts.length === 1 ? "Treffer" : "Treffer"}</span><span>{debouncedSearch ? `Suche: „${debouncedSearch}“` : "Neueste Änderung zuerst"}</span></div>
                <div className="comparison-toolbar"><span>{selectedDraftIds.length}/2 Entwürfe ausgewählt</span><button disabled={selectedDrafts.length !== 2} onClick={() => setComparisonOpen(true)}><GitCompareArrows size={15} />Direkt vergleichen</button></div>
                {drafts.map((draft) => <article className="history-draft" key={draft.id}>
                  <div className="history-draft-head"><span className={`draft-status draft-${draft.status}`}><i />{formatStatus(draft.status)}</span><time>{new Date(draft.updatedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}</time></div>
                  <h3>{draft.programName}</h3><p className="history-category">{draft.programCategory} · {draft.website}</p>
                  <p className="history-excerpt">{draft.generatedDraft}</p>
                  <div className="history-draft-foot"><span>{parseChannels(draft.promotionChannels).join(" · ") || "Keine Kanäle"}</span><span>gespeichert, nicht versendet</span></div>
                  <button className={`history-select ${selectedDraftIds.includes(draft.id) ? "history-select-active" : ""}`} onClick={() => toggleDraftSelection(draft.id)} aria-pressed={selectedDraftIds.includes(draft.id)}><span>{selectedDraftIds.includes(draft.id) && <Check size={12} />}</span>{selectedDraftIds.includes(draft.id) ? "Für Vergleich ausgewählt" : "Für Vergleich auswählen"}</button>
                </article>)}
              </div>
            ) : <div className="history-state"><FileText size={25} /><strong>Keine passenden Entwürfe</strong><p>Ändern Sie die Suche oder den Statusfilter. Es wird nichts aus der Historie gelöscht.</p></div>}
          </div>
        )}
      </section>
      <DraftComparisonSheet left={selectedDrafts[0] ?? null} right={selectedDrafts[1] ?? null} onClose={() => setComparisonOpen(false)} />
    </div>
  );
}
