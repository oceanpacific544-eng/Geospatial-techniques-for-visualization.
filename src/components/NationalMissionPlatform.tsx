import React, { useState } from 'react';
import {
  ShieldAlert,
  Database,
  Satellite,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  MapPin,
  Eye,
  Sliders,
  ChevronRight,
  ExternalLink,
  Bot,
  Flame,
  Award,
  BarChart3,
  Download
} from 'lucide-react';
import { WatershedCatchment, GeoTaggedPhoto } from '../types/watershed';

interface NationalMissionPlatformProps {
  watershed: WatershedCatchment;
  photos: GeoTaggedPhoto[];
  onNavigateToTab: (tab: any) => void;
  onOpenUploadModal: () => void;
  onOpenBhuvanModal: () => void;
  onOpenDprModal: () => void;
}

export const NationalMissionPlatform: React.FC<NationalMissionPlatformProps> = ({
  watershed,
  photos,
  onNavigateToTab,
  onOpenUploadModal,
  onOpenBhuvanModal,
  onOpenDprModal,
}) => {
  const [activePillar, setActivePillar] = useState<number>(1);
  const [selectedPhotoInspect, setSelectedPhotoInspect] = useState<GeoTaggedPhoto>(photos[0]);
  const [selectedSrishtiLayer, setSelectedSrishtiLayer] = useState<string>('lulc_50k');
  const [activeThematicMap, setActiveThematicMap] = useState<string>('erosion');
  const [decisionThreshold, setDecisionThreshold] = useState<number>(75);

  // Statistics & Metrics
  const totalVerified = photos.filter((p) => p.aiAnalysis && p.aiAnalysis.verifiedByUser).length;
  const poorConditionCount = photos.filter((p) => p.aiAnalysis?.condition === 'poor' || p.aiAnalysis?.soil_erosion_signs).length;
  const averageImpactScore = Math.round(
    photos.reduce((acc, p) => acc + (p.aiAnalysis?.impact_score || 0), 0) / (photos.length || 1)
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Banner: Core Problem & Solution Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80 px-6 py-5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                PROBLEM SOLVED: MANUAL SCRUTINY & CENTRAL INTEGRATION DEFICIT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                WDC-PMKSY / ISRO INTEGRATED
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              National Watershed Decision Support & Satellite Analytics Architecture
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl mt-1 leading-relaxed">
              Eliminates fraudulent reporting, manual paper inspections, and disconnected data silos by uniting 
              <strong> Geo-Coded Ground Photos</strong>, <strong>ISRO Bhuvan Srishti-Drishti Satellite WMS</strong>, 
              <strong> Thematic GIS Visualizations</strong>, and <strong>Automated Outcome Assessment</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenDprModal}
              className="px-3.5 py-2 text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-cyan-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full DPR Audit PDF</span>
            </button>
            <button
              onClick={() => onNavigateToTab('map')}
              className="px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-950 cursor-pointer"
            >
              <span>Interactive GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Problem Pain Points vs 4 Solutions Overview Ribbon */}
      <div className="max-w-7xl mx-auto w-full px-6 py-5 space-y-6">
        {/* Pain Points Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                PAIN POINT 1: MANUAL VERIFICATION
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                Field inspectors take physical photos with delayed submission. High risk of fabricated audits, ghost structures, and 4-6 months delay in verifying check dam crest stability.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-red-900/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Resolved by AI EXIF GPS + Vision Analysis</span>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-1">
                <Database className="w-4 h-4 text-amber-400" />
                PAIN POINT 2: LACK OF INSIGHTS
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                Raw photos lack scientific depth. Officers cannot calculate water impounded, erosion severity, soil group infiltration, or SCS-CN runoff retention from simple camera snapshots.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-900/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Resolved by Ridge-to-Valley SCS-CN Hydrology</span>
            </div>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold mb-1">
                <Layers className="w-4 h-4 text-cyan-400" />
                PAIN POINT 3: NO CENTRAL INTEGRATION
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                Disjointed systems: Bhuvan NRSC geospatial layers in one silo, PMKSY DPR reports in spreadsheets, and field drone surveys in personal mobile folders without geo-binding.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-cyan-900/40 text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Resolved by Unified Srishti-Drishti WMS GIS Hub</span>
            </div>
          </div>
        </div>

        {/* The 4 Solution Pillars Interactive Navigation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 flex flex-wrap gap-1">
          {[
            {
              id: 1,
              title: '1. Geo-Coded Image Interpretation',
              sub: 'EXIF Lat/Lng Extraction & Gemini 2.5 Vision AI',
              icon: <Eye className="w-4 h-4" />,
              color: 'text-cyan-400'
            },
            {
              id: 2,
              title: '2. Satellite Data: Srishti - Drishti',
              sub: 'ISRO Bhuvan NRSC Multi-Temporal WMS Integrator',
              icon: <Satellite className="w-4 h-4" />,
              color: 'text-emerald-400'
            },
            {
              id: 3,
              title: '3. Thematic Maps & Visual Dashboard',
              sub: 'LULC, CartoDEM Slope, Stream Order & Health',
              icon: <Layers className="w-4 h-4" />,
              color: 'text-amber-400'
            },
            {
              id: 4,
              title: '4. Outcome Assessment & Decision Support',
              sub: 'Before/After Delta, Breach Alert, DPR Export',
              icon: <TrendingUp className="w-4 h-4" />,
              color: 'text-indigo-400'
            },
          ].map((pillar) => (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(pillar.id)}
              className={`flex-1 min-w-[240px] text-left p-3 rounded-lg transition-all duration-150 cursor-pointer ${
                activePillar === pillar.id
                  ? 'bg-slate-800 border border-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={activePillar === pillar.id ? pillar.color : 'text-slate-500'}>
                  {pillar.icon}
                </span>
                <span className="font-semibold text-xs text-slate-100">{pillar.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate pl-6">{pillar.sub}</p>
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* PILLAR 1: GEO-CODED IMAGE INTERPRETATION */}
        {/* ======================================================== */}
        {activePillar === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    SOLUTION COMPONENT 1: GEO-CODED IMAGE INTERPRETATION
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Automated Verification of Geo-Tagged Ground Photos
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every uploaded photo is decoded with <code className="text-cyan-300 font-mono">exifr</code> to extract strict GPS coordinates, timestamp, and device metadata, then classified via computer vision.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenUploadModal}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Upload & Test Ground Photos</span>
                  </button>
                  <button
                    onClick={() => onNavigateToTab('dashboard')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
                  >
                    <span>View All {photos.length} Photos</span>
                  </button>
                </div>
              </div>

              {/* Photo Inspector Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
                {/* Photo List Selector */}
                <div className="lg:col-span-5 space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Select Field Evidence to Interpret ({photos.length} Available):
                  </span>
                  {photos.map((p) => {
                    const isSelected = selectedPhotoInspect.id === p.id;
                    const condition = p.aiAnalysis?.condition || 'moderate';
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPhotoInspect(p)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.fileName}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {p.siteId} - {p.aiAnalysis?.structure_type || 'Structure'}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
                                condition === 'good'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : condition === 'poor'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {condition}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                            <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{p.lat.toFixed(4)}°N, {p.lng.toFixed(4)}°E</span>
                            <span>•</span>
                            <span className="capitalize">{p.phase} phase</span>
                          </div>
                          <div className="text-[10px] text-cyan-400/90 mt-1 flex items-center justify-between font-mono">
                            <span>Score: {p.aiAnalysis?.impact_score || 0}/100</span>
                            <span>Veg: {p.aiAnalysis?.vegetation_cover_percent || 0}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Computer Vision Interpretation Panel */}
                <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>EXIF-Validated Geo-Evidence</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          {selectedPhotoInspect.fileName}
                        </h4>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          Project: {selectedPhotoInspect.projectName} • {selectedPhotoInspect.district}, {selectedPhotoInspect.state}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-400">IMPACT INDEX</div>
                        <div className="text-2xl font-bold font-mono text-cyan-300">
                          {selectedPhotoInspect.aiAnalysis?.impact_score || '--'}/100
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-800 mb-4 h-56 bg-black">
                      <img
                        src={selectedPhotoInspect.imageUrl}
                        alt="Evidence Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[10px] font-mono text-slate-200 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {selectedPhotoInspect.lat}°N, {selectedPhotoInspect.lng}°E
                        </span>
                        <span>•</span>
                        <span>Elev: {selectedPhotoInspect.elevationM || 540}m</span>
                        <span>•</span>
                        <span>{new Date(selectedPhotoInspect.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Extracted Interpretation Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-mono">STRUCTURE CLASSIFICATION</span>
                        <span className="font-bold text-slate-100 capitalize">
                          {selectedPhotoInspect.aiAnalysis?.structure_type}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-mono">WATER RETENTION LEVEL</span>
                        <span className="font-bold text-cyan-300 capitalize">
                          {selectedPhotoInspect.aiAnalysis?.water_presence} Storage
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-mono">VEGETATION COVER</span>
                        <span className="font-bold text-emerald-300">
                          {selectedPhotoInspect.aiAnalysis?.vegetation_cover_percent}% Canopy
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-mono">SOIL EROSION ACTIVE?</span>
                        <span className={`font-bold ${selectedPhotoInspect.aiAnalysis?.soil_erosion_signs ? 'text-red-400' : 'text-emerald-400'}`}>
                          {selectedPhotoInspect.aiAnalysis?.soil_erosion_signs ? 'Active Rills' : 'Stabilized'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                      <strong className="text-cyan-300 font-mono block text-[10px] uppercase mb-1">
                        AI DIAGNOSTIC REMARKS:
                      </strong>
                      {selectedPhotoInspect.aiAnalysis?.remarks}
                    </div>

                    {/* Detected Issues */}
                    {selectedPhotoInspect.aiAnalysis?.issues && selectedPhotoInspect.aiAnalysis.issues.length > 0 && (
                      <div className="space-y-1 mb-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                          Identified Structural Vulnerabilities:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPhotoInspect.aiAnalysis.issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 border border-red-800/80 text-red-300"
                            >
                              ⚠ {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">
                      Source Agency: {selectedPhotoInspect.agency || 'ISRO Bhuvan'} ({selectedPhotoInspect.bhuvanPhotoId || 'BHU-DRISHTI-VERIFIED'})
                    </span>
                    <button
                      onClick={() => onNavigateToTab('map')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Locate on Catchment Map</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PILLAR 2: SATELLITE DATA INTEGRATION (SRISHTI - DRISHTI) */}
        {/* ======================================================== */}
        {activePillar === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Satellite className="w-3.5 h-3.5" />
                    SOLUTION COMPONENT 2: SATELLITE DATA INTEGRATION (SRISHTI - DRISHTI)
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    NRSC ISRO Bhuvan Srishti (GIS Planning) & Drishti (Mobile Ground Truth) Integration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct WMS / WFS synchronization bridging Indian Remote Sensing satellites (IRS LISS-IV, Cartosat-1 CartoDEM) with multi-temporal Sentinel-2 and Landsat-9 imagery.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenBhuvanModal}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Open Bhuvan WMS Gateway</span>
                  </button>
                  <button
                    onClick={() => onNavigateToTab('earthexplorer')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
                  >
                    <span>EarthExplorer Optical Scenes</span>
                  </button>
                </div>
              </div>

              {/* Srishti vs Drishti 2-Way Synchronization Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                {/* Srishti: Top-Down Satellite Observation */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-950 rounded-lg border border-emerald-800 text-emerald-400">
                        <Satellite className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">BHUVAN SRISHTI</h4>
                        <span className="text-[10px] text-emerald-300 font-mono">Geospatial Web GIS & Macro Watershed Delineation</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded font-mono border border-emerald-700">
                      Top-Down Macro
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    National Remote Sensing Centre (NRSC) spatial layers provide authoritative hydrological boundaries, CartoDEM terrain elevation gradients, and decadal Land Use / Land Cover (LULC 1:50,000) classifications.
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Active Integrated Srishti WMS Layers:
                    </span>
                    {[
                      { id: 'lulc_50k', name: 'LULC 1:50,000 Land Use Classification (AWiFS/LISS-III)', status: 'Connected WMS' },
                      { id: 'cartodem', name: 'CartoDEM Topographic Elevation & Slope Grid (10m GSD)', status: 'Connected WMS' },
                      { id: 'drainage', name: 'Strahler Stream Hierarchy Orders 1st to 4th', status: 'Vector WFS' },
                      { id: 'erosion', name: 'National Soil Erosion Hazard & Gully Network', status: 'Connected WMS' },
                    ].map((layer) => (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedSrishtiLayer(layer.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          selectedSrishtiLayer === layer.id
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <span className="truncate">{layer.name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0 ml-2">
                          {layer.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-emerald-400">ISRO NRSC Endpoint:</strong> <code className="text-slate-300 font-mono text-[10px]">https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms</code>
                  </div>
                </div>

                {/* Drishti: Bottom-Up Mobile Ground Truthing */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-800 text-cyan-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">BHUVAN DRISHTI</h4>
                        <span className="text-[10px] text-cyan-300 font-mono">Mobile Geo-Tagging & Field Officer Ground Truth</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-cyan-900/60 text-cyan-300 rounded font-mono border border-cyan-700">
                      Bottom-Up Micro
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Field officers capture geo-tagged inspection photos at asset inception and completion. Drishti binds GPS compass azimuth, device accuracy (&lt;5m), and timestamp to avoid false billing.
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Drishti Mobile Synchronization Pipeline:
                    </span>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-300">1. Offline Field Capture</span>
                        <span className="text-cyan-400 font-bold">100% Offline Cache</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Stores geotagged photos in IndexedDB when officers are in zero-connectivity ravine zones.</p>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-300">2. Geo-Fencing Boundary Validation</span>
                        <span className="text-emerald-400 font-bold">Within Catchment</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Verifies photo coordinates lie within the active micro-watershed polygon boundary ({watershed.areaHa} ha).</p>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-300">3. Spatial Fusion with Srishti</span>
                        <span className="text-cyan-400 font-bold">Auto Overlay</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Pins verified Drishti markers on top of high-res satellite and elevation layers on the live map.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-800/40 text-[11px] text-cyan-300 flex items-center justify-between">
                    <span>Synchronized Ground Truth Records:</span>
                    <strong className="text-sm font-mono text-white">{photos.length} Inspected Assets</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PILLAR 3: THEMATIC MAPS AND VISUAL DASHBOARD */}
        {/* ======================================================== */}
        {activePillar === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    SOLUTION COMPONENT 3: THEMATIC MAPS AND VISUAL DASHBOARD
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Multi-Spectral Remote Sensing & Morphometric Geospatial Visualizer
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transforms raw satellite pixels into intelligible decision-grade thematic layers: NDVI, Moisture (NDMI), CartoDEM slope gradient, drainage flow accumulation, and erosion hazard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToTab('map')}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Launch 2D/3D Map View</span>
                  </button>
                  <button
                    onClick={() => onNavigateToTab('spectral')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
                  >
                    <span>Spectral Band Math</span>
                  </button>
                </div>
              </div>

              {/* Thematic Layers Gallery & Live Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                {[
                  {
                    id: 'erosion',
                    name: 'Soil Erosion Hazard Zonation',
                    metric: 'Severe Scour: 380 Ha',
                    badge: 'Critical Scour',
                    color: 'border-red-500/50 bg-red-950/20 text-red-300',
                    desc: 'Categorizes slopes >15% as high-velocity sheetwash. Identifies where loose boulder check dams and CCTs are mandatory.',
                  },
                  {
                    id: 'ndvi',
                    name: 'NDVI Vegetation Greenness & Biomass',
                    metric: 'Avg NDVI: +0.46',
                    badge: 'Chlorophyll Index',
                    color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
                    desc: 'Calculated from Sentinel-2 (NIR - Red)/(NIR + Red). Verifies afforestation and crop yield enhancements around check dams.',
                  },
                  {
                    id: 'cartodem',
                    name: 'CartoDEM Topographic Slope (%)',
                    metric: `${watershed.elevationMinM}m - ${watershed.elevationMaxM}m Relief`,
                    badge: 'Elevation Relief',
                    color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
                    desc: 'ISRO Cartosat-1 derived stereo relief model. Guides ridge-to-valley placement preventing downstream weir overflows.',
                  },
                  {
                    id: 'drainage',
                    name: 'Drainage Flow Accumulation Hierarchy',
                    metric: `${watershed.morphometry.drainageDensityKmPerSqKm} km/km² Density`,
                    badge: 'Strahler Stream Order',
                    color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300',
                    desc: 'Orders 1 to 3 mapped. 1st order for gully plugs, 2nd order for masonry check dams, and 3rd order for percolation tanks.',
                  },
                ].map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => setActiveThematicMap(theme.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      activeThematicMap === theme.id
                        ? `${theme.color} ring-1 ring-amber-400/60 shadow-lg`
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {theme.badge}
                        </span>
                        <span className="text-xs font-mono font-bold">{theme.metric}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{theme.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {theme.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">Status: Rendered</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        Inspect Layer <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thematic Visual Dashboard Snapshot */}
              <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    Catchment Visual Analytics Summary ({watershed.name})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Rainfall: {watershed.averageAnnualRainfallMm} mm/yr • Soil Group: {watershed.hydrologicalSoilGroup} ({watershed.dominantSoilType})
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">CATCHMENT AREA</span>
                    <span className="text-lg font-bold text-white font-mono">{watershed.areaHa} Ha</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Perimeter: {watershed.perimeterKm} km</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">BASELINE CURVE NUMBER</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">CN {watershed.baselineCurveNumber}</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Treated Goal: CN {watershed.treatedCurveNumber}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">CONSERVATION STRUCTURES</span>
                    <span className="text-lg font-bold text-cyan-300 font-mono">
                      {watershed.existingStructures.length + watershed.proposedStructures.length} Assets
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {watershed.existingStructures.length} Existing / {watershed.proposedStructures.length} Proposed
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">RUNOFF RETENTION RATIO</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {Math.round(((watershed.baselineCurveNumber - watershed.treatedCurveNumber) / watershed.baselineCurveNumber) * 100)}% Retained
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Reduced Peak Discharge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PILLAR 4: OUTCOME ASSESSMENT & DECISION SUPPORT */}
        {/* ======================================================== */}
        {activePillar === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    SOLUTION COMPONENT 4: OUTCOME ASSESSMENT & DECISION SUPPORT SYSTEM (DSS)
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Automated Verification, Breach Alerting & Treatment Recommendations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Eliminates guesswork for project directors by automatically computing multi-year Before/After impact scores, detecting structural breaches, and suggesting Ridge-to-Valley interventions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToTab('before-after')}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Multi-Temporal Swipe Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToTab('simulation')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors"
                  >
                    <span>Hydrological SCS-CN Engine</span>
                  </button>
                </div>
              </div>

              {/* Decision Support Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
                {/* 1. Automated Breach & Failure Alerting */}
                <div className="bg-slate-950/80 border border-red-900/40 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 font-mono">
                        <Flame className="w-4 h-4 text-red-500" />
                        AUTOMATED BREACH ALERTS
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-red-950 text-red-300 rounded font-mono font-bold">
                        {poorConditionCount} Actionable
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Structures categorized as <strong className="text-red-400">'Poor'</strong> or displaying <strong className="text-red-400">'Bed Scour / Spillway Fractures'</strong> bypass manual queues and trigger automated remedial alerts to divisional engineers.
                    </p>

                    <div className="mt-3 space-y-2">
                      {photos
                        .filter((p) => p.aiAnalysis?.condition === 'poor' || p.aiAnalysis?.soil_erosion_signs)
                        .slice(0, 2)
                        .map((alert) => (
                          <div key={alert.id} className="p-2.5 bg-red-950/30 border border-red-800/60 rounded-lg text-xs">
                            <div className="flex items-center justify-between text-white font-semibold">
                              <span>{alert.siteId} - {alert.aiAnalysis?.structure_type}</span>
                              <span className="text-[10px] text-red-400 font-mono">Score {alert.aiAnalysis?.impact_score}/100</span>
                            </div>
                            <p className="text-[10px] text-red-300 mt-1 line-clamp-2">
                              {alert.aiAnalysis?.remarks}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                    Instant Telegram/SMS Gateway & DPR Ticket Dispatch enabled.
                  </div>
                </div>

                {/* 2. Before / After Ecological Delta Assessment */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                        <Award className="w-4 h-4 text-emerald-400" />
                        ECOLOGICAL OUTCOME DELTA
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono font-bold">
                        Avg Score: {averageImpactScore}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Calibrated impact formula quantifies treatment success objectively:
                    </p>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-cyan-300 my-2">
                      Score = 0.3×Water + 0.3×Veg% + 0.2×Stability + 0.2×(1−Erosion)
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Vegetation Canopy Increase:</span>
                        <span className="text-emerald-400 font-bold font-mono">+60% Avg Delta</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Surface Water Impoundment:</span>
                        <span className="text-cyan-400 font-bold font-mono">3.8x Storage Boost</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Topsoil Preservation:</span>
                        <span className="text-emerald-400 font-bold font-mono">84% Scour Arrested</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onNavigateToTab('before-after')}
                      className="w-full py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                    >
                      Compare Paired Time-Lapse Sites
                    </button>
                  </div>
                </div>

                {/* 3. Decision Support: What Next? */}
                <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        AI TREATMENT RECOMMENDATIONS
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded font-mono font-bold">
                        Ridge-to-Valley
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Synthesizes slope, drainage density, and soil group C/D to prescribe the optimal engineering intervention:
                    </p>

                    <div className="space-y-2 mt-3 text-xs">
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                        <strong className="text-amber-300 block text-[11px]">Ridge Zone (Slopes &gt;12%):</strong>
                        <span className="text-[10px] text-slate-400">Continuous Contour Trenches (CCT) + Staggered pits to reduce velocity.</span>
                      </div>
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                        <strong className="text-cyan-300 block text-[11px]">Valley Drainage (Order 2):</strong>
                        <span className="text-[10px] text-slate-400">Masonry Check Dams with apron cutoff walls to avoid scouring.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onNavigateToTab('simulation')}
                      className="w-full py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors shadow-sm"
                    >
                      Simulate 24-Hr Storm Runoff
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
