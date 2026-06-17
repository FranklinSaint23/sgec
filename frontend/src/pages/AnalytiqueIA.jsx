import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

function AnalytiqueIA() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get("/analytique")
      .then((res) => { setStats(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="text-center mt-5">
      <span className="spinner-border text-primary"></span>
      <p className="mt-2 text-muted">Chargement des données analytiques…</p>
    </div>
  );
  if (error || !stats) return (
    <div className="alert alert-danger mt-4">Erreur lors du chargement des analytiques.</div>
  );

  const moisLabels = stats.mensuels.map((m) => m.mois);

  const lineData = {
    labels: moisLabels,
    datasets: [
      { label: "Naissances", data: stats.mensuels.map((m) => m.naiss),    borderColor: "#0d6efd", backgroundColor: "rgba(13,110,253,0.08)", tension: 0.4, fill: true },
      { label: "Décès",      data: stats.mensuels.map((m) => m.deces),    borderColor: "#dc3545", backgroundColor: "rgba(220,53,69,0.08)",  tension: 0.4, fill: true },
      { label: "Mariages",   data: stats.mensuels.map((m) => m.mariages), borderColor: "#198754", backgroundColor: "rgba(25,135,84,0.08)", tension: 0.4, fill: true },
    ],
  };

  const doughnutData = {
    labels: ["Naissances", "Décès", "Mariages"],
    datasets: [{
      data: [stats.totaux.naissances, stats.totaux.deces, stats.totaux.mariages],
      backgroundColor: ["#0d6efd", "#dc3545", "#198754"],
      borderWidth: 2,
    }],
  };

  const barData = {
    labels: stats.topSecretaires.map((s) => s.secretaire || "—"),
    datasets: [{
      label: "Actes enregistrés",
      data: stats.topSecretaires.map((s) => s.total),
      backgroundColor: "#ffc107",
      borderRadius: 4,
    }],
  };

  const cards = [
    { label: "Naissances", val: stats.totaux.naissances, icon: "bi-person-add",  color: "primary" },
    { label: "Décès",      val: stats.totaux.deces,      icon: "bi-heartbreak",  color: "danger"  },
    { label: "Mariages",   val: stats.totaux.mariages,   icon: "bi-heart",       color: "success" },
    { label: "Ratio décès/naissances", val: stats.totaux.ratio + "%", icon: "bi-graph-up", color: "warning" },
  ];

  return (
    <div className="container-fluid mt-2 pb-4">
      <h4 className="mb-4 fw-bold">🤖 Tableau de bord analytique IA — {stats.annee}</h4>

      {/* Cartes résumé */}
      <div className="row g-3 mb-4">
        {cards.map((c, i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div className={`card border-${c.color} shadow-sm h-100`}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">{c.label}</div>
                  <h3 className={`text-${c.color} fw-bold mb-0`}>{c.val}</h3>
                </div>
                <i className={`bi ${c.icon} display-4 text-${c.color} opacity-25`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Évolution mensuelle</h6>
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Répartition globale</h6>
            <Doughnut
              data={doughnutData}
              options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Top secrétaires — volume d'actes</h6>
            <Bar
              data={barData}
              options={{
                responsive: true,
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalytiqueIA;
