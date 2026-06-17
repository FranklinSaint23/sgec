import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { validerDeces } from "../../utils/validationCoherence";
import OCRUploader from "../../components/OCRUploader";
import LocationPicker from "../../components/LocationPicker";
import CascadeLocation from "../../components/CascadeLocation";

function AddDeces() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [secretaires, setSecretaires] = useState([]);
  const [officiers, setOfficiers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedNumero, setGeneratedNumero] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doublons, setDoublons] = useState(null);
  const [alertesCoherence, setAlertesCoherence] = useState([]);
  const [libelle, setLibelle] = useState("");
  const [libelleLoading, setLibelleLoading] = useState(false);
  const [verifCroisee, setVerifCroisee] = useState(null);

  useEffect(() => {
    api.get("/users/secretaire")
      .then(res => setSecretaires(res.data))
      .catch(err => console.error(err));

    api.get("/users/officier")
      .then(res => setOfficiers(res.data))
      .catch(err => console.error(err));
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
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (forcer) data.append("force", "true");

    try {
      const res = await api.post("/actes_deces", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMessage("Acte de décès enregistré avec succès !");
      setGeneratedNumero(res.data.numero_acte || "");
      setVerifCroisee(res.data.verif_croisee || null);
      setFormData({});
      setStep(1);
      setDoublons(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setDoublons(err.response.data.doublons_potentiels || []);
      } else {
        alert("Erreur lors de l’enregistrement.");
        console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const alertes = validerDeces(formData);
    if (alertes.length > 0) { setAlertesCoherence(alertes); return; }
    envoyerActe(false);
  };

  const confirmerMalgreAlertes = () => { setAlertesCoherence([]); envoyerActe(false); };
  const confirmerMalgreDoublons = () => { setDoublons(null); envoyerActe(true); };

  const genererLibelle = async () => {
    setLibelleLoading(true);
    try {
      const res = await api.post("/generer-libelle", { type: "deces", data: formData });
      setLibelle(res.data.libelle || "");
    } catch {
      alert("Erreur lors de la génération du libellé.");
    } finally {
      setLibelleLoading(false);
    }
  };

  // 🔹 Progression (1/7 = ~1%, etc.)
  const totalSteps = 7;
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
            <div className="row mb-3">
              <div className="col-md-12">
                <label>Déclaration de</label>
                <input type="text" name="declaration" placeholder="Sur déclaration de..." className="form-control" value={formData.declaration || ""} onChange={handleChange} required />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Secrétaire</label>
                <select name="secretaire" className="form-control" onChange={handleChange}>
                  <option value="">Choisir...</option>
                  {secretaires.map(s => (
                    <option key={s.id} value={s.username}>{s.username}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label>Officier</label>
                <select name="officier" className="form-control" onChange={handleChange}>
                  <option value="">Choisir...</option>
                  {officiers.map(o => (
                    <option key={o.id} value={o.username}>{o.username}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h5>Informations sur le décédé</h5>
            <OCRUploader type="cni" onExtracted={(data) => setFormData(prev => ({
              ...prev,
              nom_decede:       data.nom        || prev.nom_decede,
              date_naiss_decede:data.date_naiss || prev.date_naiss_decede,
              lieu_naiss_decede:data.lieu_naiss || prev.lieu_naiss_decede,
              sexe:             data.sexe       || prev.sexe,
            }))} />
            <label htmlFor="nom_decede">Nom du décédé</label>
              <input type="text" name="nom_decede" className="form-control mb-2" value={formData.nom_decede || ''} onChange={handleChange} />
            <label htmlFor="date_deces">Date de décès</label>
              <input type="date" name="date_deces" className="form-control mb-2" title='Date de décès' value={formData.date_deces || ''} onChange={handleChange} />
            <label htmlFor="lieu_deces">Lieu de décès</label>
              <input type="text" name="lieu_deces" className="form-control mb-2" placeholder="Lieu de décès" value={formData.lieu_deces || ''} onChange={handleChange} />
            <label htmlFor="sexe">Sexe</label>
              <select name="sexe" className="form-control" value={formData.sexe || ''} onChange={handleChange} required>
                <option value="">Sexe ...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>              
            <label htmlFor="lieu_naiss_decede">Lieu de naissance du décédé</label>
              <input type="text" name="lieu_naiss_decede" className="form-control mb-2" value={formData.lieu_naiss_decede || ''} onChange={handleChange} />
            <LocationPicker
              value={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
              onChange={handleLocationChange}
              cityHint={formData.lieu_deces || ''}
              label="Localiser le lieu de décès sur la carte"
            />
          </>
        );
      case 3:
        return (
          <>
            <h5>Informations sur le décédé</h5>
            <label htmlFor="date_naiss_decede">Date de naissance du décédé</label>
              <input type="date" name="date_naiss_decede" className="form-control mb-2" title='Date de naissance du décédé' value={formData.date_naiss_decede || ''} onChange={handleChange} />
            <label htmlFor="age">Âge du décédé</label> 
              <input type="number" name="age" className="form-control mb-2" value={formData.age || ''} onChange={handleChange} />
            <label htmlFor="profession_decede">Profession du décédé</label>
              <input type="text" name="profession_decede" className="form-control mb-2" value={formData.profession_decede || ''} onChange={handleChange} />
            <label htmlFor="domicile_decede">Domicile du décédé</label>
              <input type="text" name="domicile_decede" className="form-control mb-2" value={formData.domicile_decede || ''} onChange={handleChange} />

          </>
        );
        
      case 4:
        return (
          <>
            <h5>Informations sur le père du décédé</h5>
            <label htmlFor="nom_pere">Nom du père du décédé</label>
                <input type="text" name="nom_pere_decede" className="form-control mb-2" value={formData.nom_pere_decede || ''} onChange={handleChange} />
            <label htmlFor="">Domicile du père du décédé</label>
                <input type="text" name="domicile_pere_decede" className="form-control mb-2" value={formData.domicile_pere_decede || ''} onChange={handleChange} />
          </>
        );
      case 5:
        return (
          <>
            <h5>Informations sur la mère du décédé</h5>
            <label htmlFor="nom_mere">Nom de la mère du décédé</label>
              <input type="text" name="nom_mere_decede" className="form-control mb-2" value={formData.nom_mere_decede || ''} onChange={handleChange} />
            <label>Domicile de la mère du décédé</label>
              <input type="text" name="domicile_mere_decede" className="form-control mb-2" value={formData.domicile_mere_decede || ''} onChange={handleChange} />
          </>
        );
      case 6:
        return (
          <>
            <h5>📎 Pièces jointes justificatives :</h5>
            <label>CNI du décédé</label>
              <input type="file" name="cni_decede" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>Acte de naissance du décédé</label>
              <input type="file" name="acte_naissance_decede" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
          </>
        );
      case 7:
        return (
          <>
            <h5>Récapitulatif</h5>
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
          <h3 className="mb-3">⚰️ Déclarer un décès</h3>
        </div>

        {/* 🔹 Barre de progression */}
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <small>Étape {step} / {totalSteps}</small>
            <small>{Math.round(progressPercent)}%</small>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
            {generatedNumero && <p className="mt-2 mb-0 fw-bold text-primary">N° de l'acte : {generatedNumero}</p>}
            {verifCroisee && !verifCroisee.found && (
              <p className="mt-1 mb-0 text-warning small">⚠️ Aucun acte de naissance correspondant trouvé dans la base.</p>
            )}
            {verifCroisee && verifCroisee.found && (
              <p className="mt-1 mb-0 text-success small">✅ Acte de naissance correspondant trouvé.</p>
            )}
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
                <li key={i}>{d.nom_decede} — {d.date_deces} <span className="badge bg-danger ms-1">{Math.round(d.score * 100)}%</span></li>
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
              <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                ⬅️ Précédent
              </button>
            )}
            {step < totalSteps && (
              <button type="button" className="btn btn-primary ms-auto" onClick={() => setStep(step + 1)}>
                Suivant ➡️
              </button>
            )}
            {step === totalSteps && (
              <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Valider l’acte"}
              </button>
            )}
          </div>
        </form>
        <div className="mt-3 text-end">
          <Link to="/dashboard?page=list_deces" className="btn btn-warning">
            📄 Voir la liste des décès
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AddDeces;
