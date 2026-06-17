import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from "../../services/api"; 

function EditMariage() {
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
      api.get(`/actes_mariage/${id}`)
        .then((res) => setFormData(res.data))
        .catch((err) => {
          console.error("Erreur de récupération :", err);
          alert("Impossible de récupérer l'acte de mariage.");
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

      const res = await api.post(`/actes_mariage/${id}`, data);
      setSuccessMessage("Acte de mariage mis à jour avec succès !");
      setUpdatedFields({});
      setFormData(res.data.data);

      setTimeout(() => navigate("/dashboard?page=list_mariage"), 2000);
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
            <span className="fs-2 me-2">💍</span> Modifier l'acte de mariage N°&nbsp;<strong style={{color: "red",}}>{formData.numero_acte || ""}</strong>
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
            
            {/* Infos générales */}
            <div className="row mb-3">
              <div className="col-md-12">
                <label>Date d'enregistrement</label>
                <input type="datetime-local" name="contracte_le" className="form-control" value={formData.contracte_le || ''} onChange={handleChange} required />
              </div>
            </div>

            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Date de célébration</label>
                <input type="datetime-local" name="celebre_le" className="form-control mb-2" placeholder="Date de célébration" value={formData.celebre_le || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Régime matrimonial</label>
                <input type="text" name="regime" className="form-control mb-2" placeholder="Régime" value={formData.regime || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Infos Époux */}
            <h5 className="mt-4">Informations Époux</h5>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Nom de l'homme</label>
                <input type="text" name="nom_homme" className="form-control mb-2" placeholder="Nom de l'homme" value={formData.nom_homme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Nom du père de l'homme</label>
                <input type="text" name="nom_pere_homme" className="form-control mb-2" placeholder="Nom du père de l'homme" value={formData.nom_pere_homme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Nom de la mère de l'homme</label>
                <input type="text" name="nom_mere_homme" className="form-control mb-2" placeholder="Nom de la mère de l'homme" value={formData.nom_mere_homme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Date de naissance de l'homme</label>
                <input type="date" name="date_naiss_homme" title="Date de naissance de l'homme" className="form-control mb-2" value={formData.date_naiss_homme || ''} onChange={handleChange} />
              </div>
            </div>            
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Race de l'homme</label>
                <input type="text" name="race_homme" className="form-control mb-2" placeholder="Race" value={formData.race_homme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Groupement de l'homme</label>
                <input type="text" name="groupement_homme" className="form-control mb-2" placeholder="Groupement" value={formData.groupement_homme || ''} onChange={handleChange} />
              </div>
            </div>            
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Subdivision de l'homme</label>
                <input type="text" name="subdivision_homme" className="form-control mb-2" placeholder="Subdivision" value={formData.subdivision_homme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Région de l'homme</label>
                <input type="text" name="region_homme" className="form-control mb-2" placeholder="Région" value={formData.region_homme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Profession de l'homme</label>
                <input type="text" name="profession_homme" className="form-control mb-2" placeholder="Profession" value={formData.profession_homme || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Résidence de l'homme</label>
                <input type="text" name="residence_homme" className="form-control mb-2" placeholder="Résidence" value={formData.residence_homme || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Infos Épouse */}
            <h5 className="mt-4">Informations Épouse</h5>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Nom de la femme</label>
                <input type="text" name="nom_femme" className="form-control mb-2" placeholder="Nom de la femme" value={formData.nom_femme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Nom du père de la femme</label>
                <input type="text" name="nom_pere_femme" className="form-control mb-2" placeholder="Nom du père de la femme" value={formData.nom_pere_femme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Nom de la mère de la femme</label>
                <input type="text" name="nom_mere_femme" className="form-control mb-2" placeholder="Nom de la mère de la femme" value={formData.nom_mere_femme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Date de naissance de la femme</label>
                <input type="date" name="date_naiss_femme" title='Date de naissance de la femme' className="form-control mb-2" value={formData.date_naiss_femme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3" >
              <div className='col-md-6'>
                <label>Race de la femme</label>
                <input type="text" name="race_femme" className="form-control mb-2" placeholder="Race" value={formData.race_femme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Groupement de la femme</label>
                <input type="text" name="groupement_femme" className="form-control mb-2" placeholder="Groupement" value={formData.groupement_femme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Subdivision de la femme</label>
                <input type="text" name="subdivision_femme" className="form-control mb-2" placeholder="Subdivision" value={formData.subdivision_femme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Région de la femme</label>
                <input type="text" name="region_femme" className="form-control mb-2" placeholder="Région" value={formData.region_femme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Profession de la femme</label>
                <input type="text" name="profession_femme" className="form-control mb-2" placeholder="Profession" value={formData.profession_femme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Résidence de la femme</label>
                <input type="text" name="residence_femme" className="form-control mb-2" placeholder="Résidence" value={formData.residence_femme || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Dot */}
            <h5 className="mt-4">Dot</h5>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Montant convenu</label>
                <input type="number" name="dot_montant_convenu" className="form-control mb-2" placeholder="Montant convenu" value={formData.dot_montant_convenu || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Montant versé</label>
                <input type="number" name="dot_montant_verse" className="form-control mb-2" placeholder="Montant versé" value={formData.dot_montant_verse || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Date de versement</label>
                <input type="date" name="date_versement" title='Date de versement' className="form-control mb-2" value={formData.date_versement || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Date de versement complémentaire</label>
                <input type="date" name="date_versement_complementaire" title='Date de versement complémentaire' className="form-control mb-2" value={formData.date_versement_complementaire || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Témoins */}
            <h5 className="mt-4">Témoins</h5>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Témoin homme 1</label>
                <input type="text" name="temoin1_homme" className="form-control mb-2" placeholder="Témoin homme 1" value={formData.temoin1_homme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Témoin homme 2</label>
                <input type="text" name="temoin2_homme" className="form-control mb-2" placeholder="Témoin homme 2" value={formData.temoin2_homme || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="row mb-3">
              <div className='col-md-6'>
                <label>Témoin femme 1</label>
                <input type="text" name="temoin1_femme" className="form-control mb-2" placeholder="Témoin femme 1" value={formData.temoin1_femme || ''} onChange={handleChange} />
              </div>
              <div className='col-md-6'>
                <label>Témoin femme 2</label>
                <input type="text" name="temoin2_femme" className="form-control mb-2" placeholder="Témoin femme 2" value={formData.temoin2_femme || ''} onChange={handleChange} />
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
              <div className="col-md-6"><label>CNI de l'homme</label><input type="file" name="cni_homme" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
              <div className="col-md-6"><label>CNI de la femme</label><input type="file" name="cni_femme" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6"><label>Acte de naissance de l'homme</label><input type="file" name="acte_homme" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
              <div className="col-md-6"><label>Acte de naissance de la femme</label><input type="file" name="acte_femme" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} /></div>
            </div>

            {/* Boutons */}
            <div className="d-flex justify-content-between mt-4">
              <Link to="/dashboard?page=list_mariage" className="btn btn-warning">
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

export default EditMariage;
