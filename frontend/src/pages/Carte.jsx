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
  const [shapeData,      setShapeData]      = useState({});
  const [shapeVisible,   setShapeVisible]   = useState(false);
  const [shapeLoading,   setShapeLoading]   = useState(false);
  const [shapeError,     setShapeError]     = useState('');
  const [zoneStats,      setZoneStats]      = useState({});   // { regions: {nom: {total,naissance,...}} }
  const [choroplType,    setChoroplType]    = useState('total'); // total|naissance|deces|mariage
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

  const SHAPE_LAYERS = {
    regions:          { file: `${process.env.PUBLIC_URL}/regions_cmr.geojson`,          label: 'Régions',          color: '#6366f1' },
    departements:     { file: `${process.env.PUBLIC_URL}/departements_cmr.geojson`,     label: 'Départements',     color: '#0ea5e9' },
    arrondissements:  { file: `${process.env.PUBLIC_URL}/arrondissements_cmr.geojson`,  label: 'Arrondissements',  color: '#10b981' },
  };

  const [activeLayer,  setActiveLayer]  = useState('regions');

  const loadShapefiles = async (layer = activeLayer) => {
    // Si même couche active et déjà chargée → toggle visibilité
    if (layer === activeLayer && shapeData[layer]) {
      setShapeVisible(v => !v);
      return;
    }
    setActiveLayer(layer);
    setShapeLoading(true);
    setShapeError('');
    try {
      // Charger GeoJSON et stats en parallèle
      const [geoRes, statsRes] = await Promise.all([
        shapeData[layer] ? Promise.resolve(null) : fetch(SHAPE_LAYERS[layer].file),
        zoneStats[layer]  ? Promise.resolve(null) : api.get('/carte/stats-par-zone', { params: { niveau: layer } }),
      ]);

      if (geoRes) {
        if (!geoRes.ok) throw new Error('Fichier GeoJSON introuvable');
        const data = await geoRes.json();
        setShapeData(prev => ({ ...prev, [layer]: data }));
      }

      if (statsRes) {
        // Indexer par nom de zone pour accès O(1)
        const idx = {};
        (statsRes.data.zones || []).forEach(z => { idx[z.nom] = z; });
        setZoneStats(prev => ({ ...prev, [layer]: { index: idx, max: statsRes.data.max || 1 } }));
      }

      setShapeVisible(true);
    } catch (e) {
      setShapeError(`Impossible de charger ${SHAPE_LAYERS[layer].label} : ${e.message}`);
    } finally {
      setShapeLoading(false);
    }
  };

  // Interpolation de couleur blanche → couleur de la couche selon intensité 0-1
  const interpolateColor = (intensity, baseColor) => {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    const ri = Math.round(255 + (r - 255) * intensity);
    const gi = Math.round(255 + (g - 255) * intensity);
    const bi = Math.round(255 + (b - 255) * intensity);
    return `rgb(${ri},${gi},${bi})`;
  };

  const shapeStyle = useCallback((feature) => {
    const p        = feature?.properties || {};
    const nomZone  = p.nom_arr || p.nom_dep || p.nom_reg || '';
    const baseColor = SHAPE_LAYERS[activeLayer]?.color || '#6366f1';
    const stats    = zoneStats[activeLayer];
    let fillOpacity = 0.1;
    let fillColor   = baseColor;

    if (stats && nomZone) {
      const z    = stats.index[nomZone];
      const val  = z ? (z[choroplType] ?? z.total ?? 0) : 0;
      const maxV = stats.max || 1;
      const intensity = val > 0 ? 0.15 + (val / maxV) * 0.75 : 0.04;
      fillColor   = interpolateColor(intensity, baseColor);
      fillOpacity = val > 0 ? 0.75 : 0.08;
    }

    return { fillColor, fillOpacity, color: baseColor, weight: 1.2, dashArray: '4 3' };
  }, [activeLayer, zoneStats, choroplType]);

  const onEachFeature = useCallback((feature, leafletLayer) => {
    const p       = feature.properties || {};
    const nomZone = p.nom_arr || p.nom_dep || p.nom_reg || '';
    const sub     = p.nom_arr ? ` — ${p.nom_dep || ''}` : (p.nom_dep ? ` — ${p.nom_reg || ''}` : '');
    const stats   = zoneStats[activeLayer]?.index?.[nomZone];

    let tooltip = `<strong>${nomZone}</strong>${sub}`;
    if (stats) {
      tooltip += `<br><span style="color:#22c55e">Naissances : ${stats.naissance}</span>`;
      tooltip += `<br><span style="color:#ef4444">Décès : ${stats.deces}</span>`;
      tooltip += `<br><span style="color:#f59e0b">Mariages : ${stats.mariage}</span>`;
      tooltip += `<br><strong>Total : ${stats.total}</strong>`;
    }
    leafletLayer.bindTooltip(tooltip, { permanent: false, direction: 'center', sticky: true });
  }, [activeLayer, zoneStats]);

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

        {/* Shapefiles + choroplèthe */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', borderRadius: 8, padding: '4px 8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '.75rem', color: '#94a3b8', marginRight: 2 }}>Limites :</span>
          {Object.entries(SHAPE_LAYERS).map(([key, cfg]) => (
            <button key={key}
              className={`btn btn-sm ${shapeVisible && activeLayer === key ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ fontSize: '.78rem', padding: '2px 10px' }}
              onClick={() => loadShapefiles(key)}
              disabled={shapeLoading}
              title={`Afficher les ${cfg.label}`}
            >
              {shapeLoading && activeLayer === key
                ? <span className="spinner-border spinner-border-sm"></span>
                : cfg.label}
            </button>
          ))}

          {/* Sélecteur type choroplèthe — visible quand une couche est active */}
          {shapeVisible && (
            <>
              <span style={{ fontSize: '.75rem', color: '#94a3b8', margin: '0 4px' }}>par :</span>
              {[['total','Total'],['naissance','Naissances'],['deces','Décès'],['mariage','Mariages']].map(([v, lbl]) => (
                <button key={v}
                  className={`btn btn-sm ${choroplType === v ? 'btn-dark' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '.75rem', padding: '2px 8px' }}
                  onClick={() => setChoroplType(v)}
                >
                  {lbl}
                </button>
              ))}
            </>
          )}
        </div>

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

          {/* Couche shapefiles choroplèthe */}
          {shapeVisible && shapeData?.[activeLayer] && (
            <GeoJSON
              key={`${activeLayer}-${choroplType}-${zoneStats[activeLayer]?.max ?? 0}`}
              data={shapeData[activeLayer]}
              style={shapeStyle}
              onEachFeature={onEachFeature}
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
