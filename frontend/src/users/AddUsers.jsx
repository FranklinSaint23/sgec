import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function AddUsers() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '', email: '', sexe: '', role: '' });
  const [message, setMessage]   = useState('');
  const [isError, setIsError]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setErrors({}); setLoading(true); setIsError(false);
    try {
      await api.post('/register', formData);
      setMessage('Utilisateur ajouté avec succès !');
      setFormData({ username: '', password: '', email: '', sexe: '', role: '' });
      setTimeout(() => navigate('/dashboard?page=list_users'), 1800);
    } catch (err) {
      setIsError(true);
      setErrors(err.response?.data?.errors || {});
      setMessage(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ea-form-page">
      <div className="ea-form-card">
        {/* En-tête */}
        <div className="ea-form-card-header">
          <div className="ea-form-card-icon" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Ajouter un utilisateur</h5>
            <p className="text-muted small mb-0">Créer un nouveau compte dans le système</p>
          </div>
        </div>

        <div className="ea-form-card-body">
          {message && (
            <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} mb-4`}>
              <i className={`bi ${isError ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2`}></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nom d'utilisateur <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="username" placeholder="Ex : dupont_marie"
                  value={formData.username} onChange={handleChange} required />
                {errors.username && <small className="text-danger">{errors.username[0]}</small>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control" name="email" placeholder="email@exemple.com"
                  value={formData.email} onChange={handleChange} />
                {errors.email && <small className="text-danger">{errors.email[0]}</small>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Mot de passe <span className="text-danger">*</span></label>
                <input type="password" className="form-control" name="password" placeholder="Min. 8 caractères"
                  value={formData.password} onChange={handleChange} required />
                {errors.password && <small className="text-danger">{errors.password[0]}</small>}
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Sexe</label>
                <select className="form-select" name="sexe" value={formData.sexe} onChange={handleChange}>
                  <option value="">Choisir…</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
                {errors.sexe && <small className="text-danger">{errors.sexe[0]}</small>}
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Rôle <span className="text-danger">*</span></label>
                <select className="form-select" name="role" value={formData.role} onChange={handleChange} required>
                  <option value="">Choisir…</option>
                  <option value="admin">Admin</option>
                  <option value="officier">Officier</option>
                  <option value="secretaire">Secrétaire</option>
                </select>
                {errors.role && <small className="text-danger">{errors.role[0]}</small>}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-5">
              <Link to="/dashboard?page=list_users" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>Voir la liste
              </Link>
              <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Enregistrement…</>
                  : <><i className="bi bi-check2-circle me-2"></i>Valider</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUsers;
