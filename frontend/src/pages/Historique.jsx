import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import api from "../services/api";

const DT_STYLES = {
  headCells: {
    style: { fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.6px', color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  },
  rows: {
    style: { fontSize: '13.5px', color: '#334155', minHeight: '56px', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start', paddingTop: '10px', paddingBottom: '10px' },
    highlightOnHoverStyle: { backgroundColor: '#f8fafc' },
  },
  pagination: { style: { fontSize: '13px', color: '#64748b', borderTop: '1px solid #f1f5f9' } },
};

const MODULE_LABELS = {
  ActeNaissance: { label: 'Naissance', cls: 'ea-badge-green',  icon: 'bi-person-add' },
  ActeMariage:   { label: 'Mariage',   cls: 'ea-badge-yellow', icon: 'bi-heart' },
  ActeDeces:     { label: 'Décès',     cls: 'ea-badge-red',    icon: 'bi-heartbreak' },
  User:          { label: 'Utilisateur', cls: 'ea-badge-indigo', icon: 'bi-person-badge' },
};

const EVENT_BADGE = {
  created: { cls: 'ea-badge-green',  label: 'Création',     icon: 'bi-plus-circle' },
  updated: { cls: 'ea-badge-blue',   label: 'Modification', icon: 'bi-pencil' },
  deleted: { cls: 'ea-badge-red',    label: 'Suppression',  icon: 'bi-trash' },
};

const FIELD_LABELS = {
  nom: 'Nom', prenom: 'Prénom', date_naiss: 'Date naiss.', lieu: 'Lieu',
  sexe: 'Sexe', numero_acte: 'N° Acte', dresse: 'Dressé le',
  nom_homme: 'Homme', nom_femme: 'Femme', regime: 'Régime',
  nom_decede: 'Décédé', date_deces: 'Date décès',
  username: 'Utilisateur', email: 'Email', role: 'Rôle',
};

const SKIP_FIELDS = new Set(['id', 'created_at', 'updated_at', 'user_id']);

function Diff({ event, oldValues, newValues }) {
  if (event === 'created') {
    const entries = Object.entries(newValues || {}).filter(([k]) => !SKIP_FIELDS.has(k));
    if (!entries.length) return <span className="text-muted small">—</span>;
    return (
      <div className="d-flex flex-column gap-1">
        {entries.slice(0, 4).map(([k, v]) => (
          <span key={k} className="small">
            <span className="text-muted">{FIELD_LABELS[k] || k} :</span>{' '}
            <span className="text-success fw-semibold">{String(v)}</span>
          </span>
        ))}
        {entries.length > 4 && <span className="text-muted small">+{entries.length - 4} champ(s)…</span>}
      </div>
    );
  }

  if (event === 'deleted') {
    const entries = Object.entries(oldValues || {}).filter(([k]) => !SKIP_FIELDS.has(k));
    if (!entries.length) return <span className="text-muted small">—</span>;
    return (
      <div className="d-flex flex-column gap-1">
        {entries.slice(0, 4).map(([k, v]) => (
          <span key={k} className="small">
            <span className="text-muted">{FIELD_LABELS[k] || k} :</span>{' '}
            <span className="text-danger" style={{ textDecoration: 'line-through' }}>{String(v)}</span>
          </span>
        ))}
        {entries.length > 4 && <span className="text-muted small">+{entries.length - 4} champ(s)…</span>}
      </div>
    );
  }

  // updated
  const changed = Object.entries(newValues || {}).filter(
    ([k, v]) => !SKIP_FIELDS.has(k) && String(v) !== String((oldValues || {})[k])
  );
  if (!changed.length) return <span className="text-muted small">Aucun changement visible</span>;
  return (
    <div className="d-flex flex-column gap-1">
      {changed.map(([k, v]) => (
        <span key={k} className="small">
          <span className="text-muted">{FIELD_LABELS[k] || k} :</span>{' '}
          <span className="text-danger">{String((oldValues || {})[k])}</span>
          <span className="text-muted mx-1">→</span>
          <span className="text-success fw-semibold">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

function Historique() {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');
  const [filtreEvent, setFiltreEvent] = useState('');

  useEffect(() => {
    api.get('/historique/global')
      .then((r) => { setHistorique(Array.isArray(r.data) ? r.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const colonnes = [
    {
      name: 'Date',
      selector: (r) => r.created_at,
      sortable: true,
      width: '160px',
      cell: (r) => (
        <div className="small">
          <div className="fw-semibold">{new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
          <div className="text-muted">{new Date(r.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ),
    },
    {
      name: 'Utilisateur',
      selector: (r) => r.user?.username,
      sortable: true,
      width: '160px',
      cell: (r) => r.user ? (
        <div className="small">
          <div className="fw-semibold">{r.user.username}</div>
          <div className="text-muted text-capitalize">{r.user.role}</div>
        </div>
      ) : <span className="text-muted small">Système</span>,
    },
    {
      name: 'Module',
      selector: (r) => r.auditable_type,
      sortable: true,
      width: '140px',
      cell: (r) => {
        const key = r.auditable_type?.split('\\').pop();
        const m = MODULE_LABELS[key] || { label: key, cls: 'ea-badge-blue', icon: 'bi-file-text' };
        return <span className={`ea-badge ${m.cls}`}><i className={`bi ${m.icon}`}></i>{m.label}</span>;
      },
    },
    {
      name: 'Action',
      selector: (r) => r.event,
      sortable: true,
      width: '140px',
      cell: (r) => {
        const e = EVENT_BADGE[r.event] || { cls: 'ea-badge-blue', label: r.event, icon: 'bi-activity' };
        return <span className={`ea-badge ${e.cls}`}><i className={`bi ${e.icon}`}></i>{e.label}</span>;
      },
    },
    {
      name: 'Détails',
      grow: 2,
      cell: (r) => <Diff event={r.event} oldValues={r.old_values} newValues={r.new_values} />,
    },
  ];

  const data = historique.filter((h) => {
    const matchEvent = !filtreEvent || h.event === filtreEvent;
    const matchFilter = !filter
      || h.user?.username?.toLowerCase().includes(filter.toLowerCase())
      || h.auditable_type?.toLowerCase().includes(filter.toLowerCase())
      || h.event?.toLowerCase().includes(filter.toLowerCase());
    return matchEvent && matchFilter;
  });

  return (
    <div className="ea-table-page">
      <div className="ea-table-page-header">
        <div className="ea-table-page-title">
          <i className="bi bi-clock-history text-primary"></i>
          Journal d'audit
          <span className="ea-badge ea-badge-blue ms-1">{historique.length}</span>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <select
            className="form-select form-select-sm"
            style={{ width: 160 }}
            value={filtreEvent}
            onChange={(e) => setFiltreEvent(e.target.value)}
          >
            <option value="">Toutes les actions</option>
            <option value="created">Créations</option>
            <option value="updated">Modifications</option>
            <option value="deleted">Suppressions</option>
          </select>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: 220 }}
            placeholder="🔍 Utilisateur, module…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={colonnes}
        data={data}
        customStyles={DT_STYLES}
        pagination
        highlightOnHover
        progressPending={loading}
        progressComponent={<div className="py-5 text-center"><span className="spinner-border text-primary"></span></div>}
        noDataComponent={<div className="py-5 text-center text-muted small">Aucune entrée dans le journal.</div>}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        defaultSortFieldId={1}
        defaultSortAsc={false}
      />
    </div>
  );
}

export default Historique;
