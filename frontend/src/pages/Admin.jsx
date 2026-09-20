import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getLiveCrowd, getTemples } from '../api/client';
import '../styles/admin.css';
import '../styles/design-system.css';
import '../styles/admin-redesign.css';
import darshanSetuLogo from '../../assets/DarshanSetu_Logo.png';

const gates = [['Gate 1', 60, 'safe'], ['Gate 2', 72, 'moderate'], ['Gate 3', 91, 'high'], ['Gate 4', 25, 'safe']];
const defaultTemples = [
  { id: 1, name: 'Banke Bihari Temple', location: 'Vrindavan' },
  { id: 2, name: 'Dauji Temple', location: 'Baldeo' },
  { id: 3, name: 'Dwarkadhish Temple', location: 'Mathura' },
  { id: 4, name: 'Giriraj Ji Temple', location: 'Govardhan' },
  { id: 5, name: 'Prem Mandir', location: 'Vrindavan' },
  { id: 6, name: 'Radha Rani Temple', location: 'Barsana' },
  { id: 7, name: 'Shri Krishna Janmabhoomi', location: 'Mathura' }
];
const navItems = [
  ['⌂', 'Dashboard', '/admin/dashboard'], ['▦', 'Crowd & Prediction', '/admin/crowd-prediction'], ['◫', 'Simulations', '/admin/simulations'],
  ['▣', 'Bookings', '/admin/bookings'], ['♜', 'Gates & Zones', '/admin/gates-zones'], ['☷', 'Queue Management', '/admin/queue-management'],
  ['▤', 'Parking', '/admin/parking'], ['⚠', 'Emergencies', '/admin/emergencies'], ['♙', 'Staff & Security', '/admin/staff-security'],
  ['◈', 'Announcements', '/admin/announcements'], ['▥', 'Analytics', '/admin/analytics'], ['⚙', 'Settings', '/admin/settings']
];

function Sidebar() {
  const navigate = useNavigate();
  const logout = () => { clearSession(); navigate('/login', { replace: true }); };
  return <aside className="admin-redesign-sidebar">
    <Link className="admin-redesign-brand" to="/dashboard"><img src={darshanSetuLogo} alt="DarshanSetu" /><span>DarshanSetu<small>Divine Connect</small></span></Link>
    <div className="admin-redesign-profile"><span>AU</span><div><strong>Admin User</strong><small>Super Admin</small></div></div>
    <nav className="admin-redesign-nav" aria-label="Admin navigation">{navItems.map(([icon, label, href]) => <NavLink end={label === 'Dashboard'} key={label} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} to={label === 'Dashboard' ? '/dashboard' : href}><i>{icon}</i>{label}</NavLink>)}</nav>
    <button type="button" className="admin-redesign-logout" onClick={logout}>↪ <span>Logout</span></button>
  </aside>;
}

function Header({ temples, selectedTempleId, onTempleChange }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState('');
  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const closeMenu = () => setOpenMenu('');
  return <header className="admin-redesign-header"><div className="admin-temple-control"><label htmlFor="admin-temple">Temple</label><select id="admin-temple" aria-label="Select temple" value={selectedTempleId} onChange={(event) => onTempleChange(Number(event.target.value))}>{temples.map((temple) => <option value={temple.id} key={temple.id}>{temple.name}, {temple.location}</option>)}</select></div><div className="admin-header-tools"><div className="admin-menu-wrap"><button type="button" aria-label="Notifications" aria-expanded={openMenu === 'notifications'} onClick={() => setOpenMenu(openMenu === 'notifications' ? '' : 'notifications')}>♧<b>3</b></button>{openMenu === 'notifications' && <div className="admin-popover notification-popover"><strong>Notifications</strong><button type="button" onClick={() => { closeMenu(); navigate('/notifications'); }}>3 unread updates <span>View all →</span></button><button type="button" onClick={() => { closeMenu(); navigate('/admin/emergencies'); }}>Gate 3 needs attention <span>Open incident →</span></button></div>}</div><button type="button" aria-label="Emergency alerts" onClick={() => navigate('/admin/emergencies')}>⚠<b>1</b></button><div className="admin-clock"><strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><span>{now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div><div className="admin-menu-wrap"><button type="button" className="admin-header-avatar" aria-label="Open profile" aria-expanded={openMenu === 'profile'} onClick={() => setOpenMenu(openMenu === 'profile' ? '' : 'profile')}>AU</button>{openMenu === 'profile' && <div className="admin-popover profile-popover"><strong>Admin User</strong><small>Super Admin</small><button type="button" onClick={() => { closeMenu(); navigate('/profile'); }}>Profile</button><button type="button" onClick={() => { closeMenu(); navigate('/admin/settings'); }}>Settings</button><button type="button" onClick={() => { clearSession(); navigate('/login', { replace: true }); }}>Logout</button></div>}</div></div></header>;
}

function KpiCard({ icon, title, value, note, tone, children }) {
  return <article className="admin-kpi-card"><div className={`admin-kpi-icon ${tone}`}>{icon}</div><div><p>{title}</p><strong>{value}</strong><small>{note}</small>{children}</div></article>;
}

function CrowdChart() {
  return <div className="admin-chart"><div className="admin-chart-y"><span>10K</span><span>8K</span><span>6K</span><span>4K</span><span>2K</span></div><div className="admin-chart-area"><div className="admin-chart-grid">{[1, 2, 3, 4, 5].map((line) => <i key={line} />)}</div><svg viewBox="0 0 600 210" preserveAspectRatio="none" aria-label="Crowd trend line chart"><polyline points="0,168 38,153 76,126 114,139 152,112 190,121 228,89 266,105 304,130 342,111 380,137 418,96 456,75 494,88 532,51 570,72 600,56" /></svg><div className="admin-chart-x"><span>12 AM</span><span>04 AM</span><span>08 AM</span><span>12 PM</span><span>04 PM</span><span>08 PM</span></div><b className="admin-chart-value">7,850</b></div></div>;
}

function PredictionChart() {
  return <div className="prediction-chart-redesign"><svg viewBox="0 0 500 190" preserveAspectRatio="none" aria-label="AI crowd prediction chart"><polyline className="current" points="0,150 45,139 90,146 135,125 180,133 225,120 270,127 315,107 360,114 405,89 450,96 500,76" /><polyline className="prediction-30" points="0,158 45,148 90,136 135,126 180,108 225,112 270,96 315,89 360,73 405,60 450,51 500,39" /><polyline className="prediction-60" points="0,145 45,130 90,115 135,99 180,88 225,76 270,63 315,53 360,42 405,31 450,19 500,9" /></svg></div>;
}

function normalizeCrowdData(data) {
  if (!data) return null;
  const currentVisitors = Math.max(1000, Number(data.currentVisitors) || 0);
  const capacity = Number(data.capacity) || 10000;
  return { ...data, currentVisitors, capacity, occupancy: Number(((currentVisitors / capacity) * 100).toFixed(2)), estimatedWait: Math.max(1, Number(data.estimatedWait) || Math.round(currentVisitors / 180)) };
}

export default function Admin() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [actions, setActions] = useState([true, true, true, true]);
  const [live, setLive] = useState(null);
  const [temples, setTemples] = useState(defaultTemples);
  const [selectedTempleId, setSelectedTempleId] = useState(1);
  const [toast, setToast] = useState('');
  const selectedTemple = temples.find((temple) => temple.id === selectedTempleId) || defaultTemples[0];
  const loadCrowd = () => getLiveCrowd(selectedTempleId).then(({ data }) => setLive(normalizeCrowdData(data))).catch(() => setLive(normalizeCrowdData({ currentVisitors: 0, capacity: 10000, estimatedWait: 8, occupancy: 10, riskLevel: 'safe', gates: [] })));
  React.useEffect(() => {
    getTemples().then(({ data }) => {
      if (Array.isArray(data) && data.length >= 7) setTemples(data.slice(0, 7));
    }).catch(() => {});
  }, []);
  React.useEffect(() => {
    loadCrowd();
    const timer = window.setInterval(loadCrowd, 30000);
    return () => window.clearInterval(timer);
  }, [selectedTempleId]);
  React.useEffect(() => {
    if (!live) return undefined;

    const timer = window.setInterval(() => {
      setLive((current) => {
        if (!current) return current;

        const change = Math.floor(Math.random() * 91) - 35;
        const currentVisitors = Math.max(1000, current.currentVisitors + change);
        const capacity = current.capacity || 10000;
        const occupancy = Number(((currentVisitors / capacity) * 100).toFixed(2));
        const crowdRatio = current.currentVisitors ? currentVisitors / current.currentVisitors : 1;

        return {
          ...current,
          currentVisitors,
          occupancy,
          estimatedWait: Math.max(1, Math.round((current.estimatedWait || 15) * crowdRatio)),
          gates: current.gates?.map((gate, index) => ({
            ...gate,
            occupancy: Math.max(0, Math.min(100, Number((gate.occupancy + change / 2 * (index % 2 ? -1 : 1)).toFixed(2))))
          }))
        };
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [live]);
  const refresh = () => { setRefreshing(true); loadCrowd().finally(() => window.setTimeout(() => setRefreshing(false), 500)); };
  const toggleAction = (index) => setActions((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value));
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3500); };
  const executeRecommendations = () => {
    const selected = actions.filter(Boolean).length;
    if (!selected) { showToast('Select at least one recommendation first.'); return; }
    if (window.confirm(`Execute ${selected} recommendation${selected === 1 ? '' : 's'}?`)) {
      setActions([false, false, false, false]);
      showToast('Recommendations executed successfully.');
    }
  };
  const actionLabels = ['Open Gate 4', 'Reduce slot capacity by 20%', 'Deploy 4 security personnel', 'Notify incoming visitors'];
  const gateItems = live?.gates?.length ? live.gates.map((gate) => [gate.name, gate.occupancy, gate.occupancy >= 85 ? 'high' : gate.occupancy >= 70 ? 'moderate' : 'safe']) : gates;
  const currentCrowd = live?.currentVisitors?.toLocaleString('en-IN') || '—';
  const capacity = live?.capacity?.toLocaleString('en-IN') || '—';
  const occupancy = live ? `${live.occupancy}%` : '—';
  const wait = live ? `${live.estimatedWait} min` : '—';
  const risk = live?.riskLevel?.toUpperCase() || '—';
  return <div className="admin-redesign-page"><Sidebar /><main className="admin-redesign-main"><Header temples={temples} selectedTempleId={selectedTempleId} onTempleChange={setSelectedTempleId} /><div className="admin-page-heading"><div><p className="admin-eyebrow">TEMPLE OPERATIONS / OVERVIEW</p><h1>Dashboard</h1><p>Real-time temple crowd intelligence for {selectedTemple.name}, {selectedTemple.location}</p></div><div className="admin-updated"><span>Last Updated: {refreshing ? 'Updating...' : live?.updatedAt ? new Date(live.updatedAt).toLocaleTimeString() : 'Waiting for data'}</span><button type="button" onClick={refresh} disabled={refreshing} aria-label="Refresh dashboard">↻</button></div></div>
    <section className="admin-kpi-grid"><KpiCard icon="♟" title="Current Crowd" value={currentCrowd} note="Estimated" tone="blue" /><KpiCard icon="♜" title="Capacity" value={capacity} note="Maximum" tone="gold" /><KpiCard icon="◔" title="Occupancy" value={occupancy} note="of capacity" tone="orange"><div className="admin-mini-progress"><i style={{ width: `${live?.occupancy || 0}%` }} /></div></KpiCard><KpiCard icon="◷" title="Estimated Wait" value={wait} note="Average" tone="green" /><KpiCard icon="!" title="Risk Level" value={risk} note="Crowd Risk" tone="red" /></section>
    <section className="admin-analytics-grid"><article className="admin-redesign-card admin-crowd-card"><div className="admin-card-heading"><div><h2>Crowd Trend</h2><span>Current visitor movement throughout the day</span></div><div><b className="admin-live"><i /> Live</b><em>Today</em></div></div><CrowdChart /></article><article className="admin-redesign-card admin-prediction-card"><div className="admin-card-heading"><div><h2>AI Crowd Prediction</h2><span>AI-based crowd estimation</span></div><em>Prototype</em></div><div className="prediction-legend"><span><i className="legend-current" /> Current</span><span><i className="legend-orange" /> 30 Min</span><span><i className="legend-green" /> 60 Min</span></div><PredictionChart /><div className="prediction-values-redesign"><div><small>30 Min</small><strong>{live ? Math.round(live.currentVisitors * 1.08).toLocaleString('en-IN') : '—'}</strong></div><div><small>60 Min</small><strong>{live ? Math.round(live.currentVisitors * 1.2).toLocaleString('en-IN') : '—'}</strong></div></div></article><article className="admin-redesign-card gate-card"><div className="admin-card-heading"><div><h2>Gate Occupancy</h2><span>Live capacity by entry gate</span></div></div><div className="gate-list-redesign">{gateItems.map(([name, value, tone]) => <div className="gate-row-redesign" key={name}><div><span>{name}</span><strong>{value}%</strong></div><div className="gate-track"><i className={tone} style={{ width: `${value}%` }} /></div></div>)}</div><Link to="/admin/crowd" className="admin-text-link">View All Gates →</Link></article></section>
    <section className="admin-bottom-grid"><article className="admin-redesign-card action-card"><div className="admin-card-heading"><div><h2>Recommended Actions</h2><span>Suggested responses to current conditions</span></div></div>{actionLabels.map((label, index) => <label className="admin-action-row" key={label}><input type="checkbox" checked={actions[index]} onChange={() => toggleAction(index)} /><span>{label}</span></label>)}<button type="button" className="admin-primary-button" onClick={executeRecommendations}>Execute Recommendations</button></article><article className="admin-redesign-card data-card"><div className="admin-card-heading"><div><h2>Data Source Consistency</h2><span>Signal quality across operations</span></div></div>{[['QR Check-ins', '1,300'], ['Entry Records', '1,500'], ['Staff Estimate', '1,400'], ['Exit Records', '500']].map(([label, value]) => <div className="admin-data-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}<div className="confidence-row"><span>Confidence Score</span><strong>87%</strong></div><b className="confidence-badge">HIGH CONFIDENCE</b></article><article className="admin-redesign-card emergency-card"><div className="admin-card-heading"><div><h2>Active Emergencies</h2><span>Incidents requiring attention</span></div><b className="incident-count">3 Active</b></div>{[['INC-1004', 'Medical Emergency', 'Gate 3 · 7:40 PM', 'HIGH', 'high'], ['INC-1023', 'Crowd Surge', 'Queue Zone B · 7:30 PM', 'HIGH', 'high'], ['INC-1022', 'Missing Person', 'Parking B · 6:55 PM', 'MEDIUM', 'medium']].map(([id, title, detail, level, tone]) => <button type="button" className="admin-incident admin-incident-button" key={id} onClick={() => navigate('/admin/emergencies')}><i className={tone}>!</i><span><strong>{id}</strong><span>{title}</span><small>{detail}</small></span><b className={tone}>{level}</b></button>)}<Link to="/admin/emergencies" className="admin-text-link">View All →</Link></article><article className="admin-redesign-card quick-card"><div className="admin-card-heading"><div><h2>Quick Actions</h2><span>Common operational tools</span></div></div>{[['♜', 'Simulate Festival Surge', '/admin/simulations'], ['⚠', 'Simulate Medical Emergency', '/admin/simulations'], ['◈', 'Manage Announcements', '/admin/announcements'], ['▦', 'View Temple Map', '/admin/gates-zones']].map(([icon, label, href]) => <button type="button" className="quick-action-redesign" key={label} onClick={() => navigate(href)}><i>{icon}</i><span>{label}</span><b>→</b></button>)}</article></section>{toast && <div className="admin-toast" role="status">{toast}</div>}
  </main></div>;
}
