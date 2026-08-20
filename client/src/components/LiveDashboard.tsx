import { useEffect, useMemo, useState } from "react";
import { ApplicationAssistant } from "@/components/ApplicationAssistant";
import { trpc } from "@/lib/trpc";
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  Gauge,
  Link2,
  LockKeyhole,
  Menu,
  Radar,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
} from "lucide-react";

const programs = [
  { name: "Everflow-Demo-Netzwerk", category: "Software & Tools", status: "Entwurf", tone: "amber", mark: "EF" },
  { name: "Impact-Programm-Katalog", category: "Marktplatz", status: "Entdeckt", tone: "ink", mark: "IM" },
  { name: "Awin-Programm-Katalog", category: "E-Commerce", status: "Entdeckt", tone: "ink", mark: "AW" },
];

const auditEntries = [
  { time: "gerade eben", label: "Katalog-Scan vorbereitet", detail: "3 Programme geprüft", tone: "green" },
  { time: "vor 8 Min.", label: "Freigabe-Check bestanden", detail: "Affiliate-Hinweis geplant", tone: "green" },
  { time: "vor 21 Min.", label: "OpenRouter geschützt", detail: "Kein Schlüssel gespeichert", tone: "amber" },
  { time: "vor 34 Min.", label: "Simulation aktiv", detail: "Keine externe Aktion", tone: "blue" },
];

function formatClock(date: Date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export default function LiveDashboard() {
  const [botActive, setBotActive] = useState(true);
  const [scanRunning, setScanRunning] = useState(false);
  const [lastScan, setLastScan] = useState(() => new Date());
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [scanCount, setScanCount] = useState(3);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistantStatus = trpc.assistant.status.useQuery(undefined, { staleTime: 30_000 });

  useEffect(() => {
    if (!botActive) return;
    const interval = window.setInterval(() => setLastScan(new Date()), 15000);
    return () => window.clearInterval(interval);
  }, [botActive]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const lastScanLabel = useMemo(() => formatClock(lastScan), [lastScan]);

  const runScan = () => {
    if (scanRunning) return;
    setScanRunning(true);
    setToast("Katalog-Scan läuft im sicheren Simulationsmodus.");
    window.setTimeout(() => {
      setScanCount((count) => count + 1);
      setLastScan(new Date());
      setScanRunning(false);
      setToast("Scan abgeschlossen · 3 Programme ohne externe Übertragung geprüft.");
    }, 950);
  };

  const openApprovals = () => setAssistantOpen(true);

  return (
    <div className="dashboard-app">
      <aside className={`sidebar-rail ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <img src="/manus-storage/signal-observatory-logo_0fb09e86.png" alt="Signal Observatory Symbol" className="brand-mark" />
          <div className="brand-words">
            <strong>AUTONOMOUS</strong>
            <span>INCOME / BLUEPRINT</span>
          </div>
          <button className="icon-button mobile-close" aria-label="Navigation schließen" onClick={() => setMobileNav(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="rail-label">Arbeitsraum</div>
        <nav className="side-nav" aria-label="Hauptnavigation">
          <button className="nav-item nav-active"><Radar size={17} /><span>Lagebild</span><em>01</em></button>
          <button className="nav-item"><Waves size={17} /><span>Programme</span><em>03</em></button>
          <button className="nav-item"><FileCheck2 size={17} /><span>Freigaben</span><em className="nav-count">01</em></button>
          <button className="nav-item"><Gauge size={17} /><span>Performance</span></button>
        </nav>

        <div className="rail-label rail-label-lower">System</div>
        <nav className="side-nav">
          <button className="nav-item"><ShieldCheck size={17} /><span>Compliance</span></button>
          <button className="nav-item"><LockKeyhole size={17} /><span>Zugänge</span><span className="nav-dot" /></button>
          <button className="nav-item" onClick={openApprovals}><Sparkles size={17} /><span>OpenRouter</span><span className={`nav-dot ${assistantStatus.data?.configured ? "" : "nav-dot-amber"}`} /></button>
        </nav>

        <div className="rail-footer">
          <div className="footer-signal"><span className="signal-pulse" /> System stabil</div>
          <p>Letzte Synchronisierung<br /><strong>{lastScanLabel} Uhr</strong></p>
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" aria-label="Navigation schließen" onClick={() => setMobileNav(false)} />}

      <main className="dashboard-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Navigation öffnen" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Arbeitsraum</span><ChevronRight size={14} /><strong>Lagebild</strong></div>
          <div className="topbar-meta"><span className="live-tag"><i /> LIVE-ANSICHT</span><span className="date-stamp">20. AUGUST 2026</span></div>
        </header>

        <section className="hero-panel">
          <div className="hero-art hero-art-fallback" aria-hidden="true"><span className="hero-orbit orbit-a" /><span className="hero-orbit orbit-b" /><span className="hero-tick tick-a" /><span className="hero-tick tick-b" /><span className="hero-signal-mark" /></div>
          <div className="hero-wash" />
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-index">RUN 08</span><span className="eyebrow-line" /> SICHERE SIMULATION</div>
            <h1>Automatisierung mit<br /><em>sichtbarer Verantwortung.</em></h1>
            <p>Der Agent katalogisiert Chancen, bereitet Freigaben vor und hält jede externe Aktion an einer klaren Grenze an.</p>
            <div className="hero-actions">
              <button className="button-primary" onClick={runScan} disabled={scanRunning}><ScanSearch size={16} />{scanRunning ? "Scan läuft …" : "Katalog prüfen"}</button>
              <button className="button-quiet" onClick={openApprovals}>Freigaben öffnen <ArrowUpRight size={15} /></button>
            </div>
          </div>
          <div className="hero-status-card">
            <div className="status-card-head"><span className="status-kicker">AGENT STATUS</span><span className="status-live-dot" /></div>
            <div className="agent-name"><span className="agent-icon"><Bot size={20} /></span><strong>Akquise-Bot</strong></div>
            <div className="agent-state"><span className="state-dot" />{botActive ? "Beobachtet den Katalog" : "Pausiert"}</div>
            <div className="agent-divider" />
            <div className="agent-meta"><span>Letzter Scan</span><strong>{lastScanLabel} Uhr</strong></div>
            <button className={`toggle-row ${botActive ? "toggle-on" : ""}`} onClick={() => setBotActive((active) => !active)} aria-pressed={botActive}>
              <span>{botActive ? "Monitoring aktiv" : "Monitoring pausiert"}</span><span className="toggle-switch"><i /></span>
            </button>
          </div>
        </section>

        <section className="metric-strip" aria-label="Systemkennzahlen">
          <div className="metric-cell"><span className="metric-label">PROGRAMME KATALOGISIERT</span><strong>{scanCount}</strong><span className="metric-note"><span className="trend-up">+3</span> seit letzter Prüfung</span></div>
          <div className="metric-cell"><span className="metric-label">ENTWÜRFE IN PRÜFUNG</span><strong>01</strong><span className="metric-note metric-amber"><Clock3 size={13} /> wartet auf Freigabe</span></div>
          <div className="metric-cell"><span className="metric-label">TRACKING-LINKS</span><strong>00</strong><span className="metric-note">Simulation · keine Live-Links</span></div>
          <div className="metric-cell metric-last"><span className="metric-label">OPENROUTER</span><strong className="metric-word"><span className={`status-hollow-dot ${assistantStatus.data?.configured ? "status-solid-dot" : ""}`} /> {assistantStatus.data?.configured ? "bereit" : "geschützt"}</strong><span className="metric-note">{assistantStatus.data?.configured ? assistantStatus.data.model : "Schlüssel noch nicht hinterlegt"}</span></div>
        </section>

        <div className="content-grid">
          <section className="main-column">
            <div className="section-heading"><div><span className="section-index">01 /</span><h2>Signal Rail</h2></div><span className="section-caption">AKQUISE-FLUSS</span></div>
            <div className="signal-rail-card">
              <div className="rail-progress"><span className="progress-line" /></div>
              <div className="signal-steps">
                <div className="signal-step step-done"><span className="step-node"><Check size={14} /></span><div><strong>Entdeckt</strong><p>Programme aus dem Katalog aufgenommen.</p></div><time>08:42</time></div>
                <div className="signal-step step-current"><span className="step-node"><FileCheck2 size={14} /></span><div><strong>Entwurf</strong><p>Ein Bewerbungsentwurf ist vorbereitet.</p></div><time>08:44</time></div>
                <div className="signal-step step-wait"><span className="step-node"><LockKeyhole size={14} /></span><div><strong>Freigabe</strong><p>Ihre Prüfung schützt Identität und Reputation.</p></div><time>wartet</time></div>
                <div className="signal-step step-muted"><span className="step-node"><Link2 size={14} /></span><div><strong>Link</strong><p>Wird erst nach Programmfreigabe erzeugt.</p></div><time>—</time></div>
              </div>
              <div className="rail-card-foot"><ShieldCheck size={15} /><span>Keine automatische Bewerbung · keine externe Übertragung</span><ArrowUpRight size={14} /></div>
            </div>

            <div className="section-heading section-heading-programs"><div><span className="section-index">02 /</span><h2>Programm-Katalog</h2></div><button className="text-button" onClick={runScan}><RefreshCw size={14} /> aktualisieren</button></div>
            <div className="program-table">
              <div className="program-table-head"><span>PROGRAMM</span><span>KATEGORIE</span><span>STATUS</span><span /></div>
              {programs.map((program) => (
                <div className="program-row" key={program.name}>
                  <div className="program-name"><span className={`program-monogram monogram-${program.tone}`}>{program.mark}</span><strong>{program.name}</strong></div>
                  <span className="program-category">{program.category}</span>
                  <span className={`stamp stamp-${program.tone}`}><i />{program.status}</span>
                  <button className="row-arrow" aria-label={`${program.name} öffnen`}><ArrowUpRight size={15} /></button>
                </div>
              ))}
            </div>
          </section>

          <aside className="side-column">
            <div className="section-heading"><div><span className="section-index">03 /</span><h2>Freigabe</h2></div><span className="section-caption">1 AKTION</span></div>
            <div className="approval-card">
              <div className="approval-top"><span className="stamp stamp-amber"><i />PRÜFUNG</span><span className="approval-time">vor 6 Min.</span></div>
              <h3>Everflow-Demo-Netzwerk</h3>
              <p>Ein Entwurf wartet auf die Prüfung von Profil, Zielgruppe und Offenlegung.</p>
              <div className="approval-checks"><span><Check size={13} /> Profil vorhanden</span><span><Check size={13} /> Offenlegung geplant</span><span className="check-pending"><CircleAlert size={13} /> Bestätigung fehlt</span></div>
              <button className="approval-button" onClick={openApprovals}>Entwurf ansehen <ArrowUpRight size={15} /></button>
            </div>

            <div className="compliance-card">
              <div className="compliance-sigil" aria-hidden="true"><span /><i>✓</i></div>
              <div><span className="card-kicker">COMPLIANCE</span><h3>Offenlegung<br />ist eingebaut.</h3><p>Jede veröffentlichte Empfehlung erhält einen sichtbaren Affiliate-Hinweis.</p></div>
            </div>

            <div className="section-heading audit-heading"><div><span className="section-index">04 /</span><h2>Audit-Signale</h2></div><button className="text-button">alle anzeigen</button></div>
            <div className="audit-card">
              <div className="audit-paper-art" aria-hidden="true"><span /><i /><b /></div>
              <div className="audit-list">{auditEntries.map((entry) => <div className="audit-entry" key={entry.label}><span className={`audit-dot audit-${entry.tone}`} /><div><strong>{entry.label}</strong><span>{entry.detail}</span></div><time>{entry.time}</time></div>)}</div>
            </div>
          </aside>
        </div>

        <footer className="dashboard-footer"><span><span className="footer-lock"><LockKeyhole size={12} /></span> SICHERE SIMULATION · v0.8.4</span><span>Automatisierung bleibt erklärbar.</span><span>Letzter Abgleich {lastScanLabel} Uhr</span></footer>
      </main>

      <ApplicationAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      {toast && <div className="toast-message" role="status"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
    </div>
  );
}
