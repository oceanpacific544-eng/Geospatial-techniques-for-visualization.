import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { GeoWatershedMap } from './components/GeoWatershedMap';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { MultiSpectralAnalysis } from './components/MultiSpectralAnalysis';
import { HydrologicalSimulation } from './components/HydrologicalSimulation';
import { StructuresList } from './components/StructuresList';
import { ElevationProfileModal } from './components/ElevationProfileModal';
import { DprReportModal } from './components/DprReportModal';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { PresentationGuideModal } from './components/PresentationGuideModal';
import { EarthExplorerCatalog } from './components/EarthExplorerCatalog';
import { BhuvanIntegrationModal } from './components/BhuvanIntegrationModal';
import { LiveWorldMap } from './components/LiveWorldMap';
import { WATERSHED_STUDY_AREAS } from './data/watershedData';
import { SAMPLE_GEO_PHOTOS } from './data/sampleFieldPhotos';
import { 
  WatershedCatchment, 
  LayerType, 
  SWCStructure, 
  InspectionData, 
  GeoTaggedPhoto,
  BhuvanOverlay
} from './types/watershed';

export default function App() {
  const [selectedWatershedIndex, setSelectedWatershedIndex] = useState<number>(0);
  const currentWatershed: WatershedCatchment = WATERSHED_STUDY_AREAS[selectedWatershedIndex];

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AppTab>('map');

  // Field Photos state (Pre-loaded with sample dataset from Bhuvan / Drishti / WDC-PMKSY)
  const [photos, setPhotos] = useState<GeoTaggedPhoto[]>(SAMPLE_GEO_PHOTOS);

  // Active Bhuvan WMS Overlay state
  const [bhuvanActiveOverlay, setBhuvanActiveOverlay] = useState<BhuvanOverlay | null>({
    id: 'bhuvan:lulc_50k',
    name: 'Land Use / Land Cover (LULC 1:50,000)',
    wmsLayerName: 'lulc:LULC50K_1516',
    category: 'Land Resources (NRSC Bhuvan)',
    description: 'NRSC multitemporal IRS Resourcesat AWiFS/LISS-III derived 1:50k land use classification.',
    opacity: 0.75,
  });

  // Map state
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('satellite_rgb');
  const [structures, setStructures] = useState<SWCStructure[]>([
    ...currentWatershed.existingStructures,
    ...currentWatershed.proposedStructures,
  ]);
  const [inspectionData, setInspectionData] = useState<InspectionData | null>({
    lat: currentWatershed.center[0],
    lng: currentWatershed.center[1],
    elevationM: Math.round((currentWatershed.elevationMinM + currentWatershed.elevationMaxM) / 2),
    slopePercent: 8.4,
    lulcClass: 'Rainfed Agriculture (Sorghum/Pigeonpea)',
    ndviValue: 0.46,
    soilGroup: currentWatershed.hydrologicalSoilGroup,
    erosionRisk: 'Moderate',
    curveNumber: currentWatershed.baselineCurveNumber,
    recommendedTreatment: 'Contour Bunds with farm percolation pond',
  });

  // Modals state
  const [isBhuvanModalOpen, setIsBhuvanModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isPptModalOpen, setIsPptModalOpen] = useState<boolean>(false);
  const [isDprModalOpen, setIsDprModalOpen] = useState<boolean>(false);
  const [isTransectModalOpen, setIsTransectModalOpen] = useState<boolean>(false);
  const [transectCoords, setTransectCoords] = useState<{ start: [number, number]; end: [number, number] }>({
    start: [currentWatershed.boundaryGeoJson[0][0], currentWatershed.boundaryGeoJson[0][1]],
    end: [currentWatershed.center[0], currentWatershed.center[1]],
  });

  // AI Remote Sensing Analysis state for scene
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // Reset structures when watershed changes
  useEffect(() => {
    setStructures([
      ...currentWatershed.existingStructures,
      ...currentWatershed.proposedStructures,
    ]);
  }, [selectedWatershedIndex]);

  const handleApplyBhuvanLayer = (layerName: string, opacity: number = 0.8, layerMeta?: any) => {
    if (layerMeta) {
      setBhuvanActiveOverlay({
        id: layerMeta.id,
        name: layerMeta.name,
        wmsLayerName: layerMeta.wmsLayerName || layerName,
        category: layerMeta.category || 'ISRO Bhuvan NRSC',
        description: layerMeta.description || 'NRSC Thematic Dataset',
        opacity: opacity,
        legendUrl: layerMeta.legendUrl,
      });
    } else {
      setBhuvanActiveOverlay({
        id: layerName,
        name: layerName,
        wmsLayerName: layerName,
        category: 'ISRO Bhuvan NRSC',
        description: 'NRSC Thematic Dataset',
        opacity: opacity,
      });
    }
    setActiveTab('map');
  };

  const handleApplyWatershedBoundary = (boundaryGeoJson: [number, number][]) => {
    currentWatershed.boundaryGeoJson = boundaryGeoJson;
    setActiveTab('map');
  };

  const handleAddPhotos = (newPhotos: GeoTaggedPhoto[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  const handleAddStructure = (newStruct: SWCStructure) => {
    setStructures((prev) => [newStruct, ...prev]);
  };

  const handleRemoveStructure = (id: string) => {
    setStructures((prev) => prev.filter((s) => s.id !== id));
  };

  const handleOpenTransect = (startCoord: [number, number], endCoord: [number, number]) => {
    setTransectCoords({ start: startCoord, end: endCoord });
    setIsTransectModalOpen(true);
  };

  const handleVerifyPhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId && p.aiAnalysis
          ? { ...p, aiAnalysis: { ...p.aiAnalysis, verifiedByUser: true } }
          : p
      )
    );
  };

  const handleTriggerAiDiagnosis = async () => {
    setIsAiAnalyzing(true);
    try {
      await fetch('/api/analyze-watershed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyAreaName: currentWatershed.name,
          selectedLayer,
          hydrologyContext: {
            rainfall: `${currentWatershed.averageAnnualRainfallMm} mm/year`,
            soil: currentWatershed.dominantSoilType,
            slope: `${currentWatershed.elevationMinM}m to ${currentWatershed.elevationMaxM}m relief`,
          },
        }),
      });
      setActiveTab('dashboard');
    } catch (e) {
      console.warn('Analysis completed with fallback', e);
      setActiveTab('dashboard');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDprModal={() => setIsDprModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenPptModal={() => setIsPptModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] relative overflow-hidden flex flex-col">
        {/* Spatial Catchment Switcher Banner */}
        <div className="h-8 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
          {activeTab === 'world-map' ? (
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PLANETARY HYDROSPHERE & LIVE WORLD MAP:
              </span>
              <span className="text-slate-300 text-xs hidden md:inline">
                Global Watersheds · Real-time USGS Earthquakes · RainViewer Weather Radar · Day/Night Terminator
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono text-[11px]">ACTIVE CATCHMENT:</span>
              <div className="flex items-center gap-2">
                {WATERSHED_STUDY_AREAS.map((w, idx) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWatershedIndex(idx)}
                    className={`text-xs px-2 py-0.5 rounded transition-colors ${
                      selectedWatershedIndex === idx
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-3">
            {activeTab === 'world-map' ? (
              <>
                <span className="text-cyan-300">Continuous 360° Planetary Wrap</span>
                <span>·</span>
                <span className="text-emerald-400">Esri / Carto / Topo GIS</span>
              </>
            ) : (
              <>
                <span>{photos.length} Geo-Photos Active</span>
                <span>·</span>
                <span>Rainfall: {currentWatershed.averageAnnualRainfallMm} mm/yr</span>
              </>
            )}
          </div>
        </div>

        {/* Viewport Modes */}
        <div className="flex-1 w-full h-[calc(100%-2rem)] overflow-hidden">
          {activeTab === 'world-map' && <LiveWorldMap />}

          {activeTab === 'map' && (
            <GeoWatershedMap
              watershed={currentWatershed}
              selectedLayer={selectedLayer}
              onSelectLayer={setSelectedLayer}
              activeStructures={structures}
              onAddStructure={handleAddStructure}
              onOpenTransectModal={handleOpenTransect}
              inspectionData={inspectionData}
              onUpdateInspection={setInspectionData}
              photos={photos}
              onNavigateToWorldMap={() => setActiveTab('world-map')}
              onOpenBhuvanModal={() => setIsBhuvanModalOpen(true)}
              bhuvanOverlay={bhuvanActiveOverlay}
              onClearBhuvanOverlay={() => setBhuvanActiveOverlay(null)}
              onUpdateBhuvanOpacity={(op) =>
                setBhuvanActiveOverlay((prev) => (prev ? { ...prev, opacity: op } : null))
              }
            />
          )}

          {activeTab === 'dashboard' && (
            <AnalyticsDashboard
              photos={photos}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onVerifyPhoto={handleVerifyPhoto}
            />
          )}

          {activeTab === 'before-after' && (
            <BeforeAfterComparison photos={photos} />
          )}

          {activeTab === 'earthexplorer' && (
            <EarthExplorerCatalog
              onSelectSceneLayer={(layer) => setSelectedLayer(layer)}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'spectral' && (
            <MultiSpectralAnalysis
              watershed={currentWatershed}
              onTriggerAiDiagnosis={handleTriggerAiDiagnosis}
              isAiAnalyzing={isAiAnalyzing}
            />
          )}

          {activeTab === 'simulation' && (
            <HydrologicalSimulation watershed={currentWatershed} />
          )}

          {activeTab === 'structures' && (
            <StructuresList
              watershed={currentWatershed}
              structures={structures}
              onAddStructure={handleAddStructure}
              onRemoveStructure={handleRemoveStructure}
            />
          )}
        </div>
      </main>

      {/* Photo Upload & EXIF Extraction Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        watershed={currentWatershed}
        onAddPhotos={handleAddPhotos}
      />

      {/* Presentation Guide Modal */}
      <PresentationGuideModal
        isOpen={isPptModalOpen}
        onClose={() => setIsPptModalOpen(false)}
      />

      {/* Elevation Profile Modal */}
      <ElevationProfileModal
        isOpen={isTransectModalOpen}
        onClose={() => setIsTransectModalOpen(false)}
        startCoord={transectCoords.start}
        endCoord={transectCoords.end}
        watershed={currentWatershed}
      />

      {/* Detailed Project Report (DPR) Modal */}
      <DprReportModal
        isOpen={isDprModalOpen}
        onClose={() => setIsDprModalOpen(false)}
        watershed={currentWatershed}
        structures={structures}
      />

      {/* ISRO Bhuvan WMS & Boundary Integration Module */}
      <BhuvanIntegrationModal
        isOpen={isBhuvanModalOpen}
        onClose={() => setIsBhuvanModalOpen(false)}
        watershed={currentWatershed}
        onApplyBhuvanLayer={handleApplyBhuvanLayer}
        onApplyWatershedBoundary={handleApplyWatershedBoundary}
      />
    </div>
  );
}
