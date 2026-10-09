import React from 'react';
import { X, Download, Printer, CheckCircle2, FileText, Layers, Droplets } from 'lucide-react';
import { WatershedCatchment, SWCStructure } from '../types/watershed';

interface DprReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  watershed: WatershedCatchment;
  structures: SWCStructure[];
}

export const DprReportModal: React.FC<DprReportModalProps> = ({
  isOpen,
  onClose,
  watershed,
  structures,
}) => {
  if (!isOpen) return null;

  const totalCostINR = structures.reduce((acc, s) => acc + s.costEstimateINR, 0);
  const totalStorageM3 = structures.reduce((acc, s) => acc + s.storageCapacityM3, 0);

  const handleDownloadGeoJson = () => {
    const geoJsonData = {
      type: 'FeatureCollection',
      name: `${watershed.name} Watershed DPR Data`,
      features: [
        {
          type: 'Feature',
          properties: {
            name: `${watershed.name} Boundary`,
            areaHa: watershed.areaHa,
            drainageDensity: watershed.morphometry.drainageDensityKmPerSqKm,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [watershed.boundaryGeoJson.map(([lat, lng]) => [lng, lat])],
          },
        },
        ...structures.map((s) => ({
          type: 'Feature',
          properties: {
            id: s.id,
            name: s.name,
            type: s.type,
            elevationM: s.elevationM,
            storageM3: s.storageCapacityM3,
            costINR: s.costEstimateINR,
            status: s.status,
          },
          geometry: {
            type: 'Point',
            coordinates: [s.lng, s.lat],
          },
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${watershed.id}-watershed-dpr.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = [
      'Structure ID',
      'Name',
      'Type',
      'Latitude',
      'Longitude',
      'Elevation (m)',
      'Storage Capacity (m3)',
      'Catchment Area (ha)',
      'Cost Estimate (INR)',
      'Status',
    ];

    const rows = structures.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.type,
      s.lat,
      s.lng,
      s.elevationM,
      s.storageCapacityM3,
      s.catchmentAreaHa,
      s.costEstimateINR,
      s.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${watershed.id}-interventions-boq.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-8 space-y-6 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider">
              Government & Institutional Standard Detailed Project Report (DPR)
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Comprehensive Watershed Development Master Plan
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-1">
              Project Code: {watershed.code} · Basin: {watershed.stateDistrict}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Catchment Morphometry */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono border-b border-slate-800 pb-1">
            01. Catchment Characteristics & Drainage Morphometry
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Catchment Area</span>
              <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                {watershed.areaHa.toLocaleString()} ha
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Perimeter</span>
              <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                {watershed.perimeterKm} km
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Drainage Density (Dd)</span>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                {watershed.morphometry.drainageDensityKmPerSqKm} km/km²
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Bifurcation Ratio (Rb)</span>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                {watershed.morphometry.bifurcationRatio}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Soil & Water Conservation Structures BoQ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              02. Soil & Water Conservation (SWC) Bill of Quantities (BoQ)
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              Total Outlay: ₹{(totalCostINR / 100000).toFixed(2)} Lakh
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 font-mono sticky top-0">
                <tr>
                  <th className="px-3 py-2">Structure</th>
                  <th className="px-3 py-2">Coordinates</th>
                  <th className="px-3 py-2">Capacity</th>
                  <th className="px-3 py-2">Cost (INR)</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {structures.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 font-medium text-slate-200">{s.name}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-400">
                      {s.lat.toFixed(4)}°, {s.lng.toFixed(4)}°
                    </td>
                    <td className="px-3 py-2 font-mono text-emerald-400">
                      {s.storageCapacityM3.toLocaleString()} m³
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-200">
                      ₹{s.costEstimateINR.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 uppercase font-mono text-[10px] text-cyan-400">
                      {s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Projected Watershed Outcomes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono border-b border-slate-800 pb-1">
            03. Projected Watershed Outcomes & Socioeconomic Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-cyan-400">Hydrological Moderation</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Runoff velocity reduced by 42%. Attenuation creates <strong>{totalStorageM3.toLocaleString()} m³</strong> in surface water storage, boosting groundwater percolation.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-amber-400">Soil Erosion Abatement</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Continuous contour trenches and gully plugs arrest <strong>~16.4 tons/ha/year</strong> of fertile topsoil silt from washing downstream.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400">Agricultural Productivity</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Expands assured protective irrigation for <strong>185 hectares</strong> of Rabi / summer crops, improving household farm resilience.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadGeoJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download GeoJSON</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download BoQ CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print DPR</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded transition-colors"
          >
            Close DPR View
          </button>
        </div>
      </div>
    </div>
  );
};
