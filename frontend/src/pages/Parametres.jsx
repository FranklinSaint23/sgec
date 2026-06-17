import React, { useState } from "react";
import api from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function Parametres() {
  const userId    = localStorage.getItem("userId");
  const userName  = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userRole  = localStorage.getItem("userRole") || "";

  const [profil, setProfil]       = useState({ username: userName, email: userEmail });
  const [mdp, setMdp]             = useState({ actuel: "", nouveau: "", confirmer: "" });
  const [msgProfil, setMsgProfil] = useState(null);
  const [msgMdp, setMsgMdp]       = useState(null);
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [loadingMdp, setLoadingMdp]       = useState(false);

  const [prefs, setPrefs] = useState({
    notif_creation: localStorage.getItem("pref_notif_creation") !== "false",
    notif_suppression: localStorage.getItem("pref_notif_suppression") !== "false",
    lignes_par_page: localStorage.getItem("pref_lignes_par_page") || "10",
  });

  const sauverProfil = async (e) => {
    e.preventDefault();
    setLoadingProfil(true); setMsgProfil(null);
    try {
      await api.put(`/users/${userId}`, {
        username: profil.username,
        email: profil.email,
      });
      localStorage.setItem("userName", profil.username);
      localStorage.setItem("userEmail", profil.email);
      setMsgProfil({ type: "success", text: "Profil mis à jour avec succès." });
    } catch (err) {
      setMsgProfil({ type: "danger", text: err.response?.data?.message || "Erreur lors de la mise à jour." });
    } finally {
      setLoadingProfil(false);
    }
  };

  const changerMdp = async (e) => {
    e.preventDefault();
    if (mdp.nouveau !== mdp.confirmer) {
      setMsgMdp({ type: "danger", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    if (mdp.nouveau.length < 8) {
      setMsgMdp({ type: "danger", text: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    setLoadingMdp(true); setMsgMdp(null);
    try {
      await api.put(`/users/${userId}`, {
        password: mdp.nouveau,
        password_actuel: mdp.actuel,
      });
      setMdp({ actuel: "", nouveau: "", confirmer: "" });
      setMsgMdp({ type: "success", text: "Mot de passe modifié avec succès." });
    } catch (err) {
      setMsgMdp({ type: "danger", text: err.response?.data?.message || "Erreur lors du changement de mot de passe." });
    } finally {
      setLoadingMdp(false);
    }
  };

  const sauverPrefs = () => {
    localStorage.setItem("pref_notif_creation",   prefs.notif_creation);
    localStorage.setItem("pref_notif_suppression", prefs.notif_suppression);
    localStorage.setItem("pref_lignes_par_page",   prefs.lignes_par_page);
    alert("Préférences enregistrées.");
  };

  const roleLabels = { admin: "Administrateur", officier: "Officier d'état civil", secretaire: "Secrétaire" };

  return (
    <div className="container mt-4 pb-5">
      <h4 className="fw-bold mb-4"><i className="bi bi-gear me-2 text-primary"></i>Paramètres</h4>

      <div className="row g-4">

        {/* Section Profil */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white fw-bold">
              <i className="bi bi-person-circle me-2"></i>Mon profil
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 32 }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div><span className="badge bg-secondary">{roleLabels[userRole] || userRole}</span></div>
              </div>

              {msgProfil && <div className={`alert alert-${msgProfil.type} py-2`}>{msgProfil.text}</div>}

              <form onSubmit={sauverProfil}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nom d'utilisateur</label>
                  <input type="text" className="form-control" value={profil.username}
                    onChange={(e) => setProfil({ ...profil, username: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Adresse e-mail</label>
                  <input type="email" className="form-control" value={profil.email}
                    onChange={(e) => setProfil({ ...profil, email: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loadingProfil}>
                  {loadingProfil ? <><span className="spinner-border spinner-border-sm me-1"></span>Mise à jour…</> : "Sauvegarder le profil"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Section Mot de passe */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark fw-bold">
              <i className="bi bi-lock-fill me-2"></i>Changer le mot de passe
            </div>
            <div className="card-body">
              {msgMdp && <div className={`alert alert-${msgMdp.type} py-2`}>{msgMdp.text}</div>}
              <form onSubmit={changerMdp}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Mot de passe actuel</label>
                  <input type="password" className="form-control" value={mdp.actuel}
                    onChange={(e) => setMdp({ ...mdp, actuel: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nouveau mot de passe</label>
                  <input type="password" className="form-control" value={mdp.nouveau}
                    onChange={(e) => setMdp({ ...mdp, nouveau: e.target.value })} minLength={8} required />
                  <div className="form-text">Minimum 8 caractères</div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Confirmer le nouveau mot de passe</label>
                  <input type="password" className="form-control" value={mdp.confirmer}
                    onChange={(e) => setMdp({ ...mdp, confirmer: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-warning w-100" disabled={loadingMdp}>
                  {loadingMdp ? <><span className="spinner-border spinner-border-sm me-1"></span>Modification…</> : "Changer le mot de passe"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Section Préférences */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-bold">
              <i className="bi bi-sliders me-2"></i>Préférences de l'application
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="fw-bold d-block mb-2">Notifications</label>
                  <div className="form-check form-switch mb-2">
                    <input className="form-check-input" type="checkbox" id="notif_creation"
                      checked={prefs.notif_creation}
                      onChange={(e) => setPrefs({ ...prefs, notif_creation: e.target.checked })} />
                    <label className="form-check-label" htmlFor="notif_creation">Alerter lors d'une création</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="notif_suppression"
                      checked={prefs.notif_suppression}
                      onChange={(e) => setPrefs({ ...prefs, notif_suppression: e.target.checked })} />
                    <label className="form-check-label" htmlFor="notif_suppression">Alerter lors d'une suppression</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="fw-bold d-block mb-2">Lignes par page (tableaux)</label>
                  <select className="form-select" value={prefs.lignes_par_page}
                    onChange={(e) => setPrefs({ ...prefs, lignes_par_page: e.target.value })}>
                    {["5","10","20","50","100"].map((v) => <option key={v} value={v}>{v} lignes</option>)}
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button className="btn btn-success w-100" onClick={sauverPrefs}>
                    <i className="bi bi-save me-1"></i>Sauvegarder les préférences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Infos système */}
        <div className="col-12">
          <div className="card shadow-sm bg-light">
            <div className="card-body">
              <h6 className="fw-bold"><i className="bi bi-info-circle me-2"></i>Informations du système</h6>
              <div className="row g-2 small text-muted">
                <div className="col-md-4"><strong>Application :</strong> E-ACT SGEC v2.0</div>
                <div className="col-md-4"><strong>Centre :</strong> Mairie Rurale de Bafoussam 1er</div>
                <div className="col-md-4"><strong>Arrondissement :</strong> Bafoussam I — Mifi — Ouest</div>
                <div className="col-md-4"><strong>Conformité :</strong> Loi N°2011/011 du 06 mai 2011</div>
                <div className="col-md-4"><strong>Backend :</strong> Laravel 10 + Sanctum</div>
                <div className="col-md-4"><strong>Frontend :</strong> React 19 + Electron</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Parametres;
