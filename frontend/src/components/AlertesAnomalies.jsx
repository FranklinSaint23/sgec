import React, { useEffect, useState } from "react";
import api from "../services/api";

function AlertesAnomalies() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get("/anomalies")
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data || data.total === 0) return null;

  return (
    <div className="alert alert-danger border-danger mb-3" role="alert">
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        <span>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>{data.total} anomalie(s) détectée(s)</strong>
          <small className="ms-2 text-muted">— {data.generee_le}</small>
        </span>
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
      </div>

      {open && (
        <ul className="mt-2 mb-0 ps-3">
          {data.anomalies.map((a, i) => (
            <li key={i} className="mb-1">
              <span
                className={`badge me-1 ${
                  a.severite === "haute" ? "bg-danger" : "bg-warning text-dark"
                }`}
              >
                {a.severite}
              </span>
              {a.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AlertesAnomalies;
