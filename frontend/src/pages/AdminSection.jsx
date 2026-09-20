import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { clearSession, createAdminEmergency, deployAdminStaff, getAdminEmergencies, getAdminStaff, getAdminStaffStats, getLiveCrowd, removeAdminStaff, updateAdminEmergency, updateAdminStaff, updateAdminStaffStatus, updateAdminStaffZone } from '../api/client';
import '../styles/admin-section.css';
import '../styles/emergency-center.css';
import '../styles/staff-security.css';
import darshanSetuLogo from '../../assets/DarshanSetu_Logo.png';

const navItems = [
  ['Dashboard', '/admin/dashboard'],
  ['Crowd & Prediction', '/admin/crowd-prediction'],
  ['Simulations', '/admin/simulations'],
  ['Bookings', '/admin/bookings'],
  ['Gates & Zones', '/admin/gates-zones'],
  ['Queue Management', '/admin/queue-management'],
  ['Parking', '/admin/parking'],
  ['Emergencies', '/admin/emergencies'],
  ['Staff & Security', '/admin/staff-security'],
  ['Notifications', '/notifications'],
  ['Announcements', '/admin/announcements'],
  ['Analytics', '/admin/analytics'],
  ['Settings', '/admin/settings']
];

const gates = [['Gate 1', 60, 2400], ['Gate 2', 72, 2200], ['Gate 3', 91, 1800], ['Gate 4', 25, 1600]];
const queues = [['Queue A', '1,250', '35 min', 'Open'], ['Queue B', '2,100', '52 min', 'Busy'], ['Queue C', '800', '20 min', 'Open']];
const parking = [['Parking A', 500, 410], ['Parking B', 350, 140], ['Parking C', 200, 184]];
const incidents = [['INC-1004', 'Medical Emergency', 'Gate 3', 'HIGH'], ['INC-1023', 'Crowd Surge', 'Queue Zone B', 'HIGH'], ['INC-1022', 'Missing Person', 'Parking B', 'MEDIUM']];
const simulations = [['festival-surge', 'Festival Surge', 'Simulate sudden visitor growth and test capacity responses.'], ['medical-emergency', 'Medical Emergency', 'Test incident response and staff deployment workflows.'], ['crowd-surge', 'Crowd Surge', 'Model pressure in a queue zone before it becomes critical.'], ['gate-closure', 'Gate Closure', 'Test rerouting visitors when an entry gate closes.'], ['heavy-rain', 'Heavy Rain', 'Model weather-related changes to crowd and parking demand.']];

function statusFor(value) { return value >= 90 ? 'Critical' : value >= 75 ? 'High' : value >= 60 ? 'Moderate' : 'Safe'; }
function Metric({ label, value, tone = '' }) { return <article className="admin-section-metric"><span>{label}</span><strong className={tone}>{value}</strong></article>; }
function ActionButton({ children, onClick, secondary = false, type = 'button' }) { return <button type={type} className={secondary ? 'admin-section-button admin-section-button--secondary' : 'admin-section-button'} onClick={onClick}>{children}</button>; }

export function Sidebar() {
  const navigate = useNavigate();
  return <aside className="admin-section-sidebar">
    <NavLink className="admin-section-brand" to="/admin/dashboard"><img src={darshanSetuLogo} alt="DarshanSetu" /><span>DarshanSetu<small>Divine Connect</small></span></NavLink>
    <div className="admin-section-profile"><b>AU</b><span><strong>Admin User</strong><small>Super Admin</small></span></div>
    <nav className="admin-section-nav" aria-label="Admin navigation">{navItems.map(([label, path]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}</nav>
    <button type="button" className="admin-section-logout" onClick={() => { clearSession(); navigate('/login', { replace: true }); }}>Log out</button>
  </aside>;
}

export function Header({ title }) { return <header className="admin-section-header"><div><span className="admin-section-kicker">DARSHANSETU / ADMIN OPERATIONS</span><h1>{title}</h1></div><div className="admin-section-header-meta"><span>Banke Bihari Temple</span><b>AU</b></div></header>; }
function Table({ headers, rows }) { return <div className="admin-section-table-wrap"><table className="admin-section-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>; }

function DashboardSection({ crowd }) {
  const current = crowd?.currentVisitors || 7850;
  const occupancy = crowd?.occupancy || 78.5;
  return <><div className="admin-section-metrics"><Metric label="Current Crowd" value={current.toLocaleString('en-IN')} /><Metric label="Capacity" value={(crowd?.capacity || 10000).toLocaleString('en-IN')} /><Metric label="Occupancy" value={`${occupancy}%`} tone="tone-orange" /><Metric label="Estimated Wait" value={`${crowd?.estimatedWait || 42} min`} /><Metric label="Risk Level" value={(crowd?.riskLevel || 'Low').toUpperCase()} tone="tone-red" /></div><div className="admin-section-grid admin-section-grid--wide"><article className="admin-section-card"><h2>Crowd Trend</h2><p className="admin-section-muted">Live visitor movement throughout the day</p><div className="admin-bars">{[42, 58, 48, 72, 66, 84, 78, 92, 73, 86].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article><article className="admin-section-card"><h2>AI Crowd Prediction</h2><p className="admin-section-muted">Projected visitor volume</p><div className="prediction-list"><span>Current <b>{current.toLocaleString('en-IN')}</b></span><span>30 Minutes <b>{Math.round(current * 1.08).toLocaleString('en-IN')}</b></span><span>60 Minutes <b>{Math.round(current * 1.2).toLocaleString('en-IN')}</b></span></div><h3>Recommended Actions</h3><ul className="admin-section-list"><li>Keep Gate 3 monitored</li><li>Prepare additional queue staff</li><li>Notify incoming visitors</li></ul></article></div></>;
}

function CrowdSection({ crowd }) {
  const capacity = crowd?.capacity || 10000;
  const apiCrowd = crowd?.currentVisitors || 4870;
  const [currentVisitors, setCurrentVisitors] = useState(apiCrowd);
  const [trend, setTrend] = useState([30, 42, 38, 55, 50, 68, 62, 78, 70, 86, 74, 82]);

  useEffect(() => setCurrentVisitors(apiCrowd), [apiCrowd]);
  useEffect(() => {
    const changes = [5, -2, 8, -3];
    let changeIndex = 0;
    const timer = window.setInterval(() => {
      setCurrentVisitors((current) => Math.max(0, current + changes[changeIndex]));
      changeIndex = (changeIndex + 1) % changes.length;
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const occupancy = Number(((currentVisitors / capacity) * 100).toFixed(2));
  const baseWait = crowd?.estimatedWait || 15;
  const estimatedWait = Math.max(1, Math.round(baseWait * (currentVisitors / apiCrowd)));
  useEffect(() => setTrend((current) => [...current.slice(-11), Math.max(8, Math.min(100, occupancy))]), [currentVisitors, occupancy]);

  return <><div className="admin-section-metrics"><Metric label="Current Crowd" value={currentVisitors.toLocaleString('en-IN')} /><Metric label="Capacity" value={capacity.toLocaleString('en-IN')} /><Metric label="Occupancy" value={`${occupancy}%`} tone="tone-orange" /><Metric label="Estimated Wait" value={`${estimatedWait} min`} /></div><div className="admin-section-grid admin-section-grid--wide"><article className="admin-section-card"><h2>Live Crowd Trend</h2><p className="admin-section-muted">Last 24 readings from the live crowd service</p><div className="admin-bars admin-bars--tall">{trend.map((height, index) => <i key={`${index}-${height}`} style={{ height: `${height}%`, transition: 'height 450ms ease' }} />)}</div></article><article className="admin-section-card"><h2>AI Crowd Prediction</h2><div className="prediction-list"><span>Current <b>{currentVisitors.toLocaleString('en-IN')}</b></span><span>30 Minutes <b>{Math.round(currentVisitors * 1.08).toLocaleString('en-IN')}</b></span><span>60 Minutes <b>{Math.round(currentVisitors * 1.2).toLocaleString('en-IN')}</b></span></div><h3>Crowd Risk</h3><div className="risk-list"><b>LOW</b><b>MEDIUM</b><b className="risk-high">HIGH</b><b>CRITICAL</b></div></article></div></>;
}

function BookingsSection() { const [filter, setFilter] = useState('All'); const [search, setSearch] = useState(''); const allRows = [['BK-2048', 'Riya Sharma', '9876543210', 'Banke Bihari', '23 Aug 2026', '09:00 AM', '2', 'General', 'Confirmed', 'View'] , ['BK-2049', 'Arjun Mehta', '9876501234', 'Banke Bihari', '23 Aug 2026', '11:30 AM', '4', 'Special', 'Pending', 'View'], ['BK-2050', 'Neha Singh', '9876512345', 'Dwarkadhish', '24 Aug 2026', '08:00 AM', '1', 'General', 'Completed', 'View']]; const rows = allRows.filter((row) => (filter === 'All' || row[8] === filter) && row.slice(0, 4).join(' ').toLowerCase().includes(search.toLowerCase())); return <><div className="admin-section-metrics"><Metric label="Total Bookings" value="2,048" /><Metric label="Today's Bookings" value="186" /><Metric label="Upcoming" value="1,420" /><Metric label="Cancelled" value="42" /></div><article className="admin-section-card"><div className="admin-section-toolbar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search booking, devotee or mobile" /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Confirmed</option><option>Pending</option><option>Completed</option></select><input type="date" /><select><option>All Temples</option><option>Banke Bihari Temple</option><option>Dwarkadhish Temple</option></select></div><Table headers={['Booking ID', 'Devotee', 'Mobile', 'Temple', 'Date', 'Time Slot', 'Devotees', 'Darshan', 'Status', 'Actions']} rows={rows} /></article></>; }

function SimulationsSection() { const [running, setRunning] = useState(''); return <><div className="admin-section-banner"><strong>SIMULATION MODE</strong><span>Test operational responses without changing production crowd data.</span></div><div className="admin-section-grid">{simulations.map(([id, title, description]) => <article className="admin-section-card" key={id}><span className="admin-section-tag">{running === id ? 'RUNNING' : 'READY'}</span><h2>{title}</h2><p>{description}</p><div className="admin-section-card-actions"><ActionButton onClick={() => setRunning(id)}>{running === id ? 'Simulation Running' : 'Run Simulation'}</ActionButton><ActionButton secondary onClick={() => setRunning('')}>Reset</ActionButton></div></article>)}</div></>; }

function GatesSection() {
  const [openGates, setOpenGates] = useState(['Gate 1', 'Gate 2', 'Gate 3']);
  const [selectedGate, setSelectedGate] = useState('');
  const [liveGates, setLiveGates] = useState(gates);
  const [zoneLevels, setZoneLevels] = useState([64, 58, 82, 44, 71, 28]);
  const toggleGate = (name) => setOpenGates((current) => current.includes(name) ? current.filter((gate) => gate !== name) : [...current, name]);

  useEffect(() => {
    const changes = [5, -2, 8, -3];
    let changeIndex = 0;
    const timer = window.setInterval(() => {
      const change = changes[changeIndex];
      changeIndex = (changeIndex + 1) % changes.length;
      setLiveGates((current) => current.map(([name, occupancy, capacity]) => [name, Math.max(0, Math.min(100, Number((occupancy + change).toFixed(2)))), capacity]));
      setZoneLevels((current) => current.map((level, index) => Math.max(0, Math.min(100, Number((level + change / (index % 2 ? 2 : 1)).toFixed(2))))));
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const zones = ['Main Entrance', 'Queue Zone A', 'Queue Zone B', 'Waiting Area', 'Parking Area', 'Exit Zone'];
  return <><div className="admin-section-grid">{liveGates.map(([name, occupancy, capacity]) => <article className="admin-section-card" key={name}><div className="admin-section-card-title"><h2>{name}</h2><b className={`status status--${statusFor(occupancy).toLowerCase()}`}>{statusFor(occupancy)}</b></div><strong className="admin-section-big-number">{occupancy}%</strong><div className="admin-section-progress"><i style={{ width: `${occupancy}%`, transition: 'width 450ms ease' }} /></div><p>{Math.round(capacity * occupancy / 100).toLocaleString('en-IN')} current crowd / {capacity.toLocaleString('en-IN')} capacity</p><div className="admin-section-card-actions"><ActionButton onClick={() => toggleGate(name)}>{openGates.includes(name) ? 'Close Gate' : 'Open Gate'}</ActionButton><ActionButton secondary onClick={() => setSelectedGate(name)}>View Details</ActionButton></div>{selectedGate === name && <p className="admin-section-muted">{name} is {openGates.includes(name) ? 'open' : 'closed'} and currently serving {occupancy}% occupancy.</p>}</article>)}</div><article className="admin-section-card"><h2>Temple Zones</h2><Table headers={['Zone', 'Crowd Level', 'Status']} rows={zones.map((zone, index) => [zone, `${zoneLevels[index]}%`, statusFor(zoneLevels[index])])} /></article></>;
}

function QueueSection() {
  const [paused, setPaused] = useState([]);
  const [liveQueues, setLiveQueues] = useState(queues.map(([name, people, wait, status]) => ({ name, people: Number(people.replace(/,/g, '')), wait: Number.parseInt(wait, 10), status })));
  const togglePause = (name) => setPaused((current) => current.includes(name) ? current.filter((queue) => queue !== name) : [...current, name]);

  useEffect(() => {
    const changes = [5, -2, 8, -3];
    let changeIndex = 0;
    const timer = window.setInterval(() => {
      const change = changes[changeIndex];
      changeIndex = (changeIndex + 1) % changes.length;
      setLiveQueues((current) => current.map((queue) => ({
        ...queue,
        people: Math.max(0, queue.people + change),
        wait: Math.max(1, queue.wait + change)
      })));
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const totalPeople = liveQueues.reduce((total, queue) => total + queue.people, 0);
  const averageWait = Math.round(liveQueues.reduce((total, queue) => total + queue.wait, 0) / liveQueues.length);
  const longestQueue = Math.max(...liveQueues.map((queue) => queue.people));
  return <><div className="admin-section-metrics"><Metric label="People in Queue" value={totalPeople.toLocaleString('en-IN')} /><Metric label="Average Wait" value={`${averageWait} min`} /><Metric label="Longest Queue" value={longestQueue.toLocaleString('en-IN')} /><Metric label="Active Queues" value={3 - paused.length} /></div><div className="admin-section-grid">{liveQueues.map(({ name, people, wait, status }) => <article className="admin-section-card" key={name}><div className="admin-section-card-title"><h2>{name}</h2><b className="status status--moderate">{paused.includes(name) ? 'Paused' : status}</b></div><strong className="admin-section-big-number">{people.toLocaleString('en-IN')}</strong><p>people waiting</p><div className="queue-detail"><span>Waiting time <b>{wait} min</b></span><span>Capacity <b>2,500</b></span></div><div className="admin-section-card-actions"><ActionButton onClick={() => setPaused((current) => current.filter((queue) => queue !== name))}>Open Queue</ActionButton><ActionButton secondary onClick={() => togglePause(name)}>{paused.includes(name) ? 'Resume' : 'Pause'}</ActionButton></div></article>)}</div></>;
}

function ParkingSection() {
  const [managed, setManaged] = useState('');
  const [liveParking, setLiveParking] = useState(parking);

  useEffect(() => {
    const changes = [5, -2, 8, -3];
    let changeIndex = 0;
    const timer = window.setInterval(() => {
      const change = changes[changeIndex];
      changeIndex = (changeIndex + 1) % changes.length;
      setLiveParking((current) => current.map(([name, capacity, occupied]) => [name, capacity, Math.max(0, Math.min(capacity, occupied + change))]));
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const totalCapacity = liveParking.reduce((total, [, capacity]) => total + capacity, 0);
  const occupied = liveParking.reduce((total, [, , currentOccupied]) => total + currentOccupied, 0);
  const available = totalCapacity - occupied;
  return <><div className="admin-section-metrics"><Metric label="Total Capacity" value={totalCapacity.toLocaleString('en-IN')} /><Metric label="Occupied" value={occupied.toLocaleString('en-IN')} /><Metric label="Available" value={available.toLocaleString('en-IN')} /><Metric label="Occupancy" value={`${Math.round(occupied / totalCapacity * 100)}%`} tone="tone-orange" /></div><div className="admin-section-grid">{liveParking.map(([name, capacity, currentOccupied]) => { const occupancy = Math.round(currentOccupied / capacity * 100); return <article className="admin-section-card" key={name}><h2>{name}</h2><strong className="admin-section-big-number">{occupancy}%</strong><div className="admin-section-progress"><i style={{ width: `${occupancy}%`, transition: 'width 450ms ease' }} /></div><div className="queue-detail"><span>Total slots <b>{capacity}</b></span><span>Available <b>{capacity - currentOccupied}</b></span></div><ActionButton onClick={() => setManaged(name)}>{managed === name ? 'Status Updated' : 'Manage Parking'}</ActionButton></article>; })}</div><article className="admin-section-card"><h2>Parking Map</h2><p className="admin-section-muted">{managed ? `${managed} management status updated.` : 'Live area availability is shown above. Use Manage Parking to update operational status.'}</p><ActionButton onClick={() => setManaged('All parking zones')}>View Parking Map</ActionButton></article></>;
}

function EmergencyModal({ title, onClose, children }) {
  return <div className="admin-emergency-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); onClose(); } }}><div className="admin-emergency-modal" role="dialog" aria-modal="true" aria-labelledby="emergency-modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="admin-emergency-modal-head"><h2 id="emergency-modal-title">{title}</h2><button type="button" aria-label="Close modal" onClick={onClose}>×</button></div>{children}</div></div>;
}

function EmergencyField({ label, children }) {
  return <label className="admin-emergency-field"><span>{label}</span>{children}</label>;
}

function ReportEmergencyForm({ onCancel, onSubmit }) {
  const [form, setForm] = useState({ type: 'Medical Emergency', location: 'Gate 3', priority: 'HIGH', description: '' });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="admin-emergency-form"><EmergencyField label="Emergency Type"><select value={form.type} onChange={(event) => update('type', event.target.value)}>{['Medical Emergency', 'Crowd Surge', 'Missing Person', 'Fire', 'Security Threat', 'Accident', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></EmergencyField><EmergencyField label="Location"><select value={form.location} onChange={(event) => update('location', event.target.value)}>{['Gate 1', 'Gate 2', 'Gate 3', 'Queue Zone A', 'Queue Zone B', 'Queue Zone C', 'Parking A', 'Parking B', 'Temple Courtyard', 'Main Entrance'].map((value) => <option key={value}>{value}</option>)}</select></EmergencyField><EmergencyField label="Priority"><select value={form.priority} onChange={(event) => update('priority', event.target.value)}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select></EmergencyField><EmergencyField label="Description"><textarea required value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe the emergency" /></EmergencyField><EmergencyField label="Reported By"><input value="Admin User" readOnly /></EmergencyField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onCancel}>Cancel</ActionButton><ActionButton type="submit">Report Emergency</ActionButton></div></form>;
}

function AssignEmergencyForm({ incident, teams, onCancel, onSubmit }) {
  const [team, setTeam] = useState(incident.assignedTeam || teams[0]);
  const [notes, setNotes] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(team); }} className="admin-emergency-form"><div className="admin-emergency-detail-grid"><span>Incident<strong>{incident.id}</strong></span><span>Priority<strong>{incident.priority}</strong></span></div><EmergencyField label="Response Team"><select value={team} onChange={(event) => setTeam(event.target.value)}>{teams.map((value) => <option key={value}>{value}</option>)}</select></EmergencyField><EmergencyField label="Notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add assignment notes" /></EmergencyField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onCancel}>Cancel</ActionButton><ActionButton type="submit">Assign Team</ActionButton></div></form>;
}

function ResolveEmergencyForm({ incident, onCancel, onSubmit }) {
  const [notes, setNotes] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); if (notes.trim()) onSubmit(notes.trim()); }} className="admin-emergency-form"><p>Resolve <strong>{incident.id}</strong> · {incident.type} at {incident.location}?</p><EmergencyField label="Resolution Notes"><textarea required value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Describe the resolution" /></EmergencyField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onCancel}>Cancel</ActionButton><ActionButton type="submit">Mark as Resolved</ActionButton></div></form>;
}

function EmergenciesSection() {
  const [items, setItems] = useState(incidents.map(([id, type, location, priority], index) => ({ id, type, description: index === 0 ? 'Patient found unwell' : index === 1 ? 'Large gathering detected' : 'Child lost (age 8)', location, locationDetail: index === 0 ? 'Main Entry Gate' : index === 1 ? 'Waiting Area' : 'Parking Lot', priority, status: 'Active', reportedBy: 'Admin User', reportedAt: new Date(Date.now() - index * 45 * 60000).toISOString(), assignedTeam: '', resolutionNotes: '' })));
  const [filter, setFilter] = useState('All Incidents');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'reportedAt', direction: 'desc' });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const teams = ['Medical Response Team', 'Security Team Alpha', 'Security Team Beta', 'Crowd Control Team', 'Lost & Found Team'];
  const alertTypeFor = (type) => ({ 'Medical Emergency': 'medical', 'Crowd Surge': 'crowd_surge', 'Missing Person': 'missing_person', Fire: 'fire', 'Security Threat': 'security', Accident: 'security', Other: 'security' }[type] || 'security');
  useEffect(() => {
    getAdminEmergencies(1).then(({ data }) => {
      if (!Array.isArray(data) || !data.length) return;
      setItems(data.map((item) => ({ id: item.incident_id, type: item.alert_type, description: item.description || 'Emergency reported', location: item.location, locationDetail: 'Temple premises', priority: String(item.priority || 'medium').toUpperCase(), status: String(item.status || 'active').replace(/^./, (letter) => letter.toUpperCase()), reportedBy: 'Admin User', reportedAt: item.created_at, assignedTeam: item.assigned_staff ? `Staff ${item.assigned_staff}` : '', resolutionNotes: '' })));
    }).catch(() => showToast('Could not load emergency incidents'));
  }, []);
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const sortBy = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  const updateIncident = (id, changes) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  const selectedIncident = modal?.incidentId ? items.find((item) => item.id === modal.incidentId) : null;
  const visibleItems = items.filter((item) => {
    const matchesFilter = filter === 'All Incidents' || (filter === 'High Priority' && item.priority === 'HIGH') || (filter === 'Medium Priority' && item.priority === 'MEDIUM') || (filter === 'Low Priority' && item.priority === 'LOW') || item.status === filter;
    const query = search.toLowerCase();
    return matchesFilter && (!query || [item.id, item.type, item.location, item.description, item.assignedTeam].join(' ').toLowerCase().includes(query));
  }).sort((a, b) => {
    const first = String(a[sort.key] || '').toLowerCase();
    const second = String(b[sort.key] || '').toLowerCase();
    return (first > second ? 1 : first < second ? -1 : 0) * (sort.direction === 'asc' ? 1 : -1);
  });
  const activeCount = items.filter((item) => ['Active', 'Assigned', 'Responding', 'Pending'].includes(item.status)).length;
  const resolvedCount = items.filter((item) => item.status === 'Resolved').length;
  const submitReport = async (form) => { if (!form.description.trim()) return; const fallbackId = `INC-${1000 + items.length + 5}`; const item = { id: fallbackId, type: form.type, description: form.description.trim(), location: form.location, locationDetail: 'Reported location', priority: form.priority, status: 'Active', reportedBy: 'Admin User', reportedAt: new Date().toISOString(), assignedTeam: '', resolutionNotes: '' }; try { const response = await createAdminEmergency({ templeId: 1, alertType: alertTypeFor(form.type), location: form.location, description: form.description.trim(), priority: form.priority.toLowerCase() }); item.id = response.data?.incident_id || fallbackId; } catch { /* Keep the local fallback when the API is unavailable. */ } setItems((current) => [item, ...current]); setModal(null); showToast('Emergency reported successfully'); };
  const assignTeam = async (team) => { if (!selectedIncident || !team) return; try { await updateAdminEmergency(selectedIncident.id, { status: 'assigned', assignedStaff: null }); } catch { /* Keep the local update when the API is unavailable. */ } updateIncident(selectedIncident.id, { assignedTeam: team, assignedAt: new Date().toISOString(), status: 'Active' }); setModal(null); showToast('Response team assigned successfully'); };
  const resolveIncident = async (notes) => { if (!selectedIncident || !notes) return; try { await updateAdminEmergency(selectedIncident.id, { status: 'resolved' }); } catch { /* Keep the local update when the API is unavailable. */ } updateIncident(selectedIncident.id, { status: 'Resolved', resolvedAt: new Date().toISOString(), resolutionNotes: notes }); setModal(null); showToast('Emergency resolved successfully'); };
  const openModal = (type, incident) => {
    setModal({ type, incidentId: incident?.id });
  };
  const formatDate = (value) => new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  return <div className="admin-emergency-center"><div className="admin-emergency-intro"><div><span className="admin-section-kicker">DARSHANSETU / ADMIN OPERATIONS</span><h2>Emergency Management Center</h2><p>Monitor incidents, respond quickly, and ensure a safe &amp; smooth darshan experience.</p></div><div className="admin-emergency-temple"><strong>Banke Bihari Temple</strong><span>Vrindavan · <b>AU</b></span></div></div><div className="admin-emergency-stats"><Metric label="Total Incidents" value={items.length} /><Metric label="Active Incidents" value={activeCount} tone="tone-red" /><Metric label="Resolved" value={resolvedCount} tone="tone-green" /><Metric label="Response Team" value="12" tone="tone-blue" /><Metric label="Today" value={new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} /></div><article className="admin-section-card admin-emergency-card"><div className="admin-emergency-card-head"><div><h2>Emergency Incidents</h2><p>Manage and respond to all active incidents at the temple.</p></div><div className="admin-emergency-tools"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search incidents..." aria-label="Search incidents" /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter incidents"><option>All Incidents</option><option>Active</option><option>Pending</option><option>Resolved</option><option>High Priority</option><option>Medium Priority</option><option>Low Priority</option></select><ActionButton onClick={() => openModal('report')}>Report Emergency</ActionButton></div></div><div className="admin-section-table-wrap admin-emergency-table-wrap"><table className="admin-section-table admin-emergency-table"><thead><tr>{[['id', 'Incident ID'], ['type', 'Type'], ['location', 'Location'], ['priority', 'Priority'], ['status', 'Status']].map(([key, label]) => <th key={key}><button type="button" onClick={() => sortBy(key)}>{label} <small>{sort.key === key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</small></button></th>)}<th>Actions</th></tr></thead><tbody>{visibleItems.length ? visibleItems.map((item) => <tr key={item.id}><td><strong>{item.id}</strong><small>{formatDate(item.reportedAt)}</small></td><td><strong>{item.type}</strong><small>{item.description}</small></td><td><strong>{item.location}</strong><small>{item.locationDetail}</small></td><td><span className={`admin-emergency-badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span></td><td><span className={`admin-emergency-badge status-${item.status.toLowerCase()}`}><i />{item.status}</span></td><td><div className="admin-emergency-actions"><button type="button" onClick={() => openModal('assign', item)}>Assign</button><button type="button" onClick={() => openModal('resolve', item)} disabled={item.status === 'Resolved'}>Resolve</button><button type="button" aria-label={`More actions for ${item.id}`} onClick={() => openModal('details', item)}>•••</button></div></td></tr>) : <tr><td colSpan="6" className="admin-emergency-empty">No incidents match your filters.</td></tr>}</tbody></table></div></article>{modal?.type === 'report' && <EmergencyModal title="Report Emergency" onClose={() => setModal(null)}><ReportEmergencyForm onCancel={() => setModal(null)} onSubmit={submitReport} /></EmergencyModal>}{modal?.type === 'assign' && selectedIncident && <EmergencyModal title="Assign Response Team" onClose={() => setModal(null)}><AssignEmergencyForm incident={selectedIncident} teams={teams} onCancel={() => setModal(null)} onSubmit={assignTeam} /></EmergencyModal>}{modal?.type === 'resolve' && selectedIncident && <EmergencyModal title="Resolve Emergency?" onClose={() => setModal(null)}><ResolveEmergencyForm incident={selectedIncident} onCancel={() => setModal(null)} onSubmit={resolveIncident} /></EmergencyModal>}{modal?.type === 'details' && selectedIncident && <EmergencyModal title={`Incident ${selectedIncident.id}`} onClose={() => setModal(null)}><div className="admin-emergency-detail-grid"><span>Type<strong>{selectedIncident.type}</strong></span><span>Priority<strong>{selectedIncident.priority}</strong></span><span>Location<strong>{selectedIncident.location}</strong></span><span>Status<strong>{selectedIncident.status}</strong></span><span>Reported By<strong>{selectedIncident.reportedBy}</strong></span><span>Reported<strong>{formatDate(selectedIncident.reportedAt)}</strong></span><span>Assigned Team<strong>{selectedIncident.assignedTeam || 'Unassigned'}</strong></span><span>Resolved<strong>{selectedIncident.resolvedAt ? formatDate(selectedIncident.resolvedAt) : 'Not resolved'}</strong></span></div><p className="admin-emergency-notes">{selectedIncident.description}</p>{selectedIncident.resolutionNotes && <p className="admin-emergency-notes">Resolution: {selectedIncident.resolutionNotes}</p>}<div className="admin-emergency-modal-actions"><ActionButton onClick={() => setModal(null)}>Close</ActionButton></div></EmergencyModal>}{toast && <div className="admin-emergency-toast" role="status">{toast}</div>}</div>;
}

const staffFallback = [
  { id: 'ST-001', name: 'Amit Kumar', role: 'Security', assigned_zone: 'Gate 3', shift_start: '08:00:00', shift_end: '16:00:00', status: 'Active', contact: '9876543210', email: 'amit.staff@darshansetu.com', assignment: 'Gate Security', current_location: 'Gate 3', emergency_contact: '9876511001', joining_date: '2023-04-12' },
  { id: 'ST-014', name: 'Pooja Rao', role: 'Medical', assigned_zone: 'Main Entrance', shift_start: '12:00:00', shift_end: '20:00:00', status: 'On Break', contact: '9876501234', email: 'pooja.staff@darshansetu.com', assignment: 'Medical Support', current_location: 'Staff Room', emergency_contact: '9876511002', joining_date: '2023-07-19' },
  { id: 'ST-022', name: 'Ravi Das', role: 'Security', assigned_zone: 'Queue Zone B', shift_start: '16:00:00', shift_end: '00:00:00', status: 'Emergency Deployment', contact: '9876501235', email: 'ravi.staff@darshansetu.com', assignment: 'Emergency Response', current_location: 'Queue Zone B', emergency_contact: '9876511003', joining_date: '2024-01-08' },
  { id: 'ST-031', name: 'Neha Sharma', role: 'Crowd Control', assigned_zone: 'Gate 2', shift_start: '06:00:00', shift_end: '14:00:00', status: 'Available', contact: '9876500004', email: 'neha.staff@darshansetu.com', assignment: 'Crowd Control' },
  { id: 'ST-044', name: 'Vikram Singh', role: 'Parking', assigned_zone: 'Parking A', shift_start: '08:00:00', shift_end: '16:00:00', status: 'Active', contact: '9876500005', email: 'vikram.staff@darshansetu.com', assignment: 'Parking Management' },
  { id: 'ST-052', name: 'Meera Joshi', role: 'Support', assigned_zone: 'Temple Courtyard', shift_start: '10:00:00', shift_end: '18:00:00', status: 'Off Duty', contact: '9876500006', email: 'meera.staff@darshansetu.com', assignment: 'Regular Duty' }
];
const staffZones = ['Gate 1', 'Gate 2', 'Gate 3', 'Main Entrance', 'Queue Zone A', 'Queue Zone B', 'Queue Zone C', 'Parking A', 'Parking B', 'Temple Courtyard'];
const staffRoles = ['Security', 'Medical', 'Administration', 'Crowd Control', 'Parking', 'Queue Management', 'Support'];
const staffStatuses = ['Active', 'Available', 'On Break', 'Emergency Deployment', 'Off Duty'];
const staffAssignments = ['Regular Duty', 'Crowd Control', 'Gate Security', 'Medical Support', 'Emergency Response', 'Parking Management', 'Queue Management'];

function staffInitials(name) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
function staffTime(value) { return String(value || '').slice(0, 5); }
function StaffField({ label, children }) { return <label className="admin-staff-field"><span>{label}</span>{children}</label>; }

function StaffDialog({ mode, staff, staffOptions, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...(staff || {}), zone: staff?.assigned_zone || 'Gate 3', assignedZone: staff?.assigned_zone || 'Gate 3', assignment: staff?.assignment || 'Regular Duty', priority: staff?.priority || 'LOW', notes: '' }));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const title = mode === 'details' ? `Staff Details · ${staff.id}` : mode === 'edit' ? `Edit ${staff.name}` : mode === 'deploy' ? 'Deploy Staff' : mode === 'status' ? 'Change Staff Status' : mode === 'zone' ? 'Change Assigned Zone' : 'Remove Staff Member?';
  if (mode === 'details') return <EmergencyModal title={title} onClose={onClose}><div className="admin-staff-detail-grid">{[['Staff ID', staff.id], ['Full Name', staff.name], ['Role', staff.role], ['Assigned Zone', staff.assigned_zone], ['Current Shift', `${staffTime(staff.shift_start)} - ${staffTime(staff.shift_end)}`], ['Status', staff.status], ['Contact Number', staff.contact], ['Email', staff.email || 'Not provided'], ['Joining Date', staff.joining_date || 'Not provided'], ['Emergency Contact', staff.emergency_contact || 'Not provided'], ['Current Assignment', staff.assignment || 'Regular Duty'], ['Current Location', staff.current_location || staff.assigned_zone]].map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div><div className="admin-emergency-modal-actions"><ActionButton onClick={onClose}>Close</ActionButton></div></EmergencyModal>;
  if (mode === 'remove') return <EmergencyModal title={title} onClose={onClose}><div className="admin-staff-confirm"><p>Remove <strong>{staff.name}</strong> ({staff.id}) from the active directory?</p><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onClose}>Cancel</ActionButton><ActionButton onClick={() => onSave(form)}>Remove Staff</ActionButton></div></div></EmergencyModal>;
  if (mode === 'status') return <EmergencyModal title={title} onClose={onClose}><form className="admin-staff-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}><StaffField label="Status"><select value={form.status} onChange={(event) => update('status', event.target.value)}>{staffStatuses.map((value) => <option key={value}>{value}</option>)}</select></StaffField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onClose}>Cancel</ActionButton><ActionButton type="submit">Save Status</ActionButton></div></form></EmergencyModal>;
  if (mode === 'zone') return <EmergencyModal title={title} onClose={onClose}><form className="admin-staff-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}><StaffField label="Assigned Zone"><select value={form.zone} onChange={(event) => update('zone', event.target.value)}>{staffZones.map((value) => <option key={value}>{value}</option>)}</select></StaffField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onClose}>Cancel</ActionButton><ActionButton type="submit">Save Zone</ActionButton></div></form></EmergencyModal>;
  if (mode === 'deploy') return <EmergencyModal title={title} onClose={onClose}><form className="admin-staff-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}><StaffField label="Select Staff"><select value={form.id} onChange={(event) => update('id', event.target.value)}>{staffOptions.map((value) => <option value={value.id} key={value.id}>{value.name} · {value.id}</option>)}</select></StaffField><StaffField label="Emergency Incident ID (optional)"><input value={form.incidentId || ''} onChange={(event) => update('incidentId', event.target.value)} placeholder="Example: INC-1004" /></StaffField><StaffField label="Select Zone"><select value={form.zone} onChange={(event) => update('zone', event.target.value)}>{staffZones.map((value) => <option key={value}>{value}</option>)}</select></StaffField><StaffField label="Select Assignment"><select value={form.assignment} onChange={(event) => update('assignment', event.target.value)}>{staffAssignments.map((value) => <option key={value}>{value}</option>)}</select></StaffField><StaffField label="Priority"><select value={form.priority} onChange={(event) => update('priority', event.target.value)}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select></StaffField><StaffField label="Deployment Notes"><textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add deployment notes" /></StaffField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onClose}>Cancel</ActionButton><ActionButton type="submit">Deploy Staff</ActionButton></div></form></EmergencyModal>;
  return <EmergencyModal title={title} onClose={onClose}><form className="admin-staff-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}><StaffField label="Name"><input required value={form.name || ''} onChange={(event) => update('name', event.target.value)} /></StaffField><StaffField label="Role"><select value={form.role} onChange={(event) => update('role', event.target.value)}>{staffRoles.map((value) => <option key={value}>{value}</option>)}</select></StaffField><StaffField label="Assigned Zone"><select value={form.assignedZone} onChange={(event) => update('assignedZone', event.target.value)}>{staffZones.map((value) => <option key={value}>{value}</option>)}</select></StaffField><StaffField label="Shift Start"><input type="time" required value={staffTime(form.shift_start)} onChange={(event) => update('shift_start', event.target.value)} /></StaffField><StaffField label="Shift End"><input type="time" required value={staffTime(form.shift_end)} onChange={(event) => update('shift_end', event.target.value)} /></StaffField><StaffField label="Status"><select value={form.status} onChange={(event) => update('status', event.target.value)}>{staffStatuses.map((value) => <option key={value}>{value}</option>)}</select></StaffField><StaffField label="Contact"><input required value={form.contact || ''} onChange={(event) => update('contact', event.target.value)} /></StaffField><StaffField label="Email"><input type="email" value={form.email || ''} onChange={(event) => update('email', event.target.value)} /></StaffField><div className="admin-emergency-modal-actions"><ActionButton secondary onClick={onClose}>Cancel</ActionButton><ActionButton type="submit">Save Changes</ActionButton></div></form></EmergencyModal>;
}

function StaffSection() {
  const [items, setItems] = useState(staffFallback);
  const [stats, setStats] = useState({ totalStaff: staffFallback.length, activeStaff: 3, securityPersonnel: 2, availableStaff: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(staffFallback.length);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const pageSize = 10;
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3000); };
  const load = async () => { setLoading(true); setError(''); try { const response = await getAdminStaff({ page, pageSize, search, role, status }); setItems(response.data?.items || []); setTotal(response.data?.total || 0); } catch { const filtered = staffFallback.filter((item) => (!search || Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())) && (!role || item.role === role) && (!status || item.status === status)); setItems(filtered); setTotal(filtered.length); } finally { setLoading(false); } };
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [page, search, role, status]);
  useEffect(() => { getAdminStaffStats().then((response) => setStats(response.data || stats)).catch(() => {}); }, []);
  const updateLocal = (id, changes) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  const save = async (mode, form) => { const target = mode === 'deploy' ? items.find((item) => item.id === form.id) : modal?.staff; if (!target) return; try { if (mode === 'edit') { await updateAdminStaff(target.id, form); updateLocal(target.id, { ...form, assigned_zone: form.assignedZone, shift_start: form.shift_start, shift_end: form.shift_end }); notify('Staff details updated successfully'); } if (mode === 'status') { await updateAdminStaffStatus(target.id, form.status); updateLocal(target.id, { status: form.status }); notify('Staff status updated successfully'); } if (mode === 'zone') { await updateAdminStaffZone(target.id, form.zone); updateLocal(target.id, { assigned_zone: form.zone, current_location: form.zone }); notify('Zone assignment updated successfully'); } if (mode === 'deploy') { await deployAdminStaff(target.id, { zone: form.zone, assignment: form.assignment, priority: form.priority, notes: form.notes, incidentId: form.incidentId || undefined }); updateLocal(target.id, { status: 'Emergency Deployment', assigned_zone: form.zone, assignment: form.assignment, current_location: form.zone }); notify('Staff deployed successfully'); } if (mode === 'remove') { await removeAdminStaff(target.id); setItems((current) => current.filter((item) => item.id !== target.id)); setTotal((current) => Math.max(current - 1, 0)); notify('Staff removed successfully'); } getAdminStaffStats().then((response) => setStats(response.data || stats)).catch(() => {}); } catch (requestError) { notify(requestError.message || 'Staff action failed'); } setModal(null); };
  const visiblePageCount = Math.max(Math.ceil(total / pageSize), 1);
  const open = (mode, staff = null) => setModal({ mode, staff });
  return <div className="admin-staff-page"><div className="admin-staff-intro"><div><span className="admin-section-kicker">DARSHANSETU / ADMIN OPERATIONS</span><h2>Staff &amp; Security Management</h2><p>Manage temple staff, security personnel and ensure smooth operations at all times.</p></div><div className="admin-emergency-temple"><strong>Banke Bihari Temple</strong><span>Vrindavan · <b>AU</b></span></div></div><div className="admin-section-metrics admin-staff-metrics"><Metric label="Total Staff" value={stats.totalStaff} /><Metric label="Active Staff" value={stats.activeStaff} tone="tone-green" /><Metric label="Security Personnel" value={stats.securityPersonnel} tone="tone-red" /><Metric label="Available Staff" value={stats.availableStaff} tone="tone-blue" /></div><article className="admin-section-card admin-staff-card"><div className="admin-section-card-title"><div><h2>Staff Directory</h2><p className="admin-section-muted">View and manage all staff members, their roles and current status.</p></div><ActionButton onClick={() => open('deploy', items[0])}>Deploy Staff</ActionButton></div><div className="admin-staff-filters"><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search staff..." aria-label="Search staff" /><select value={role} onChange={(event) => { setPage(1); setRole(event.target.value); }} aria-label="Filter by role"><option value="">All Roles</option>{staffRoles.map((value) => <option key={value}>{value}</option>)}</select><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} aria-label="Filter by status"><option value="">All Status</option>{staffStatuses.map((value) => <option key={value}>{value}</option>)}</select></div><div className="admin-section-table-wrap admin-staff-table-wrap"><table className="admin-section-table admin-staff-table"><thead><tr>{['STAFF ID', 'NAME', 'ROLE', 'ASSIGNED ZONE', 'SHIFT', 'STATUS', 'CONTACT', 'ACTIONS'].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan="8" className="admin-emergency-empty">Loading staff...</td></tr> : items.length ? items.map((item) => <tr key={item.id}><td><strong>{item.id}</strong></td><td><span className="admin-staff-name"><b>{staffInitials(item.name)}</b><strong>{item.name}</strong></span></td><td><span className={`admin-staff-role role-${item.role.toLowerCase().replaceAll(' ', '-')}`}>{item.role}</span></td><td>{item.assigned_zone}</td><td>{staffTime(item.shift_start)} - {staffTime(item.shift_end)}</td><td><span className={`admin-staff-status status-${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span></td><td>{item.contact}</td><td><div className="admin-staff-actions"><button type="button" onClick={() => open('details', item)}>View</button><button type="button" aria-label={`Manage ${item.name}`} onClick={() => open('edit', item)}>•••</button><select aria-label={`Actions for ${item.name}`} value="" onChange={(event) => { if (event.target.value) open(event.target.value, item); }}><option value="">Actions</option><option value="status">Change Status</option><option value="zone">Change Zone</option><option value="deploy">Deploy Staff</option><option value="remove">Remove Staff</option></select></div></td></tr>) : <tr><td colSpan="8" className="admin-emergency-empty">No staff members found. Try changing your search or filters.</td></tr>}</tbody></table></div><div className="admin-staff-pagination"><span>Showing {total ? ((page - 1) * pageSize) + 1 : 0}-{Math.min(page * pageSize, total)} of {total} staff members</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><strong>{page} / {visiblePageCount}</strong><button type="button" disabled={page >= visiblePageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div></article>{modal && <StaffDialog mode={modal.mode} staff={modal.staff} staffOptions={items} onClose={() => setModal(null)} onSave={(form) => save(modal.mode, form)} />}{toast && <div className="admin-emergency-toast" role="status">{toast}</div>}</div>;
}

function AnnouncementsSection() { const [items, setItems] = useState([['Morning Slot Update', 'Visitors can use Gate 2 for morning slots.', 'All visitors', 'Published'], ['Festival Security Briefing', 'Additional screening is active at Gate 3.', 'Staff only', 'Scheduled']]); const create = () => { const title = window.prompt('Announcement title'); if (title?.trim()) setItems((current) => [[title.trim(), 'New announcement ready for review.', 'All visitors', 'Draft'], ...current]); }; const update = (title, status) => setItems((current) => current.map((item) => item[0] === title ? [item[0], item[1], item[2], status] : item)); return <><div className="admin-section-toolbar admin-section-toolbar--top"><h2>Announcements</h2><ActionButton onClick={create}>Create Announcement</ActionButton></div><div className="admin-section-grid">{items.map(([title, message, audience, status]) => <article className="admin-section-card" key={title}><span className="admin-section-tag">{status}</span><h2>{title}</h2><p>{message}</p><div className="queue-detail"><span>Audience <b>{audience}</b></span><span>23 Aug 2026</span></div><div className="admin-section-card-actions"><ActionButton onClick={() => update(title, 'Draft')}>Edit</ActionButton><ActionButton secondary onClick={() => update(title, 'Scheduled')}>Schedule</ActionButton></div></article>)}</div></>; }

const analyticsData = {
  Today: { averageCrowd: 6420, peakCrowd: 8950, averageWait: 42, totalBookings: 2048, confirmed: 1820, completed: 640, cancelled: 42, gateOccupancy: 91, bars: [40, 55, 48, 72, 88, 62, 76, 91] },
  '7 Days': { averageCrowd: 5810, peakCrowd: 9120, averageWait: 36, totalBookings: 12480, confirmed: 10960, completed: 8420, cancelled: 318, gateOccupancy: 84, bars: [52, 66, 44, 78, 61, 86, 72, 90] },
  '30 Days': { averageCrowd: 4970, peakCrowd: 8950, averageWait: 31, totalBookings: 48120, confirmed: 42680, completed: 35740, cancelled: 1420, gateOccupancy: 79, bars: [35, 48, 63, 57, 74, 68, 82, 76] },
  'Custom Range': { averageCrowd: 5280, peakCrowd: 8440, averageWait: 34, totalBookings: 8640, confirmed: 7520, completed: 5980, cancelled: 206, gateOccupancy: 82, bars: [44, 58, 51, 69, 64, 73, 80, 68] }
};

function AnalyticsSection() {
  const [period, setPeriod] = useState('Today');
  const data = analyticsData[period];
  const exportReport = () => {
    const report = `DarshanSetu Analytics Report (${period})\nAverage Crowd: ${data.averageCrowd}\nPeak Crowd: ${data.peakCrowd}\nAverage Wait: ${data.averageWait} min\nTotal Bookings: ${data.totalBookings}`;
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `darshansetu-analytics-${period.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <><div className="admin-section-toolbar admin-section-toolbar--top"><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Analytics period"><option>Today</option><option>7 Days</option><option>30 Days</option><option>Custom Range</option></select><ActionButton onClick={exportReport}>Export Report</ActionButton></div><div className="admin-section-metrics"><Metric label="Average Crowd" value={data.averageCrowd.toLocaleString('en-IN')} /><Metric label="Peak Crowd" value={data.peakCrowd.toLocaleString('en-IN')} /><Metric label="Average Wait" value={`${data.averageWait} min`} /><Metric label="Total Bookings" value={data.totalBookings.toLocaleString('en-IN')} /></div><div className="admin-section-grid admin-section-grid--wide"><article className="admin-section-card"><h2>Crowd Analytics</h2><div className="admin-bars admin-bars--tall">{data.bars.map((height, index) => <i key={`${period}-${index}`} style={{ height: `${height}%`, transition: 'height 450ms ease' }} />)}</div></article><article className="admin-section-card"><h2>Booking Analytics</h2><div className="prediction-list"><span>Confirmed <b>{data.confirmed.toLocaleString('en-IN')}</b></span><span>Completed <b>{data.completed.toLocaleString('en-IN')}</b></span><span>Cancelled <b>{data.cancelled.toLocaleString('en-IN')}</b></span><span>Gate 3 occupancy <b>{data.gateOccupancy}%</b></span></div></article></div></>;
}

function SettingsSection() { const [saved, setSaved] = useState(false); return <article className="admin-section-card admin-settings"><h2>Temple Settings</h2><div className="admin-section-form"><label>Temple Name<input defaultValue="Banke Bihari Temple, Vrindavan" /></label><label>Capacity<input type="number" defaultValue="10000" /></label><label>Opening Time<input type="time" defaultValue="05:00" /></label><label>Closing Time<input type="time" defaultValue="22:00" /></label><label>Warning Threshold (%)<input type="number" defaultValue="60" /></label><label>High Risk Threshold (%)<input type="number" defaultValue="80" /></label><label>Critical Threshold (%)<input type="number" defaultValue="90" /></label></div><h2>Notification Settings</h2><div className="admin-section-checks"><label><input type="checkbox" defaultChecked /> Emergency Notifications</label><label><input type="checkbox" defaultChecked /> Crowd Alerts</label><label><input type="checkbox" defaultChecked /> Booking Alerts</label></div><ActionButton onClick={() => setSaved(true)}>{saved ? 'Changes Saved' : 'Save Changes'}</ActionButton></article>; }

export default function AdminSection() {
  const { section = 'crowd-prediction' } = useParams();
  const location = useLocation();
  const routeSection = { '/admin/crowd': 'crowd-prediction', '/admin/queue': 'queue-management', '/admin/staff': 'staff-security', '/admin/bookings': 'bookings', '/admin/dashboard/bookings': 'bookings', '/admin/crowd-prediction': 'crowd-prediction', '/admin/simulations': 'simulations', '/admin/gates-zones': 'gates-zones', '/admin/queue-management': 'queue-management', '/admin/parking': 'parking', '/admin/emergencies': 'emergencies', '/admin/staff-security': 'staff-security', '/admin/announcements': 'announcements', '/admin/analytics': 'analytics', '/admin/settings': 'settings' }[location.pathname] || section;
  const [crowd, setCrowd] = useState(null);
  useEffect(() => { if (routeSection === 'crowd-prediction' || routeSection === 'dashboard') getLiveCrowd(1).then(({ data }) => setCrowd(data)).catch(() => {}); }, [routeSection]);
  const content = { 'crowd-prediction': ['Crowd & Prediction', <CrowdSection crowd={crowd} />], simulations: ['Crowd Simulation Center', <SimulationsSection />], bookings: ['Booking Management', <BookingsSection />], 'gates-zones': ['Gates & Zones Management', <GatesSection />], 'queue-management': ['Queue Management', <QueueSection />], parking: ['Parking Management', <ParkingSection />], emergencies: ['Emergency Management Center', <EmergenciesSection />], 'staff-security': ['Staff & Security Management', <StaffSection />], announcements: ['Announcements Management', <AnnouncementsSection />], analytics: ['Analytics & Reports', <AnalyticsSection />], settings: ['Admin Settings', <SettingsSection />] }[routeSection] || ['Admin Operations', <DashboardSection crowd={crowd} />];
  return <div className="admin-section-page"><Sidebar /><main className="admin-section-main"><Header title={content[0]} /><div className="admin-section-content">{content[1]}</div></main></div>;
}
