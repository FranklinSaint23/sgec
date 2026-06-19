import React, { useState, useRef } from "react";
import api from "../services/api";

function OCRUploader({ onExtracted, type = "cni" }) {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({ recto: null, verso: null });
  const rectoRef = useRef();
  const versoRef = useRef();

  const toBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const [header, base64] = e.target.result.split(",");
      const mediaType = header.match(/data:([^;]+)/)[1];
      resolve({ base64, mediaType });
    };
    reader.readAsDataURL(file);
  });

  const handleScan = async () => {
    const rectoFile = rectoRef.current?.files[0];
    const versoFile = versoRef.current?.files[0];
    if (!rectoFile) { alert("Veuillez sélectionner au moins le recto."); return; }

    setLoading(true);
    try {
      const recto = await toBase64(rectoFile);
      const payload = {
        image_base64: recto.base64,
        media_type:   recto.mediaType,
        type,
      };
      if (versoFile) {
        const verso = await toBase64(versoFile);
        payload.image_base64_verso = verso.base64;
        payload.media_type_verso   = verso.mediaType;
      }
      const res = await api.post("/ocr", payload);
      onExtracted(res.data);
    } catch {
      alert("Impossible d'extraire les informations du document.");
    } finally {
      setLoading(false);
      if (rectoRef.current) rectoRef.current.value = "";
      if (versoRef.current) versoRef.current.value = "";
      setPreviews({ recto: null, verso: null });
    }
  };

  const handlePreview = (side, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviews(prev => ({ ...prev, [side]: URL.createObjectURL(file) }));
  };

  return (
    <div className="mb-3 p-3 border rounded bg-white" style={{ borderStyle: "dashed" }}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="fw-bold text-primary small">🔍 Scan automatique IA</span>
        <small className="text-muted">Photographiez le recto (et verso) pour pré-remplir</small>
      </div>

      <div className="d-flex gap-3 flex-wrap mb-2">
        {/* Recto */}
        <div>
          <label className="form-label small mb-1 fw-semibold">Recto *</label>
          <input
            ref={rectoRef}
            type="file"
            accept="image/*"
            className="form-control form-control-sm"
            style={{ width: 180 }}
            onChange={(e) => handlePreview("recto", e)}
          />
          {previews.recto && (
            <img src={previews.recto} alt="Recto" className="mt-1 rounded border"
              style={{ maxHeight: 55, maxWidth: 160, objectFit: "cover", display: "block" }} />
          )}
        </div>

        {/* Verso */}
        <div>
          <label className="form-label small mb-1 fw-semibold">Verso <span className="text-muted fw-normal">(optionnel)</span></label>
          <input
            ref={versoRef}
            type="file"
            accept="image/*"
            className="form-control form-control-sm"
            style={{ width: 180 }}
            onChange={(e) => handlePreview("verso", e)}
          />
          {previews.verso && (
            <img src={previews.verso} alt="Verso" className="mt-1 rounded border"
              style={{ maxHeight: 55, maxWidth: 160, objectFit: "cover", display: "block" }} />
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={handleScan}
        disabled={loading}
      >
        {loading ? (
          <><span className="spinner-border spinner-border-sm me-1"></span>Extraction en cours…</>
        ) : (
          <><i className="bi bi-camera me-1"></i>Scanner le document</>
        )}
      </button>
    </div>
  );
}

export default OCRUploader;
