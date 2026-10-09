import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Sliders, 
  Droplets, 
  ShieldCheck, 
  TrendingDown, 
  Coins, 
  Zap, 
  RotateCcw,
  Layers
} from 'lucide-react';
import { WatershedCatchment, SimulationInputs, SimulationOutputs } from '../types/watershed';
import { calculateSCSCNRunoff } from '../data/watershedData';

interface HydrologicalSimulationProps {
  watershed: WatershedCatchment;
}

export const HydrologicalSimulation: React.FC<HydrologicalSimulationProps> = ({
  watershed,
}) => {
  const [inputs, setInputs] = useState<SimulationInputs>({
    designRainfallMm: 85, // 24-hr design storm event (mm)
    catchmentAreaHa: watershed.areaHa,
    selectedSoilGroup: watershed.hydrologicalSoilGroup,
    rainfallDurationHours: 6,
    checkDamCount: 3,
    farmPondCount: 6,
    cctLengthM: 4500, // 4.5 km of contour trenches
    gullyPlugCount: 18,
    afforestationAreaHa: 120,
  });

  const handleReset = () => {
    setInputs({
      designRainfallMm: 85,
      catchmentAreaHa: watershed.areaHa,
      selectedSoilGroup: watershed.hydrologicalSoilGroup,
      rainfallDurationHours: 6,
      checkDamCount: 3,
      farmPondCount: 6,
      cctLengthM: 4500,
      gullyPlugCount: 18,
      afforestationAreaHa: 120,
    });
  };

  // Hydrological Calculations (SCS-CN & Water Balance)
  const outputs: SimulationOutputs = useMemo(() => {
    const P = inputs.designRainfallMm;
    const areaM2 = inputs.catchmentAreaHa * 10000;

    // Baseline Curve Number
    const baselineCN = watershed.baselineCurveNumber;
    const { sMm: baselineS, runoffMm: baselineRunoffMm } = calculateSCSCNRunoff(P, baselineCN);
    const baselineRunoffVolumeM3 = (baselineRunoffMm / 1000) * areaM2;

    // Treated Curve Number adjustment based on implemented conservation works
    // CCT (per 1000m) reduces CN by ~0.8
    // Afforestation reduces CN by ~0.04 per ha
    // Gully plugs reduce CN by ~0.15 per plug
    const cnReduction =
      (inputs.cctLengthM / 1000) * 0.9 +
      inputs.afforestationAreaHa * 0.04 +
      inputs.gullyPlugCount * 0.15;
    const treatedCN = Math.max(55, Math.round(baselineCN - cnReduction));

    const { sMm: treatedS, runoffMm: treatedRunoffMm } = calculateSCSCNRunoff(P, treatedCN);
    const treatedRunoffVolumeM3 = (treatedRunoffMm / 1000) * areaM2;

    // Peak discharge approximation (m³/s)
    const tpBaseline = watershed.morphometry.timeOfConcentrationHours * 0.6;
    const baselinePeakDischargeM3s = parseFloat(
      ((0.208 * (inputs.catchmentAreaHa / 100) * baselineRunoffMm) / tpBaseline).toFixed(1)
    );

    const tpTreated = tpBaseline * 1.35; // attenuation extends lag time
    const treatedPeakDischargeM3s = parseFloat(
      ((0.208 * (inputs.catchmentAreaHa / 100) * treatedRunoffMm) / tpTreated).toFixed(1)
    );

    const attenuatedRunoffM3 = Math.max(0, baselineRunoffVolumeM3 - treatedRunoffVolumeM3);
    const attenuationPercent = parseFloat(
      ((attenuatedRunoffM3 / (baselineRunoffVolumeM3 || 1)) * 100).toFixed(1)
    );

    // Harvested storage capacity
    const harvestedStorageCapacityM3 =
      inputs.checkDamCount * 28000 +
      inputs.farmPondCount * 4500 +
      (inputs.cctLengthM * 0.5 * 0.5 * 0.9); // CCT volumetric storage (0.5m x 0.5m trench)

    // Groundwater recharge (approx 65% of attenuated water + storage infiltration)
    const estimatedGroundwaterRechargeM3 = Math.round(
      attenuatedRunoffM3 * 0.62 + harvestedStorageCapacityM3 * 0.45
    );

    // Soil loss reduction (Tons/yr via RUSLE factor C & P modification)
    const annualSoilLossReductionTons = Math.round(
      inputs.catchmentAreaHa * 3.4 * (cnReduction / 12) + inputs.gullyPlugCount * 45
    );

    // Additional irrigation command area (ha) (assume 2500 m³ per ha supplemental irrigation)
    const additionalIrrigationPotentialHa = parseFloat(
      (harvestedStorageCapacityM3 / 2200).toFixed(1)
    );

    // Budget estimate (INR)
    const estimatedTotalBudgetINR =
      inputs.checkDamCount * 420000 +
      inputs.farmPondCount * 95000 +
      inputs.cctLengthM * 65 + // ₹65/m for CCT excavation
      inputs.gullyPlugCount * 12000 +
      inputs.afforestationAreaHa * 18000;

    return {
      baselineS,
      baselineRunoffMm,
      baselineRunoffVolumeM3,
      baselinePeakDischargeM3s,
      treatedS,
      treatedRunoffMm,
      treatedRunoffVolumeM3,
      treatedPeakDischargeM3s,
      attenuatedRunoffM3,
      attenuationPercent,
      harvestedStorageCapacityM3,
      estimatedGroundwaterRechargeM3,
      annualSoilLossReductionTons,
      additionalIrrigationPotentialHa,
      estimatedTotalBudgetINR,
    };
  }, [inputs, watershed]);

  // Synthetic Storm Hydrograph (Pre-Intervention vs Post-Intervention)
  const hydrographPoints = useMemo(() => {
    const points: { t: number; baselineQ: number; treatedQ: number }[] = [];
    const totalHours = 14;

    for (let t = 0; t <= totalHours; t += 0.5) {
      // Gamma / Poisson unit hydrograph shape
      const tNorm = t / (watershed.morphometry.timeOfConcentrationHours || 2.5);

      const baselineQ =
        outputs.baselinePeakDischargeM3s *
        Math.pow(tNorm, 2.2) *
        Math.exp(-2.2 * (tNorm - 1));

      const treatedQ =
        outputs.treatedPeakDischargeM3s *
        Math.pow(t / 4.2, 1.8) *
        Math.exp(-1.8 * (t / 4.2 - 1));

      points.push({
        t,
        baselineQ: Math.max(0, parseFloat((isNaN(baselineQ) ? 0 : baselineQ).toFixed(1))),
        treatedQ: Math.max(0, parseFloat((isNaN(treatedQ) ? 0 : treatedQ).toFixed(1))),
      });
    }

    return points;
  }, [outputs, watershed]);

  const maxQ = Math.max(
    outputs.baselinePeakDischargeM3s * 1.15,
    outputs.treatedPeakDischargeM3s * 1.15,
    10
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Sub-Header Ribbon */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-100">
            SCS-CN Runoff & Soil-Water Conservation Simulation Engine
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            Catchment: {watershed.name}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Outcome Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">RUNOFF ATTENUATION</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {outputs.attenuationPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Saved {Math.round(outputs.attenuatedRunoffM3).toLocaleString()} m³ from storm discharge
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">GW RECHARGE POTENTIAL</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {outputs.estimatedGroundwaterRechargeM3.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">m³</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Replenishes shallow unconfined aquifers
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">SOIL EROSION ARRESTED</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {outputs.annualSoilLossReductionTons.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">t/yr</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Trapped by gully plugs and contour bunds
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">ESTIMATED SWC BUDGET</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              ₹{(outputs.estimatedTotalBudgetINR / 100000).toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">Lakh</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Command area: +{outputs.additionalIrrigationPotentialHa} ha
            </div>
          </div>
        </div>

        {/* 2-Column Split: Controls on Left, Storm Hydrograph on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Interactive Simulation Control Sliders (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Storm & Catchment Parameters</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400">SCS-CN Equations</span>
              </div>

              {/* Slider 1: Design Rainfall */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">24-hr Design Storm Rainfall (P)</span>
                  <span className="font-mono text-cyan-300 font-semibold">{inputs.designRainfallMm} mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={inputs.designRainfallMm}
                  onChange={(e) =>
                    setInputs({ ...inputs, designRainfallMm: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Soil Group Picker */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-300">Hydrological Soil Group (HSG)</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['A', 'B', 'C', 'D'] as const).map((group) => (
                    <button
                      key={group}
                      onClick={() => setInputs({ ...inputs, selectedSoilGroup: group })}
                      className={`py-1.5 rounded text-xs text-center font-mono transition-colors border ${
                        inputs.selectedSoilGroup === group
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Group {group}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="font-semibold text-xs text-slate-200 mb-3">
                  Conservation Interventions Allocation
                </div>

                {/* Slider: Masonry Check Dams */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Masonry Check Dams</span>
                    <span className="font-mono text-slate-100 font-semibold">{inputs.checkDamCount} units</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={inputs.checkDamCount}
                    onChange={(e) =>
                      setInputs({ ...inputs, checkDamCount: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Slider: Continuous Contour Trenches (CCT) */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Contour Trenches (CCT) Length</span>
                    <span className="font-mono text-slate-100 font-semibold">{inputs.cctLengthM.toLocaleString()} m</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="500"
                    value={inputs.cctLengthM}
                    onChange={(e) =>
                      setInputs({ ...inputs, cctLengthM: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Slider: Farm Ponds */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Percolation Farm Ponds</span>
                    <span className="font-mono text-slate-100 font-semibold">{inputs.farmPondCount} units</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={inputs.farmPondCount}
                    onChange={(e) =>
                      setInputs({ ...inputs, farmPondCount: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Slider: Afforestation Area */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Agroforestry & Pasture Buffer</span>
                    <span className="font-mono text-slate-100 font-semibold">{inputs.afforestationAreaHa} ha</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="20"
                    value={inputs.afforestationAreaHa}
                    onChange={(e) =>
                      setInputs({ ...inputs, afforestationAreaHa: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>Baseline Curve No: {watershed.baselineCurveNumber}</span>
              <span className="text-emerald-400">Post-Treatment Curve No: {Math.round(watershed.baselineCurveNumber - (inputs.cctLengthM / 1000) * 0.9 - inputs.afforestationAreaHa * 0.04)}</span>
            </div>
          </div>

          {/* Right Column: Comparative Storm Hydrograph & Water Balance (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Catchment Outflow Storm Hydrograph (Q vs Elapsed Time)</span>
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Demonstrates peak flood discharge reduction and hydrograph attenuation.
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-3 h-0.5 bg-rose-500 rounded" />
                    <span>Baseline Pre-Treatment</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-3 h-0.5 bg-cyan-400 rounded" />
                    <span>Post-Treatment (SWC Plan)</span>
                  </span>
                </div>
              </div>

              {/* Hydrograph SVG Canvas */}
              <div className="py-4">
                <svg viewBox="0 0 600 240" className="w-full h-56 overflow-visible">
                  <defs>
                    <linearGradient id="hydroBaselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="hydroTreatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Q grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = 200 - ratio * 180;
                    const val = Math.round(ratio * maxQ);
                    return (
                      <g key={ratio}>
                        <line
                          x1="45"
                          y1={y}
                          x2="580"
                          y2={y}
                          stroke="#1e293b"
                          strokeDasharray="4,4"
                        />
                        <text
                          x="38"
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] fill-slate-500 font-mono"
                        >
                          {val} m³/s
                        </text>
                      </g>
                    );
                  })}

                  {/* Time X-axis */}
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((hr) => {
                    const x = 45 + (hr / 14) * 535;
                    return (
                      <g key={hr}>
                        <line x1={x} y1="200" x2={x} y2="205" stroke="#475569" />
                        <text
                          x={x}
                          y="218"
                          textAnchor="middle"
                          className="text-[9px] fill-slate-400 font-mono"
                        >
                          T+{hr}h
                        </text>
                      </g>
                    );
                  })}

                  {/* Baseline curve */}
                  {hydrographPoints.length > 0 && (
                    <>
                      <path
                        d={`M 45 200 ${hydrographPoints
                          .map((p) => {
                            const x = 45 + (p.t / 14) * 535;
                            const y = 200 - (p.baselineQ / maxQ) * 180;
                            return `L ${x} ${y}`;
                          })
                          .join(' ')} L 580 200 Z`}
                        fill="url(#hydroBaselineGrad)"
                      />
                      <path
                        d={`M 45 200 ${hydrographPoints
                          .map((p) => {
                            const x = 45 + (p.t / 14) * 535;
                            const y = 200 - (p.baselineQ / maxQ) * 180;
                            return `L ${x} ${y}`;
                          })
                          .join(' ')}`}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                      />
                    </>
                  )}

                  {/* Treated curve */}
                  {hydrographPoints.length > 0 && (
                    <>
                      <path
                        d={`M 45 200 ${hydrographPoints
                          .map((p) => {
                            const x = 45 + (p.t / 14) * 535;
                            const y = 200 - (p.treatedQ / maxQ) * 180;
                            return `L ${x} ${y}`;
                          })
                          .join(' ')} L 580 200 Z`}
                        fill="url(#hydroTreatedGrad)"
                      />
                      <path
                        d={`M 45 200 ${hydrographPoints
                          .map((p) => {
                            const x = 45 + (p.t / 14) * 535;
                            const y = 200 - (p.treatedQ / maxQ) * 180;
                            return `L ${x} ${y}`;
                          })
                          .join(' ')}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Runoff Comparison Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">PEAK DISCHARGE (Qp)</div>
                  <div className="text-slate-100 font-bold font-mono text-sm mt-0.5">
                    {outputs.baselinePeakDischargeM3s} → <span className="text-cyan-300">{outputs.treatedPeakDischargeM3s} m³/s</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">RUNOFF DEPTH (Q)</div>
                  <div className="text-slate-100 font-bold font-mono text-sm mt-0.5">
                    {outputs.baselineRunoffMm.toFixed(1)} → <span className="text-cyan-300">{outputs.treatedRunoffMm.toFixed(1)} mm</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">TOTAL DISCHARGE VOL</div>
                  <div className="text-slate-100 font-bold font-mono text-sm mt-0.5">
                    {Math.round(outputs.baselineRunoffVolumeM3 / 1000)}k → <span className="text-cyan-300">{Math.round(outputs.treatedRunoffVolumeM3 / 1000)}k m³</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">ATTENUATION GAIN</div>
                  <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                    -{outputs.attenuationPercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
