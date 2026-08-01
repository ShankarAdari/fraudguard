import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// ─── Utility ─────────────────────────────────────────────────────────────────
const uuid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

const CATEGORIES = ['retail', 'groceries', 'travel', 'electronics', 'crypto', 'wire_transfer', 'digital_goods'];
const USERS = Array.from({ length: 30 }, (_, i) => `usr_${(101 + i).toString().padStart(3, '0')}`);
const DEVICES = ['iPhone 15 Pro', 'MacBook Pro M3', 'Pixel 8', 'Unknown Linux', 'Android Tablet', 'Samsung S24'];

function buildTxn(overrides = {}) {
  const isFraud = Math.random() < 0.30;
  const amount = isFraud
    ? parseFloat((Math.random() * 3500 + 600).toFixed(2))
    : parseFloat((Math.random() * 180 + 8).toFixed(2));
  const prob = isFraud
    ? parseFloat((Math.random() * 0.35 + 0.62).toFixed(3))
    : parseFloat((Math.random() * 0.18).toFixed(3));
  const tier = prob >= 0.80 ? 'CRITICAL' : prob >= 0.55 ? 'HIGH' : prob >= 0.28 ? 'MEDIUM' : 'LOW';
  const cat = isFraud ? ['crypto', 'wire_transfer', 'electronics'][Math.floor(Math.random() * 3)] : CATEGORIES[Math.floor(Math.random() * 4)];
  const userId = USERS[Math.floor(Math.random() * USERS.length)];
  return {
    id: `TX-${uuid()}`,
    userId,
    amount,
    fraudProb: prob,
    riskTier: tier,
    flagged: prob >= 0.55,
    status: 'PENDING',        // PENDING | BLOCKED | CLEARED | INVESTIGATING
    merchantCategory: cat,
    device: isFraud ? 'Unknown Linux' : DEVICES[Math.floor(Math.random() * 3)],
    location: isFraud ? 'Lagos, NG' : ['New York, US', 'London, UK', 'Toronto, CA'][Math.floor(Math.random() * 3)],
    timestamp: now(),
    summary: prob >= 0.55
      ? `ALERT: ${(prob * 100).toFixed(0)}% fraud probability detected. User ${userId} initiated $${amount.toFixed(2)} in "${cat}" category — ${(2.1 + Math.random() * 4).toFixed(1)}× their baseline velocity. Device fingerprint flagged as "${isFraud ? 'Unknown Linux' : DEVICES[Math.floor(Math.random() * 3)]}". Recommend immediate review.`
      : null,
    ...overrides,
  };
}

const TIER_COLOR = { CRITICAL: '#C25B4A', HIGH: '#D4A054', MEDIUM: '#4EA8DE', LOW: '#52B788' };
const STATUS_COLOR = { PENDING: '#9A9CA5', BLOCKED: '#C25B4A', CLEARED: '#52B788', INVESTIGATING: '#C9A7F5' };

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }) {
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '360px' }}>
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ borderLeft: `4px solid ${t.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: t.color }}>{t.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{t.message}</div>
            </div>
            <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem', flexShrink: 0 }}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ tier }) {
  return <span className={`badge-risk badge-${tier.toLowerCase()}`}>{tier}</span>;
}
function StatusBadge({ status }) {
  const icons = { PENDING: '⏳', BLOCKED: '🛑', CLEARED: '✓', INVESTIGATING: '🔍' };
  return (
    <span style={{ padding: '0.18rem 0.55rem', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: STATUS_COLOR[status], background: `${STATUS_COLOR[status]}22`, border: `1px solid ${STATUS_COLOR[status]}55` }}>
      {icons[status]} {status}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, subColor }) {
  return (
    <div className="chrome-card">
      <div className="chrome-scrim">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>{label}</span>
        <div className="metric-number tabular-nums" style={{ fontSize: '2.3rem', marginTop: '0.3rem', lineHeight: 1 }}>{value}</div>
        {sub && <span style={{ color: subColor || 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>{sub}</span>}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [txns, setTxns] = useState(() => {
    const seed = [
      buildTxn({ id: 'TX-DEMO001', userId: 'usr_104', amount: 3450.00, fraudProb: 0.92, riskTier: 'CRITICAL', flagged: true, merchantCategory: 'crypto', device: 'Unknown Linux', location: 'Lagos, NG', timestamp: '01:05:22', summary: 'ALERT: 92% fraud probability. usr_104 initiated $3450.00 in "crypto" — 6.2× baseline velocity. Device fingerprint unknown. Recommend block.' }),
      buildTxn({ id: 'TX-DEMO002', userId: 'usr_112', amount: 45.20, fraudProb: 0.04, riskTier: 'LOW', flagged: false, merchantCategory: 'groceries', device: 'iPhone 15 Pro', location: 'New York, US', timestamp: '01:05:18', summary: null }),
      buildTxn({ id: 'TX-DEMO003', userId: 'usr_109', amount: 1250.00, fraudProb: 0.78, riskTier: 'HIGH', flagged: true, merchantCategory: 'electronics', device: 'Unknown Linux', location: 'Lagos, NG', timestamp: '01:04:45', summary: 'ALERT: 78% fraud probability. usr_109 spent $1250.00 on "electronics" — 4.0× baseline. 4 transactions in the past 10 minutes.' }),
      buildTxn({ id: 'TX-DEMO004', userId: 'usr_121', amount: 18.50, fraudProb: 0.02, riskTier: 'LOW', flagged: false, merchantCategory: 'retail', device: 'MacBook Pro M3', location: 'London, UK', timestamp: '01:03:10', summary: null }),
    ];
    return seed;
  });

  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // feed | alerts | blocked | audit
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [totalScored, setTotalScored] = useState(1420);
  const [streaming, setStreaming] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState('normal'); // slow | normal | fast | burst
  const [incomingRate, setIncomingRate] = useState(0);
  const toastRef = useRef(0);
  const streamRef = useRef(null);
  const rateCountRef = useRef(0);

  // Auto-select most critical flagged PENDING on mount
  useEffect(() => {
    const top = txns.find(t => t.flagged && t.status === 'PENDING');
    if (top) setSelected(top.id);
  }, []);

  // Pointer-tracked chrome reflection
  useEffect(() => {
    const handleMove = (e) => {
      document.querySelectorAll('.chrome-card').forEach(card => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.backgroundPosition = `${x}% ${y}%`;
        card.style.setProperty('--glow-x', `${x}%`);
        card.style.setProperty('--glow-y', `${y}%`);
      });
    };
    const handleScroll = () => {
      const shift = (window.scrollY * 0.05) % 200;
      document.documentElement.style.setProperty('--flow-offset', `${shift}%`);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('pointermove', handleMove); window.removeEventListener('scroll', handleScroll); };
  }, []);

  // ── Toast helpers ────────────────────────────────────────────────────────────
  const addToast = useCallback((title, message, color = '#52B788') => {
    const id = ++toastRef.current;
    setToasts(p => [...p, { id, title, message, color }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  // ── Action: Block Account ────────────────────────────────────────────────────
  const handleBlock = useCallback((txn) => {
    if (!txn) return;
    if (txn.status === 'BLOCKED') { addToast('Already Blocked', `${txn.userId} is already blocked.`, '#D4A054'); return; }

    setTxns(p => p.map(t => t.id === txn.id ? { ...t, status: 'BLOCKED' } : t));

    const entry = {
      id: uuid(),
      action: 'ACCOUNT BLOCKED',
      txnId: txn.id,
      userId: txn.userId,
      amount: txn.amount,
      riskScore: txn.fraudProb,
      analyst: 'Fraud-Ops Agent',
      timestamp: now(),
      note: `Account ${txn.userId} blocked after $${txn.amount.toFixed(2)} ${txn.merchantCategory} transaction flagged at ${(txn.fraudProb * 100).toFixed(0)}% fraud probability.`,
    };
    setAuditLog(p => [entry, ...p]);
    setBlockedAccounts(p => {
      if (p.find(b => b.userId === txn.userId)) return p;
      return [{ userId: txn.userId, blockedAt: now(), txnId: txn.id, reason: txn.merchantCategory, riskScore: txn.fraudProb }, ...p];
    });
    addToast('🛑 Account Blocked', `${txn.userId} blocked · $${txn.amount.toFixed(2)} ${txn.merchantCategory} flagged.`, '#C25B4A');

    // Auto-select next pending flagged
    setSelected(prev => {
      if (prev === txn.id) {
        const next = txns.find(t => t.id !== txn.id && t.flagged && t.status === 'PENDING');
        return next ? next.id : null;
      }
      return prev;
    });
  }, [txns, addToast]);

  // ── Action: Mark Legitimate ──────────────────────────────────────────────────
  const handleClear = useCallback((txn) => {
    if (!txn) return;
    if (txn.status === 'CLEARED') { addToast('Already Cleared', `${txn.id} was already marked legitimate.`, '#D4A054'); return; }

    setTxns(p => p.map(t => t.id === txn.id ? { ...t, status: 'CLEARED' } : t));

    const entry = {
      id: uuid(),
      action: 'MARKED LEGITIMATE',
      txnId: txn.id,
      userId: txn.userId,
      amount: txn.amount,
      riskScore: txn.fraudProb,
      analyst: 'Fraud-Ops Agent',
      timestamp: now(),
      note: `Transaction ${txn.id} cleared as legitimate. $${txn.amount.toFixed(2)} in ${txn.merchantCategory} reviewed and approved.`,
    };
    setAuditLog(p => [entry, ...p]);
    addToast('✓ Marked Legitimate', `${txn.id} cleared · ${txn.userId} approved.`, '#52B788');

    setSelected(prev => {
      if (prev === txn.id) {
        const next = txns.find(t => t.id !== txn.id && t.flagged && t.status === 'PENDING');
        return next ? next.id : null;
      }
      return prev;
    });
  }, [txns, addToast]);

  // ── Action: Set Investigating ────────────────────────────────────────────────
  const handleInvestigate = useCallback((txn) => {
    if (!txn || txn.status === 'INVESTIGATING') return;
    setTxns(p => p.map(t => t.id === txn.id ? { ...t, status: 'INVESTIGATING' } : t));
    const entry = {
      id: uuid(), action: 'INVESTIGATION OPENED', txnId: txn.id, userId: txn.userId,
      amount: txn.amount, riskScore: txn.fraudProb, analyst: 'Fraud-Ops Agent',
      timestamp: now(), note: `Manual investigation initiated for ${txn.id} ($${txn.amount.toFixed(2)} ${txn.merchantCategory}).`,
    };
    setAuditLog(p => [entry, ...p]);
    addToast('🔍 Under Investigation', `${txn.id} moved to investigation queue.`, '#C9A7F5');
  }, [addToast]);

  // ── Action: Unblock Account ──────────────────────────────────────────────────
  const handleUnblock = useCallback((userId) => {
    setBlockedAccounts(p => p.filter(b => b.userId !== userId));
    setTxns(p => p.map(t => t.userId === userId && t.status === 'BLOCKED' ? { ...t, status: 'CLEARED' } : t));
    const entry = { id: uuid(), action: 'ACCOUNT UNBLOCKED', txnId: '—', userId, amount: 0, riskScore: 0, analyst: 'Fraud-Ops Agent', timestamp: now(), note: `Account ${userId} reinstated after manual review.` };
    setAuditLog(p => [entry, ...p]);
    addToast('Account Reinstated', `${userId} unblocked and access restored.`, '#4EA8DE');
  }, [addToast]);

  // ── Action: Inject Live Transaction ─────────────────────────────────────────
  const injectTxn = useCallback((auto = false) => {
    const count = auto && streamSpeed === 'burst' ? Math.floor(Math.random() * 4) + 2 : 1;
    const newTxns = Array.from({ length: count }, () => ({ ...buildTxn(), isNew: true }));
    setTxns(p => [...newTxns, ...p].slice(0, 80));
    setTotalScored(p => p + count);
    rateCountRef.current += count;
    // Auto-select highest-risk new alert if none selected
    const topAlert = newTxns.find(t => t.flagged);
    if (topAlert) setSelected(prev => prev === null ? topAlert.id : prev);
    // Flash clear isNew after 2.5s
    setTimeout(() => {
      setTxns(p => p.map(t => newTxns.find(n => n.id === t.id) ? { ...t, isNew: false } : t));
    }, 2500);
  }, [streamSpeed]);

  // ── Auto-stream engine ───────────────────────────────────────────────────────
  const SPEED_MS = { slow: 4000, normal: 2200, fast: 1100, burst: 600 };

  useEffect(() => {
    if (streamRef.current) clearInterval(streamRef.current);
    if (!streaming) return;
    streamRef.current = setInterval(() => {
      injectTxn(true);
    }, SPEED_MS[streamSpeed]);
    return () => clearInterval(streamRef.current);
  }, [streaming, streamSpeed, injectTxn]);

  // ── Incoming rate ticker (resets every 10s) ──────────────────────────────────
  useEffect(() => {
    const ticker = setInterval(() => {
      setIncomingRate(rateCountRef.current * 6); // extrapolate to /min
      rateCountRef.current = 0;
    }, 10000);
    return () => clearInterval(ticker);
  }, []);

  // ── Computed stats ───────────────────────────────────────────────────────────
  const flaggedCount = txns.filter(t => t.flagged).length;
  const blockedCount = txns.filter(t => t.status === 'BLOCKED').length;
  const clearedCount = txns.filter(t => t.status === 'CLEARED').length;
  const pendingAlerts = txns.filter(t => t.flagged && t.status === 'PENDING').length;
  const fraudRate = txns.length > 0 ? ((flaggedCount / txns.length) * 100).toFixed(1) : '0.0';
  const selectedTxn = txns.find(t => t.id === selected) || null;

  const alertTxns = txns.filter(t => t.flagged).sort((a, b) => b.fraudProb - a.fraudProb);
  const feedTxns = [...txns].sort((a, b) => 0);

  return (
    <div className="app-shell">
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-diamond">◈</span>
          <div>
            <div className="logo-text">FRAUDGUARD</div>
            <div className="logo-sub">v1.2.0 · XGBoost</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { key: 'feed', icon: '📡', label: 'Live Feed' },
            { key: 'alerts', icon: '🚨', label: 'Alert Queue', badge: pendingAlerts },
            { key: 'blocked', icon: '🛑', label: 'Blocked Accounts', badge: blockedAccounts.length },
            { key: 'audit', icon: '📋', label: 'Audit Log', badge: auditLog.length },
          ].map(item => (
            <button key={item.key} className={`nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="status-dot" />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--alert-green)' }}>System Online</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FastAPI · Port 8000</div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {activeTab === 'feed' && '📡 Live Transaction Feed'}
                {activeTab === 'alerts' && '🚨 Fraud Alert Queue'}
                {activeTab === 'blocked' && '🛑 Blocked Accounts'}
                {activeTab === 'audit' && '📋 Audit Log'}
              </h2>
              {streaming && (
                <span className="live-pill">
                  <span className="live-dot" />
                  LIVE
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
              {streaming
                ? `Auto-streaming at ${streamSpeed} speed · ~${incomingRate || (streamSpeed === 'burst' ? 30 : streamSpeed === 'fast' ? 55 : streamSpeed === 'normal' ? 27 : 15)} txns/min · ${pendingAlerts} pending review`
                : 'Stream paused · Click Resume to continue live monitoring'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Speed selector */}
            <div className="speed-group">
              {['slow','normal','fast','burst'].map(s => (
                <button
                  key={s}
                  className={`speed-btn ${streamSpeed === s ? 'active' : ''}`}
                  onClick={() => setStreamSpeed(s)}
                >
                  {s === 'slow' ? '🐢' : s === 'normal' ? '▶' : s === 'fast' ? '⚡' : '💥'} {s}
                </button>
              ))}
            </div>
            {/* Pause / Resume */}
            <button
              className={`btn-chrome ${streaming ? 'btn-pause' : 'btn-resume'}`}
              onClick={() => setStreaming(p => !p)}
            >
              {streaming ? '⏸ Pause' : '▶ Resume'}
            </button>
            {/* Manual inject */}
            <button className="btn-chrome" onClick={() => injectTxn(false)}>⚡ Inject</button>
          </div>
        </div>

        {/* ── KPI Strip ──────────────────────────────────────────────────── */}
        <div className="kpi-strip">
          <KpiCard label="Total Scored" value={totalScored.toLocaleString()} sub="↑ 12.4% vs last hour" subColor="var(--alert-green)" />
          <KpiCard label="Fraud Rate" value={`${fraudRate}%`} sub={`${flaggedCount} flagged of ${txns.length}`} subColor="var(--alert-amber)" />
          <KpiCard label="Pending Alerts" value={pendingAlerts} sub={`${blockedCount} blocked · ${clearedCount} cleared`} subColor={pendingAlerts > 0 ? 'var(--alert-red)' : 'var(--alert-green)'} />
          <KpiCard label="LRU Cache Hit" value="94.2%" sub="O(1) · Doubly-Linked List" />
          <KpiCard label="ROC-AUC" value="0.9815" sub="MLflow v1.2.0-xgboost" subColor="#7EE8FA" />
        </div>

        {/* ── Panels ─────────────────────────────────────────────────────── */}
        <div className="panels">

          {/* LEFT: Feed / Alerts / Blocked / Audit */}
          <div className="chrome-card panel-left">
            <div className="chrome-scrim" style={{ padding: 0 }}>

              {/* FEED TAB */}
              {activeTab === 'feed' && (
                <div className="panel-inner">
                  <div className="panel-header">
                    <span className="panel-title">All Transactions</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{txns.length} total</span>
                  </div>
                  <div className="txn-list">
                    {feedTxns.map(txn => (
                      <TxnRow key={txn.id} txn={txn} selected={selected === txn.id} onClick={() => setSelected(txn.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* ALERTS TAB */}
              {activeTab === 'alerts' && (
                <div className="panel-inner">
                  <div className="panel-header">
                    <span className="panel-title">Prioritized by Risk Score</span>
                    <span style={{ color: 'var(--alert-amber)', fontSize: '0.75rem' }}>{alertTxns.length} flagged</span>
                  </div>
                  {alertTxns.length === 0 ? (
                    <div className="empty-state">🎉 No active fraud alerts. All clear.</div>
                  ) : (
                    <div className="txn-list">
                      {alertTxns.map((txn, i) => (
                        <TxnRow key={txn.id} txn={txn} selected={selected === txn.id} onClick={() => setSelected(txn.id)} rank={i + 1} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BLOCKED TAB */}
              {activeTab === 'blocked' && (
                <div className="panel-inner">
                  <div className="panel-header">
                    <span className="panel-title">Blocked User Accounts</span>
                    <span style={{ color: 'var(--alert-red)', fontSize: '0.75rem' }}>{blockedAccounts.length} blocked</span>
                  </div>
                  {blockedAccounts.length === 0 ? (
                    <div className="empty-state">No accounts currently blocked.</div>
                  ) : (
                    <div className="txn-list">
                      {blockedAccounts.map(b => (
                        <div key={b.userId} className="txn-row" style={{ borderLeft: '4px solid var(--alert-red)' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700 }}>{b.userId}</span>
                              <span style={{ fontSize: '0.72rem', background: 'rgba(194,91,74,0.15)', color: 'var(--alert-red)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(194,91,74,0.4)' }}>BLOCKED</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              Blocked at {b.blockedAt} · Trigger: {b.txnId} · Category: {b.reason}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--alert-red)', fontSize: '0.85rem' }}>{(b.riskScore * 100).toFixed(0)}% risk</span>
                            <button className="action-btn action-btn-clear" onClick={() => handleUnblock(b.userId)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
                              Reinstate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AUDIT TAB */}
              {activeTab === 'audit' && (
                <div className="panel-inner">
                  <div className="panel-header">
                    <span className="panel-title">Action Audit Trail</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{auditLog.length} entries</span>
                  </div>
                  {auditLog.length === 0 ? (
                    <div className="empty-state">No actions taken yet. Block or clear a transaction to create an audit entry.</div>
                  ) : (
                    <div className="txn-list">
                      {auditLog.map(entry => (
                        <div key={entry.id} className="txn-row" style={{ borderLeft: `4px solid ${entry.action.includes('BLOCK') ? 'var(--alert-red)' : entry.action.includes('LEGITIMATE') || entry.action.includes('UNBLOCK') ? 'var(--alert-green)' : '#C9A7F5'}` }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: entry.action.includes('BLOCK') ? 'var(--alert-red)' : entry.action.includes('LEGITIMATE') || entry.action.includes('UNBLOCK') ? 'var(--alert-green)' : '#C9A7F5' }}>{entry.action}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{entry.timestamp}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{entry.note}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Analyst: {entry.analyst} · TXN: {entry.txnId}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Investigation Panel */}
          <div className="chrome-card panel-right">
            <div className="chrome-scrim" style={{ padding: 0 }}>
              {selectedTxn ? (
                <InvestigationPanel txn={selectedTxn} onBlock={handleBlock} onClear={handleClear} onInvestigate={handleInvestigate} />
              ) : (
                <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>🤖</span>
                  <span>Select a transaction to inspect</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxnRow({ txn, selected, onClick, rank }) {
  return (
    <div className={`txn-row ${selected ? 'selected' : ''} ${txn.isNew ? 'txn-row-new' : ''}`} onClick={onClick} style={{ borderLeft: `4px solid ${TIER_COLOR[txn.riskTier]}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {txn.isNew && <span className="badge-new">NEW</span>}
          {rank && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>#{rank}</span>}
          <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace' }}>{txn.id}</span>
          <RiskBadge tier={txn.riskTier} />
          <StatusBadge status={txn.status} />
        </div>

        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span>{txn.userId}</span>
          <span>·</span>
          <span>{txn.merchantCategory}</span>
          <span>·</span>
          <span>{txn.device}</span>
          <span>·</span>
          <span>{txn.timestamp}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '1rem' }}>${txn.amount.toFixed(2)}</div>
        <div style={{ fontSize: '0.72rem', color: TIER_COLOR[txn.riskTier], fontWeight: 700 }}>{(txn.fraudProb * 100).toFixed(1)}% risk</div>
      </div>
    </div>
  );
}

// ─── Investigation Panel ──────────────────────────────────────────────────────
function InvestigationPanel({ txn, onBlock, onClear, onInvestigate }) {
  const isActionable = txn.status === 'PENDING' || txn.status === 'INVESTIGATING';
  const isBlocked = txn.status === 'BLOCKED';
  const isCleared = txn.status === 'CLEARED';

  return (
    <div className="investigation-panel">
      {/* Header */}
      <div className="invest-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>AI Investigator</span>
          <RiskBadge tier={txn.riskTier} />
          <StatusBadge status={txn.status} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.timestamp}</div>
      </div>

      <div className="invest-body">

        {/* Transaction Details Grid */}
        <div className="detail-card">
          <div className="detail-card-label">Transaction Details</div>
          <div className="detail-grid">
            <div className="detail-item"><span className="di-label">Transaction ID</span><span className="di-value mono">{txn.id}</span></div>
            <div className="detail-item"><span className="di-label">User</span><span className="di-value">{txn.userId}</span></div>
            <div className="detail-item"><span className="di-label">Amount</span><span className="di-value" style={{ color: txn.fraudProb > 0.55 ? 'var(--alert-amber)' : 'var(--text-primary)', fontWeight: 800 }}>${txn.amount.toFixed(2)}</span></div>
            <div className="detail-item"><span className="di-label">Fraud Score</span><span className="di-value" style={{ color: TIER_COLOR[txn.riskTier], fontWeight: 800 }}>{(txn.fraudProb * 100).toFixed(1)}%</span></div>
            <div className="detail-item"><span className="di-label">Category</span><span className="di-value">{txn.merchantCategory}</span></div>
            <div className="detail-item"><span className="di-label">Device</span><span className="di-value">{txn.device}</span></div>
            <div className="detail-item"><span className="di-label">Location</span><span className="di-value">{txn.location}</span></div>
            <div className="detail-item"><span className="di-label">Time</span><span className="di-value">{txn.timestamp}</span></div>
          </div>
        </div>

        {/* Risk Meter */}
        <div className="detail-card">
          <div className="detail-card-label">Risk Score Meter</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>0% Safe</span>
              <span style={{ color: TIER_COLOR[txn.riskTier], fontWeight: 800 }}>{(txn.fraudProb * 100).toFixed(1)}%</span>
              <span style={{ color: 'var(--text-muted)' }}>100% Critical</span>
            </div>
            <div className="risk-meter-track">
              <div className="risk-meter-fill" style={{ width: `${txn.fraudProb * 100}%`, background: `linear-gradient(90deg, #52B788, ${TIER_COLOR[txn.riskTier]})` }} />
              <div className="risk-meter-threshold" style={{ left: '55%' }} title="Alert threshold" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              {[['Velocity', txn.fraudProb > 0.5 ? 'HIGH' : 'NORMAL'], ['Device FP', txn.device.includes('Unknown') ? 'FLAGGED' : 'CLEAN'], ['Location', txn.location.includes('NG') || txn.location.includes('RO') ? 'HIGH RISK' : 'NORMAL'], ['Category', ['crypto','wire_transfer'].includes(txn.merchantCategory) ? 'HIGH RISK' : 'LOW RISK']].map(([label, val]) => (
                <div key={label} className="signal-chip" style={{ borderColor: val.includes('HIGH') || val.includes('FLAGGED') || val.includes('CRITICAL') ? 'rgba(194,91,74,0.4)' : 'rgba(82,183,136,0.4)', color: val.includes('HIGH') || val.includes('FLAGGED') ? 'var(--alert-red)' : val.includes('RISK') && val !== 'LOW RISK' ? 'var(--alert-amber)' : 'var(--alert-green)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{label}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="detail-card" style={{ borderColor: txn.flagged ? 'rgba(194,91,74,0.3)' : 'rgba(82,183,136,0.3)', background: txn.flagged ? 'rgba(194,91,74,0.04)' : 'rgba(82,183,136,0.04)' }}>
          <div className="detail-card-label" style={{ color: '#7EE8FA' }}>🤖 LangGraph Investigation Note</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.65, marginTop: '0.5rem' }}>
            {txn.summary || 'Transaction velocity and spend patterns align with this user\'s established 24h/7d historical baseline. No anomalous device fingerprint, location mismatch, or category risk detected. XGBoost classifier rates this below the alert threshold. No investigation flag triggered.'}
          </p>
        </div>

        {/* Status Banner */}
        {(isBlocked || isCleared) && (
          <div className="status-banner" style={{ background: isBlocked ? 'rgba(194,91,74,0.12)' : 'rgba(82,183,136,0.12)', border: `1px solid ${isBlocked ? 'rgba(194,91,74,0.35)' : 'rgba(82,183,136,0.35)'}` }}>
            <span style={{ fontSize: '1.1rem' }}>{isBlocked ? '🛑' : '✅'}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isBlocked ? 'var(--alert-red)' : 'var(--alert-green)' }}>
                {isBlocked ? 'Account Blocked' : 'Marked as Legitimate'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isBlocked ? `${txn.userId} is blocked. No further transactions will be processed.` : 'Transaction reviewed and cleared by Fraud-Ops Agent.'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {isActionable ? (
            <>
              <button className="action-btn action-btn-block" onClick={() => onBlock(txn)}>
                🛑 Block Account
              </button>
              <button className="action-btn action-btn-investigate" onClick={() => onInvestigate(txn)} disabled={txn.status === 'INVESTIGATING'}>
                🔍 {txn.status === 'INVESTIGATING' ? 'Investigating…' : 'Open Investigation'}
              </button>
              <button className="action-btn action-btn-clear" onClick={() => onClear(txn)}>
                ✓ Mark Legitimate
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.5rem 0' }}>
              {isBlocked ? '🛑 This account is blocked. Go to Blocked Accounts tab to reinstate.' : '✓ Transaction resolved. Check the Audit Log for details.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
