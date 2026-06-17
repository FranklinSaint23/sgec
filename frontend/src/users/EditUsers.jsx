import { useEffect, useState } from "react";
import api from "../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";

function EditUser() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const id             = searchParams.get("id");

  const [userData, setUserData] = useState({
    username: "", email: "", sexe: "", role: "", password: "", password_confirmation: "",
  });
  const [message,  setMessage]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/users/${id}`)
      .then((r) => {
        setUserData((p) => ({
          ...p,
          username: r.data.username || "",
          email:    r.data.email    || "",
          sexe:     r.data.sexe     || "",
          role:     (r.data.role    || "").toLowerCase(),
        }));
      })
      .catch(() => setMessage({ type: "danger", text: "Impossible de récupérer l'utilisateur." }))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password && userData.password !== userData.password_confirmation) {
      setMessage({ type: "danger", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setLoading(true); setMessage(null);
    try {
      await api.put(`/users/${id}`, userData);
      setMessage({ type: "success", text: "Utilisateur modifié avec succès." });
      setTimeout(() => navigate("/dashboard?page=list_users"), 1800);
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.message || "Erreur serveur." });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="ea-form-page">
      <div className="py-5 text-center">
        <span className="spinner-border text-primary"></span>
      </div>
    </div>
  );

  return (
    <div className="ea-form-page">
      <div className="ea-form-card">

        {/* En-tête */}
        <div className="ea-form-card-header">
          <div className="ea-form-card-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            <i className="bi bi-person-gear"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Modifier l'utilisateur</h5>
            <p className="text-muted small mb-0">
              Compte : <strong>{userData.username}</strong>
            </p>
          </div>
        </div>

        <div className="ea-form-card-body">
          {message && (
            <div className={`alert alert-${message.type} mb-4`}>
              <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-4">

              {/* Nom d'utilisateur */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nom d'utilisateur <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="username"
                  value={userData.username} onChange={handleChange} required />
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control" name="email"
                  value={userData.email} onChange={handleChange} />
              </div>

              {/* Sexe */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Sexe</label>
                <select className="form-select" name="sexe" value={userData.sexe} onChange={handleChange}>
                  <option value="">Choisir…</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              {/* Rôle */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Rôle <span className="text-danger">*</span></label>
                <select className="form-select" name="role" value={userData.role} onChange={handleChange} required>
                  <option value="">Choisir…</option>
                  <option value="admin">Admin</option>
                  <option value="officier">Officier</option>
                  <option value="secretaire">Secrétaire</option>
                </select>
              </div>

              {/* Séparateur mot de passe */}
              <div className="col-12">
                <hr className="my-1" />
                <p className="text-muted small mb-0">
                  <i className="bi bi-lock me-1"></i>
                  Laisser vide pour conserver le mot de passe actuel
                </p>
              </div>

              {/* Nouveau mot de passe */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nouveau mot de passe</label>
                <input type="password" className="form-control" name="password"
                  value={userData.password} onChange={handleChange}
                  placeholder="Min. 8 caractères" />
              </div>

              {/* Confirmation */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Confirmer le mot de passe</label>
                <input type="password" className="form-control" name="password_confirmation"
                  value={userData.password_confirmation} onChange={handleChange}
                  placeholder="Répéter le mot de passe" />
              </div>

            </div>

            <div className="d-flex justify-content-between align-items-center mt-5">
              <button type="button" className="btn btn-outline-secondary"
                onClick={() => navigate("/dashboard?page=list_users")}>
                <i className="bi bi-arrow-left me-2"></i>Annuler
              </button>
              <button type="submit" className="btn btn-warning px-5" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement…</>
                  : <><i className="bi bi-floppy me-2"></i>Enregistrer les modifications</>}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default EditUser;
