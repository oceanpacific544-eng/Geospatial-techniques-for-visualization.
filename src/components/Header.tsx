import React from 'react';
import { 
  FileText, 
  Upload, 
  Presentation, 
  Compass, 
  Layers, 
  BarChart3, 
  SplitSquareVertical, 
  Globe2, 
  Activity, 
  Sparkles,
  Bot
} from 'lucide-react';

export type AppTab = 'world-map' | 'map' | 'dashboard' | 'before-after' | 'earthexplorer' | 'spectral' | 'simulation' | 'structures';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenDprModal: () => void;
  onOpenUploadModal: () => void;
  onOpenPptModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenDprModal,
  onOpenUploadModal,
  onOpenPptModal,
}) => {
  const navTabs: { id: AppTab; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    { id: 'world-map', label: 'Live World Map', icon: <Globe2 className="w-3.5 h-3.5 text-cyan-400" />, isLive: true },
    { id: 'map', label: 'Catchment GIS Map', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Impact Dashboard', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'before-after', label: 'Before / After Swipe', icon: <SplitSquareVertical className="w-3.5 h-3.5" /> },
    { id: 'earthexplorer', label: 'EarthExplorer & Bhuvan', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { id: 'spectral', label: 'Spectral Indices', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'simulation', label: 'Hydrology SCS-CN', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 px-4 md:px-6 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-30">
      {/* Zone 1: Branding & Project Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-cyan-950/50 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Compass className="w-4 h-4 text-cyan-400 animate-[spin_12s_linear_infinite]" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-bold tracking-tight text-white whitespace-nowrap">
              WatershedGeoInsight
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              v2.4 Live
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden md:block">
            ISRO Bhuvan WMS · USGS EarthExplorer · AI Interpretation
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-medium bg-slate-900/60 p-1 rounded-lg border border-slate-800/80">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 transition-all duration-150 whitespace-nowrap rounded-md flex items-center gap-1.5 text-xs ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 font-semibold shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.isLive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700/60 ml-0.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions & Utilities */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile quick tabs switch */}
        <div className="lg:hidden">
          <select
            value={activeTab}
            onChange={(e) => onSelectTab(e.target.value as AppTab)}
            className="bg-slate-900 border border-slate-800 text-cyan-300 text-xs rounded px-2 py-1.5 focus:outline-none"
          >
            {navTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenPptModal}
          className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
          title="Architecture & Presentation Outline"
        >
          <Presentation className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Jury Guide</span>
        </button>

        <button
          onClick={onOpenUploadModal}
          className="px-2.5 py-1.5 text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-800/80 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
          title="Upload drone or mobile field photos with EXIF"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Photos</span>
        </button>

        <button
          onClick={onOpenDprModal}
          className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-cyan-900"
          title="Generate Comprehensive PMKSY Detailed Project Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export DPR</span>
        </button>
      </div>
    </header>
  );
};
