import React, { useState } from 'react';
import { 
  Globe, 
  Satellite, 
  Layers, 
  ExternalLink, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  Download,
  Info,
  Maximize2
} from 'lucide-react';
import { EARTH_EXPLORER_SCENES } from '../data/earthExplorerScenes';
import { EarthExplorerScene, LayerType } from '../types/watershed';

interface EarthExplorerCatalogProps {
  onSelectSceneLayer: (layer: LayerType) => void;
  onNavigateToMap: () => void;
}

export const EarthExplorerCatalog: React.FC<EarthExplorerCatalogProps> = ({
  onSelectSceneLayer,
  onNavigateToMap,
}) => {
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [selectedSatellite, setSelectedSatellite] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScene, setSelectedScene] = useState<EarthExplorerScene>(EARTH_EXPLORER_SCENES[0]);

  const filteredScenes = EARTH_EXPLORER_SCENES.filter((scene) => {
    if (selectedAgency !== 'all' && scene.agency !== selectedAgency) return false;
    if (selectedSatellite !== 'all' && scene.satellite !== selectedSatellite) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        scene.entityId.toLowerCase().includes(q) ||
        scene.satellite.toLowerCase().includes(q) ||
        scene.watershedCoverage.toLowerCase().includes(q) ||
        scene.pathRowOrTile.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const agencies = Array.from(new Set(EARTH_EXPLORER_SCENES.map((s) => s.agency)));
  const satellites = Array.from(new Set(EARTH_EXPLORER_SCENES.map((s) => s.satellite)));

  const handleLoadSceneToMap = (scene: EarthExplorerScene) => {
    setSelectedScene(scene);
    if (scene.satellite.includes('Sentinel') || scene.satellite.includes('LISS')) {
      onSelectSceneLayer('fcc_infrared');
    } else if (scene.satellite.includes('CartoDEM') || scene.satellite.includes('SRTM')) {
      onSelectSceneLayer('dem_elevation');
    } else {
      onSelectSceneLayer('satellite_rgb');
    }
    onNavigateToMap();
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Sub Header */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-100">
            USGS EarthExplorer & ISRO Bhuvan NRSC Satellite Scene Repository
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            Multi-Temporal Optical & DEM Granules
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href="https://earthexplorer.usgs.gov/"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 flex items-center gap-1 transition-colors"
          >
            <span>USGS EarthExplorer</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href="https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 flex items-center gap-1 transition-colors"
          >
            <span>ISRO Bhuvan Portal</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </div>

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="font-bold text-xs text-cyan-300 flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span>Multi-Source Remote Sensing Feeds for Watershed Verification</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Open Data Integration
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Directly access multi-spectral scenes from <strong>USGS EarthExplorer</strong> (Landsat 8/9, Sentinel-2, SRTM) and <strong>ISRO Bhuvan NRSC</strong> (Resourcesat-2 LISS-IV, CartoDEM, LULC WMS) to corroborate ground-truth geo-tagged photos with satellite-derived NDVI and moisture indices.
          </p>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Data Providers</option>
              {agencies.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={selectedSatellite}
              onChange={(e) => setSelectedSatellite(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Sensors / Satellites</option>
              {satellites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Entity ID, Tile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded pl-8 pr-3 py-1 text-xs w-48"
              />
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {filteredScenes.length} scenes cataloged
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenes.map((scene) => (
            <div
              key={scene.entityId}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between transition-colors group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative h-44 overflow-hidden bg-slate-950 border-b border-slate-800">
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.entityId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-slate-700">
                    {scene.satellite}
                  </div>
                  <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-700">
                    {scene.resolutionM}m GSD
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    Cloud: {scene.cloudCoverPercent}%
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5 text-xs">
                  <div>
                    <div className="font-bold text-slate-100 font-mono truncate text-[11px]">
                      {scene.entityId}
                    </div>
                    <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                      {scene.agency} · {scene.pathRowOrTile}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    Coverage: <span className="text-slate-100 font-medium">{scene.watershedCoverage}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    {scene.recommendedUse}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Available Bands:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scene.bandsAvailable.slice(0, 4).map((band, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-950 border border-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-300"
                        >
                          {band}
                        </span>
                      ))}
                      {scene.bandsAvailable.length > 4 && (
                        <span className="text-[10px] text-slate-500 font-mono self-center">
                          +{scene.bandsAvailable.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleLoadSceneToMap(scene)}
                  className="w-full py-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Load Scene onto Map Viewport</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Remote Sensing Technical Guidance (Step 4 & 5) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <div className="font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            Recommended Satellite Band Combinations for Watershed Verification
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400">1. False Color Composite (FCC NIR)</div>
              <div className="font-mono text-[11px] text-slate-300">Sentinel-2: B8-B4-B3 · Landsat-9: B5-B4-B3</div>
              <p className="text-[11px] text-slate-400">
                Vigorous chlorophyll reflects strongly in Near-Infrared (red in FCC). Differentiates treated irrigated crops from dry fallow lands.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <div className="font-semibold text-cyan-400">2. Water Index (MNDWI & NDWI)</div>
              <div className="font-mono text-[11px] text-slate-300">(Green - SWIR) / (Green + SWIR)</div>
              <p className="text-[11px] text-slate-400">
                Detects open water surface area in farm ponds, check dams, and percolation tanks while suppressing built-up noise.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <div className="font-semibold text-amber-400">3. CartoDEM Slope & Flow Routing</div>
              <div className="font-mono text-[11px] text-slate-300">10m ISRO Cartosat-1 Stereo DEM</div>
              <p className="text-[11px] text-slate-400">
                Determines ridge-to-valley flow accumulation, drainage network order (Strahler 1 to 4), and optimal check dam placement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
