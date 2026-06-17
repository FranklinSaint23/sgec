import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DT_STYLES = {
  headCells: {
    style: { fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.6px', color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  },
  rows: {
    style: { fontSize: '14px', color: '#334155', minHeight: '52px', borderBottom: '1px solid #f1f5f9' },
    highlightOnHoverStyle: { backgroundColor: '#f8fafc' },
  },
  pagination: { style: { fontSize: '13px', color: '#64748b', borderTop: '1px solid #f1f5f9' } },
};

function CopieMariage() {
  const [actes, setActes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    api.get('/actes_mariage')
      .then((r) => { setActes(Array.isArray(r.data) ? r.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const colonnes = [
    { name: 'N° Acte',             selector: (r) => r.numero_acte,  sortable: true, cell: (r) => <span className="fw-semibold text-primary">{r.numero_acte}</span> },
    { name: 'Nom de l\'homme',     selector: (r) => r.nom_homme,    sortable: true },
    { name: 'Nom de la femme',     selector: (r) => r.nom_femme,    sortable: true },
    { name: 'Régime matrimonial',  selector: (r) => r.regime,       sortable: true },
    { name: 'Contracté le',        selector: (r) => r.contracte_le, sortable: true },
    {
      name: 'Actions', width: '110px', ignoreRowClick: true,
      cell: (r) => (
        <Link to={`/detail_copie_mariage/${r.id}`} className="btn btn-sm btn-warning">
          <i className="bi bi-eye me-1"></i>Détails
        </Link>
      ),
    },
  ];

  const dataFiltre = actes.filter((a) =>
    Object.values(a).some((v) => String(v).toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="ea-table-page">
      <div className="ea-table-page-header">
        <div className="ea-table-page-title">
          <i className="bi bi-file-earmark-heart text-warning"></i>
          Duplicata — Actes de mariage
          <span className="ea-badge ea-badge-yellow ms-1">{actes.length}</span>
        </div>
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ width: 240 }}
          placeholder="🔍 Rechercher…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <DataTable
        columns={colonnes}
        data={dataFiltre}
        customStyles={DT_STYLES}
        pagination
        highlightOnHover
        progressPending={loading}
        progressComponent={<div className="py-5 text-center"><span className="spinner-border text-warning"></span></div>}
        noDataComponent={<div className="py-5 text-center text-muted small">Aucun acte de mariage trouvé.</div>}
        paginationRowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
}

export default CopieMariage;
