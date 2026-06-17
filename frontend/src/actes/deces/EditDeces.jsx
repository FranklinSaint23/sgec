import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from "../../services/api"; 
function EditDeces() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({});
  const [updatedFields, setUpdatedFields] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const toggleForm = () => setIsVisible(!isVisible);

  // 🔹 Charger les infos existantes
  useEffect(() => {
    if (id) {
      api.get(`/actes_deces/${id}`)
        .then((res) => setFormData(res.data))
        .catch((err) => {
          console.error("Erreur de récupération :", err);
          alert("Impossible de récupérer l'acte de décès.");
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setUpdatedFields(prev => ({ ...prev, [name]: newValue }));
  };

  // Envoi uniquement des champs modifiés
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(updatedFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          data.append(key, value);
        }
      });

      data.append('_method', 'PUT'); // Laravel attend ça pour une update avec fichiers

      const res = await api.post(`/actes_deces/${id}`, data);
      setSuccessMessage("Acte de décès mis à jour avec succès !");
      setUpdatedFields({});
      setFormData(res.data.data);

      setTimeout(() => navigate("/dashboard?page=list_deces"), 2000);
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData.numero_acte) {
    return <div className="text-center mt-5">Chargement...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="col-md-10 mx-auto p-5 bg-light rounded shadow">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0 mx-auto d-flex align-items-center">
            <span className="fs-2 me-2">⚰️</span> Modifier l'acte de décès N°&nbsp;<strong style={{color: "red",}}>{formData.numero_acte || ""}</strong> 
          </h2>
          <i
            className={`bi ${isVisible ? 'bi-chevron-up' : 'bi-chevron-down'} fs-4 cursor-pointer`}
            onClick={toggleForm}
            role="button"
          ></i>
        </div>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {isVisible && (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            
            {/* Date d'enregistrement */}
            <div className="mb-3">
              <label>Date d'enregistrement</label>
              <input type="datetime-local" name="dresse_le" className="form-control"
                value={formData.dresse_le || ''} onChange={handleChange} required />
            </div>

            {/* Infos Décédé */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Nom du décédé</label>
                <input type="text" name="nom_decede" className="form-control mb-2" placeholder="Nom du décédé" value={formData.nom_decede || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Date de décès</label>
                <input type="date" name="date_deces" className="form-control mb-2" title="Date de décès" value={formData.date_deces || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Lieu de décès</label>
                <input type="text" name="lieu_deces" className="form-control mb-2" placeholder="Lieu de décès" value={formData.lieu_deces || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Sexe</label>
                <select name="sexe" className="form-control" value={formData.sexe || ''} onChange={handleChange} required>
                  <option value="">Sexe ...</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Lieu de naissance du décédé</label>
                <input type="text" name="lieu_naiss_decede" className="form-control mb-2" placeholder="Lieu de naissance du décédé" value={formData.lieu_naiss_decede || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Date de naissance du décédé</label>
                <input type="date" name="date_naiss_decede" className="form-control mb-2" title="Date de naissance du décédé" value={formData.date_naiss_decede || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Âge du décédé</label>
                <input type="number" name="age" className="form-control mb-2" placeholder="Âge du décédé" value={formData.age || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Profession du décédé</label>
                <input type="text" name="profession_decede" className="form-control mb-2" placeholder="Profession du décédé" value={formData.profession_decede || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Domicile du décédé</label>
                <input type="text" name="domicile_decede" className="form-control mb-2" placeholder="Domicile du décédé" value={formData.domicile_decede || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Nom du père du décédé</label>
                <input type="text" name="nom_pere_decede" className="form-control mb-2" placeholder="Nom du père du décédé" value={formData.nom_pere_decede || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Domicile du père du décédé</label>
                <input type="text" name="domicile_pere_decede" className="form-control mb-2" placeholder="Domicile du père du décédé" value={formData.domicile_pere_decede || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Nom de la mère du décédé</label>
                <input type="text" name="nom_mere_decede" className="form-control mb-2" placeholder="Nom de la mère du décédé" value={formData.nom_mere_decede || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Domicile de la mère du décédé</label>
                <input type="text" name="domicile_mere_decede" className="form-control mb-2" placeholder="Domicile de la mère du décédé" value={formData.domicile_mere_decede || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Sur déclaration de</label>
                <input type="text" name="declaration" className="form-control" placeholder="Sur déclaration de" value={formData.declaration || ''} onChange={handleChange} required />
              </div>
            </div>

            {/* Secrétaire & Officier */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Secrétaire d’état civil</label>
                <input type="text" name="secretaire" className="form-control" value={formData.secretaire || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label>Officier d’état civil</label>
                <input type="text" name="officier" className="form-control" value={formData.officier || ""} onChange={handleChange} required />
              </div>
            </div>

            {/* Pièces jointes */}
            <div className="mt-4">
              <p className="fw-bold">📎 Pièces jointes :</p>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>CNI du décédé</label>
                <input type="file" name="cni_decede" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Acte de naissance du décédé</label>
                <input type="file" name="acte_naissance_decede" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
              </div>
            </div>

            {/* Boutons */}
            <div className="d-flex justify-content-between mt-4">
              <Link to="/dashboard?page=list_deces" className="btn btn-warning">
                <i className="bi bi-arrow-left me-2"></i>Annuler
              </Link>
              <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                {isSubmitting ? "Mise à jour..." : <><i className="bi bi-save me-2"></i>Enregistrer les modifications</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditDeces;
