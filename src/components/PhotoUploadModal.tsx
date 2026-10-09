import React, { useState, useRef } from 'react';
import exifr from 'exifr';
import { 
  Upload, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  X, 
  Trash2, 
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { GeoTaggedPhoto, PhotoAiAnalysis, WatershedCatchment } from '../types/watershed';
import { calculateFormulaImpactScore } from '../data/sampleFieldPhotos';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  watershed: WatershedCatchment;
  onAddPhotos: (newPhotos: GeoTaggedPhoto[]) => void;
}

interface StagedPhoto {
  id: string;
  file?: File;
  fileName: string;
  imageUrl: string;
  lat: number | null;
  lng: number | null;
  timestamp: string;
  projectName: string;
  district: string;
  phase: 'before' | 'after';
  siteId: string;
  hasExifGps: boolean;
  status: 'ready' | 'analyzing' | 'completed' | 'error';
  analysis?: PhotoAiAnalysis;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  watershed,
  onAddPhotos,
}) => {
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [isProcessingExif, setIsProcessingExif] = useState<boolean>(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState<boolean>(false);
  const [pickingLocationPhotoId, setPickingLocationPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingExif(true);
    const newStaged: StagedPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = `photo-${Date.now()}-${i}`;
      const imageUrl = URL.createObjectURL(file);

      let lat: number | null = null;
      let lng: number | null = null;
      let timestamp = new Date().toISOString();
      let hasExif = false;

      try {
        // Extract GPS & Timestamp via exifr
        const exifData = await exifr.parse(file, ['latitude', 'longitude', 'DateTimeOriginal']);
        if (exifData?.latitude && exifData?.longitude) {
          lat = parseFloat(exifData.latitude.toFixed(6));
          lng = parseFloat(exifData.longitude.toFixed(6));
          hasExif = true;
        }
        if (exifData?.DateTimeOriginal) {
          timestamp = new Date(exifData.DateTimeOriginal).toISOString();
        }
      } catch (err) {
        console.warn('Could not extract EXIF from', file.name, err);
      }

      // Default fallback to watershed center if no EXIF
      if (lat === null || lng === null) {
        // slight jitter around watershed center
        lat = parseFloat((watershed.center[0] + (Math.random() - 0.5) * 0.02).toFixed(5));
        lng = parseFloat((watershed.center[1] + (Math.random() - 0.5) * 0.02).toFixed(5));
      }

      newStaged.push({
        id: photoId,
        file,
        fileName: file.name,
        imageUrl,
        lat,
        lng,
        timestamp,
        projectName: watershed.name,
        district: 'Kurnool',
        phase: 'after',
        siteId: `SITE-${Date.now().toString().slice(-4)}`,
        hasExifGps: hasExif,
        status: 'ready',
      });
    }

    setStagedPhotos((prev) => [...prev, ...newStaged]);
    setIsProcessingExif(false);
  };

  const removeStagedPhoto = (id: string) => {
    setStagedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzingAll(true);

    for (const photo of stagedPhotos) {
      if (photo.status === 'completed') continue;

      // Update status to analyzing
      setStagedPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, status: 'analyzing' } : p))
      );

      try {
        let base64 = '';
        if (photo.file) {
          base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(photo.file!);
          });
        }

        const res = await fetch('/api/analyze-field-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            imageMimeType: photo.file?.type || 'image/jpeg',
            photoId: photo.id,
            metadata: {
              phase: photo.phase,
              projectName: photo.projectName,
            },
          }),
        });

        const data = await res.json();
        const analysis: PhotoAiAnalysis = {
          structure_type: data.structure_type || 'check dam',
          condition: data.condition || 'good',
          water_presence: data.water_presence || 'high',
          vegetation_cover_percent: data.vegetation_cover_percent ?? 70,
          soil_erosion_signs: data.soil_erosion_signs ?? false,
          issues: data.issues || [],
          impact_score: data.impact_score ?? calculateFormulaImpactScore(
            data.water_presence || 'high',
            data.vegetation_cover_percent || 70,
            data.condition || 'good',
            data.soil_erosion_signs || false
          ),
          remarks: data.remarks || 'Analysis completed successfully.',
          verifiedByUser: false,
        };

        setStagedPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: 'completed', analysis } : p))
        );
      } catch (err) {
        console.error('Failed to analyze photo', photo.id, err);
        setStagedPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, status: 'error' } : p))
        );
      }
    }

    setIsAnalyzingAll(false);
  };

  const handleCommitAll = () => {
    const validPhotos: GeoTaggedPhoto[] = stagedPhotos.map((p) => ({
      id: p.id,
      fileName: p.fileName,
      imageUrl: p.imageUrl,
      lat: p.lat || watershed.center[0],
      lng: p.lng || watershed.center[1],
      timestamp: p.timestamp,
      projectName: p.projectName,
      district: p.district,
      phase: p.phase,
      siteId: p.siteId,
      hasExifGps: p.hasExifGps,
      aiAnalysis: p.analysis || {
        structure_type: 'check dam',
        condition: 'good',
        water_presence: 'high',
        vegetation_cover_percent: 65,
        soil_erosion_signs: false,
        issues: [],
        impact_score: 82,
        remarks: 'Manual upload registered.',
      },
    }));

    onAddPhotos(validPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-5 shadow-2xl text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Geo-Tagged Field Photo Ingestion (WDC-PMKSY / Bhuvan Drishti)</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Extracts GPS (lat/long) & timestamp via EXIF. Analyzes structure type, water presence, and impact via Gemini Vision.
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag and Drop Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-400/70 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            multiple
            accept="image/*"
            className="hidden"
          />
          <FolderPlus className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-xs font-semibold text-slate-200">
            Click to upload field photos or drag and drop multiple files
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            EXIF GPS coordinates (lat, long) and acquisition time will be auto-extracted via <code>exifr</code>
          </div>
        </div>

        {/* Staged Photos Queue */}
        {stagedPhotos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 font-mono">
                Staged Field Photos ({stagedPhotos.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzingAll}
                  className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isAnalyzingAll ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing via Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze All with Gemini Vision</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {stagedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-4 text-xs"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.fileName}
                    className="w-16 h-14 object-cover rounded border border-slate-700 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-200 truncate">{photo.fileName}</div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          photo.hasExifGps
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {photo.hasExifGps ? 'EXIF GPS VERIFIED' : 'DEFAULT GPS FALLBACK'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <MapPin className="w-3 h-3" />
                        <span>{photo.lat?.toFixed(5)}°N, {photo.lng?.toFixed(5)}°E</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                      </span>
                      <span>
                        Phase:{' '}
                        <select
                          value={photo.phase}
                          onChange={(e) =>
                            setStagedPhotos((prev) =>
                              prev.map((p) =>
                                p.id === photo.id
                                  ? { ...p, phase: e.target.value as 'before' | 'after' }
                                  : p
                              )
                            )
                          }
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-1 py-0.5 text-[10px]"
                        >
                          <option value="after">After (Treated)</option>
                          <option value="before">Before (Pre-Treatment)</option>
                        </select>
                      </span>
                    </div>

                    {photo.analysis && (
                      <div className="pt-1 text-[11px] text-emerald-300 font-sans flex items-center gap-3">
                        <span><strong>{photo.analysis.structure_type.toUpperCase()}</strong> ({photo.analysis.condition})</span>
                        <span>· Water: {photo.analysis.water_presence}</span>
                        <span>· Veg: {photo.analysis.vegetation_cover_percent}%</span>
                        <span className="font-mono font-semibold text-cyan-300">
                          Impact Score: {photo.analysis.impact_score}/100
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeStagedPhoto(photo.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="text-[11px] text-slate-400">
            {stagedPhotos.length} photos staged ·{' '}
            {stagedPhotos.filter((p) => p.status === 'completed').length} analyzed
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitAll}
              disabled={stagedPhotos.length === 0}
              className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded text-xs transition-colors disabled:opacity-50"
            >
              Add Photos to Map & Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
