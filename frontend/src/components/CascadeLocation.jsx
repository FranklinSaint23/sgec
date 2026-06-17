import { useEffect } from 'react';
import { REGIONS, DEPARTEMENTS, ARRONDISSEMENTS, centreDEtat } from '../data/camerounAdmin';

/**
 * Sélecteurs en cascade : Région → Département → Arrondissement → Centre d'état civil
 * Appelle onChange({ province, departement, arrondissement, centre }) à chaque changement.
 */
export default function CascadeLocation({ values = {}, onChange }) {
  const { province = '', departement = '', arrondissement = '', centre = '' } = values;

  const depts  = DEPARTEMENTS(province);
  const arrs   = ARRONDISSEMENTS(province, departement);

  // Réinitialiser les niveaux inférieurs quand le parent change
  useEffect(() => {
    if (province && !depts.includes(departement)) {
      onChange({ province, departement: '', arrondissement: '', centre: '' });
    }
  }, [province]);

  useEffect(() => {
    if (departement && !arrs.includes(arrondissement)) {
      onChange({ province, departement, arrondissement: '', centre: '' });
    }
  }, [departement]);

  const handleRegion = (e) => {
    onChange({ province: e.target.value, departement: '', arrondissement: '', centre: '' });
  };

  const handleDept = (e) => {
    onChange({ province, departement: e.target.value, arrondissement: '', centre: '' });
  };

  const handleArr = (e) => {
    const arr = e.target.value;
    onChange({ province, departement, arrondissement: arr, centre: centreDEtat(arr) });
  };

  const handleCentre = (e) => {
    onChange({ province, departement, arrondissement, centre: e.target.value });
  };

  const selectStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    fontSize: '.88rem',
    color: '#334155',
    appearance: 'auto',
  };

  const disabledStyle = { ...selectStyle, background: '#f8fafc', color: '#94a3b8' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>

      {/* Région */}
      <div>
        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
          Région <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select style={selectStyle} value={province} onChange={handleRegion} required>
          <option value="">— Sélectionner —</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Département */}
      <div>
        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
          Département <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          style={province ? selectStyle : disabledStyle}
          value={departement}
          onChange={handleDept}
          disabled={!province}
          required
        >
          <option value="">— Sélectionner —</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Arrondissement */}
      <div>
        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
          Arrondissement <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          style={departement ? selectStyle : disabledStyle}
          value={arrondissement}
          onChange={handleArr}
          disabled={!departement}
          required
        >
          <option value="">— Sélectionner —</option>
          {arrs.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Centre d'état civil */}
      <div>
        <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
          Centre d'état civil <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          style={arrondissement ? selectStyle : disabledStyle}
          value={centre}
          onChange={handleCentre}
          disabled={!arrondissement}
          placeholder="Mairie de …"
          required
        />
      </div>

      {/* Indicateur de saisie complète */}
      {province && departement && arrondissement && centre && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: '#16a34a', background: '#f0fdf4', borderRadius: 8, padding: '6px 12px' }}>
          <i className="bi bi-check-circle-fill"></i>
          <span><strong>{arrondissement}</strong> — {departement} — Région {province}</span>
        </div>
      )}
    </div>
  );
}
