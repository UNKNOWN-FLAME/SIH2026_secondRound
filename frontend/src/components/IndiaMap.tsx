/**
 * IndiaMap — Interactive geographic map for LMIS Command Dashboard
 *
 * Uses Leaflet + react-leaflet with real GeoJSON boundary data.
 *
 * GeoJSON source: github.com/geohacker/india (MIT License)
 * Files required in /public/geo/:
 *   india-states.geojson    — properties: NAME_1 (state name), ID_1 (state ID)
 *   india-districts.geojson — properties: NAME_1 (state), NAME_2 (district), ID_1, ID_2
 *
 * See src/mock/demoData.ts → GEO_DATA_DOCS for asset source details.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLMIS } from '../context/LMISContext';
import { DEMO_ALERTS, SEVERITY_META, classifySeverity } from '../mock/demoData';
import { Layers, AlertTriangle, Loader, MapPin } from 'lucide-react';

// Fix Leaflet default icon paths broken by Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Types ───────────────────────────────────────────────────────────────────

type MapLayer = 'mismatch' | 'industrial';

interface GeoFeature {
  type: string;
  properties: Record<string, string | number | null>;
  geometry: Record<string, unknown>;
}

interface GeoData {
  type: string;
  features: GeoFeature[];
}

// ─── State name → internal code mapping ──────────────────────────────────────
// Maps GeoJSON NAME_1 values to 2-letter codes used in demo data

const STATE_NAME_TO_CODE: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Orissa': 'OR',
  'Odisha': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttaranchal': 'UK',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',
  'Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Andaman and Nicobar': 'AN',
  'Chandigarh': 'CH',
  'Puducherry': 'PY',
  'Lakshadweep': 'LD',
  'Dadra and Nagar Haveli': 'DN',
  'Daman and Diu': 'DD',
};

// ─── Colour helpers ──────────────────────────────────────────────────────────

const STATE_DEMO_RATIOS: Record<string, number> = {
  MH: 2.1, GJ: 1.7, KA: 1.4, TN: 1.1, UP: 1.8, RJ: 0.35,
  MP: 0.9, WB: 1.3, AP: 1.5, HR: 1.6, PB: 0.7, TG: 1.2,
  OR: 0.85, CG: 0.65, JH: 0.55, UK: 0.95, HP: 0.45, AS: 0.78,
  BR: 0.42, KL: 0.88, GA: 1.05, MN: 0.62, TR: 0.75, NL: 0.68,
  SK: 0.91, AR: 0.58, MZ: 0.71, ML: 0.83,
};

const STATE_INDUSTRIAL_INTENSITY: Record<string, number> = {
  MH: 0.95, GJ: 0.88, KA: 0.82, TN: 0.79, UP: 0.74, HR: 0.71,
  AP: 0.65, TG: 0.70, WB: 0.60, MP: 0.50, RJ: 0.55, PB: 0.52,
  OR: 0.45, CG: 0.40, JH: 0.42, UK: 0.30, HP: 0.25, BR: 0.22,
  KL: 0.48, GA: 0.55, AS: 0.35,
};

function mismatchColour(ratio: number | undefined): string {
  if (ratio === undefined) return '#1e2940';
  const sev = classifySeverity(ratio);
  return SEVERITY_META[sev].color;
}

function industrialColour(intensity: number | undefined): string {
  if (intensity === undefined) return '#1e2940';
  if (intensity >= 0.8) return '#22d3ee';
  if (intensity >= 0.5) return '#0ea5e9';
  if (intensity >= 0.2) return '#1d4ed8';
  return '#1e293b';
}

// ─── Map view controller ─────────────────────────────────────────────────────

function MapViewController({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
  }, [bounds, map]);
  return null;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipInfo {
  name: string;
  stateCode?: string;
  ratio?: number;
  industrial?: number;
  demand?: number;
  supply?: number;
  layer: MapLayer;
  x: number;
  y: number;
}

function MapTooltip({ info }: { info: TooltipInfo | null }) {
  if (!info) return null;
  const sev = info.ratio !== undefined ? classifySeverity(info.ratio) : null;
  return (
    <div style={{
      position: 'absolute',
      left: Math.min(info.x + 12, window.innerWidth - 240),
      top: info.y - 10,
      zIndex: 1000,
      background: '#0f1117',
      border: '1px solid #2e3350',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      color: '#e2e8f0',
      pointerEvents: 'none',
      maxWidth: 230,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#fff' }}>{info.name}</div>
      {info.layer === 'mismatch' ? (
        <>
          {info.ratio !== undefined ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#94a3b8' }}>Demand</span>
                <span>{info.demand?.toLocaleString('en-IN') ?? '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#94a3b8' }}>Supply</span>
                <span>{info.supply?.toLocaleString('en-IN') ?? '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#94a3b8' }}>D/S Ratio</span>
                <span style={{ fontWeight: 600 }}>{info.ratio.toFixed(2)}×</span>
              </div>
              {sev && (
                <div style={{ marginTop: 6, padding: '2px 8px', borderRadius: 4, background: `${SEVERITY_META[sev].color}22`, color: SEVERITY_META[sev].color, fontWeight: 600, fontSize: 11 }}>
                  {SEVERITY_META[sev].label}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#64748b' }}>No mismatch data available</div>
          )}
        </>
      ) : (
        <>
          {info.industrial !== undefined ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#94a3b8' }}>Industrial Index</span>
                <span style={{ color: '#22d3ee', fontWeight: 600 }}>{(info.industrial * 100).toFixed(0)}%</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>Relative intensity — demo scale</div>
            </>
          ) : (
            <div style={{ color: '#64748b' }}>No industrial data available</div>
          )}
        </>
      )}
      <div style={{ marginTop: 6, fontSize: 10, color: '#475569', borderTop: '1px solid #2e3350', paddingTop: 4 }}>
        ⚠ Demo data — not verified statistics
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function MapLegend({ layer }: { layer: MapLayer }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 36,
      right: 12,
      zIndex: 1000,
      background: 'rgba(15,17,23,0.93)',
      border: '1px solid #2e3350',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 11,
      color: '#94a3b8',
      pointerEvents: 'none',
    }}>
      {layer === 'mismatch' ? (
        <>
          <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Labour Mismatch (D/S)</div>
          {[
            { label: '≥1.60 — Acute Shortage', color: '#ef4444', pat: '███' },
            { label: '1.25–1.60 — Elevated', color: '#f97316', pat: '███' },
            { label: '0.80–1.25 — Balanced', color: '#10b981', pat: '███' },
            { label: '0.50–0.80 — Emerging Surplus', color: '#f59e0b', pat: '███' },
            { label: '<0.50 — Chronic Saturation', color: '#a78bfa', pat: '███' },
            { label: 'No data', color: '#1e2940', pat: '░░░' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ color: item.color, fontSize: 9, letterSpacing: -1 }}>{item.pat}</span>
              <span style={{ fontSize: 10 }}>{item.label}</span>
            </div>
          ))}
        </>
      ) : (
        <>
          <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Industrial Activity Index</div>
          {[
            { label: '≥80% Very High', color: '#22d3ee' },
            { label: '50–80% High', color: '#0ea5e9' },
            { label: '20–50% Moderate', color: '#1d4ed8' },
            { label: '<20% Low', color: '#1e293b' },
            { label: 'No data', color: '#1e2940' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ width: 12, height: 10, borderRadius: 2, background: item.color, display: 'inline-block', border: '1px solid #334155', flexShrink: 0 }} />
              <span style={{ fontSize: 10 }}>{item.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 9, color: '#475569' }}>Relative intensity — demo scale</div>
        </>
      )}
    </div>
  );
}

// ─── Main map ─────────────────────────────────────────────────────────────────

export default function IndiaMap({ height = 520 }: { height?: number }) {
  const { state, setJurisdiction, openDiagnostic } = useLMIS();
  const [activeLayer, setActiveLayer] = useState<MapLayer>('mismatch');
  const [statesGeo, setStatesGeo] = useState<GeoData | null>(null);
  const [districtsGeo, setDistrictsGeo] = useState<GeoData | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [selectedStateBounds, setSelectedStateBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isStateLevel = state.selectedJurisdiction.level === 'state';
  const selectedStateId1 = state.selectedJurisdiction.stateCode; // we store NAME_1 as stateCode here

  // Load GeoJSON
  useEffect(() => {
    setGeoLoading(true);
    setGeoError(null);

    Promise.all([
      fetch('/geo/india-states.geojson').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: india-states.geojson not found`);
        return r.json();
      }),
      fetch('/geo/india-districts.geojson').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([states, districts]) => {
      setStatesGeo(states);
      if (districts) setDistrictsGeo(districts);
    }).catch(err => {
      setGeoError(err.message);
    }).finally(() => setGeoLoading(false));
  }, []);

  const getStateStyle = useCallback((feature: GeoFeature | undefined): L.PathOptions => {
    const stateName = String(feature?.properties?.NAME_1 ?? '');
    const code = STATE_NAME_TO_CODE[stateName];
    const ratio = code ? STATE_DEMO_RATIOS[code] : undefined;
    const industrial = code ? STATE_INDUSTRIAL_INTENSITY[code] : undefined;
    const isSelected = state.selectedJurisdiction.stateName === stateName;

    const fillColor = activeLayer === 'mismatch' ? mismatchColour(ratio) : industrialColour(industrial);
    return {
      fillColor,
      fillOpacity: isSelected ? 0.88 : 0.68,
      color: isSelected ? '#cbd5e1' : '#1e293b',
      weight: isSelected ? 2 : 0.8,
    };
  }, [activeLayer, state.selectedJurisdiction.stateName]);

  const getDistrictStyle = useCallback((feature: GeoFeature | undefined): L.PathOptions => {
    const districtName = String(feature?.properties?.NAME_2 ?? '');
    const isSelected = state.selectedJurisdiction.districtName === districtName;
    const alert = DEMO_ALERTS.find(a => a.district === districtName);
    const stateName = String(feature?.properties?.NAME_1 ?? '');
    const code = STATE_NAME_TO_CODE[stateName];
    const ratio = alert?.ratio;
    const industrial = code ? STATE_INDUSTRIAL_INTENSITY[code] * (alert ? 0.9 : 0.5) : undefined;
    const fillColor = activeLayer === 'mismatch' ? mismatchColour(ratio) : industrialColour(industrial);

    return {
      fillColor,
      fillOpacity: isSelected ? 0.88 : 0.65,
      color: isSelected ? '#cbd5e1' : '#334155',
      weight: isSelected ? 2 : 0.6,
    };
  }, [activeLayer, state.selectedJurisdiction.districtName]);

  const onMouseMove = useCallback((e: L.LeafletMouseEvent, feature: GeoFeature, level: 'state' | 'district') => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const x = containerRect ? e.originalEvent.clientX - containerRect.left : 0;
    const y = containerRect ? e.originalEvent.clientY - containerRect.top : 0;

    if (level === 'state') {
      const stateName = String(feature.properties?.NAME_1 ?? '');
      const code = STATE_NAME_TO_CODE[stateName];
      const ratio = code ? STATE_DEMO_RATIOS[code] : undefined;
      const industrial = code ? STATE_INDUSTRIAL_INTENSITY[code] : undefined;
      const supply = 11400;
      setTooltip({ name: stateName, stateCode: code, ratio, industrial, demand: ratio !== undefined ? Math.round(supply * ratio) : undefined, supply: ratio !== undefined ? supply : undefined, layer: activeLayer, x, y });
    } else {
      const districtName = String(feature.properties?.NAME_2 ?? '');
      const stateName = String(feature.properties?.NAME_1 ?? '');
      const code = STATE_NAME_TO_CODE[stateName];
      const alert = DEMO_ALERTS.find(a => a.district === districtName);
      setTooltip({ name: districtName, stateCode: code, ratio: alert?.ratio, industrial: code ? STATE_INDUSTRIAL_INTENSITY[code] : undefined, demand: alert?.demand, supply: alert?.supply, layer: activeLayer, x, y });
    }
  }, [activeLayer]);

  const onStateClick = useCallback((e: L.LeafletMouseEvent, feature: GeoFeature) => {
    const stateName = String(feature.properties?.NAME_1 ?? '');
    const code = STATE_NAME_TO_CODE[stateName] ?? String(feature.properties?.ID_1 ?? '');
    setJurisdiction({ level: 'state', stateCode: code, stateName });
    const polygon = e.target as L.Polygon;
    setSelectedStateBounds(polygon.getBounds());
  }, [setJurisdiction]);

  const onDistrictClick = useCallback((feature: GeoFeature) => {
    const districtName = String(feature.properties?.NAME_2 ?? '');
    const stateName = String(feature.properties?.NAME_1 ?? '');
    const stateCode = STATE_NAME_TO_CODE[stateName] ?? String(feature.properties?.ID_1 ?? '');
    const districtCode = String(feature.properties?.ID_2 ?? districtName.toLowerCase().replace(/\s+/g, '-'));
    setJurisdiction({ level: 'district', stateCode, stateName, districtCode, districtName });
    openDiagnostic({ districtCode, districtName, stateCode });
  }, [setJurisdiction, openDiagnostic]);

  const resetToNational = useCallback(() => {
    setJurisdiction({ level: 'national' });
    setSelectedStateBounds(null);
  }, [setJurisdiction]);

  return (
    <div ref={containerRef} style={{ position: 'relative', height, background: '#0a0d14', borderRadius: 8, overflow: 'hidden', border: '1px solid #2e3350' }}>

      {/* Layer toggle */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveLayer('mismatch')}
          aria-pressed={activeLayer === 'mismatch'}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #2e3350', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: activeLayer === 'mismatch' ? 'rgba(239,68,68,0.8)' : '#1a1d2e', color: activeLayer === 'mismatch' ? '#fff' : '#94a3b8' }}
        >
          <Layers size={12} /> Labour Mismatch
        </button>
        <button
          onClick={() => setActiveLayer('industrial')}
          aria-pressed={activeLayer === 'industrial'}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #2e3350', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: activeLayer === 'industrial' ? 'rgba(34,211,238,0.8)' : '#1a1d2e', color: activeLayer === 'industrial' ? '#0f1117' : '#94a3b8' }}
        >
          <Layers size={12} /> Industrial Activity
        </button>
      </div>

      {/* Back to national */}
      {isStateLevel && (
        <button
          onClick={resetToNational}
          style={{ position: 'absolute', top: 44, left: 10, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: '1px solid #2e3350', fontSize: 11, cursor: 'pointer', background: '#1a1d2e', color: '#94a3b8' }}
          aria-label="Return to national view"
        >
          ← All India
        </button>
      )}

      {/* Loading */}
      {geoLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 999, background: '#0a0d14' }}>
          <Loader size={32} style={{ color: '#4f8ef7' }} className="spinner" />
          <span style={{ color: '#64748b', fontSize: 13 }}>Loading geographic boundaries…</span>
        </div>
      )}

      {/* Error state */}
      {geoError && !geoLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 999, background: '#0a0d14', padding: 24 }}>
          <AlertTriangle size={36} style={{ color: '#f59e0b' }} />
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>Map Data Unavailable</div>
          <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', maxWidth: 360 }}>
            Place <code style={{ color: '#f59e0b' }}>india-states.geojson</code> and <code style={{ color: '#f59e0b' }}>india-districts.geojson</code> in <code style={{ color: '#f59e0b' }}>/public/geo/</code>
          </div>
          <div style={{ fontSize: 11, color: '#475569', padding: '6px 12px', background: '#1a1d2e', borderRadius: 6, border: '1px solid #2e3350' }}>
            <MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />
            Recommended: github.com/geohacker/india (MIT)
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Error: {geoError}</div>
        </div>
      )}

      {/* Leaflet Map */}
      {!geoLoading && !geoError && statesGeo && (
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          zoomControl={false}
          style={{ height: '100%', width: '100%', background: '#0a0d14' }}
          minZoom={4}
          maxZoom={10}
          maxBounds={[[5, 63], [40, 100]]}
        >
          <ZoomControl position="bottomleft" />
          <MapViewController bounds={selectedStateBounds} />

          {/* State layer */}
          {!isStateLevel && (
            <GeoJSON
              key={`states-${activeLayer}`}
              data={statesGeo as unknown as GeoJSON.FeatureCollection}
              style={(feature) => getStateStyle(feature as unknown as GeoFeature)}
              onEachFeature={(feature, layer) => {
                const f = feature as unknown as GeoFeature;
                (layer as L.Path).on({
                  mouseover: (e) => {
                    (e as L.LeafletMouseEvent).target.setStyle({ fillOpacity: 0.92, weight: 1.5, color: '#94a3b8' });
                    onMouseMove(e as L.LeafletMouseEvent, f, 'state');
                  },
                  mousemove: (e) => onMouseMove(e as L.LeafletMouseEvent, f, 'state'),
                  mouseout: (e) => {
                    (e as L.LeafletMouseEvent).target.setStyle({ fillOpacity: 0.68, weight: 0.8, color: '#1e293b' });
                    setTooltip(null);
                  },
                  click: (e) => onStateClick(e as L.LeafletMouseEvent, f),
                });
              }}
            />
          )}

          {/* District layer */}
          {isStateLevel && districtsGeo && (() => {
            const selectedStateName = state.selectedJurisdiction.stateName;
            const stateFeatures = districtsGeo.features.filter(
              f => String(f.properties?.NAME_1 ?? '') === selectedStateName
            );
            if (stateFeatures.length === 0) return null;
            const subset: GeoData = { type: 'FeatureCollection', features: stateFeatures };
            return (
              <GeoJSON
                key={`districts-${selectedStateName}-${activeLayer}`}
                data={subset as unknown as GeoJSON.FeatureCollection}
                style={(feature) => getDistrictStyle(feature as unknown as GeoFeature)}
                onEachFeature={(feature, layer) => {
                  const f = feature as unknown as GeoFeature;
                  (layer as L.Path).on({
                    mouseover: (e) => {
                      (e as L.LeafletMouseEvent).target.setStyle({ fillOpacity: 0.92, weight: 1.5, color: '#94a3b8' });
                      onMouseMove(e as L.LeafletMouseEvent, f, 'district');
                    },
                    mousemove: (e) => onMouseMove(e as L.LeafletMouseEvent, f, 'district'),
                    mouseout: (e) => {
                      (e as L.LeafletMouseEvent).target.setStyle({ fillOpacity: 0.65, weight: 0.6, color: '#334155' });
                      setTooltip(null);
                    },
                    click: () => onDistrictClick(f),
                  });
                }}
              />
            );
          })()}

          {/* Fallback: show all districts when state selected but no matching features */}
          {isStateLevel && districtsGeo && (() => {
            const selectedStateName = state.selectedJurisdiction.stateName;
            const count = districtsGeo.features.filter(f => String(f.properties?.NAME_1 ?? '') === selectedStateName).length;
            if (count === 0) {
              // Show state outline as fallback
              const stateFeatures = statesGeo.features.filter(f => String(f.properties?.NAME_1 ?? '') === selectedStateName);
              if (stateFeatures.length === 0) return null;
              const subset: GeoData = { type: 'FeatureCollection', features: stateFeatures };
              return (
                <GeoJSON
                  key={`state-fallback-${selectedStateName}`}
                  data={subset as unknown as GeoJSON.FeatureCollection}
                  style={() => ({ fillColor: '#4f8ef7', fillOpacity: 0.2, color: '#4f8ef7', weight: 2 })}
                />
              );
            }
            return null;
          })()}
        </MapContainer>
      )}

      <MapTooltip info={tooltip} />
      {!geoLoading && !geoError && <MapLegend layer={activeLayer} />}

      {/* Demo badge */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '3px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>
        DEMO DATA
      </div>

      {/* Interaction hint */}
      {!geoLoading && !geoError && !isStateLevel && (
        <div style={{ position: 'absolute', bottom: 36, left: 10, zIndex: 1000, fontSize: 10, color: '#475569', padding: '4px 8px', background: 'rgba(15,17,23,0.8)', borderRadius: 4 }}>
          Click a state to drill down
        </div>
      )}
      {isStateLevel && (
        <div style={{ position: 'absolute', bottom: 36, left: 10, zIndex: 1000, fontSize: 10, color: '#475569', padding: '4px 8px', background: 'rgba(15,17,23,0.8)', borderRadius: 4 }}>
          Click a district for diagnostic
        </div>
      )}
    </div>
  );
}

