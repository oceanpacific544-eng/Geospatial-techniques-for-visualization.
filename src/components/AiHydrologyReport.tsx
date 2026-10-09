import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Droplets, 
  ShieldCheck, 
  FileText, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { AiDiagnosisResult, WatershedCatchment } from '../types/watershed';

interface AiHydrologyReportProps {
  watershed: WatershedCatchment;
  diagnosis: AiDiagnosisResult | null;
  isLoading: boolean;
  onReanalyze: () => void;
}

export const AiHydrologyReport: React.FC<AiHydrologyReportProps> = ({
  watershed,
  diagnosis,
  isLoading,
  onReanalyze,
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-8 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-slate-100">
            Running Multi-Spectral Geospatial Model
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Evaluating NIR reflectance, Strahler drainage morphometry, and RUSLE erosion risk...
          </p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-8 space-y-4">
        <Sparkles className="w-10 h-10 text-cyan-400/60" />
        <div className="text-center max-w-md space-y-2">
          <h3 className="text-base font-bold text-slate-100">
            No Active Geospatial Diagnostic
          </h3>
          <p className="text-xs text-slate-400">
            Click below to execute an automated AI interpretation of the geo-coded satellite imagery, drainage morphometry, and conservation intervention needs.
          </p>
          <button
            onClick={onReanalyze}
            className="mt-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold rounded transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Watershed Diagnostic</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Ribbon */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-100">
            AI Geospatial Interpretation & Watershed Diagnostic Report
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            {diagnosis.isAiGenerated ? 'Gemini 2.5 Flash Verified' : 'Hydrological Rule Engine'}
          </span>
        </div>

        <button
          onClick={onReanalyze}
          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Re-Analyze Scene</span>
        </button>
      </div>

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Executive Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              01. Executive Hydrological Summary
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Catchment Area: {watershed.areaHa} ha
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {diagnosis.summary}
          </p>
        </div>

        {/* Projected Outcomes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">RUNOFF REDUCTION</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              -{diagnosis.projectedOutcomes.surfaceRunoffReductionPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Peak hydrograph attenuation</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">ANNUAL GW RECHARGE</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {diagnosis.projectedOutcomes.annualGroundwaterRechargeM3.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">m³</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Aquifer replenishment</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">SOIL RETENTION (RUSLE)</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {diagnosis.projectedOutcomes.soilLossReductionTonHaYear}{' '}
              <span className="text-xs font-normal text-slate-400">t/ha/yr</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Topsoil preserved</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] text-slate-400 font-mono">IRRIGATION COMMAND</div>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
              +{diagnosis.projectedOutcomes.potentialIrrigationCommandHa}{' '}
              <span className="text-xs font-normal text-slate-400">ha</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Double cropped area</div>
          </div>
        </div>

        {/* LULC Classification Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              02. Land Use / Land Cover (LULC) Classification & Erosion Risk
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              100% Catchment Delineation
            </span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
              <tr>
                <th className="px-5 py-2.5">Land Cover Category</th>
                <th className="px-5 py-2.5">Area Coverage (%)</th>
                <th className="px-5 py-2.5">Erosion Hazard</th>
                <th className="px-5 py-2.5">Recommended Conservation Measure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {diagnosis.lulcClassification.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-100">{item.category}</td>
                  <td className="px-5 py-3 font-mono text-slate-200 tabular-nums">
                    {item.percentage}%
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        item.erosionRisk === 'Severe' || item.erosionRisk === 'Extreme'
                          ? 'border-rose-500/40 text-rose-300 bg-rose-500/10'
                          : item.erosionRisk === 'Moderate'
                          ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                          : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                      }`}
                    >
                      {item.erosionRisk}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-cyan-200">{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Diagnostic Morphological Findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            03. Geomorphological & Drainage Diagnostics
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {diagnosis.diagnosticFindings.map((finding, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 leading-relaxed flex items-start gap-2.5"
              >
                <span className="text-cyan-400 font-mono font-bold mt-0.5">0{idx + 1}.</span>
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended SWC Interventions Action Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              04. Prioritized Ridge-to-Valley Action Plan
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              Spatial Coordinates & Budget
            </span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
              <tr>
                <th className="px-5 py-2.5">Intervention Structure</th>
                <th className="px-5 py-2.5">Topographic Location</th>
                <th className="px-5 py-2.5">Elevation</th>
                <th className="px-5 py-2.5">Primary Purpose</th>
                <th className="px-5 py-2.5 font-mono">Cost Estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {diagnosis.recommendedInterventions.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-100">{rec.type}</td>
                  <td className="px-5 py-3 font-mono text-cyan-300 text-[11px]">{rec.location}</td>
                  <td className="px-5 py-3 font-mono text-slate-200">{rec.elevation}</td>
                  <td className="px-5 py-3 text-slate-300">{rec.purpose}</td>
                  <td className="px-5 py-3 font-mono text-slate-100 font-semibold">
                    {rec.estimatedCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
