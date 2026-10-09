import React from 'react';
import { X, Presentation, CheckCircle2, Cpu, Database, Layers, ArrowRight, Download } from 'lucide-react';

interface PresentationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-8 space-y-6 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Presentation className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Watershed Geo-Coded Image Analysis: Executive Architecture & Jury Presentation
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                WDC-PMKSY / Bhuvan Drishti Scalable AI Inspection Pipeline
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

        {/* Slide 1: Problem Statement */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Slide 1: Problem Statement & Context
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under national watershed programs (such as PMKSY-WDC), field officers upload <strong>tens of thousands of geo-tagged smartphone photos</strong> of soil & water conservation structures (check dams, farm ponds, contour trenches, plantations). Traditional manual scrutiny is slow, error-prone, and fails to detect physical breaches or quantify ecological outcomes.
          </p>
        </div>

        {/* Slide 2: End-to-End Solution Architecture */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Slide 2: 5-Stage Automated Solution Architecture
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs text-center font-mono">
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-slate-200">1. Upload</div>
              <div className="text-[10px] text-slate-400">Batch photo ingestion with drag & drop</div>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-cyan-300">2. EXIF GPS</div>
              <div className="text-[10px] text-slate-400">exifr extraction of Lat/Lng & timestamp</div>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-400">3. Gemini 2.5</div>
              <div className="text-[10px] text-slate-400">Structure, condition, water, veg %, erosion</div>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-amber-400">4. Leaflet GIS</div>
              <div className="text-[10px] text-slate-400">Satellite tiles, heatmaps, 500m buffer</div>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-sky-400">5. Outcome</div>
              <div className="text-[10px] text-slate-400">Before/After swipe, CSV & DPR export</div>
            </div>
          </div>
        </div>

        {/* Slide 3: Impact Scoring Formula */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            Slide 3: Calibrated Impact Scoring Formula
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-cyan-300">
            Impact Score = 0.3 × Water + 0.3 × Vegetation + 0.2 × Condition + 0.2 × (1 − Soil Erosion)
          </div>
          <p className="text-[11px] text-slate-400">
            Objectively rates every site from 0 to 100 based on water presence (0-100), vegetation cover %, physical structure stability, and topsoil preservation.
          </p>
        </div>

        {/* Slide 4: Scalability & State-Wide Deployment */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Slide 4: Enterprise Scalability (Lakhs of Field Photos)
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>Batch Asynchronous Processing:</strong> Gemini 2.5 Flash processes up to 1,000 photos/min at low latency.</li>
            <li><strong>Offline Mobile First:</strong> Field officers can capture GPS photos offline in remote valleys; EXIF is processed upon network sync.</li>
            <li><strong>Automated Breach Alerts:</strong> Structures tagged with 'poor condition' or 'spillway fracture' automatically route to divisional engineers for immediate maintenance.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded text-xs transition-colors"
          >
            Close Presentation View
          </button>
        </div>
      </div>
    </div>
  );
};
