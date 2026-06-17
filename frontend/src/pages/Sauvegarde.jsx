import React, { useEffect, useState } from "react";
import api from "../services/api";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TYPES = [
  { key: "naissances", endpoint: "/actes_naissance", label: "Actes de naissance", icon: "bi-person-add",  color: "primary",   cols: ["numero_acte","nom","date_naiss","lieu","sexe","nom_pere","nom_mere"] },
  { key: "mariages",   endpoint: "/actes_mariage",   label: "Actes de mariage",   icon: "bi-heart",       color: "success",   cols: ["numero_acte","nom_homme","nom_femme","contracte_le","regime"] },
  { key: "deces",      endpoint: "/actes_deces",     label: "Actes de décès",     icon: "bi-heartbreak",  color: "danger",    cols: ["numero_acte","nom_decede","date_deces","lieu_deces","sexe"] },
];

function Sauvegarde() {
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState({});
  const [lastExport, setLastExport] = useState(() => JSON.parse(localStorage.getItem("last_exports") || "{}"));

  useEffect(() => {
    TYPES.forEach(({ key, endpoint }) => {
      api.get(endpoint).then((res) => {
        setStats((prev) => ({ ...prev, [key]: res.data }));
      }).catch(() => {});
    });
  }, []);

  const saveExportDate = (key) => {
    const updated = { ...lastExport, [key]: new Date().toLocaleString("fr-FR") };
    localStorage.setItem("last_exports", JSON.stringify(updated));
    setLastExport(updated);
  };

  const exportCSV = (key, label) => {
    const data = stats[key];
    if (!data?.length) return alert("Aucune donnée à exporter.");
    setLoading((p) => ({ ...p, [key + "_csv"]: true }));
    const csv = Papa.unparse(data);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url; a.download = `${key}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    saveExportDate(key);
    setLoading((p) => ({ ...p, [key + "_csv"]: false }));
  };

  const exportExcel = (key, label) => {
    const data = stats[key];
    if (!data?.length) return alert("Aucune donnée à exporter.");
    setLoading((p) => ({ ...p, [key + "_xlsx"]: true }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
    XLSX.writeFile(wb, `${key}_${new Date().toISOString().slice(0,10)}.xlsx`);
    saveExportDate(key);
    setLoading((p) => ({ ...p, [key + "_xlsx"]: false }));
  };

  const exportPDF = (type) => {
    const data = stats[type.key];
    if (!data?.length) return alert("Aucune donnée à exporter.");
    setLoading((p) => ({ ...p, [type.key + "_pdf"]: true }));
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(type.label, 14, 15);
    doc.setFontSize(10);
    doc.text(`Exporté le ${new Date().toLocaleString("fr-FR")}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [type.cols],
      body: data.map((r) => type.cols.map((c) => r[c] ?? "")),
      styles: { fontSize: 8 },
    });
    doc.save(`${type.key}_${new Date().toISOString().slice(0,10)}.pdf`);
    saveExportDate(type.key);
    setLoading((p) => ({ ...p, [type.key + "_pdf"]: false }));
  };

  const exportAll = () => {
    TYPES.forEach((t) => {
      exportCSV(t.key, t.label);
    });
  };

  const totalActes = Object.values(stats).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <div className="container mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-cloud-download me-2 text-primary"></i>Sauvegarde &amp; Export
        </h4>
        <button className="btn btn-success" onClick={exportAll}>
          <i className="bi bi-download me-1"></i>Tout exporter (CSV)
        </button>
      </div>

      {/* Résumé */}
      <div className="row g-3 mb-4">
        {TYPES.map((t) => (
          <div className="col-md-4" key={t.key}>
            <div className={`card border-${t.color} shadow-sm`}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">{t.label}</div>
                  <h3 className={`fw-bold text-${t.color} mb-0`}>{stats[t.key]?.length ?? "…"}</h3>
                  {lastExport[t.key] && <small className="text-muted">Dernier export : {lastExport[t.key]}</small>}
                </div>
                <i className={`bi ${t.icon} display-5 text-${t.color} opacity-25`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes d'export par type */}
      {TYPES.map((t) => (
        <div className="card shadow-sm mb-3" key={t.key}>
          <div className={`card-header d-flex justify-content-between align-items-center bg-${t.color} bg-opacity-10`}>
            <span className="fw-bold">
              <i className={`bi ${t.icon} me-2 text-${t.color}`}></i>
              {t.label}
              <span className={`badge bg-${t.color} ms-2`}>{stats[t.key]?.length ?? "…"} actes</span>
            </span>
          </div>
          <div className="card-body">
            <div className="row g-2 align-items-center">
              <div className="col-md-8 small text-muted">
                Colonnes : {t.cols.join(", ")}
              </div>
              <div className="col-md-4">
                <div className="btn-group w-100">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => exportCSV(t.key, t.label)}
                    disabled={loading[t.key + "_csv"]}>
                    <i className="bi bi-filetype-csv me-1"></i>CSV
                  </button>
                  <button className="btn btn-outline-success btn-sm" onClick={() => exportExcel(t.key, t.label)}
                    disabled={loading[t.key + "_xlsx"]}>
                    <i className="bi bi-file-excel me-1"></i>Excel
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => exportPDF(t)}
                    disabled={loading[t.key + "_pdf"]}>
                    <i className="bi bi-file-pdf me-1"></i>PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Info sauvegarde base */}
      <div className="alert alert-info mt-3 small">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note :</strong> Ces exports contiennent les données de la base de données en temps réel.
        Total : <strong>{totalActes}</strong> actes exportables.
        Pour une sauvegarde complète de la base MySQL, utilisez <code>mysqldump</code> depuis le serveur.
      </div>
    </div>
  );
}

export default Sauvegarde;
