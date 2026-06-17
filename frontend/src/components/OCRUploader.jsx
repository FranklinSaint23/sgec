import React, { useState, useRef } from "react";
import api from "../services/api";

function OCRUploader({ onExtracted, type = "cni" }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target.result;
      const [header, base64] = base64Full.split(",");
      const mediaType = header.match(/data:([^;]+)/)[1];
      setPreview(base64Full);
      setLoading(true);

      try {
        const res = await api.post("/ocr", {
          image_base64: base64,
          media_type: mediaType,
          type,
        });
        onExtracted(res.data);
      } catch {
        alert("Impossible d'extraire les informations du document.");
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-3 p-3 border rounded bg-white" style={{ borderStyle: "dashed" }}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="fw-bold text-primary small">🔍 Scan automatique IA</span>
        <small className="text-muted">Photographiez un document pour pré-remplir</small>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="d-none"
        onChange={handleFile}
      />
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={() => fileRef.current.click()}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-1"></span>
            Extraction en cours…
          </>
        ) : (
          <>
            <i className="bi bi-camera me-1"></i>Scanner le document
          </>
        )}
      </button>
      {preview && (
        <img
          src={preview}
          alt="Aperçu"
          className="mt-2 ms-2 rounded border"
          style={{ maxHeight: 60, maxWidth: 150, objectFit: "cover" }}
        />
      )}
    </div>
  );
}

export default OCRUploader;
