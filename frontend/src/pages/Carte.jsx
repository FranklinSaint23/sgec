import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
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

function MapClickHandler({ proxMode, onMapClick }) {
  useMapEvents({
    click: (e) => { if (proxMode) onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function Carte() {
  const [features,    setFeatures]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [layers,      setLayers]      = useState({ naissance: true, deces: true, mariage: true });
  const [stats,       setStats]       = useState({ naissance: 0, deces: 0, mariage: 0 });
  const [geoStats,       setGeoStats]       = useState(null);
  const [statsOpen,      setStatsOpen]      = useState(false);
  const [heatmap,        setHeatmap]        = useState(false);
  const [shapeData,      setShapeData]      = useState(null);
  const [shapeVisible,   setShapeVisible]   = useState(false);
  const [shapeLoading,   setShapeLoading]   = useState(false);
  const [shapeError,     setShapeError]     = useState('');
  const [search,         setSearch]         = useState('');
  const [rayon,          setRayon]          = useState(5000);
  const [proxMode,       setProxMode]       = useState(false);
  const [proxResults,    setProxResults]    = useState([]);
  const [proxLoading,    setProxLoading]    = useState(false);
  const [clickPos,       setClickPos]       = useState(null);

  // Centre Cameroun, zoom pays
  const CENTER = [5.5, 12.3];
  const ZOOM   = 6;

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

  const loadShapefiles = async () => {
    if (shapeData) { setShapeVisible(v => !v); return; }
    setShapeLoading(true);
    setShapeError('');
    try {
      // GeoJSON des régions du Cameroun — GADM niveau 1 (simplifié)
      const url = 'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson';
      // Utiliser les données GADM Cameroun niveau 1
      const res = await fetch('https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_CMR_1.json');
      if (!res.ok) throw new Error('Fichier non disponible');
      const data = await res.json();
      setShapeData(data);
      setShapeVisible(true);
    } catch {
      setShapeError('Impossible de charger les limites (connexion requise). Placer le fichier gadm41_CMR_1.json dans public/');
    } finally {
      setShapeLoading(false);
    }
  };

  const shapeStyle = useCallback((feature) => ({
    fillColor: '#6366f1',
    fillOpacity: 0.08,
    color: '#6366f1',
    weight: 1.5,
    dashArray: '4 3',
  }), []);

  const onEachRegion = useCallback((feature, layer) => {
    const name = feature.properties?.NAME_1 || feature.properties?.name || '';
    if (name) layer.bindTooltip(name, { permanent: false, direction: 'center', className: 'region-tooltip' });
  }, []);

  const loadGeoStats = () => {
    if (geoStats) { setStatsOpen(o => !o); return; }
    api.get('/carte/stats')
      .then(res => { setGeoStats(res.data); setStatsOpen(true); })
      .catch(console.error);
  };

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

      {/* Badges couches + recherche */}
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

      {/* Toolbar outils */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Proximité */}
        <button
          className={`btn btn-sm ${proxMode ? 'btn-danger' : 'btn-outline-primary'}`}
          onClick={() => { setProxMode(p => !p); setProxResults([]); setClickPos(null); }}
        >
          <i className={`bi bi-${proxMode ? 'x-circle' : 'geo-alt'} me-1`}></i>
          {proxMode ? 'Annuler' : 'Par proximité'}
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
              <i className="bi bi-cursor me-1"></i>Clique sur la carte
            </span>
          </>
        )}
        {proxLoading && <span className="spinner-border spinner-border-sm text-primary"></span>}

        {/* Heatmap */}
        <button
          className={`btn btn-sm ${heatmap ? 'btn-warning' : 'btn-outline-secondary'}`}
          onClick={() => setHeatmap(h => !h)}
          title="Mode densité / points"
        >
          <i className={`bi bi-${heatmap ? 'fire' : 'grid-3x3-gap'} me-1`}></i>
          {heatmap ? 'Densité' : 'Points'}
        </button>

        {/* Shapefiles */}
        <button
          className={`btn btn-sm ${shapeVisible ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={loadShapefiles}
          disabled={shapeLoading}
          title="Limites administratives"
        >
          {shapeLoading
            ? <><span className="spinner-border spinner-border-sm me-1"></span>Chargement…</>
            : <><i className="bi bi-map-fill me-1"></i>Limites régions</>
          }
        </button>

        {/* Stats géo */}
        <button
          className={`btn btn-sm ${statsOpen ? 'btn-info' : 'btn-outline-info'}`}
          onClick={loadGeoStats}
          title="Statistiques géolocalisées"
        >
          <i className="bi bi-bar-chart-map me-1"></i>Géo-stats
        </button>

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

      {/* Panneau géo-statistiques */}
      {statsOpen && geoStats && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#334155' }}>
              <i className="bi bi-bar-chart-map me-2 text-info"></i>Statistiques géolocalisées
            </span>
            <button onClick={() => setStatsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Totaux */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.entries(TYPES).map(([type, cfg]) => (
              <div key={type} style={{ flex: 1, minWidth: 80, background: cfg.color + '18', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: cfg.color }}>{geoStats.totaux[type]}</div>
                <div style={{ fontSize: '.73rem', color: '#64748b' }}>{cfg.label}</div>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 80, background: '#6366f118', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#6366f1' }}>{geoStats.totaux.total}</div>
              <div style={{ fontSize: '.73rem', color: '#64748b' }}>Total</div>
            </div>
          </div>

          {/* Zones les plus denses */}
          {geoStats.zones?.length > 0 && (
            <>
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Zones les plus actives</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                {geoStats.zones.slice(0, 8).map((z, i) => {
                  const cfg = TYPES[z.type] || { color: '#94a3b8', label: z.type };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }}></span>
                      <span style={{ color: '#64748b' }}>{z.lat_zone}°N {z.lng_zone}°E</span>
                      <span style={{ color: cfg.color, fontWeight: 600, marginLeft: 'auto' }}>{z.total} {cfg.label.toLowerCase()}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Carte Leaflet */}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="spinner-border text-primary"></div>
          </div>
        )}

        {heatmap && (
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 500, background: '#fff9', borderRadius: 8, padding: '4px 10px', fontSize: '.75rem', color: '#d97706', fontWeight: 700, border: '1px solid #fbbf24' }}>
            <i className="bi bi-fire me-1"></i>Mode densité activé
          </div>
        )}

        {shapeError && (
          <div style={{ fontSize: '.78rem', color: '#d97706', background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, padding: '6px 12px', marginBottom: 6 }}>
            <i className="bi bi-exclamation-triangle me-1"></i>{shapeError}
          </div>
        )}

        <MapContainer center={CENTER} zoom={ZOOM} style={{ height: '560px', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Couche shapefiles régions */}
          {shapeVisible && shapeData && (
            <GeoJSON
              key="regions-cmr"
              data={shapeData}
              style={shapeStyle}
              onEachFeature={onEachRegion}
            />
          )}

          <RecenterMap center={CENTER} />
          <MapClickHandler proxMode={proxMode} onMapClick={handleMapClick} />

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

          {/* Points ou heatmap */}
          {filtered.map((f, i) => {
            const [lng, lat] = f.geometry.coordinates;
            const cfg = TYPES[f.properties.type] || { color: '#94a3b8', label: '', icon: '' };

            if (heatmap) {
              return (
                <CircleMarker
                  key={i}
                  center={[lat, lng]}
                  radius={28}
                  pathOptions={{ stroke: false, fillColor: cfg.color, fillOpacity: 0.15 }}
                />
              );
            }

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
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries(TYPES).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: '#475569' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: cfg.color, border: '2px solid #fff', boxShadow: '0 0 0 1px ' + cfg.color, display: 'inline-block' }}></span>
            {cfg.label}
          </div>
        ))}
        {heatmap && (
          <div style={{ fontSize: '.78rem', color: '#d97706' }}>
            <i className="bi bi-info-circle me-1"></i>
            Mode densité : superposition des zones pour visualiser les concentrations
          </div>
        )}
      </div>

    </div>
  );
}
