import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale
} from "chart.js";
import { Pie, Doughnut, Bar, Line, Radar } from "react-chartjs-2";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../services/api";

// Enregistrer les composants Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale
);

function Statistiques() {
  const [stats, setStats] = useState({
    totalNaissances: 0,
    totalDeces: 0,
    totalMariages: 0,
    totalUsers: 0,
    repartitionSexe: { M: 0, F: 0 },
    decesSexe: { M: 0, F: 0 },
    actesMensuels: [],
    decesMensuels: [],
    ratioDecesNaissances: 0,
    roles: {},
    dernieresConnexions: [],
    journalActions: 0,
    topUsers: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistiques")
      .then(res => res.data)
      .then(data => setStats(data))
      .catch(err => {
        console.error("Erreur API:", err);
        alert("Impossible de charger les statistiques.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5">Chargement…</div>;

  // === Graphiques existants ===
  const pieData = {
    labels: ["Naissances", "Décès", "Mariages"],
    datasets: [{ data: [stats.totalNaissances, stats.totalDeces, stats.totalMariages], backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"] }],
  };
  const barData = {
    labels: stats.actesMensuels.map(a => a.mois),
    datasets: [
      { label: "Naissances", data: stats.actesMensuels.map(a => a.naiss), backgroundColor: "#36A2EB" },
      { label: "Décès", data: stats.actesMensuels.map(a => a.deces), backgroundColor: "#FF6384" },
    ],
  };
  const lineData = {
    labels: stats.actesMensuels.map(a => a.mois),
    datasets: [{ label: "Naissances", data: stats.actesMensuels.map(a => a.naiss), borderColor: "#36A2EB", fill: true }],
  };
  const doughnutData = {
    labels: ["Masculin", "Féminin"],
    datasets: [{ data: [stats.repartitionSexe.M, stats.repartitionSexe.F], backgroundColor: ["#36A2EB", "#FF6384"] }],
  };
  const radarData = {
    labels: stats.topUsers.map(u => u.username),
    datasets: [{ label: "Nombre d’actions", data: stats.topUsers.map(u => u.actions), backgroundColor: "rgba(54,162,235,0.2)", borderColor: "#36A2EB" }],
  };

  // === Nouveaux graphiques ===
  const decesSexeData = {
    labels: ["Hommes", "Femmes"],
    datasets: [{ data: [stats.decesSexe.M, stats.decesSexe.F], backgroundColor: ["#36A2EB", "#FF6384"] }],
  };
  const decesMensuelsData = {
    labels: stats.decesMensuels.map(d => d.mois),
    datasets: [{ label: "Décès", data: stats.decesMensuels.map(d => d.total), backgroundColor: "#FF6384" }],
  };
  const rolesData = {
    labels: Object.keys(stats.roles),
    datasets: [{ data: Object.values(stats.roles), backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"] }],
  };

  // === Fonctions Export ===
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("📊 Statistiques du système", 20, 20);

    doc.setFontSize(12);
    doc.text(`Naissances: ${stats.totalNaissances}`, 20, 40);
    doc.text(`Décès: ${stats.totalDeces}`, 20, 50);
    doc.text(`Mariages: ${stats.totalMariages}`, 20, 60);
    doc.text(`Utilisateurs: ${stats.totalUsers}`, 20, 70);
    doc.text(`Ratio décès/naissances: ${stats.ratioDecesNaissances}%`, 20, 80);
    doc.text(`Journal d'audit: ${stats.journalActions} actions`, 20, 90);

    doc.save("statistiques.pdf");
  };

  const exportExcel = () => {
    const data = [
      ["Indicateur", "Valeur"],
      ["Naissances", stats.totalNaissances],
      ["Décès", stats.totalDeces],
      ["Mariages", stats.totalMariages],
      ["Utilisateurs", stats.totalUsers],
      ["Ratio décès/naissances (%)", stats.ratioDecesNaissances],
      ["Journal d'audit", stats.journalActions],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statistiques");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "statistiques.xlsx");
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📊 Statistiques générales</h2>
        <div>
          <button className="btn btn-outline-danger me-2" onClick={exportPDF}>
            Exporter PDF
          </button>
          <button className="btn btn-outline-success" onClick={exportExcel}>
            Exporter Excel
          </button>
        </div>
      </div>

      {/* Cartes */}
      <div className="row mb-4">
        <div className="col-md-3"><div className="card bg-primary text-white"><div className="card-body"><h6>Naissances</h6><p className="fs-4">{stats.totalNaissances}</p></div></div></div>
        <div className="col-md-3"><div className="card bg-danger text-white"><div className="card-body"><h6>Décès</h6><p className="fs-4">{stats.totalDeces}</p></div></div></div>
        <div className="col-md-3"><div className="card bg-warning text-white"><div className="card-body"><h6>Mariages</h6><p className="fs-4">{stats.totalMariages}</p></div></div></div>
        <div className="col-md-3"><div className="card bg-success text-white"><div className="card-body"><h6>Utilisateurs</h6><p className="fs-4">{stats.totalUsers}</p></div></div></div>
      </div>

      {/* Actes */}
      <div className="row">
        <div className="col-md-6 mb-4"><h5>Répartition des actes</h5><Pie data={pieData} /></div>
        <div className="col-md-6 mb-4"><h5>Naissances vs Décès par mois</h5><Bar data={barData} /></div>
        <div className="col-md-6 mb-4"><h5>Évolution des naissances</h5><Line data={lineData} /></div>
        <div className="col-md-6 mb-4"><h5>Répartition naissances (sexe)</h5><Doughnut data={doughnutData} /></div>
      </div>

      {/* Décès */}
      <h4 className="mt-5">⚰️ Statistiques des décès</h4>
      <div className="row">
        <div className="col-md-6 mb-4"><h5>Répartition par sexe</h5><Doughnut data={decesSexeData} /></div>
        <div className="col-md-6 mb-4"><h5>Décès par mois</h5><Bar data={decesMensuelsData} /></div>
      </div>
      <div className="alert alert-info">📉 Taux décès/naissances : {stats.ratioDecesNaissances}%</div>

      {/* Utilisateurs */}
      <h4 className="mt-5">👥 Utilisateurs</h4>
      <div className="row">
        <div className="col-md-6 mb-4"><h5>Répartition par rôle</h5><Doughnut data={rolesData} /></div>
        <div className="col-md-6 mb-4">
          <h5>Dernières connexions</h5>
          <ul className="list-group">
            {stats.dernieresConnexions.map((u, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between">
                {u.username} <span>{u.last_login_at}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Historique */}
      <h4 className="mt-5">🕑 Historique</h4>
      <div className="row">
        <div className="col-md-6 mb-4"><div className="card bg-dark text-white"><div className="card-body"><h6>Total actions journal</h6><p className="fs-3">{stats.journalActions}</p></div></div></div>
        <div className="col-md-6 mb-4"><h5>Top 5 utilisateurs actifs</h5><Radar data={radarData} /></div>
      </div>
    </div>
  );
}

export default Statistiques;
