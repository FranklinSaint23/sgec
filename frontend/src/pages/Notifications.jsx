import React, { useEffect, useState } from "react";
import api from "../services/api";

const TYPE_ICONS = {
  created: { icon: "bi-plus-circle-fill", color: "text-success", label: "Création" },
  updated: { icon: "bi-pencil-fill",      color: "text-warning", label: "Modification" },
  deleted: { icon: "bi-trash-fill",       color: "text-danger",  label: "Suppression" },
};

const ACTE_LABELS = {
  "App\\Models\\ActeNaissance": { label: "Acte de naissance", color: "primary" },
  "App\\Models\\ActeMariage":   { label: "Acte de mariage",   color: "success" },
  "App\\Models\\ActeDeces":     { label: "Acte de décès",     color: "danger"  },
  "App\\Models\\User":          { label: "Utilisateur",       color: "secondary" },
};

function Notifications() {
  const [audits, setAudits]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtre, setFiltre]       = useState("tous");
  const [lus, setLus]             = useState(() => JSON.parse(localStorage.getItem("notifs_lus") || "[]"));

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    api.get("/historique/global")
      .then((res) => { setAudits(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const marquerTousLus = () => {
    const ids = audits.map((a) => a.id);
    localStorage.setItem("notifs_lus", JSON.stringify(ids));
    setLus(ids);
  };

  const filtres = [
    { key: "tous",    label: "Toutes" },
    { key: "created", label: "Créations" },
    { key: "updated", label: "Modifications" },
    { key: "deleted", label: "Suppressions" },
  ];

  const auditsFiltres = filtre === "tous" ? audits : audits.filter((a) => a.event === filtre);
  const nonLus = audits.filter((a) => !lus.includes(a.id)).length;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const acteInfo = (audit) => ACTE_LABELS[audit.auditable_type] || { label: audit.auditable_type?.split("\\").pop(), color: "secondary" };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0">
            <i className="bi bi-bell me-2 text-primary"></i>Notifications
            {nonLus > 0 && <span className="badge bg-danger ms-2">{nonLus}</span>}
          </h4>
          <small className="text-muted">{audits.length} événements au total</small>
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={marquerTousLus}>
          <i className="bi bi-check2-all me-1"></i>Tout marquer comme lu
        </button>
      </div>

      {/* Filtres */}
      <div className="btn-group mb-3">
        {filtres.map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${filtre === f.key ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFiltre(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center mt-5"><span className="spinner-border text-primary"></span></div>
      ) : auditsFiltres.length === 0 ? (
        <div className="alert alert-info">Aucune notification.</div>
      ) : (
        <div className="list-group shadow-sm">
          {auditsFiltres.map((audit) => {
            const typeInfo = TYPE_ICONS[audit.event] || { icon: "bi-info-circle", color: "text-secondary", label: audit.event };
            const actInfo  = acteInfo(audit);
            const estLu    = lus.includes(audit.id);

            return (
              <div
                key={audit.id}
                className={`list-group-item list-group-item-action d-flex gap-3 py-3 ${!estLu ? "border-start border-4 border-primary bg-light" : ""}`}
              >
                <div className="mt-1">
                  <i className={`bi ${typeInfo.icon} fs-4 ${typeInfo.color}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className={`badge bg-${actInfo.color} me-2`}>{actInfo.label}</span>
                      <span className={`badge bg-light border ${typeInfo.color} text-dark`}>{typeInfo.label}</span>
                    </div>
                    <small className="text-muted">{formatDate(audit.created_at)}</small>
                  </div>
                  <p className="mb-1 mt-1 small">
                    {audit.event === "created" && <>Nouvel acte créé (ID #{audit.auditable_id})</>}
                    {audit.event === "updated" && <>Acte #{audit.auditable_id} modifié</>}
                    {audit.event === "deleted" && <>Acte #{audit.auditable_id} supprimé</>}
                  </p>
                  {audit.user && (
                    <small className="text-muted">
                      <i className="bi bi-person me-1"></i>
                      {audit.user.username || "Utilisateur inconnu"}
                    </small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
