import React, { useState, useEffect } from "react";
import api from "../services/api";

const MOTIFS = ["Mariage", "Décès", "Divorce", "Reconnaissance", "Rectification", "Légitimation", "Adoption", "Autre"];

const ACTE_TYPES = [
  { key: "naissance", label: "Acte de naissance" },
  { key: "mariage",   label: "Acte de mariage"   },
  { key: "deces",     label: "Acte de décès"     },
];

function nomActe(acte, type) {
  if (type === "naissance") return acte.nom;
  if (type === "mariage")   return `${acte.nom_homme} × ${acte.nom_femme}`;
  if (type === "deces")     return acte.nom_decede;
  return "—";
}

function Mentions() {
  const [mentions, setMentions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filtreType, setFiltreType]     = useState("");
  const [filtreQ, setFiltreQ]           = useState("");

  // Formulaire d'ajout
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ acte_type: "naissance", motif: "", texte: "", date_mention: "", officier: "", secretaire: "" });
  const [searchQ, setSearchQ]           = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [acteSelectionne, setActeSelectionne] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [msg, setMsg]                   = useState(null);

  const [officiers, setOfficiers]       = useState([]);
  const [secretaires, setSecretaires]   = useState([]);

  useEffect(() => {
    chargerMentions();
    api.get("/users/officier").then((r) => setOfficiers(r.data)).catch(() => {});
    api.get("/users/secretaire").then((r) => setSecretaires(r.data)).catch(() => {});
  }, []);

  const chargerMentions = () => {
    setLoading(true);
    api.get("/mentions").then((r) => { setMentions(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  const rechercherActe = async () => {
    if (!searchQ.trim()) return;
    try {
      const res = await api.get(`/mentions/search-acte?type=${form.acte_type}&q=${encodeURIComponent(searchQ)}`);
      setSearchResults(res.data);
    } catch { alert("Erreur de recherche."); }
  };

  const selectionnerActe = (acte) => {
    setActeSelectionne(acte);
    setSearchResults([]);
    setSearchQ("");
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (!acteSelectionne) { setMsg({ type: "danger", text: "Sélectionnez un acte d'abord." }); return; }
    setSubmitting(true); setMsg(null);
    try {
      await api.post("/mentions", {
        ...form,
        acte_id:      acteSelectionne.id,
        numero_acte:  acteSelectionne.numero_acte,
        nom_personne: nomActe(acteSelectionne, form.acte_type),
      });
      setMsg({ type: "success", text: "Mention marginale ajoutée avec succès." });
      setForm({ acte_type: "naissance", motif: "", texte: "", date_mention: "", officier: "", secretaire: "" });
      setActeSelectionne(null);
      setShowForm(false);
      chargerMentions();
    } catch (err) {
      setMsg({ type: "danger", text: err.response?.data?.message || "Erreur lors de l'ajout." });
    } finally {
      setSubmitting(false);
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cette mention ?")) return;
    await api.delete(`/mentions/${id}`);
    chargerMentions();
  };

  const mentionsFiltrees = mentions.filter((m) => {
    if (filtreType && m.acte_type !== filtreType) return false;
    if (filtreQ && !`${m.nom_personne} ${m.numero_acte} ${m.motif}`.toLowerCase().includes(filtreQ.toLowerCase())) return false;
    return true;
  });

  const MOTIF_COLORS = { Mariage: "success", Décès: "danger", Divorce: "warning", Rectification: "info", default: "secondary" };

  return (
    <div className="container mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-journal-text me-2 text-primary"></i>Mentions marginales
        </h4>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setMsg(null); }}>
          <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"} me-1`}></i>
          {showForm ? "Fermer" : "Ajouter une mention"}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-primary text-white fw-bold">Nouvelle mention marginale</div>
          <div className="card-body">
            {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
            <form onSubmit={soumettre}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="fw-bold">Type d'acte</label>
                  <select className="form-select" value={form.acte_type}
                    onChange={(e) => { setForm({ ...form, acte_type: e.target.value }); setActeSelectionne(null); setSearchResults([]); }}>
                    {ACTE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="fw-bold">Rechercher l'acte</label>
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="N° acte ou nom…"
                      value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), rechercherActe())} />
                    <button type="button" className="btn btn-outline-primary" onClick={rechercherActe}>
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="list-group mt-1 shadow-sm" style={{ maxHeight: 180, overflowY: "auto" }}>
                      {searchResults.map((acte) => (
                        <li key={acte.id} className="list-group-item list-group-item-action py-2 small" style={{ cursor: "pointer" }}
                          onClick={() => selectionnerActe(acte)}>
                          <strong>{acte.numero_acte}</strong> — {nomActe(acte, form.acte_type)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {acteSelectionne && (
                    <div className="alert alert-success py-2 mt-2 small mb-0">
                      <i className="bi bi-check-circle me-1"></i>
                      Acte sélectionné : <strong>{acteSelectionne.numero_acte}</strong> — {nomActe(acteSelectionne, form.acte_type)}
                      <button type="button" className="btn-close btn-sm ms-2" style={{ float: "right" }} onClick={() => setActeSelectionne(null)}></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="fw-bold">Motif</label>
                  <select className="form-select" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} required>
                    <option value="">Choisir…</option>
                    {MOTIFS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="fw-bold">Date de la mention</label>
                  <input type="date" className="form-control" value={form.date_mention}
                    onChange={(e) => setForm({ ...form, date_mention: e.target.value })} required />
                </div>
                <div className="col-md-2">
                  <label className="fw-bold">Officier</label>
                  <select className="form-select" value={form.officier} onChange={(e) => setForm({ ...form, officier: e.target.value })}>
                    <option value="">—</option>
                    {officiers.map((o) => <option key={o.id} value={o.username}>{o.username}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="fw-bold">Secrétaire</label>
                  <select className="form-select" value={form.secretaire} onChange={(e) => setForm({ ...form, secretaire: e.target.value })}>
                    <option value="">—</option>
                    {secretaires.map((s) => <option key={s.id} value={s.username}>{s.username}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="fw-bold">Texte de la mention</label>
                  <textarea className="form-control" rows={3} value={form.texte}
                    onChange={(e) => setForm({ ...form, texte: e.target.value })}
                    placeholder="Ex : Mention de mariage avec... le..." required></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm me-1"></span>Enregistrement…</> : "Enregistrer la mention"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <select className="form-select" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
            <option value="">Tous les types</option>
            {ACTE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div className="col-md-8">
          <input type="text" className="form-control" placeholder="🔍 Rechercher par nom, N° acte, motif…"
            value={filtreQ} onChange={(e) => setFiltreQ(e.target.value)} />
        </div>
      </div>

      {/* Liste des mentions */}
      {loading ? (
        <div className="text-center mt-4"><span className="spinner-border text-primary"></span></div>
      ) : mentionsFiltrees.length === 0 ? (
        <div className="alert alert-info">Aucune mention marginale trouvée.</div>
      ) : (
        <div className="list-group shadow-sm">
          {mentionsFiltrees.map((m) => (
            <div key={m.id} className="list-group-item py-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className={`badge bg-${MOTIF_COLORS[m.motif] || MOTIF_COLORS.default} me-2`}>{m.motif}</span>
                  <span className="badge bg-light text-dark border me-2">{ACTE_TYPES.find((t) => t.key === m.acte_type)?.label}</span>
                  <strong>N° {m.numero_acte}</strong>
                  {m.nom_personne && <span className="ms-2 text-muted">— {m.nom_personne}</span>}
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <small className="text-muted">{new Date(m.date_mention).toLocaleDateString("fr-FR")}</small>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => supprimer(m.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <p className="mb-1 mt-2 small">{m.texte}</p>
              <small className="text-muted">
                {m.officier && <><i className="bi bi-person-badge me-1"></i>Officier : {m.officier}</>}
                {m.secretaire && <><span className="mx-2">·</span><i className="bi bi-person me-1"></i>Secrétaire : {m.secretaire}</>}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Mentions;
