import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from "../../services/api"; 
function EditNaiss() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({});
  const [updatedFields, setUpdatedFields] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const toggleForm = () => setIsVisible(!isVisible);

  // Charger les données existantes
  useEffect(() => {
    if (id) {
      api.get(`/actes_naissance/${id}`)
        .then((res) => setFormData(res.data))
        .catch((err) => {
          console.error("Erreur de récupération :", err);
          alert("Impossible de récupérer l'acte de naissance.");
        });
    }
  }, [id]);

  // Gérer les changements
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

      const res = await api.post(`/actes_naissance/${id}`, data);
      setSuccessMessage("Acte de naissance mis à jour avec succès !");
      setUpdatedFields({});
      setFormData(res.data.data);

      setTimeout(() => navigate("/dashboard?page=list_naiss"), 2000);
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
            <span className="fs-2 me-2">🚼</span> Modifier l'acte de naissance N°&nbsp;<strong style={{color: "red",}}>{formData.numero_acte || ""}</strong> 
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
            

            {/* Enfant */}
            <div className="row mb-3">
            <div className="mb-3"><label>Date d'enregistrement</label><input type="datetime-local" name="dresse" className="form-control" value={formData.dresse || ""} onChange={handleChange} required /></div>

              <div className="col-md-6">
                <label>Nom de l’enfant</label>
                <input type="text" name="nom" className="form-control"
                  value={formData.nom || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label>Date et heure de naissance</label>
                <input type="datetime-local" name="date_naiss" className="form-control"
                  value={formData.date_naiss || ""} onChange={handleChange} required />
              </div>
            </div>

            {/* Sexe et lieu */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Lieu de naissance</label>
                <input type="text" name="lieu" className="form-control"
                  value={formData.lieu || ""} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label>Sexe</label>
                <select name="sexe" className="form-control"
                  value={formData.sexe || ""} onChange={handleChange} required>
                  <option value="">Choisir...</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>

            {/* Père */}
            <div className="row mb-3">
              <div className="col-md-6"><label>Nom du père</label><input type="text" name="nom_pere" className="form-control" value={formData.nom_pere || ""} onChange={handleChange} /></div>
              <div className="col-md-6"><label>Lieu de naissance du père</label><input type="text" name="lieu_naiss_pere" className="form-control" value={formData.lieu_naiss_pere || ""} onChange={handleChange} /></div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6"><label>Date de naissance du père</label><input type="date" name="date_naiss_pere" className="form-control" value={formData.date_naiss_pere || ""} onChange={handleChange} /></div>
              <div className="col-md-6"><label>Domicile du père</label><input type="text" name="domicile_pere" className="form-control" value={formData.domicile_pere || ""} onChange={handleChange} /></div>
            </div>
            <div className="mb-3"><label>Profession du père</label><input type="text" name="profession_pere" className="form-control" value={formData.profession_pere || ""} onChange={handleChange} /></div>

            {/* Mère */}
            <div className="row mb-3">
              <div className="col-md-6"><label>Nom de la mère</label><input type="text" name="nom_mere" className="form-control" value={formData.nom_mere || ""} onChange={handleChange} /></div>
              <div className="col-md-6"><label>Lieu de naissance de la mère</label><input type="text" name="lieu_naiss_mere" className="form-control" value={formData.lieu_naiss_mere || ""} onChange={handleChange} /></div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6"><label>Date de naissance de la mère</label><input type="date" name="date_naiss_mere" className="form-control" value={formData.date_naiss_mere || ""} onChange={handleChange} /></div>
              <div className="col-md-6"><label>Domicile de la mère</label><input type="text" name="domicile_mere" className="form-control" value={formData.domicile_mere || ""} onChange={handleChange} /></div>
            </div>

            {/* Administratif */}
            <div className="row mb-3">
              <div className="col-md-6"><label>Profession de la mère</label><input type="text" name="profession_mere" className="form-control" value={formData.profession_mere || ""} onChange={handleChange} /></div>
              <div className="col-md-6"><label>Sur déclaration de</label><input type="text" name="declaration" className="form-control" value={formData.declaration || ""} onChange={handleChange} required /></div>
            </div>
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
              <div className="col-md-6"><label>CNI du père</label><input type="file" name="cni_pere" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
              <div className="col-md-6"><label>CNI de la mère</label><input type="file" name="cni_mere" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6"><label>Certificat médical de naissance</label><input type="file" name="certificat_naissance" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
              <div className="col-md-6"><label>Attestation de résidence</label><input type="file" name="attestation_residence" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
            </div>

            {/* Boutons */}
            <div className="d-flex justify-content-between mt-4">
              <Link to="/dashboard?page=list_naiss" className="btn btn-warning">
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

export default EditNaiss;
