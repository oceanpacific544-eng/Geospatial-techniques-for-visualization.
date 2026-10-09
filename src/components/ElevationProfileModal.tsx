import React, { useMemo, useState } from 'react';
import { X, TrendingDown, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { ElevationTransectPoint, WatershedCatchment } from '../types/watershed';

interface ElevationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  startCoord: [number, number];
  endCoord: [number, number];
  watershed: WatershedCatchment;
}

export const ElevationProfileModal: React.FC<ElevationProfileModalProps> = ({
  isOpen,
  onClose,
  startCoord,
  endCoord,
  watershed,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate scientific elevation transect data along the line
  const transectPoints: ElevationTransectPoint[] = useMemo(() => {
    const pointsCount = 40;
    const result: ElevationTransectPoint[] = [];

    // Great circle distance approximation
    const dLat = (endCoord[0] - startCoord[0]) * 111.32;
    const dLng = (endCoord[1] - startCoord[1]) * 111.32 * Math.cos((startCoord[0] * Math.PI) / 180);
    const totalDistanceKm = Math.sqrt(dLat * dLat + dLng * dLng) || 4.8;

    const minElev = watershed.elevationMinM;
    const maxElev = watershed.elevationMaxM;

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const dist = parseFloat((t * totalDistanceKm).toFixed(2));

      // Realistic topographic cross-section curve: Ridge -> Slope -> Valley -> Counter-slope
      const normalizedElev =
        0.5 +
        0.45 * Math.cos(t * Math.PI * 1.3) +
        0.12 * Math.sin(t * Math.PI * 3.8) -
        0.2 * Math.sin(t * Math.PI * 0.9);

      const elev = Math.round(minElev + Math.max(0, Math.min(1, normalizedElev)) * (maxElev - minElev));
      
      // Slope calculation
      const slope = parseFloat(
        Math.abs(Math.sin(t * Math.PI * 2.2) * 24 + (1 - t) * 6).toFixed(1)
      );

      let zone: 'Ridge' | 'Middle Slope' | 'Valley Bottom' = 'Middle Slope';
      let streamIntersect: string | undefined = undefined;
      let recommendedStructure: string | undefined = undefined;

      if (t < 0.25 || elev > maxElev - 60) {
        zone = 'Ridge';
        recommendedStructure = 'Continuous Contour Trenches (CCT) & Gully Plugs';
      } else if (t > 0.55 && t < 0.75) {
        zone = 'Valley Bottom';
        streamIntersect = '3rd Order Main Nala Confluence';
        recommendedStructure = 'Masonry Check Dam (Perennial Storage)';
      } else {
        zone = 'Middle Slope';
        recommendedStructure = 'Contour Bunds & Farm Percolation Pond';
      }

      result.push({
        distanceKm: dist,
        elevationM: elev,
        slopePercent: slope,
        zone,
        streamIntersection: streamIntersect,
        recommendedStructure,
      });
    }

    return result;
  }, [startCoord, endCoord, watershed]);

  if (!isOpen) return null;

  const minElev = Math.min(...transectPoints.map((p) => p.elevationM));
  const maxElev = Math.max(...transectPoints.map((p) => p.elevationM));
  const totalDist = transectPoints[transectPoints.length - 1].distanceKm;

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;

  const pointsSvgString = transectPoints
    .map((p, idx) => {
      const x = paddingX + (p.distanceKm / totalDist) * (svgWidth - 2 * paddingX);
      const y =
        svgHeight -
        paddingY -
        ((p.elevationM - minElev) / (maxElev - minElev || 1)) * (svgHeight - 2 * paddingY);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPolygonString = `${paddingX},${svgHeight - paddingY} ${pointsSvgString} ${
    svgWidth - paddingX
  },${svgHeight - paddingY}`;

  const currentHoveredPoint = hoveredIndex !== null ? transectPoints[hoveredIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span>Ridge-to-Valley Topographic Elevation Transect</span>
            </h3>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Transect Line: [{startCoord[0].toFixed(4)}°N, {startCoord[1].toFixed(4)}°E] → [
              {endCoord[0].toFixed(4)}°N, {endCoord[1].toFixed(4)}°E] · Length: {totalDist} km
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transect Profile Graphic */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono pb-2">
            <span>Ridge Line (Elev: {maxElev}m)</span>
            <span>Valley Invert (Elev: {minElev}m)</span>
            <span>Total Relief: {maxElev - minElev}m</span>
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible cursor-crosshair"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
              const val = Math.round(minElev + ratio * (maxElev - minElev));
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-500 font-mono"
                  >
                    {val}m
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <polygon points={areaPolygonString} fill="url(#elevGradient)" />

            {/* Elevation Line */}
            <polyline
              points={pointsSvgString}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data point hover targets */}
            {transectPoints.map((p, idx) => {
              const x = paddingX + (p.distanceKm / totalDist) * (svgWidth - 2 * paddingX);
              const y =
                svgHeight -
                paddingY -
                ((p.elevationM - minElev) / (maxElev - minElev || 1)) * (svgHeight - 2 * paddingY);

              return (
                <g key={idx}>
                  {p.streamIntersection && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={svgHeight - paddingY}
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredIndex === idx ? 5 : 2.5}
                    fill={hoveredIndex === idx ? '#38bdf8' : p.streamIntersection ? '#0284c7' : '#0891b2'}
                    className="transition-all"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {currentHoveredPoint && (
            <div className="absolute top-14 right-8 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl space-y-1 z-20">
              <div className="text-cyan-300 font-semibold flex items-center justify-between gap-4">
                <span>Transect Station: {currentHoveredPoint.distanceKm} km</span>
                <span className="font-mono text-slate-100">{currentHoveredPoint.elevationM} m ASL</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Slope: <span className="text-slate-200">{currentHoveredPoint.slopePercent}%</span> · Zone:{' '}
                <span className="text-slate-200">{currentHoveredPoint.zone}</span>
              </div>
              {currentHoveredPoint.streamIntersection && (
                <div className="text-[11px] text-sky-400 font-medium">
                  🌊 Stream: {currentHoveredPoint.streamIntersection}
                </div>
              )}
              <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-800">
                Suitable SWC: {currentHoveredPoint.recommendedStructure}
              </div>
            </div>
          )}
        </div>

        {/* Hydrological Zonation & Conservation Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span>Upper Catchment (Ridge Zone)</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Slopes: 15% – 30% · Thin lithic soil · High velocity runoff origin.
            </div>
            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
              <strong>Mandatory Treatments:</strong> Continuous Contour Trenches (CCT), loose stone boulder gully plugs, Agave americana vegetative barriers.
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <span>Middle Slope (Arable Buffer)</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Slopes: 5% – 15% · Rainfed cropping zone · Sheet erosion risk.
            </div>
            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
              <strong>Mandatory Treatments:</strong> Earthen contour bunding with waste weirs, farm percolation ponds, vetiver hedge grass strips.
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="font-semibold text-sky-400 flex items-center gap-1.5">
              <span>Valley Bottom (Drainage Invert)</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Slopes: 1% – 5% · Concentrated 3rd order stream confluence.
            </div>
            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
              <strong>Mandatory Treatments:</strong> Masonry overflow check dams, percolation tanks, vegetative stream bank stabilization to arrest bed scour.
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
          >
            Close Transect
          </button>
        </div>
      </div>
    </div>
  );
};
