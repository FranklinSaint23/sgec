import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { validerMariage } from "../../utils/validationCoherence";
import OCRUploader from "../../components/OCRUploader";
import LocationPicker from "../../components/LocationPicker";
import CascadeLocation from "../../components/CascadeLocation";

function AddMariage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedNumero, setGeneratedNumero] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doublons, setDoublons] = useState(null);
  const [alertesCoherence, setAlertesCoherence] = useState([]);
  const [libelle, setLibelle] = useState("");
  const [libelleLoading, setLibelleLoading] = useState(false);
  const [verifCroisee, setVerifCroisee] = useState(null);

  const [secretaires, setSecretaires] = useState([]);
  const [officiers, setOfficiers] = useState([]);

  useEffect(() => {
    api.get("/users/secretaire")
      .then(res => setSecretaires(res.data))
      .catch(err => console.error("Erreur secrétaires", err));

    api.get("/users/officier")
      .then(res => setOfficiers(res.data))
      .catch(err => console.error("Erreur officiers", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleLocationChange = (loc) => {
    setFormData(prev => {
      const next = { ...prev };
      if (loc) { next.latitude = loc.lat; next.longitude = loc.lng; }
      else { delete next.latitude; delete next.longitude; }
      return next;
    });
  };

  const envoyerActe = async (forcer = false) => {
    setIsSubmitting(true);
    setErrors({});
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => { if (value) data.append(key, value); });
    if (forcer) data.append("force", "true");

    try {
      const res = await api.post("/actes_mariage", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMessage("Acte de mariage enregistré avec succès !");
      setGeneratedNumero(res.data.numero_acte || "");
      setVerifCroisee(res.data.verif_croisee || null);
      setFormData({});
      setStep(1);
      setDoublons(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setDoublons(err.response.data.doublons_potentiels || []);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert("Erreur serveur : " + (err.response?.data?.message || err.message));
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const alertes = validerMariage(formData);
    if (alertes.length > 0) { setAlertesCoherence(alertes); return; }
    envoyerActe(false);
  };

  const confirmerMalgreAlertes = () => { setAlertesCoherence([]); envoyerActe(false); };
  const confirmerMalgreDoublons = () => { setDoublons(null); envoyerActe(true); };

  const genererLibelle = async () => {
    setLibelleLoading(true);
    try {
      const res = await api.post("/generer-libelle", { type: "mariage", data: formData });
      setLibelle(res.data.libelle || "");
    } catch {
      alert("Erreur lors de la génération du libellé.");
    } finally {
      setLibelleLoading(false);
    }
  };

  // Nombre d’étapes
  const totalSteps = 9; // on ajoute 1 étape pour le régime matrimonial
  const progressPercent = (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h5>📝 Informations administratives</h5>
            <div className="mb-3">
              <CascadeLocation
                values={{ province: formData.province, departement: formData.departement, arrondissement: formData.arrondissement, centre: formData.centre }}
                onChange={(loc) => setFormData(prev => ({ ...prev, ...loc }))}
              />
            </div>
            <label>Date de célébration</label>
            <input type="datetime-local" name="celebre_le" className="form-control mb-2" value={formData.celebre_le || ""} onChange={handleChange} />
            <LocationPicker
              value={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
              onChange={handleLocationChange}
              cityHint={formData.arrondissement || ""}
              label="Localiser le lieu de mariage sur la carte"
            />
          </>
        );
      case 2:
        return (
          <>
            <h5>👨 Informations sur l’Époux</h5>
            <OCRUploader type="cni" onExtracted={(data) => setFormData(prev => ({
              ...prev,
              nom_homme:        data.nom        || prev.nom_homme,
              date_naiss_homme: data.date_naiss || prev.date_naiss_homme,
              profession_homme: data.profession || prev.profession_homme,
              residence_homme:  data.domicile   || prev.residence_homme,
            }))} />
            <label>Nom de l’homme</label>
            <input type="text" name="nom_homme" className="form-control mb-2" value={formData.nom_homme || ''} onChange={handleChange} />
            <label>Nom du père</label>
            <input type="text" name="nom_pere_homme" className="form-control mb-2" value={formData.nom_pere_homme || ''} onChange={handleChange} />
            <label>Nom de la mère</label>
            <input type="text" name="nom_mere_homme" className="form-control mb-2" value={formData.nom_mere_homme || ''} onChange={handleChange} />
            <label>Date de naissance</label>
            <input type="date" name="date_naiss_homme" className="form-control mb-2" value={formData.date_naiss_homme || ''} onChange={handleChange} />
            <label>Race de l'homme</label>
            <input type="text" name="race_homme" className="form-control mb-2" placeholder="Race" value={formData.race_homme || ''} onChange={handleChange} />
            <label>Groupement de l'homme</label>
            <input type="text" name="groupement_homme" className="form-control mb-2" placeholder="Groupement" value={formData.groupement_homme || ''} onChange={handleChange} />
            <label>Subdivision de l'homme</label>
            <input type="text" name="subdivision_homme" className="form-control mb-2" placeholder="Subdivision" value={formData.subdivision_homme || ''} onChange={handleChange} />
            <label>Région de l'homme</label>
            <input type="text" name="region_homme" className="form-control mb-2" placeholder="Région" value={formData.region_homme || ''} onChange={handleChange} />              
            <label>Profession</label>
            <input type="text" name="profession_homme" className="form-control mb-2" value={formData.profession_homme || ''} onChange={handleChange} />
            <label>Résidence</label>
            <input type="text" name="residence_homme" className="form-control mb-2" value={formData.residence_homme || ''} onChange={handleChange} />
          </>
        );
      case 3:
        return (
          <>
            <h5>👩 Informations sur l’Épouse</h5>
            <OCRUploader type="cni" onExtracted={(data) => setFormData(prev => ({
              ...prev,
              nom_femme:        data.nom        || prev.nom_femme,
              date_naiss_femme: data.date_naiss || prev.date_naiss_femme,
              profession_femme: data.profession || prev.profession_femme,
              residence_femme:  data.domicile   || prev.residence_femme,
            }))} />
            <label>Nom de la femme</label>
            <input type="text" name="nom_femme" className="form-control mb-2" value={formData.nom_femme || ''} onChange={handleChange} />
            <label>Nom du père</label>
            <input type="text" name="nom_pere_femme" className="form-control mb-2" value={formData.nom_pere_femme || ''} onChange={handleChange} />
            <label>Nom de la mère</label>
            <input type="text" name="nom_mere_femme" className="form-control mb-2" value={formData.nom_mere_femme || ''} onChange={handleChange} />
            <label>Date de naissance</label>
            <input type="date" name="date_naiss_femme" className="form-control mb-2" value={formData.date_naiss_femme || ''} onChange={handleChange} />
            <label>Race de la femme</label>
            <input type="text" name="race_femme" className="form-control mb-2" placeholder="Race" value={formData.race_femme || ''} onChange={handleChange} />
            <label>Groupement de la femme</label>
            <input type="text" name="groupement_femme" className="form-control mb-2" placeholder="Groupement" value={formData.groupement_femme || ''} onChange={handleChange} />
            <label>Subdivision de la femme</label>
            <input type="text" name="subdivision_femme" className="form-control mb-2" placeholder="Subdivision" value={formData.subdivision_femme || ''} onChange={handleChange} />
            <label>Région de la femme</label>
            <input type="text" name="region_femme" className="form-control mb-2" placeholder="Région" value={formData.region_femme || ''} onChange={handleChange} />                         
            <label>Profession</label>
            <input type="text" name="profession_femme" className="form-control mb-2" value={formData.profession_femme || ''} onChange={handleChange} />
            <label>Résidence</label>
            <input type="text" name="residence_femme" className="form-control mb-2" value={formData.residence_femme || ''} onChange={handleChange} />
          </>
        );
      case 4:
        return (
          <>
            <h5>📜 Régime matrimonial</h5>
            <label>Choisir un régime</label>
            <select name="regime" className="form-control" value={formData.regime || ''} onChange={handleChange} required>
              <option value="">-- Sélectionner --</option>
              <option value="monogamie">Monoganie</option>
              <option value="polygamie">Polygamie</option>
              <option value="Communaute">Communauté de biens</option>
              <option value="Separation">Séparation de biens</option>
            </select>
          </>
        );
      case 5:
        return (
          <>
            <h5>💰 Dot</h5>
            <label>Montant convenu</label>
            <input type="number" name="dot_montant_convenu" className="form-control mb-2" value={formData.dot_montant_convenu || ''} onChange={handleChange} />
            <label>Montant versé</label>
            <input type="number" name="dot_montant_verse" className="form-control mb-2" value={formData.dot_montant_verse || ''} onChange={handleChange} />
            <label>Date du premier versement</label>
            <input type="date" name="date_versement" className="form-control mb-2" value={formData.date_versement || ''} onChange={handleChange} />
            <label>Date versement complémentaire</label>
            <input type="date" name="date_versement_complementaire" className="form-control mb-2" value={formData.date_versement_complementaire || ''} onChange={handleChange} />
          </>
        );
      case 6:
        return (
          <>
            <h5>👥 Témoins</h5>
            <label>Témoin homme 1</label>
            <input type="text" name="temoin1_homme" className="form-control mb-2" value={formData.temoin1_homme || ''} onChange={handleChange} />
            <label>Témoin homme 2</label>
            <input type="text" name="temoin2_homme" className="form-control mb-2" value={formData.temoin2_homme || ''} onChange={handleChange} />
            <label>Témoin femme 1</label>
            <input type="text" name="temoin1_femme" className="form-control mb-2" value={formData.temoin1_femme || ''} onChange={handleChange} />
            <label>Témoin femme 2</label>
            <input type="text" name="temoin2_femme" className="form-control mb-2" value={formData.temoin2_femme || ''} onChange={handleChange} />
          </>
        );
      case 7:
        return (
          <>
            <h5>⚖️ Secrétaire & Officier</h5>
            <label>Secrétaire</label>
            <select name="secretaire" className="form-control mb-2" onChange={handleChange}>
              <option value="">Choisir...</option>
              {secretaires.map(s => (
                <option key={s.id} value={s.username}>{s.username}</option>
              ))}
            </select>
            <label>Officier</label>
            <select name="officier" className="form-control" onChange={handleChange}>
              <option value="">Choisir...</option>
              {officiers.map(o => (
                <option key={o.id} value={o.username}>{o.username}</option>
              ))}
            </select>
          </>
        );
      case 8:
        return (
          <>
            <h5>📎 Pièces jointes</h5>
            <label>CNI de l’homme</label>
            <input type="file" name="cni_homme" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>CNI de la femme</label>
            <input type="file" name="cni_femme" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>Acte de naissance de l’homme</label>
            <input type="file" name="acte_homme" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>Acte de naissance de la femme</label>
            <input type="file" name="acte_femme" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
          </>
        );
      case 9:
        return (
          <>
            <h5>📋 Récapitulatif</h5>
            <pre className="bg-white border rounded p-2" style={{ fontSize: 12, maxHeight: 200, overflow: "auto" }}>
              {JSON.stringify(formData, null, 2)}
            </pre>
            <button type="button" className="btn btn-outline-secondary btn-sm mt-2" onClick={genererLibelle} disabled={libelleLoading}>
              {libelleLoading ? <><span className="spinner-border spinner-border-sm me-1"></span>Génération…</> : "📄 Générer le libellé officiel"}
            </button>
            {libelle && (
              <div className="mt-3 p-3 border rounded bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="text-success">Libellé officiel généré</strong>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => navigator.clipboard.writeText(libelle)}>
                    <i className="bi bi-clipboard"></i> Copier
                  </button>
                </div>
                <p className="mb-0" style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{libelle}</p>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <div className="col-md-10 mx-auto p-4 bg-light rounded shadow">
        <div className="text-center">
          <h3 className="mb-3">💍 Déclarer un mariage</h3>
        </div>

        {/* Progression */}
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <small>Étape {step} / {totalSteps}</small>
            <small>{Math.round(progressPercent)}%</small>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div className="progress-bar bg-success" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
            {generatedNumero && <p className="fw-bold text-primary mt-2">N° Acte : {generatedNumero}</p>}
            {verifCroisee && (!verifCroisee.epoux?.found || !verifCroisee.epouse?.found) && (
              <p className="mt-1 mb-0 text-warning small">⚠️ Acte(s) de naissance non trouvé(s) pour un ou les deux époux.</p>
            )}
            {verifCroisee && verifCroisee.epoux?.found && verifCroisee.epouse?.found && (
              <p className="mt-1 mb-0 text-success small">✅ Actes de naissance des deux époux trouvés.</p>
            )}
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="alert alert-danger">
            <ul className="mb-0">
              {Object.entries(errors).map(([f, m], i) => <li key={i}>{m.join(", ")}</li>)}
            </ul>
          </div>
        )}

        {alertesCoherence.length > 0 && (
          <div className="alert alert-warning">
            <h6 className="fw-bold">⚠️ Incohérences détectées</h6>
            <ul className="mb-2">{alertesCoherence.map((a, i) => <li key={i}>{a}</li>)}</ul>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-warning" onClick={confirmerMalgreAlertes}>Enregistrer quand même</button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAlertesCoherence([])}>Corriger</button>
            </div>
          </div>
        )}

        {doublons && (
          <div className="alert alert-danger">
            <h6 className="fw-bold">🔴 Doublons potentiels détectés</h6>
            <ul className="mb-2">
              {doublons.map((d, i) => (
                <li key={i}>{d.nom_homme} × {d.nom_femme} <span className="badge bg-danger ms-1">{Math.round(d.score * 100)}%</span></li>
              ))}
            </ul>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-danger" onClick={confirmerMalgreDoublons}>Forcer l'enregistrement</button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setDoublons(null)}>Annuler</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {renderStep()}

          <div className="d-flex justify-content-between mt-4">
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>⬅️ Précédent</button>
            )}
            {step < totalSteps && (
              <button type="button" className="btn btn-primary ms-auto" onClick={() => setStep(step + 1)}>Suivant ➡️</button>
            )}
            {step === totalSteps && (
              <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Valider l’acte"}
              </button>
            )}
          </div>
        </form>

        <div className="mt-3 text-end">
          <Link to="/dashboard?page=list_mariage" className="btn btn-warning">
            📄 Voir la liste des mariages
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AddMariage;
