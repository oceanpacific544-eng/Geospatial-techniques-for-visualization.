import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Filter, 
  Trash2, 
  Compass, 
  Layers, 
  CheckCircle2, 
  DollarSign, 
  Droplets,
  FolderGit2
} from 'lucide-react';
import { SWCStructure, WatershedCatchment, StructureType } from '../types/watershed';

interface StructuresListProps {
  watershed: WatershedCatchment;
  structures: SWCStructure[];
  onAddStructure: (struct: SWCStructure) => void;
  onRemoveStructure: (id: string) => void;
  onFlyToStructure?: (lat: number, lng: number) => void;
}

export const StructuresList: React.FC<StructuresListProps> = ({
  watershed,
  structures,
  onAddStructure,
  onRemoveStructure,
  onFlyToStructure,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New structure form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'check_dam' as StructureType,
    lat: watershed.center[0],
    lng: watershed.center[1],
    elevationM: 580,
    storageCapacityM3: 20000,
    catchmentAreaHa: 1200,
    costEstimateINR: 350000,
    description: '',
  });

  const filteredStructures = structures.filter((s) => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const totalStorageM3 = structures.reduce((acc, s) => acc + s.storageCapacityM3, 0);
  const totalCostINR = structures.reduce((acc, s) => acc + s.costEstimateINR, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStruct: SWCStructure = {
      id: `struct-user-${Date.now()}`,
      name: formData.name || `Proposed ${formData.type.replace('_', ' ').toUpperCase()}`,
      type: formData.type,
      lat: formData.lat,
      lng: formData.lng,
      elevationM: formData.elevationM,
      storageCapacityM3: formData.storageCapacityM3,
      catchmentAreaHa: formData.catchmentAreaHa,
      costEstimateINR: formData.costEstimateINR,
      status: 'proposed',
      description: formData.description || 'Custom intervention added via planning console.',
    };
    onAddStructure(newStruct);
    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Ribbon */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-100">
            Soil & Water Conservation (SWC) Interventions Registry
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            {structures.length} Interventions Total
          </span>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Structure</span>
        </button>
      </div>

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">TOTAL REGISTERED UNITS</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {structures.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {structures.filter((s) => s.status === 'existing').length} existing ·{' '}
              {structures.filter((s) => s.status === 'proposed').length} proposed
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">CUMULATIVE STORAGE CAPACITY</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {totalStorageM3.toLocaleString()} <span className="text-xs text-slate-400">m³</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Harvested water across check dams & tanks
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">TOTAL CAPITAL OUTLAY</div>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              ₹{(totalCostINR / 100000).toFixed(2)} <span className="text-xs text-slate-400">Lakh</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Material, machinery & labour allocation
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 font-mono">WATERSHED BENEFICIARY REACH</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              640 <span className="text-xs text-slate-400">Farm Families</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across 3 revenue villages in catchment
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            {/* Type selector */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Structure Types</option>
              <option value="check_dam">Masonry Check Dams</option>
              <option value="farm_pond">Farm Percolation Ponds</option>
              <option value="cct">Contour Trenches (CCT)</option>
              <option value="gully_plug">Gully Plugs</option>
              <option value="percolation_tank">Percolation Tanks</option>
              <option value="afforestation">Agroforestry Buffers</option>
            </select>

            {/* Status selector */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="existing">Existing Structures</option>
              <option value="proposed">Proposed / Planned</option>
            </select>
          </div>

          <div className="text-slate-400 text-[11px] font-mono">
            Showing {filteredStructures.length} of {structures.length} structures
          </div>
        </div>

        {/* Structures Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              <tr>
                <th className="px-4 py-3">Structure Name & Type</th>
                <th className="px-4 py-3">Location Coordinates</th>
                <th className="px-4 py-3">Elevation</th>
                <th className="px-4 py-3">Storage / Capacity</th>
                <th className="px-4 py-3">Catchment</th>
                <th className="px-4 py-3">Budget Estimate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredStructures.map((struct) => (
                <tr key={struct.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{struct.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {struct.type.replace('_', ' ')}
                      {struct.streamOrder ? ` · Order ${struct.streamOrder} Stream` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-cyan-300">
                    {struct.lat.toFixed(4)}°N, {struct.lng.toFixed(4)}°E
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    {struct.elevationM} m
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {struct.storageCapacityM3.toLocaleString()} m³
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {struct.catchmentAreaHa} ha
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    ₹{(struct.costEstimateINR / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        struct.status === 'existing'
                          ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                          : 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10'
                      }`}
                    >
                      {struct.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemoveStructure(struct.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove intervention"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Structure Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Register Proposed Conservation Structure</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Structure Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cement Plug Dam #3 at North Tributary"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Intervention Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as StructureType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="check_dam">Masonry Check Dam</option>
                    <option value="farm_pond">Farm Pond / Percolation</option>
                    <option value="cct">Contour Trenches (CCT)</option>
                    <option value="gully_plug">Gully Plug</option>
                    <option value="percolation_tank">Percolation Tank</option>
                    <option value="afforestation">Agroforestry Buffer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Elevation (m ASL)</label>
                  <input
                    type="number"
                    value={formData.elevationM}
                    onChange={(e) => setFormData({ ...formData, elevationM: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Storage Capacity (m³)</label>
                  <input
                    type="number"
                    value={formData.storageCapacityM3}
                    onChange={(e) =>
                      setFormData({ ...formData, storageCapacityM3: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Catchment Area (ha)</label>
                  <input
                    type="number"
                    value={formData.catchmentAreaHa}
                    onChange={(e) =>
                      setFormData({ ...formData, catchmentAreaHa: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Cost (INR)</label>
                <input
                  type="number"
                  value={formData.costEstimateINR}
                  onChange={(e) =>
                    setFormData({ ...formData, costEstimateINR: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technical Rationale & Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Stream bed morphology, foundation conditions, upstream gully severity..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded"
                >
                  Save Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
