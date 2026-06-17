import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import api from "../services/api";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DT_STYLES = {
  headCells: {
    style: { fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.6px', color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  },
  rows: {
    style: { fontSize: '14px', color: '#334155', minHeight: '52px', borderBottom: '1px solid #f1f5f9' },
    highlightOnHoverStyle: { backgroundColor: '#f8fafc', cursor: 'default' },
  },
  pagination: { style: { fontSize: '13px', color: '#64748b', borderTop: '1px solid #f1f5f9' } },
};

const ROLE_BADGE = {
  admin:      'ea-badge ea-badge-indigo',
  officier:   'ea-badge ea-badge-blue',
  secretaire: 'ea-badge ea-badge-green',
};

function ListUsers() {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMsg, setSuccessMsg]     = useState('');

  useEffect(() => {
    api.get('/users')
      .then((r) => { setUsers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const confirmDelete = (user) => {
    setUserToDelete(user);
    new window.bootstrap.Modal(document.getElementById('deleteModal')).show();
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setSuccessMsg('Utilisateur supprimé avec succès.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setUserToDelete(null);
      window.bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
    }
  };

  const colonnes = [
    { name: '#', selector: (_, i) => i + 1, width: '60px', sortable: false },
    { name: 'Nom d\'utilisateur', selector: (u) => u.username, sortable: true, cell: (u) => <span className="fw-semibold">{u.username}</span> },
    { name: 'Email', selector: (u) => u.email, sortable: true },
    { name: 'Sexe', selector: (u) => u.sexe === 'M' ? 'Masculin' : 'Féminin', width: '110px', sortable: true },
    {
      name: 'Rôle', selector: (u) => u.role, sortable: true, width: '130px',
      cell: (u) => <span className={ROLE_BADGE[u.role] || 'ea-badge ea-badge-blue'}>{u.role}</span>,
    },
    {
      name: 'Actions', width: '120px', ignoreRowClick: true,
      cell: (u) => (
        <div className="d-flex gap-2">
          <Link to={`/dashboard?page=edit_users&id=${u.id}`} className="btn btn-sm btn-warning" title="Modifier">
            <i className="bi bi-pencil"></i>
          </Link>
          <button className="btn btn-sm btn-danger" title="Supprimer" onClick={() => confirmDelete(u)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const dataFiltre = users.filter((u) =>
    Object.values(u).some((v) => String(v).toLowerCase().includes(filter.toLowerCase()))
  );

  const exportCSV = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([Papa.unparse(dataFiltre)], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'utilisateurs.csv'; a.click();
  };
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataFiltre), 'Users');
    XLSX.writeFile(wb, 'utilisateurs.xlsx');
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des utilisateurs', 14, 12);
    autoTable(doc, { head: [['N°', 'Nom', 'Email', 'Sexe', 'Rôle']], body: dataFiltre.map((u, i) => [i+1, u.username, u.email, u.sexe === 'M' ? 'Masculin' : 'Féminin', u.role]) });
    doc.save('utilisateurs.pdf');
  };

  return (
    <div>
      {successMsg && <div className="alert alert-success mb-3"><i className="bi bi-check-circle me-2"></i>{successMsg}</div>}

      <div className="ea-table-page">
        {/* Header */}
        <div className="ea-table-page-header">
          <div className="ea-table-page-title">
            <i className="bi bi-people text-primary"></i>
            Utilisateurs
            <span className="ea-badge ea-badge-blue ms-1">{users.length}</span>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <input type="text" className="form-control form-control-sm" style={{ width: 220 }}
              placeholder="🔍 Rechercher…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" onClick={exportCSV} title="Exporter CSV"><i className="bi bi-file-earmark-spreadsheet"></i></button>
              <button className="btn btn-outline-success"   onClick={exportExcel} title="Exporter Excel"><i className="bi bi-file-excel"></i></button>
              <button className="btn btn-outline-danger"    onClick={exportPDF}   title="Exporter PDF"><i className="bi bi-file-pdf"></i></button>
            </div>
            <Link to="/dashboard?page=add_users" className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-1"></i>Ajouter
            </Link>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={colonnes}
          data={dataFiltre}
          customStyles={DT_STYLES}
          pagination
          highlightOnHover
          progressPending={loading}
          progressComponent={<div className="py-5 text-center"><span className="spinner-border text-primary"></span></div>}
          noDataComponent={<div className="py-5 text-center text-muted small">Aucun utilisateur trouvé.</div>}
          paginationRowsPerPageOptions={[10, 25, 50]}
        />
      </div>

      {/* Modal suppression */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div className="modal-header bg-danger text-white" style={{ borderRadius: '16px 16px 0 0' }}>
              <h5 className="modal-title"><i className="bi bi-exclamation-triangle me-2"></i>Confirmation</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body py-4">
              {userToDelete
                ? <p className="mb-0">Voulez-vous vraiment supprimer <strong>{userToDelete.username}</strong> ?</p>
                : <p className="mb-0">Chargement…</p>}
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListUsers;
