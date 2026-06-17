import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "../services/api";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const BADGE = {
  Naissance: { cls: "ea-badge-green",  icon: "bi-person-add" },
  Mariage:   { cls: "ea-badge-yellow", icon: "bi-heart" },
  Décès:     { cls: "ea-badge-red",    icon: "bi-heartbreak" },
};

function StatCard({ icon, iconClass, label, value, sub }) {
  const display = value === undefined || value === null
    ? <span style={{ display: 'inline-block', width: 56, height: 28, background: '#e2e8f0', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }}></span>
    : value;
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="ea-stat-card">
        <div className={`ea-stat-icon ${iconClass}`}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <div className="ea-stat-label">{label}</div>
          <div className="ea-stat-value">{display}</div>
          {sub && <div className="ea-stat-sub">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

const SEVERITE = {
  haute:   { cls: "danger",  icon: "bi-exclamation-octagon-fill" },
  moyenne: { cls: "warning", icon: "bi-exclamation-triangle-fill" },
  basse:   { cls: "info",    icon: "bi-info-circle-fill" },
};

function Board() {
  const userName  = localStorage.getItem("userName") || "Utilisateur";
  const userRole  = localStorage.getItem("userRole") || "";
  const [stats, setStats]             = useState(null);
  const [latestActes, setLatestActes] = useState([]);
  const [anomalies, setAnomalies]     = useState([]);
  const [anomDismissed, setAnomDismissed] = useState(false);
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    api.get("/dashboard-stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/actes/latest").then((r) => setLatestActes(r.data)).catch(() => {});
    api.get("/anomalies").then((r) => setAnomalies(r.data.anomalies || [])).catch(() => {});
  }, []);

  const barData = {
    labels: ["Naissances", "Décès", "Mariages"],
    datasets: [{
      label: "Actes",
      data: [stats?.actes_naissance ?? 0, stats?.actes_deces ?? 0, stats?.actes_mariage ?? 0],
      backgroundColor: ["rgba(16,185,129,.8)", "rgba(239,68,68,.8)", "rgba(245,158,11,.8)"],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels: ["Naissances", "Décès", "Mariages"],
    datasets: [{
      data: [stats?.actes_naissance || 0, stats?.actes_deces || 0, stats?.actes_mariage || 0],
      backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
      borderWidth: 3,
      borderColor: "#fff",
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
      y: { grid: { color: "#f1f5f9" }, ticks: { precision: 0, font: { size: 11 } }, beginAtZero: true },
    },
  };

  return (
    <div>
      {/* Anomalies */}
      {!anomDismissed && anomalies.length > 0 && (
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-danger">
              <i className="bi bi-shield-exclamation me-2"></i>
              {anomalies.length} anomalie{anomalies.length > 1 ? 's' : ''} détectée{anomalies.length > 1 ? 's' : ''}
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setAnomDismissed(true)}>
              <i className="bi bi-x"></i> Ignorer
            </button>
          </div>
          {anomalies.map((a, i) => {
            const s = SEVERITE[a.severite] || SEVERITE.basse;
            return (
              <div key={i} className={`alert alert-${s.cls} py-2 px-3 mb-2 d-flex align-items-start gap-2`} style={{ fontSize: 13 }}>
                <i className={`bi ${s.icon} mt-1`}></i>
                <span>{a.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="ea-welcome">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="ea-welcome-title">Bonjour, {userName} 👋</div>
          <div className="ea-welcome-sub">Bienvenue sur E-ACT — Système de gestion de l'état civil</div>
          <div className="ea-welcome-date">{today.charAt(0).toUpperCase() + today.slice(1)}</div>
        </div>
        <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', opacity: .12, fontSize: '6rem', zIndex: 0 }}>
          📋
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <StatCard icon="bi-person-add"  iconClass="green"  label="Naissances"  value={stats?.actes_naissance} sub="Actes enregistrés" />
        <StatCard icon="bi-heartbreak"  iconClass="red"    label="Décès"       value={stats?.actes_deces}     sub="Actes enregistrés" />
        <StatCard icon="bi-heart"       iconClass="yellow" label="Mariages"    value={stats?.actes_mariage}   sub="Actes enregistrés" />
        <StatCard icon="bi-people-fill" iconClass="blue"   label="Utilisateurs" value={stats?.users}          sub="Comptes actifs" />
      </div>

      {/* Graphiques */}
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="ea-card">
            <div className="ea-card-header">
              <span className="ea-card-title"><i className="bi bi-bar-chart me-2 text-primary"></i>Répartition des actes</span>
            </div>
            <div className="ea-card-body">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="ea-card h-100">
            <div className="ea-card-header">
              <span className="ea-card-title"><i className="bi bi-pie-chart me-2 text-indigo"></i>Vue d'ensemble</span>
            </div>
            <div className="ea-card-body d-flex flex-column align-items-center justify-content-center">
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { padding: 16, font: { size: 12 } } } }, cutout: "65%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Derniers actes */}
      <div className="ea-card">
        <div className="ea-card-header">
          <span className="ea-card-title"><i className="bi bi-clock-history me-2 text-primary"></i>Derniers actes enregistrés</span>
          <span className="ea-badge ea-badge-blue">{latestActes.length} récents</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {latestActes.length === 0 ? (
            <div className="text-center py-4 text-muted small">Aucun acte récent.</div>
          ) : (
            <table className="ea-table">
              <thead>
                <tr>
                  <th>N° Acte</th>
                  <th>Type</th>
                  <th>Nom(s)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {latestActes.map((acte, i) => {
                  const b = BADGE[acte.type] || { cls: "ea-badge-blue", icon: "bi-file-text" };
                  return (
                    <tr key={i}>
                      <td><span className="fw-bold text-primary">{acte.numero}</span></td>
                      <td>
                        <span className={`ea-badge ${b.cls}`}>
                          <i className={`bi ${b.icon}`}></i>{acte.type}
                        </span>
                      </td>
                      <td>{acte.nom}</td>
                      <td><span className="text-muted small">{acte.date}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Board;
