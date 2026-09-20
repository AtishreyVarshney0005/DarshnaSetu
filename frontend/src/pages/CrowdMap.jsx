import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearSession, getCrowdHistory, getLiveCrowd } from "../api/client";
import "../styles/crowd.css";

const DEMO_TEMPLE_ID = 1;
const metricCards = [
  { key: "currentVisitors", label: "Current visitors", icon: "◉" },
  { key: "capacity", label: "Temple capacity", icon: "▣" },
  { key: "occupancy", label: "Occupancy", suffix: "%", icon: "◌" },
  { key: "estimatedWait", label: "Estimated wait", suffix: " min", icon: "◷" }
];
const formatValue = (value) => Number(value || 0).toLocaleString("en-IN");

export default function CrowdMap() {
  const [live, setLive] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getLiveCrowd(DEMO_TEMPLE_ID), getCrowdHistory(DEMO_TEMPLE_ID)])
      .then(([liveResponse, historyResponse]) => {
        if (!active) return;
        setLive(liveResponse.data);
        setHistory((historyResponse.data || []).map((point) => ({
          ...point,
          label: `${point.date} ${String(point.hour).padStart(2, "0")}:00`
        })));
      })
      .catch((requestError) => active && setError(requestError.message || "Live crowd data is unavailable"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const logout = () => {
    clearSession();
    window.location.replace("/login");
  };

  if (loading) return <main className="crowd-state"><strong>DarshanSetu</strong><p>Loading live crowd...</p></main>;
  if (error) return <main className="crowd-state crowd-state--error"><span className="crowd-alert-icon">!</span><h1>Live crowd unavailable</h1><p>{error}</p><Link to="/">Return home</Link></main>;
  if (!live) return <main className="crowd-state"><p>No crowd data available for this temple.</p></main>;

  return (
    <main className="crowd-page crowd-dashboard">
      <header className="crowd-header">
        <div><span className="crowd-eyebrow">DARSHANSETU / LIVE INTELLIGENCE</span><h1>Live crowd conditions</h1><p>{live.templeName}</p></div>
        <div className="crowd-actions"><span className="crowd-live">● Live</span><Link to="/">Home</Link><button type="button" onClick={logout} aria-label="Log out">↪</button></div>
      </header>
      <section className="crowd-metrics" aria-label="Live crowd metrics">
        {metricCards.map(({ key, label, suffix = "", icon }) => <article className="crowd-metric" key={key}><span className="crowd-metric-icon">{icon}</span><div><span>{label}</span><strong>{formatValue(live[key])}{suffix}</strong></div></article>)}
        <article className={`crowd-metric crowd-risk crowd-risk--${live.riskLevel}`}><span className="crowd-metric-icon">!</span><div><span>Risk level</span><strong>{live.riskLevel}</strong></div></article>
      </section>
      <section className="crowd-content-grid">
        <article className="crowd-panel crowd-chart-panel"><div className="crowd-panel-heading"><div><span className="crowd-eyebrow">HISTORY</span><h2>Crowd movement</h2></div><span>Last 24 readings</span></div><div className="crowd-chart"><svg viewBox="0 0 600 220" role="img" aria-label="Crowd movement history"><path d="M0 190H600M0 140H600M0 90H600M0 40H600" className="chart-grid-line" />{history.length > 1 && <polyline points={history.map((point, index) => `${(index / (history.length - 1)) * 600},${205 - (Number(point.currentVisitors || 0) / Math.max(live.capacity, 1)) * 170}`).join(" ")} className="crowd-line" />}</svg></div></article>
        <article className="crowd-panel"><div className="crowd-panel-heading"><div><span className="crowd-eyebrow">ENTRY POINTS</span><h2>Gate status</h2></div><span>{live.gates.length} gates</span></div><div className="gate-status-list">{live.gates.map((gate) => <div className="gate-status" key={gate.id}><div><strong>{gate.name}</strong><span>{formatValue(gate.currentVisitors)} / {formatValue(gate.capacity)} visitors</span></div><b>{gate.occupancy}%</b><div className="gate-track"><i style={{ width: `${Math.min(gate.occupancy, 100)}%` }} /></div></div>)}</div></article>
      </section>
      <section className="crowd-footer-panel"><div><span className="crowd-eyebrow">SITUATION SUMMARY</span><h2>Plan your arrival with confidence</h2><p>Updated {new Date(live.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}. Crowd risk is calculated from current occupancy and gate conditions.</p></div><Link to="/booking">Book a calmer slot</Link></section>
    </main>
  );
}
