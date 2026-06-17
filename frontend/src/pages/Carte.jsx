import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

const TYPES = {
  naissance: { color: '#22c55e', label: 'Naissances', icon: 'bi-heart-pulse' },
  deces:     { color: '#ef4444', label: 'Décès',      icon: 'bi-file-earmark-x' },
  mariage:   { color: '#f59e0b', label: 'Mariages',   icon: 'bi-hearts' },
};

// Composants Leaflet — DOIVENT être définis en dehors du composant principal
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function MapClickHandler({ proxMode, rayon, onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (proxMode) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Carte() {
  const [features,     setFeatures]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [layers,       setLayers]       = useState({ naissance: true, deces: true, mariage: true });
  const [stats,        setStats]        = useState({ naissance: 0, deces: 0, mariage: 0 });
  const [search,       setSearch]       = useState('');
  const [rayon,        setRayon]        = useState(5000);
  const [proxMode,     setProxMode]     = useState(false);
  const [proxResults,  setProxResults]  = useState([]);
  const [proxLoading,  setProxLoading]  = useState(false);
  const [clickPos,     setClickPos]     = useState(null);

  const CENTER = [5.4764, 10.1594];

  useEffect(() => {
    api.get('/carte/tous')
      .then(res => {
        const feats = res.data.features || [];
        setFeatures(feats);
        setStats({
          naissance: feats.filter(f => f.properties.type === 'naissance').length,
          deces:     feats.filter(f => f.properties.type === 'deces').length,
          mariage:   feats.filter(f => f.properties.type === 'mariage').length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMapClick = async (lat, lng) => {
    setClickPos({ lat, lng });
    setProxLoading(true);
    try {
      const res = await api.get('/carte/proximite', { params: { lat, lng, rayon } });
      setProxResults(res.data.data?.features || []);
    } catch (err) {
      console.error(err);
    } finally {
      setProxLoading(false);
    }
  };

  const toggleLayer = (type) => setLayers(l => ({ ...l, [type]: !l[type] }));

  const filtered = features.filter(f => {
    if (!layers[f.properties.type]) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return f.properties.nom?.toLowerCase().includes(q)
        || f.properties.numero_acte?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Stats / couches */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Object.entries(TYPES).map(([type, cfg]) => (
          <div key={type} onClick={() => toggleLayer(type)} style={{
            flex: 1, minWidth: 130,
            background: layers[type] ? cfg.color : '#e2e8f0',
            color: layers[type] ? '#fff' : '#64748b',
            borderRadius: 12, padding: '10px 16px', cursor: 'pointer',
            transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: layers[type] ? `0 4px 12px ${cfg.color}55` : 'none',
          }}>
            <i className={`bi ${cfg.icon}`} style={{ fontSize: '1.4rem' }}></i>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{stats[type]}</div>
              <div style={{ fontSize: '.73rem', opacity: .85 }}>{cfg.label}</div>
            </div>
          </div>
        ))}

        {/* Recherche */}
        <div style={{ flex: 2, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '8px 14px', border: '1px solid #e2e8f0' }}>
          <i className="bi bi-search" style={{ color: '#94a3b8' }}></i>
          <input
            type="text"
            placeholder="Nom ou numéro d'acte..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '.88rem', background: 'transparent' }}
          />
          {search && <i className="bi bi-x" style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSearch('')}></i>}
        </div>
      </div>

      {/* Toolbar proximité */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${proxMode ? 'btn-danger' : 'btn-outline-primary'}`}
          onClick={() => { setProxMode(p => !p); setProxResults([]); setClickPos(null); }}
        >
          <i className={`bi bi-${proxMode ? 'x-circle' : 'geo-alt'} me-1`}></i>
          {proxMode ? 'Annuler' : 'Recherche par proximité'}
        </button>

        {proxMode && (
          <>
            <select className="form-select form-select-sm" style={{ width: 100 }}
              value={rayon} onChange={e => setRayon(Number(e.target.value))}>
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
            <span style={{ fontSize: '.8rem', color: '#f59e0b', fontWeight: 600 }}>
              <i className="bi bi-cursor me-1"></i>
              Clique sur la carte pour chercher dans ce rayon
            </span>
          </>
        )}
        {proxLoading && <span className="spinner-border spinner-border-sm text-primary ms-1"></span>}
        <span style={{ marginLeft: 'auto', fontSize: '.8rem', color: '#94a3b8' }}>
          {filtered.length} acte(s) affiché(s)
        </span>
      </div>

      {/* Résultats proximité */}
      {proxMode && proxResults.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 12, maxHeight: 130, overflowY: 'auto' }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
            {proxResults.length} acte(s) dans un rayon de {(rayon / 1000).toFixed(0)} km
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {proxResults.map((f, i) => {
              const cfg = TYPES[f.properties.type] || {};
              return (
                <span key={i} style={{ background: cfg.color + '22', color: cfg.color, borderRadius: 20, padding: '2px 10px', fontSize: '.76rem', fontWeight: 600 }}>
                  {f.properties.numero_acte} — {f.properties.nom}
                  {f.properties.distance_m != null && (
                    <span style={{ opacity: .7 }}> ({(f.properties.distance_m / 1000).toFixed(2)} km)</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Carte Leaflet — hauteur fixe obligatoire */}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="spinner-border text-primary"></div>
          </div>
        )}

        <MapContainer
          center={CENTER}
          zoom={13}
          style={{ height: '520px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap center={CENTER} />
          <MapClickHandler proxMode={proxMode} rayon={rayon} onMapClick={handleMapClick} />

          {/* Cercle de proximité */}
          {clickPos && (
            <CircleMarker
              center={[clickPos.lat, clickPos.lng]}
              radius={Math.min(rayon / 400, 60)}
              pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.1, weight: 2, dashArray: '6 4' }}
            >
              <Popup>Centre — rayon {(rayon / 1000).toFixed(0)} km</Popup>
            </CircleMarker>
          )}

          {/* Points des actes */}
          {filtered.map((f, i) => {
            const [lng, lat] = f.geometry.coordinates;
            const cfg = TYPES[f.properties.type] || { color: '#94a3b8', label: '', icon: '' };
            return (
              <CircleMarker
                key={i}
                center={[lat, lng]}
                radius={9}
                pathOptions={{ color: '#fff', fillColor: cfg.color, fillOpacity: 0.9, weight: 2 }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, color: cfg.color, marginBottom: 4 }}>
                      <i className={`bi ${cfg.icon} me-1`}></i>{cfg.label}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '.92rem' }}>{f.properties.nom}</div>
                    <div style={{ fontSize: '.82rem', color: '#64748b' }}>N° {f.properties.numero_acte}</div>
                    {f.properties.date_label && (
                      <div style={{ fontSize: '.82rem', color: '#64748b' }}>{f.properties.date_label}</div>
                    )}
                    {f.properties.sexe && (
                      <div style={{ fontSize: '.82rem', color: '#64748b' }}>
                        {f.properties.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
        {Object.entries(TYPES).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: '#475569' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: cfg.color, border: '2px solid #fff', boxShadow: '0 0 0 1px ' + cfg.color, display: 'inline-block' }}></span>
            {cfg.label}
          </div>
        ))}
      </div>

    </div>
  );
}
