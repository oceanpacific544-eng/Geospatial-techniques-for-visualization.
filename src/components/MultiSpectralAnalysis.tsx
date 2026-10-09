import React, { useState, useRef } from 'react';
import { 
  SplitSquareVertical, 
  Layers, 
  Sparkles, 
  Upload, 
  BarChart3, 
  Eye, 
  Cpu, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  ZoomIn
} from 'lucide-react';
import { WatershedCatchment, LayerType } from '../types/watershed';

interface MultiSpectralAnalysisProps {
  watershed: WatershedCatchment;
  onTriggerAiDiagnosis: (customImageBase64?: string) => void;
  isAiAnalyzing: boolean;
}

export const MultiSpectralAnalysis: React.FC<MultiSpectralAnalysisProps> = ({
  watershed,
  onTriggerAiDiagnosis,
  isAiAnalyzing,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'split_slider' | 'band_indices' | 'spectral_signature' | 'upload_custom'>('split_slider');
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0 to 100
  const [selectedSpectralIndex, setSelectedSpectralIndex] = useState<'ndvi' | 'fcc' | 'ndwi' | 'rgb'>('fcc');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Sub-Header Ribbon */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-100">
            Multi-Spectral Geo-Coded Imagery Interpretation Suite
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            {watershed.name}
          </span>
        </div>

        {/* View Mode Segmented Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 text-xs">
          <button
            onClick={() => setActiveViewMode('split_slider')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeViewMode === 'split_slider'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Temporal Comparison (2018 vs 2024)</span>
          </button>
          <button
            onClick={() => setActiveViewMode('band_indices')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeViewMode === 'band_indices'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Spectral Bands & Indices</span>
          </button>
          <button
            onClick={() => setActiveViewMode('spectral_signature')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeViewMode === 'spectral_signature'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Spectral Reflectance Curves</span>
          </button>
          <button
            onClick={() => setActiveViewMode('upload_custom')}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeViewMode === 'upload_custom'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Drone/Sat Image</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* VIEW 1: Split-Screen Temporal Swipe Slider */}
        {activeViewMode === 'split_slider' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Pre-Intervention (2018 Baseline) vs Post-Intervention (2024 Rejuvenation)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag the vertical divider to evaluate change in vegetative cover, check dam pondage, and gully erosion arrest.
                </p>
              </div>
              <button
                onClick={() => onTriggerAiDiagnosis()}
                disabled={isAiAnalyzing}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAiAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Imagery...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Geospatial Diagnostic</span>
                  </>
                )}
              </button>
            </div>

            {/* Split Screen Container */}
            <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 select-none group">
              {/* Right Image (2024 Treated Interventions) */}
              <img
                src={watershed.imagery.interventionsAerial}
                alt="2024 Post-Intervention Watershed"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded text-xs font-mono">
                2024: Post-Intervention (Check Dams & CCTs Active)
              </div>

              {/* Left Image (2018 Baseline Degraded) with Clip Path */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${splitPosition}%` }}
              >
                <img
                  src={watershed.imagery.erosionSurvey}
                  alt="2018 Pre-Intervention Watershed"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%', objectPosition: 'left' }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded text-xs font-mono">
                  2018: Pre-Treatment Baseline (Gully Incisions & Bare Soil)
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white shadow-lg">
                  <SplitSquareVertical className="w-4 h-4" />
                </div>
              </div>

              {/* Invisible Range Slider Overlay for accessibility and touch */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPosition}
                onChange={(e) => setSplitPosition(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>

            {/* Quantitative Change Detection Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-mono">VEGETATIVE CANOPY GAIN</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  +38.6 %
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  NDVI mean shifted from 0.22 to 0.54
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-mono">SURFACE RUNOFF ATTENUATION</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  -41.2 %
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Peak hydrograph discharge flattened
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-mono">WATER STORAGE CREATED</div>
                <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                  89,500 m³
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Harvested across 3 Check Dams & Ponds
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="text-[11px] text-slate-400 font-mono">SOIL LOSS REDUCTION (RUSLE)</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  -16.4 t/ha/yr
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  CCT & boulder plugs trapped bed silt
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Spectral Bands & Indices */}
        {activeViewMode === 'band_indices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100">
                  Remote Sensing Indices & Multi-Spectral Composites
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Examine calibrated bands to distinguish chlorophyll photosynthetic activity, soil moisture, and mineral exposure.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded p-1 text-xs">
                {(
                  [
                    { id: 'fcc', label: 'FCC NIR (B8-4-3)' },
                    { id: 'rgb', label: 'True Color (B4-3-2)' },
                    { id: 'ndvi', label: 'NDVI Index' },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedSpectralIndex(b.id)}
                    className={`px-3 py-1 rounded transition-colors ${
                      selectedSpectralIndex === b.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display selected index image */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                <img
                  src={
                    selectedSpectralIndex === 'fcc'
                      ? watershed.imagery.fccInfrared
                      : selectedSpectralIndex === 'ndvi'
                      ? watershed.imagery.interventionsAerial
                      : watershed.imagery.rgbSatellite
                  }
                  alt="Spectral Index Representation"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur border border-slate-800 p-3 rounded-lg text-xs space-y-1 max-w-sm">
                  <div className="font-semibold text-cyan-300">
                    {selectedSpectralIndex === 'fcc'
                      ? 'False Color Composite (NIR-Red-Green)'
                      : selectedSpectralIndex === 'ndvi'
                      ? 'NDVI Normalized Vegetation Index'
                      : 'True Color Orthophoto (Red-Green-Blue)'}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedSpectralIndex === 'fcc'
                      ? 'Vivid crimson shades indicate active chlorophyll absorption in Near-Infrared (Band 8). Cyan and bone-white reflect exposed bare soil and rock outcrops.'
                      : selectedSpectralIndex === 'ndvi'
                      ? 'Mathematical ratio (NIR - Red) / (NIR + Red). Highlights high-vigor crop clusters vs severely degraded barren ridge lines.'
                      : 'Standard visible spectrum orthomosaic providing authentic geomorphological reference and drainage boundary alignment.'}
                  </p>
                </div>
              </div>

              {/* Spectral Legend & Interpretation Guide */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
                <div className="font-semibold text-slate-200 border-b border-slate-800 pb-2">
                  Spectral Radiometric Key
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Crimson / Bright Red</div>
                      <div className="text-[11px] text-slate-400">
                        Healthy biomass, dense irrigated crops, orchard plantations. High NIR reflectance.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-sky-950 border border-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Deep Blue / Black</div>
                      <div className="text-[11px] text-slate-400">
                        Check dam reservoir pondage, farm ponds, rivers. High NIR absorption.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-amber-200 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Light Beige / Tan</div>
                      <div className="text-[11px] text-slate-400">
                        Exposed sandy loam topsoil, fallow dryland agricultural plots. Moderate uniform reflectance.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Cyan / Ash Gray</div>
                      <div className="text-[11px] text-slate-400">
                        Barren rock ridges, degraded gullies, settlements, and paved access roads.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="font-semibold text-slate-200">Hydrological Application</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    By masking pixels with NDVI &lt; 0.15 on slopes &gt; 12%, we automatically delineate <strong>340 hectares of critical soil erosion hotspots</strong> requiring urgent vegetative and structural measures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Spectral Reflectance Curves */}
        {activeViewMode === 'spectral_signature' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Endmember Spectral Reflectance Signatures (Wavelength $\lambda$)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical interaction of solar electromagnetic radiation with diverse watershed land cover types.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-4 border-b border-slate-800">
                <span>Spectral Bands: Coastal (443nm) · Blue (490nm) · Green (560nm) · Red (665nm) · RedEdge (705nm) · NIR (842nm) · SWIR (1610nm)</span>
                <span className="text-cyan-400">Atmospherically Corrected BOA Reflectance</span>
              </div>

              {/* Spectral Chart SVG */}
              <div className="py-4">
                <svg viewBox="0 0 800 280" className="w-full h-64 overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.2, 0.4, 0.6, 0.8].map((val) => (
                    <g key={val}>
                      <line
                        x1="50"
                        y1={240 - val * 260}
                        x2="780"
                        y2={240 - val * 260}
                        stroke="#1e293b"
                        strokeDasharray="4,4"
                      />
                      <text
                        x="42"
                        y={245 - val * 260}
                        textAnchor="end"
                        className="text-[10px] fill-slate-500 font-mono"
                      >
                        {(val * 100).toFixed(0)}%
                      </text>
                    </g>
                  ))}

                  {/* Wavelength X-axis Labels */}
                  {[
                    { label: 'Blue 490nm', x: 100 },
                    { label: 'Green 560nm', x: 220 },
                    { label: 'Red 665nm', x: 340 },
                    { label: 'RedEdge 705nm', x: 460 },
                    { label: 'NIR 842nm', x: 580 },
                    { label: 'SWIR 1610nm', x: 720 },
                  ].map((band) => (
                    <g key={band.label}>
                      <line x1={band.x} y1="240" x2={band.x} y2="245" stroke="#475569" />
                      <text
                        x={band.x}
                        y="262"
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {band.label}
                      </text>
                    </g>
                  ))}

                  {/* Curve 1: Healthy Irrigated Vegetation (High NIR peak) */}
                  <path
                    d="M 100 220 C 160 215, 220 200, 280 215 C 340 225, 400 180, 460 120 C 520 70, 580 60, 650 95 L 720 140"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />

                  {/* Curve 2: Bare Degraded Soil (Steadily ascending) */}
                  <path
                    d="M 100 210 L 220 185 L 340 160 L 460 145 L 580 130 L 720 110"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="5,3"
                  />

                  {/* Curve 3: Deep Water Pond (Absorbs NIR) */}
                  <path
                    d="M 100 200 C 160 210, 220 220, 340 232 C 460 236, 580 238, 720 239"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-1 bg-emerald-500 rounded" />
                  <span className="text-slate-200">Healthy Canopy / Irrigated Crops (Vigorous chlorophyll NIR plateau)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-1 bg-amber-500 rounded border-dashed" />
                  <span className="text-slate-200">Eroded Barren Topsoil (Steady linear increase across SWIR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-1 bg-sky-500 rounded" />
                  <span className="text-slate-200">Harvested Water Body (Complete NIR absorption)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Upload Custom Drone / Satellite Image */}
        {activeViewMode === 'upload_custom' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Upload Custom Geo-Coded Drone Orthomosaic or Satellite Scene
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Load custom imagery (GeoTIFF, PNG, JPG) to execute automatic drainage and erosion interpretation via Gemini Vision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-400/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/40"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-cyan-400 mb-3" />
                <div className="text-sm font-semibold text-slate-200">
                  Click to select image or drag and drop
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Supports Drone Orthomosaics, Sentinel-2, Landsat-9 (JPG, PNG, WebP)
                </div>
                <div className="mt-4 px-3 py-1 bg-slate-800 rounded text-[11px] font-mono text-cyan-300">
                  Geographic Bounds Auto-Matched to {watershed.name}
                </div>
              </div>

              {/* Preview & Trigger */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-200 mb-2">
                    Active Image Staging Buffer
                  </div>
                  {uploadedImagePreview ? (
                    <div className="h-48 rounded-lg overflow-hidden border border-slate-700 relative">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                        Custom Image Ready
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center text-xs text-slate-500">
                      Using Default Benchmark: {watershed.name} (Sentinel-2 NIR)
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => onTriggerAiDiagnosis(uploadedImagePreview || undefined)}
                    disabled={isAiAnalyzing}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAiAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing Remote Sensing Scene...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Interpretation on This Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
