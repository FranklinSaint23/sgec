import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { validerNaissance } from "../../utils/validationCoherence";
import OCRUploader from "../../components/OCRUploader";
import LocationPicker from "../../components/LocationPicker";
import CascadeLocation from "../../components/CascadeLocation";

function AddNaiss() {
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
      const res = await api.post("/actes_naissance", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Acte de naissance enregistré !");
      setGeneratedNumero(res.data.numero_acte || "");
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
    const alertes = validerNaissance(formData);
    if (alertes.length > 0) {
      setAlertesCoherence(alertes);
      return;
    }
    envoyerActe(false);
  };

  const confirmerMalgreAlertes = () => {
    setAlertesCoherence([]);
    envoyerActe(false);
  };

  const confirmerMalgreAlerte = () => {
    envoyerActe(true);
  };

  const annulerAlerte = () => {
    setDoublons(null);
  };

  const genererLibelle = async () => {
    setLibelleLoading(true);
    try {
      const res = await api.post("/generer-libelle", { type: "naissance", data: formData });
      setLibelle(res.data.libelle || "");
    } catch {
      alert("Erreur lors de la génération du libellé.");
    } finally {
      setLibelleLoading(false);
    }
  };

  const totalSteps = 6;
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
                <input type="text" name="declaration" className="form-control" value={formData.declaration || ""} onChange={handleChange} />
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
            <h5>Informations sur l’enfant</h5>
            <OCRUploader type="cni" onExtracted={(data) => setFormData(prev => ({
              ...prev,
              nom:       data.nom        || prev.nom,
              date_naiss:data.date_naiss || prev.date_naiss,
              lieu:      data.lieu_naiss || prev.lieu,
              sexe:      data.sexe       || prev.sexe,
            }))} />
            <label htmlFor="nom">Nom de l’enfant</label>
              <input type="text" name="nom" className="form-control mb-3" value={formData.nom || ""} onChange={handleChange} />
            <label htmlFor="date_naiss">Date et heure de naissance</label>
              <input type="datetime-local" name="date_naiss" className="form-control mb-3" value={formData.date_naiss || ""} onChange={handleChange} />
            <label htmlFor="lieu">Lieu de naissance</label>
              <input type="text" name="lieu" className="form-control mb-3" value={formData.lieu || ""} onChange={handleChange} />
            <label htmlFor="sexe">Sexe</label>
            <select name="sexe" className="form-control mb-3" value={formData.sexe || ""} onChange={handleChange}>
              <option value="">Choisir le sexe</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
            <LocationPicker
              value={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
              onChange={handleLocationChange}
              cityHint={formData.lieu || ''}
              label="Localiser le lieu de naissance sur la carte"
            />
          </>
        );
      case 3:
        return (
          <>
            <h5>Informations sur le père</h5>
            <label htmlFor="nom_pere">Nom du père</label>
              <input type="text" name="nom_pere" className="form-control mb-2" value={formData.nom_pere || ""} onChange={handleChange} />
            <label htmlFor="">Lieu de naissance du père</label>
              <input type="text" name="lieu_naiss_pere" className="form-control mb-2" value={formData.lieu_naiss_pere || ""} onChange={handleChange} />
            <label htmlFor="">Date de naissance du père</label>
              <input type="date" name="date_naiss_pere" className="form-control mb-2" value={formData.date_naiss_pere || ""} onChange={handleChange} />
            <label htmlFor="">Domicile du père</label>
              <input type="text" name="domicile_pere" className="form-control mb-2" value={formData.domicile_pere || ''} onChange={handleChange} />
            <label htmlFor="">Profession du père</label>
              <input type="text" name="profession_pere" className="form-control" value={formData.profession_pere || ''} onChange={handleChange} />

          </>
        );
      case 4:
        return (
          <>
            <h5>Informations sur la mère</h5>
            <label htmlFor="nom_mere">Nom de la mère</label>
              <input type="text" name="nom_mere" className="form-control mb-2" value={formData.nom_mere || ""} onChange={handleChange} />
            <label>Lieu de naissance de la mère</label>
              <input type="text" name="lieu_naiss_mere" className="form-control mb-2" value={formData.lieu_naiss_mere || ''} onChange={handleChange} />
            <label>Date de naissance de la mère</label>
              <input type="date" name="date_naiss_mere" className="form-control mb-2" value={formData.date_naiss_mere || ''} onChange={handleChange} />
            <label>Domicile de la mère</label>
              <input type="text" name="domicile_mere" className="form-control mb-2" value={formData.domicile_mere || ''} onChange={handleChange} />
            <label>Profession de la mère</label>
              <input type="text" name="profession_mere" className="form-control" value={formData.profession_mere || ''} onChange={handleChange} />

          
          </>
        );
      case 5:
        return (
          <>
            <h5>📎 Pièces jointes justificatives :</h5>
            <label>CNI du père</label>
              <input type="file" name="cni_pere" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>CNI de la mère</label>
              <input type="file" name="cni_mere" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>Certificat médical de naissance</label>
              <input type="file" name="certificat_naissance" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
            <label>Acte de mariage</label>
              <input type="file" name="acte_mariage" className="form-control mb-2" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
          </>
        );
      case 6:
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
          <h3 className="mb-3">🚼 Déclarer une naissance</h3>
        </div>

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
            {generatedNumero && (
              <p className="mt-2 mb-0 fw-bold text-primary">
                N° de l'acte : {generatedNumero}
              </p>
            )}
          </div>
        )}

        {alertesCoherence.length > 0 && (
          <div className="alert alert-warning border-warning">
            <h6 className="fw-bold">⚠️ Incohérences détectées</h6>
            <ul className="mb-2">
              {alertesCoherence.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-warning" onClick={confirmerMalgreAlertes}>
                Enregistrer quand même
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAlertesCoherence([])}>
                Corriger
              </button>
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
          <Link to="/dashboard?page=list_naiss" className="btn btn-warning">
            📄 Voir la liste des naissances
          </Link>
        </div>
      </div>

      {doublons && doublons.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div className="bg-white rounded shadow p-4" style={{ maxWidth: "500px", width: "90%" }}>
            <h5 className="text-warning">⚠️ Doublons potentiels détectés</h5>
            <p>Des actes similaires existent déjà dans la base :</p>
            <ul className="list-group mb-3">
              {doublons.map((d) => (
                <li key={d.id} className="list-group-item">
                  <strong>{d.nom}</strong> — né(e) le {d.date_naiss} <br />
                  <small className="text-muted">Similarité : {Math.round(d.score * 100)}%</small>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={annulerAlerte}>
                Annuler et corriger
              </button>
              <button className="btn btn-danger" onClick={confirmerMalgreAlerte} disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer malgré l'alerte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddNaiss;