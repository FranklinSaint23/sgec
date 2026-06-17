import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Villes principales du Cameroun avec coordonnées [lat, lng]
const VILLES = {
  'bafoussam': [5.4764, 10.1594],
  'yaoundé': [3.8480, 11.5021], 'yaounde': [3.8480, 11.5021],
  'douala': [4.0511, 9.7679],
  'mbouda': [5.6333, 10.2833],
  'foumban': [5.7167, 10.9000],
  'bamenda': [5.9597, 10.1459],
  'ngaoundéré': [7.3167, 13.5833], 'ngaoundere': [7.3167, 13.5833],
  'garoua': [9.3000, 13.3833],
  'maroua': [10.5833, 14.3167],
  'bertoua': [4.5833, 13.6833],
  'ebolowa': [2.9000, 11.1500],
  'kribi': [2.9500, 9.9167],
  'buea': [4.1560, 9.2376],
  'limbe': [4.0167, 9.2000],
  'dschang': [5.4500, 10.0500],
  'baham': [5.3667, 10.3833],
  'bangangté': [5.1500, 10.5167], 'bangante': [5.1500, 10.5167],
};

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
          + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findVille(hint) {
  const n = normalize(hint);
  return Object.entries(VILLES).find(([k]) => n.includes(k))?.[1] || null;
}

// Sous-composants Leaflet (doivent être déclarés en dehors du rendu)
function PinPlacer({ position, onPlace }) {
  useMapEvents({ click: (e) => onPlace([e.latlng.lat, e.latlng.lng]) });
  return position
    ? <CircleMarker center={position} radius={9} pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }} />
    : null;
}

function AutoCenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 14, { animate: true }); }, [center]);
  return null;
}

export default function LocationPicker({ value, onChange, cityHint, label = 'Localiser sur la carte (optionnel)' }) {
  const [open,       setOpen]       = useState(false);
  const [position,   setPosition]   = useState(value ? [value.lat, value.lng] : null);
  const [mapCenter,  setMapCenter]  = useState([5.4764, 10.1594]);
  const [geoWarning, setGeoWarning] = useState({ msg: '', level: '' });

  // Centrer la carte sur la ville tapée
  useEffect(() => {
    const coords = findVille(cityHint || '');
    if (coords) setMapCenter(coords);
  }, [cityHint]);

  // Validation géographique
  useEffect(() => {
    if (!position || !cityHint) { setGeoWarning({ msg: '', level: '' }); return; }
    const villeCoords = findVille(cityHint);
    if (!villeCoords) return;
    const dist = distanceKm(position[0], position[1], villeCoords[0], villeCoords[1]);
    if (dist > 100) {
      setGeoWarning({ msg: `Coordonnées éloignées de "${cityHint}" (${Math.round(dist)} km) — vérifier`, level: 'danger' });
    } else if (dist > 30) {
      setGeoWarning({ msg: `Coordonnées à ${Math.round(dist)} km de "${cityHint}"`, level: 'warning' });
    } else {
      setGeoWarning({ msg: `Localisation cohérente avec "${cityHint}"`, level: 'success' });
    }
  }, [position, cityHint]);

  const handlePlace = (pos) => {
    setPosition(pos);
    onChange({ lat: pos[0], lng: pos[1] });
  };

  const handleClear = () => {
    setPosition(null);
    onChange(null);
    setGeoWarning({ msg: '', level: '' });
  };

  const autoPlace = () => {
    const coords = findVille(cityHint || '');
    if (coords) { handlePlace(coords); setOpen(true); }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            flex: 1, background: position ? '#f0fdf4' : '#f8fafc',
            border: `1px dashed ${position ? '#22c55e' : '#cbd5e1'}`,
            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            color: position ? '#16a34a' : '#64748b', fontSize: '.84rem',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <i className={`bi bi-${position ? 'geo-alt-fill' : 'geo-alt'}`}></i>
          {position
            ? `Localisé : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
            : label}
          <i className={`bi bi-chevron-${open ? 'up' : 'down'} ms-auto`}></i>
        </button>

        {cityHint && !position && (
          <button type="button" onClick={autoPlace}
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: '#3b82f6', fontSize: '.8rem', whiteSpace: 'nowrap' }}
            title={`Centrer sur ${cityHint}`}
          >
            <i className="bi bi-crosshair me-1"></i>Auto
          </button>
        )}
      </div>

      {/* Alerte géographique */}
      {geoWarning.msg && (
        <div style={{ marginTop: 4, fontSize: '.78rem', padding: '3px 10px', borderRadius: 6,
          color: geoWarning.level === 'danger' ? '#dc2626' : geoWarning.level === 'warning' ? '#d97706' : '#16a34a',
          background: geoWarning.level === 'danger' ? '#fef2f2' : geoWarning.level === 'warning' ? '#fffbeb' : '#f0fdf4',
        }}>
          <i className={`bi bi-${geoWarning.level === 'success' ? 'check-circle' : 'exclamation-triangle'} me-1`}></i>
          {geoWarning.msg}
        </div>
      )}

      {/* Mini carte */}
      {open && (
        <div style={{ marginTop: 6, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '5px 12px', background: '#f8fafc', fontSize: '.78rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><i className="bi bi-cursor me-1"></i>Clique sur la carte pour placer le marqueur</span>
            {position && (
              <button type="button" onClick={handleClear}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '.78rem' }}>
                <i className="bi bi-x-circle me-1"></i>Effacer
              </button>
            )}
          </div>
          <MapContainer center={mapCenter} zoom={13} style={{ height: 260, width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AutoCenter center={mapCenter} />
            <PinPlacer position={position} onPlace={handlePlace} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}
