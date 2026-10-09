import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Layers, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Sliders, 
  MapPin, 
  X,
  Compass,
  Activity,
  ArrowRight
} from 'lucide-react';
import { WatershedCatchment } from '../types/watershed';

interface BhuvanLayerMeta {
  id: string;
  name: string;
  wmsLayerName: string;
  category: string;
  description: string;
  defaultOpacity: number;
}

interface BhuvanIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  watershed: WatershedCatchment;
  onApplyBhuvanLayer: (layerName: string, opacity: number, layerMeta?: BhuvanLayerMeta) => void;
  onApplyWatershedBoundary: (boundaryGeoJson: [number, number][], metadata: any) => void;
}

export const BhuvanIntegrationModal: React.FC<BhuvanIntegrationModalProps> = ({
  isOpen,
  onClose,
  watershed,
  onApplyBhuvanLayer,
  onApplyWatershedBoundary,
}) => {
  const [layers, setLayers] = useState<BhuvanLayerMeta[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('lulc:LULC50K_1516');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.8);
  const [isLoadingLayers, setIsLoadingLayers] = useState<boolean>(false);

  // Boundary query state
  const [searchCode, setSearchCode] = useState<string>(watershed.code || '4B2A');
  const [isFetchingBoundary, setIsFetchingBoundary] = useState<boolean>(false);
  const [fetchedBoundaryResult, setFetchedBoundaryResult] = useState<any | null>(null);

  // Probe state
  const [probeLat, setProbeLat] = useState<number>(watershed.center[0]);
  const [probeLng, setProbeLng] = useState<number>(watershed.center[1]);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeResult, setProbeResult] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingLayers(true);
    fetch('/api/bhuvan/thematic-layers')
      .then((res) => res.json())
      .then((data) => {
        if (data.layers) {
          setLayers(data.layers);
        }
      })
      .catch((err) => console.warn('Could not load Bhuvan layers', err))
      .finally(() => setIsLoadingLayers(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchBoundary = async () => {
    setIsFetchingBoundary(true);
    try {
      const res = await fetch(`/api/bhuvan/watershed-boundary?code=${encodeURIComponent(searchCode)}`);
      const data = await res.json();
      if (data.success && data.watershed) {
        setFetchedBoundaryResult(data.watershed);
      }
    } catch (err) {
      console.error('Error fetching Bhuvan boundary', err);
    } finally {
      setIsFetchingBoundary(false);
    }
  };

  const handleApplyBoundaryToMap = () => {
    if (!fetchedBoundaryResult) return;
    const coords = fetchedBoundaryResult.geometry.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]);
    onApplyWatershedBoundary(coords, fetchedBoundaryResult.properties);
    onClose();
  };

  const handleApplyWms = () => {
    const layerObj = layers.find((l) => l.wmsLayerName === selectedLayer) || {
      id: selectedLayer,
      name: selectedLayer,
      wmsLayerName: selectedLayer,
      category: 'ISRO Bhuvan WMS',
      description: 'Thematic GIS overlay',
      defaultOpacity: layerOpacity,
    };
    onApplyBhuvanLayer(selectedLayer, layerOpacity, layerObj);
    onClose();
  };

  const handleProbeCoordinate = async () => {
    setIsProbing(true);
    try {
      const res = await fetch('/api/bhuvan/get-feature-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: probeLat,
          lng: probeLng,
          layer: selectedLayer,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProbeResult(data.bhuvanThematicRecord);
      }
    } catch (err) {
      console.error('Error querying Bhuvan GetFeatureInfo', err);
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-6 shadow-2xl text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                ISRO Bhuvan Geo-Portal WMS & Watershed Boundary Integration Module
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Live OGC WMS 1.1.1/1.3.0 · National Remote Sensing Centre (NRSC) Hyderabad
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Live Watershed Boundary Fetcher */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>01. Live Bhuvan Watershed Boundary Ingestion (PMKSY Atlas)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Vector GeoJSON API
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="e.g., 4B2A, WDC-PMKSY-MH-07B, KOSI-12B, KB-03"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-xs font-mono flex-1 min-w-[240px]"
            />
            <button
              onClick={handleFetchBoundary}
              disabled={isFetchingBoundary}
              className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isFetchingBoundary ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to Bhuvan...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Fetch Boundary</span>
                </>
              )}
            </button>
          </div>

          {fetchedBoundaryResult && (
            <div className="bg-slate-900 border border-cyan-500/40 rounded-lg p-3 space-y-2 mt-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-100">
                  {fetchedBoundaryResult.properties.name} ({fetchedBoundaryResult.properties.code})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  ISRO Bhuvan Verified
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300 font-mono">
                <div>Basin: <span className="text-slate-100">{fetchedBoundaryResult.properties.basin}</span></div>
                <div>Area: <span className="text-cyan-300">{fetchedBoundaryResult.properties.areaHa} ha</span></div>
                <div>State: <span className="text-slate-100">{fetchedBoundaryResult.properties.state}</span></div>
                <div>Drainage Dd: <span className="text-cyan-300">{fetchedBoundaryResult.properties.drainageDensity} km/km²</span></div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleApplyBoundaryToMap}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Overlay Boundary Onto GeoWatershedMap</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Bhuvan Thematic WMS Layers */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>02. ISRO NRSC Thematic WMS Layers</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              WMS: bhuvan-vec1.nrsc.gov.in
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer.wmsLayerName)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors space-y-1 ${
                  selectedLayer === layer.wmsLayerName
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-100">{layer.name}</span>
                  <span className="text-[10px] font-mono text-cyan-300">{layer.category}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Layer: {layer.wmsLayerName}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {layer.description}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">WMS Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="accent-cyan-400 w-32 cursor-pointer"
              />
              <span className="font-mono text-slate-200 text-[11px]">{Math.round(layerOpacity * 100)}%</span>
            </div>

            <button
              onClick={handleApplyWms}
              className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Overlay Selected WMS Layer onto Map</span>
            </button>
          </div>
        </div>

        {/* Section 3: Bhuvan GetFeatureInfo Live Coordinate Probe */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>03. Bhuvan GetFeatureInfo Coordinate Inspector</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Live Thematic Interrogation
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono">Lat:</span>
              <input
                type="number"
                step="0.0001"
                value={probeLat}
                onChange={(e) => setProbeLat(parseFloat(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 font-mono w-28"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono">Lng:</span>
              <input
                type="number"
                step="0.0001"
                value={probeLng}
                onChange={(e) => setProbeLng(parseFloat(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 font-mono w-28"
              />
            </div>
            <button
              onClick={handleProbeCoordinate}
              disabled={isProbing}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isProbing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              <span>Query Bhuvan Attributes</span>
            </button>
          </div>

          {probeResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5 mt-2 font-mono">
              <div className="text-cyan-300 font-bold flex justify-between">
                <span>LULC Classification: {probeResult.lulcClass}</span>
                <span className="text-slate-400">Code: {probeResult.lulcCode}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                <div>CartoDEM Elev: <span className="text-slate-100">{probeResult.cartoDemElevationM} m</span></div>
                <div>Slope: <span className="text-slate-100">{probeResult.slopeClass}</span></div>
                <div>Erosion: <span className="text-amber-400">{probeResult.soilErosionSeverity}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
          >
            Close Module
          </button>
        </div>
      </div>
    </div>
  );
};
