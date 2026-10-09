import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Droplets, 
  Download, 
  Filter, 
  Layers, 
  Info,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { GeoTaggedPhoto } from '../types/watershed';

interface AnalyticsDashboardProps {
  photos: GeoTaggedPhoto[];
  onOpenUploadModal: () => void;
  onVerifyPhoto?: (id: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  photos,
  onOpenUploadModal,
  onVerifyPhoto,
}) => {
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      if (selectedAgency !== 'all' && p.agency !== selectedAgency) return false;
      if (selectedState !== 'all' && p.state !== selectedState) return false;
      if (selectedDistrict !== 'all' && p.district !== selectedDistrict) return false;
      if (selectedPhase !== 'all' && p.phase !== selectedPhase) return false;
      return true;
    });
  }, [photos, selectedAgency, selectedState, selectedDistrict, selectedPhase]);

  const agencies = useMemo(() => {
    return Array.from(new Set(photos.map((p) => p.agency).filter(Boolean))) as string[];
  }, [photos]);

  const states = useMemo(() => {
    return Array.from(new Set(photos.map((p) => p.state).filter(Boolean))) as string[];
  }, [photos]);

  const districts = useMemo(() => {
    return Array.from(new Set(photos.map((p) => p.district)));
  }, [photos]);

  // Metrics
  const totalCount = filteredPhotos.length;

  const conditionCounts = useMemo(() => {
    const counts = { good: 0, moderate: 0, poor: 0 };
    filteredPhotos.forEach((p) => {
      const cond = p.aiAnalysis?.condition;
      if (cond === 'good') counts.good++;
      else if (cond === 'moderate') counts.moderate++;
      else if (cond === 'poor') counts.poor++;
    });
    return counts;
  }, [filteredPhotos]);

  const structureTypeCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      'check dam': 0,
      'farm pond': 0,
      'contour trench': 0,
      'gully plug': 0,
      'plantation': 0,
    };
    filteredPhotos.forEach((p) => {
      const st = p.aiAnalysis?.structure_type || 'check dam';
      if (counts[st] !== undefined) counts[st]++;
      else counts[st] = 1;
    });
    return counts;
  }, [filteredPhotos]);

  const avgImpactScore = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = filteredPhotos.reduce(
      (acc, p) => acc + (p.aiAnalysis?.impact_score || 0),
      0
    );
    return Math.round(sum / totalCount);
  }, [filteredPhotos, totalCount]);

  const avgVegetation = useMemo(() => {
    if (totalCount === 0) return 0;
    const sum = filteredPhotos.reduce(
      (acc, p) => acc + (p.aiAnalysis?.vegetation_cover_percent || 0),
      0
    );
    return Math.round(sum / totalCount);
  }, [filteredPhotos, totalCount]);

  const handleDownloadCsv = () => {
    const headers = [
      'Photo ID',
      'File Name',
      'Latitude',
      'Longitude',
      'Timestamp',
      'District',
      'Phase',
      'Structure Type',
      'Condition',
      'Water Presence',
      'Vegetation Cover (%)',
      'Soil Erosion Signs',
      'Impact Score',
      'Remarks',
    ];

    const rows = filteredPhotos.map((p) => [
      p.id,
      `"${p.fileName.replace(/"/g, '""')}"`,
      p.lat,
      p.lng,
      p.timestamp,
      p.district,
      p.phase,
      p.aiAnalysis?.structure_type || '',
      p.aiAnalysis?.condition || '',
      p.aiAnalysis?.water_presence || '',
      p.aiAnalysis?.vegetation_cover_percent ?? '',
      p.aiAnalysis?.soil_erosion_signs ? 'YES' : 'NO',
      p.aiAnalysis?.impact_score ?? '',
      `"${(p.aiAnalysis?.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `watershed-geotagged-photos-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const poorConditionPhotos = filteredPhotos.filter(
    (p) => p.aiAnalysis?.condition === 'poor' || p.aiAnalysis?.soil_erosion_signs
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Sub Header */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-100">
            WDC-PMKSY Watershed Geo-Coded Monitoring Dashboard
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            {totalCount} Geotagged Field Photos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenUploadModal}
            className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          >
            <span>Upload New Photos</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Data Providers (Bhuvan & USGS)</option>
              {agencies.map((a) => (
                <option key={a} value={a}>
                  Provider: {a}
                </option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  State: {s}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  District: {d}
                </option>
              ))}
            </select>

            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Phases</option>
              <option value="after">Post-Intervention (After)</option>
              <option value="before">Pre-Intervention (Before)</option>
            </select>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Filtered: {totalCount} records
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">TOTAL STRUCTURES ANALYZED</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {totalCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {districts.length} administrative districts
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">AVERAGE IMPACT SCORE</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {avgImpactScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Calculated via calibrated formula
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">AVERAGE VEGETATION COVER</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {avgVegetation}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Canopy & crop vigor around structures
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">HIGH-RISK ATTENTION SITES</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {conditionCounts.poor}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Requires immediate desiltation or weir repair
            </div>
          </div>
        </div>

        {/* Step 5: Impact Scoring Formula Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="font-semibold text-xs text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Standard Watershed Impact Scoring Model (Step 5)</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              Weight: Water 30% · Veg 30% · Condition 20% · Erosion 20%
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-300">
            Impact Score = 0.3 × Water + 0.3 × Vegetation + 0.2 × Condition + 0.2 × (1 − Soil Erosion)
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            This model combines hydrological surface storage presence (none: 0, low: 33, medium: 66, high: 100), canopy vigor (0-100%), structural integrity (poor: 25, moderate: 65, good: 100), and erosion abatement to output an objective metric for WDC-PMKSY outcome tracking.
          </p>
        </div>

        {/* Visual Charts: Condition Pie & Structure Breakdown Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Condition Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="font-semibold text-xs text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
              <span>Structure Condition Health Distribution</span>
              <span className="font-mono text-slate-400 text-[11px]">{totalCount} units</span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Good / Functional</span>
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {conditionCounts.good} ({totalCount ? Math.round((conditionCounts.good / totalCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${totalCount ? (conditionCounts.good / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Moderate / Minor Desilting</span>
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {conditionCounts.moderate} ({totalCount ? Math.round((conditionCounts.moderate / totalCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${totalCount ? (conditionCounts.moderate / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Poor / Active Erosion / Breach</span>
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {conditionCounts.poor} ({totalCount ? Math.round((conditionCounts.poor / totalCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${totalCount ? (conditionCounts.poor / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Structure Type Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="font-semibold text-xs text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
              <span>Structure Type Categorization</span>
              <span className="font-mono text-slate-400 text-[11px]">Count</span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(structureTypeCounts).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 capitalize">{type}</span>
                    <span className="font-mono text-cyan-300 font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${totalCount ? (count / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Attention List: Poor Condition & Erosion Hotspots */}
        {poorConditionPhotos.length > 0 && (
          <div className="bg-slate-900 border border-rose-500/30 rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Priority Action Queue: Degraded & Damaged Structures</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {poorConditionPhotos.length} flagged for inspection
              </span>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {poorConditionPhotos.map((photo) => (
                <div key={photo.id} className="p-4 flex items-center gap-4 hover:bg-slate-800/40 transition-colors">
                  <img
                    src={photo.imageUrl}
                    alt={photo.fileName}
                    className="w-16 h-14 object-cover rounded border border-rose-500/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-100">
                        {photo.aiAnalysis?.structure_type.toUpperCase()} · {photo.siteId}
                      </div>
                      <span className="font-mono text-rose-400 font-semibold">
                        Impact: {photo.aiAnalysis?.impact_score}/100
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Location: {photo.lat.toFixed(4)}°N, {photo.lng.toFixed(4)}°E ({photo.district})
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Issues: {photo.aiAnalysis?.issues.join(', ') || 'Severe degradation'}
                    </div>
                  </div>
                  {onVerifyPhoto && (
                    <button
                      onClick={() => onVerifyPhoto(photo.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-xs whitespace-nowrap"
                    >
                      Verify Site
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
