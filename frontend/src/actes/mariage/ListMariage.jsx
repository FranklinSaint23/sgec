import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import Papa from "papaparse"; // Pour CSV
import * as XLSX from "xlsx"; // Pour Excel
import jsPDF from "jspdf"; // Pour PDF
import autoTable from "jspdf-autotable"; // Table PDF
import api from "../../services/api"; 

function ListMariage() {
  const [actes, setActes] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [acteToDelete, setActeToDelete] = useState(null);
  const [searchIA, setSearchIA] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);
  const [resultatsIA, setResultatsIA] = useState(null);


  // Charger les données
  useEffect(() => {
    api.get("/actes_mariage")
      .then((res) => {
        setActes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch :", err);
        setLoading(false);
      });
  }, []);

  const confirmDelete = (acte) => {
    setActeToDelete(acte);
    const modal = new window.bootstrap.Modal(
      document.getElementById("deleteModal")
    );
    modal.show();
  };

  // Supprimer un acte
  const handleDelete = async () => {
    if (!acteToDelete) return;

    try {
      await api.delete(`/actes_mariage/${acteToDelete.id}`);
      setActes(actes.filter((a) => a.id !== acteToDelete.id));
      setSuccessMessage("Acte supprimé avec succès.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setActeToDelete(null);
      const modalElement = document.getElementById("deleteModal");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    }
  };

  const rechercherIA = async () => {
    if (!searchIA.trim()) return;
    setLoadingIA(true); setResultatsIA(null);
    try {
      const res = await api.get(`/search?type=mariage&q=${encodeURIComponent(searchIA)}`);
      setResultatsIA(res.data);
    } catch { alert("Service de recherche IA indisponible."); }
    finally { setLoadingIA(false); }
  };

  const customStyles = {
    headCells: {
      style: { fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.6px', color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
    },
    rows: {
      style: { fontSize: '14px', color: '#334155', minHeight: '52px', borderBottom: '1px solid #f1f5f9' },
      highlightOnHoverStyle: { backgroundColor: '#f8fafc' },
    },
    pagination: { style: { fontSize: '13px', color: '#64748b', borderTop: '1px solid #f1f5f9' } },
  };

  // Colonnes
  const colonnes = [ 
    { name: "N° Acte", selector: (acte) => acte.numero_acte, sortable: true },
    { name: "Nom de l'homme", selector: (acte) => acte.nom_homme, sortable: true },
    { name: "Nom de la femme", selector: (acte) => acte.nom_femme, sortable: true },
    { name: "Régime matrimonial", selector: (acte) => acte.regime, sortable: true },
    { name: "Contracté le", selector: (acte) => acte.contracte_le, sortable: true },
    {
      name: "Actions",
      cell: (acte) => (
        <div className="d-flex gap-2">
          <Link
            to={`/dashboard?page=edit_mariage&id=${acte.id}`}
            className="btn btn-sm btn-success"
            title="Modifier"
          >
            <i className="bi bi-pencil"></i>
          </Link>
          <button
            className="btn btn-sm btn-danger"
            title="Supprimer"
            onClick={() => confirmDelete(acte)}
          >
            <i className="bi bi-trash"></i>
          </button>
          <Link
            to={`/detail_mariage/${acte.id}`}
            className="btn btn-sm btn-warning"
            title="Détails"
          >
            <i className="bi bi-info-circle"></i>
          </Link>
          <Link to={`/publier_mariage/${acte.id}`} 
            className="btn btn-sm btn-info" 
            title="Certificat de reconnaissance"
          >
            <i className="bi bi-megaphone fs-6"></i>
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      

    },
  ];

  const sourceActes = resultatsIA || actes;
  const dataFiltre = sourceActes.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Export CSV
  const exportCSV = () => {
    const csv = Papa.unparse(dataFiltre);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "actes_mariage.csv";
    a.click();
  };

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataFiltre);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Actes");
    XLSX.writeFile(wb, "actes_mariage.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des actes de mariage", 14, 10);
    autoTable(doc, {
      head: [["N° Acte", "Nom de l'homme", "Nom de la femme", "Contracté le"]],
      body: dataFiltre.map((row) => [
        row.numero_acte,
        row.nom_homme,
        row.nom_femme,
        row.contracte_le,
      ]),
    });
    
    doc.save("actes_mariage.pdf");
  };


  return (
    <div className="container mt-4">
      <div className="col-md-12 p-4 bg-light rounded shadow-sm mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">📋 Liste des actes de mariage</h3>
          <Link to="/dashboard?page=acte_mariage" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Déclarer un mariage
          </Link>
        </div>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {/* Recherche IA */}
        <div className="input-group mb-3">
          <input type="text" placeholder="🤖 Recherche approchée (nom époux/épouse…)" className="form-control"
            value={searchIA} onChange={e => { setSearchIA(e.target.value); setResultatsIA(null); }}
            onKeyDown={e => e.key === "Enter" && rechercherIA()} />
          <button className="btn btn-outline-primary" onClick={rechercherIA} disabled={loadingIA}>{loadingIA ? "…" : "Recherche IA"}</button>
          {resultatsIA && <button className="btn btn-outline-secondary" onClick={() => { setResultatsIA(null); setSearchIA(""); }}>Effacer</button>}
        </div>
        {resultatsIA && <div className="alert alert-info py-2 mb-2"><strong>{resultatsIA.length} résultat(s) IA</strong> pour « {searchIA} »</div>}

        {/* Recherche + boutons export */}
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            className="form-control w-25"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <div className="btn-group">
            <button className="btn btn-outline-secondary" onClick={exportCSV}>
              <i className="bi bi-file-earmark-spreadsheet"></i> CSV
            </button>
            <button className="btn btn-outline-success" onClick={exportExcel}>
              <i className="bi bi-file-excel"></i> Excel
            </button>
            <button className="btn btn-outline-danger" onClick={exportPDF}>
              <i className="bi bi-file-pdf"></i> PDF
            </button>
          </div>
        </div>

        <DataTable
          columns={colonnes}
          data={dataFiltre}
          pagination
          highlightOnHover
          striped
          bordered
          responsive
          progressPending={loading}
          customStyles={customStyles}
          noDataComponent="Aucun acte trouvé."
        />
      </div>

      {/* Modal suppression */}
      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirmation de suppression</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Fermer"
              ></button>
            </div>
            <div className="modal-body">
              {acteToDelete ? (
                <p>
                  Voulez-vous vraiment supprimer l'acte{" "}
                  <strong>{acteToDelete.numero_acte}</strong> ?
                </p>
              ) : (
                <p>Chargement...</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListMariage;



