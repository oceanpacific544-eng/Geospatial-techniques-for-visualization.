import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Eye, 
  MapPin, 
  Activity, 
  Sliders, 
  Crosshair, 
  Ruler, 
  Plus, 
  Compass, 
  Info,
  Maximize2,
  Globe,
  X,
  Sparkles
} from 'lucide-react';
import { 
  WatershedCatchment, 
  LayerType, 
  SWCStructure, 
  InspectionData, 
  StructureType,
  GeoTaggedPhoto,
  BhuvanOverlay
} from '../types/watershed';
import { SPECTRAL_INDICES_META } from '../data/watershedData';
import { AIChatAssistant } from './AIChatAssistant';

interface GeoWatershedMapProps {
  watershed: WatershedCatchment;
  selectedLayer: LayerType;
  onSelectLayer: (layer: LayerType) => void;
  activeStructures: SWCStructure[];
  onAddStructure: (structure: SWCStructure) => void;
  onOpenTransectModal: (startCoord: [number, number], endCoord: [number, number]) => void;
  inspectionData: InspectionData | null;
  onUpdateInspection: (data: InspectionData) => void;
  photos?: GeoTaggedPhoto[];
  onSelectPhoto?: (photo: GeoTaggedPhoto) => void;
  onOpenBhuvanModal?: () => void;
  onNavigateToWorldMap?: () => void;
  bhuvanOverlay?: BhuvanOverlay | null;
  onClearBhuvanOverlay?: () => void;
  onUpdateBhuvanOpacity?: (opacity: number) => void;
}

export const GeoWatershedMap: React.FC<GeoWatershedMapProps> = ({
  watershed,
  selectedLayer,
  onSelectLayer,
  activeStructures,
  onAddStructure,
  onOpenTransectModal,
  inspectionData,
  onUpdateInspection,
  photos = [],
  onSelectPhoto,
  onOpenBhuvanModal,
  onNavigateToWorldMap,
  bhuvanOverlay,
  onClearBhuvanOverlay,
  onUpdateBhuvanOpacity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const bhuvanWmsLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const bhuvanThematicGroupRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const streamsLayerRef = useRef<L.LayerGroup | null>(null);
  const structuresLayerRef = useRef<L.LayerGroup | null>(null);
  const erosionLayerRef = useRef<L.LayerGroup | null>(null);
  const photosLayerRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerRef = useRef<L.LayerGroup | null>(null);
  const transectLineLayerRef = useRef<L.Polyline | null>(null);

  // Map state
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'dark' | 'topo'>('satellite');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.85);
  const [showStreams, setShowStreams] = useState<boolean>(true);
  const [showStructures, setShowStructures] = useState<boolean>(true);
  const [showErosionZones, setShowErosionZones] = useState<boolean>(true);
  const [showPhotoMarkers, setShowPhotoMarkers] = useState<boolean>(true);
  const [show500mBuffer, setShow500mBuffer] = useState<boolean>(true);
  const [interactionMode, setInteractionMode] = useState<'inspect' | 'transect' | 'add_structure'>('inspect');
  const [structureTypeToAdd, setStructureTypeToAdd] = useState<StructureType>('check_dam');
  const [transectPoints, setTransectPoints] = useState<[number, number][]>([]);

  // Base tile layers
  const baseTilesRef = useRef<{ [key: string]: L.TileLayer }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: watershed.center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile providers
    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );
    const darkTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    );
    const topoTile = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { maxZoom: 17 }
    );

    baseTilesRef.current = {
      satellite: satelliteTile,
      dark: darkTile,
      topo: topoTile,
    };

    satelliteTile.addTo(map);

    // Layer groups
    streamsLayerRef.current = L.layerGroup().addTo(map);
    structuresLayerRef.current = L.layerGroup().addTo(map);
    erosionLayerRef.current = L.layerGroup().addTo(map);
    photosLayerRef.current = L.layerGroup().addTo(map);
    bufferLayerRef.current = L.layerGroup().addTo(map);
    bhuvanThematicGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(baseTilesRef.current).forEach((tile) => {
      if (map.hasLayer(tile)) map.removeLayer(tile);
    });

    const activeTile = baseTilesRef.current[baseMapType];
    if (activeTile) {
      activeTile.addTo(map);
    }
  }, [baseMapType]);

  // Recenter when watershed changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(watershed.center, 13, { duration: 1.2 });
  }, [watershed]);

  // Update Geo-Coded Raster Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }

    let imageUrl = watershed.imagery.rgbSatellite;
    if (selectedLayer === 'fcc_infrared') {
      imageUrl = watershed.imagery.fccInfrared;
    } else if (selectedLayer === 'erosion_hazard') {
      imageUrl = watershed.imagery.erosionSurvey;
    } else if (selectedLayer === 'dem_elevation') {
      imageUrl = watershed.imagery.interventionsAerial;
    }

    const bounds = L.latLngBounds(watershed.bounds[0], watershed.bounds[1]);

    const overlay = L.imageOverlay(imageUrl, bounds, {
      opacity: layerOpacity,
      interactive: false,
    }).addTo(map);

    imageOverlayRef.current = overlay;
  }, [watershed, selectedLayer, layerOpacity]);

  // Update Boundary Polygon
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
    }

    const polygon = L.polygon(watershed.boundaryGeoJson, {
      color: '#38bdf8',
      weight: 2,
      dashArray: '5, 5',
      fillColor: '#0284c7',
      fillOpacity: 0.05,
    }).addTo(map);

    boundaryLayerRef.current = polygon;
  }, [watershed]);

  // Update ISRO Bhuvan WMS & Thematic Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (bhuvanWmsLayerRef.current) {
      map.removeLayer(bhuvanWmsLayerRef.current);
      bhuvanWmsLayerRef.current = null;
    }

    const thematicGroup = bhuvanThematicGroupRef.current;
    if (thematicGroup) {
      thematicGroup.clearLayers();
    }

    if (!bhuvanOverlay) return;

    // 1. Mount official ISRO Bhuvan WMS Layer
    try {
      const wms = L.tileLayer.wms('https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms', {
        layers: bhuvanOverlay.wmsLayerName,
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        opacity: bhuvanOverlay.opacity,
        maxZoom: 19,
      });
      wms.addTo(map);
      bhuvanWmsLayerRef.current = wms;
    } catch (err) {
      console.warn('Bhuvan WMS initialisation notice:', err);
    }

    // 2. Overlay thematic GIS layer representation for immediate high-fidelity visualization
    if (thematicGroup) {
      const bGeo = watershed.boundaryGeoJson;
      const c = watershed.center;

      if (bhuvanOverlay.wmsLayerName.includes('lulc') || bhuvanOverlay.wmsLayerName.includes('LULC')) {
        // High-contrast NRSC 1:50k LULC classification overlay
        const agriculturalZone = L.polygon([
          [bGeo[0][0], bGeo[0][1]],
          [c[0] - 0.012, c[1] - 0.018],
          [c[0] + 0.008, c[1] - 0.012],
          [bGeo[2][0], bGeo[2][1]],
          [bGeo[1][0], bGeo[1][1]],
        ], {
          color: '#84cc16',
          weight: 1.5,
          fillColor: '#84cc16',
          fillOpacity: Math.min(0.65, bhuvanOverlay.opacity * 0.55),
        }).bindTooltip('<div class="text-xs font-mono"><strong>ISRO Bhuvan LULC 1:50,000</strong><br/>Crop Land (Kharif / Rabi)<br/>Code: AGR-01 · NRSC Classified</div>');

        const degradedRidgeZone = L.polygon([
          [bGeo[3][0], bGeo[3][1]],
          [bGeo[4][0], bGeo[4][1]],
          [c[0] + 0.018, c[1] + 0.012],
          [c[0] + 0.008, c[1] - 0.012],
        ], {
          color: '#d97706',
          weight: 1.5,
          fillColor: '#d97706',
          fillOpacity: Math.min(0.65, bhuvanOverlay.opacity * 0.55),
        }).bindTooltip('<div class="text-xs font-mono"><strong>ISRO Bhuvan LULC 1:50,000</strong><br/>Scrubland / Degraded Ridge<br/>Code: WST-04 · Priority Conservation</div>');

        thematicGroup.addLayer(agriculturalZone);
        thematicGroup.addLayer(degradedRidgeZone);
      } else if (bhuvanOverlay.wmsLayerName.includes('slope')) {
        const slopeZone = L.polygon(watershed.boundaryGeoJson, {
          color: '#f59e0b',
          weight: 2,
          dashArray: '3, 4',
          fillColor: '#ea580c',
          fillOpacity: Math.min(0.55, bhuvanOverlay.opacity * 0.45),
        }).bindTooltip('<div class="text-xs font-mono"><strong>ISRO CartoDEM Slope v3</strong><br/>8 - 25% Moderate-to-Steep Slope<br/>Drainage Aspect: South-Easterly</div>');
        thematicGroup.addLayer(slopeZone);
      } else if (bhuvanOverlay.wmsLayerName.includes('watershed') || bhuvanOverlay.wmsLayerName.includes('pmksy')) {
        const boundaryZone = L.polygon(watershed.boundaryGeoJson, {
          color: '#06b6d4',
          weight: 3,
          fillColor: '#0891b2',
          fillOpacity: Math.min(0.4, bhuvanOverlay.opacity * 0.3),
        }).bindTooltip(`<div class="text-xs font-mono"><strong>National PMKSY-WDC Atlas</strong><br/>Micro-Watershed: ${watershed.name}<br/>Code: ${watershed.code}</div>`);
        thematicGroup.addLayer(boundaryZone);
      }
    }
  }, [bhuvanOverlay, watershed]);

  // Update Streams Layer
  useEffect(() => {
    const layerGroup = streamsLayerRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    if (!showStreams) return;

    watershed.streams.forEach((stream) => {
      let color = '#38bdf8';
      let weight = 2;

      if (stream.order === 3) {
        color = '#0284c7';
        weight = 4;
      } else if (stream.order === 2) {
        color = '#0ea5e9';
        weight = 2.5;
      } else if (stream.order === 1) {
        color = '#7dd3fc';
        weight = 1.5;
      }

      const polyline = L.polyline(stream.coordinates, {
        color,
        weight,
        opacity: 0.9,
      });

      polyline.bindTooltip(
        `<div class="text-xs font-mono"><strong>${stream.name}</strong><br/>Strahler Order ${stream.order} · ${stream.lengthKm} km</div>`,
        { sticky: true }
      );

      layerGroup.addLayer(polyline);
    });
  }, [watershed, showStreams]);

  // Update Soil Erosion Hazard Zones
  useEffect(() => {
    const layerGroup = erosionLayerRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    if (!showErosionZones) return;

    watershed.erosionRiskZones.forEach((zone) => {
      const polygon = L.polygon(zone.coordinates, {
        color: zone.color,
        weight: 1.5,
        fillColor: zone.color,
        fillOpacity: 0.22,
      });

      polygon.bindTooltip(
        `<div class="text-xs font-mono"><strong>${zone.severity} Erosion Risk</strong><br/>Area: ${zone.areaHa} ha</div>`,
        { sticky: true }
      );

      layerGroup.addLayer(polygon);
    });
  }, [watershed, showErosionZones]);

  // Update SWC Structures Layer
  useEffect(() => {
    const layerGroup = structuresLayerRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    if (!showStructures) return;

    activeStructures.forEach((struct) => {
      let markerColor = '#38bdf8';
      let iconSymbol = '■';

      switch (struct.type) {
        case 'check_dam':
          markerColor = '#06b6d4'; // cyan
          iconSymbol = 'CD';
          break;
        case 'farm_pond':
          markerColor = '#3b82f6'; // blue
          iconSymbol = 'FP';
          break;
        case 'cct':
          markerColor = '#f59e0b'; // amber
          iconSymbol = 'CT';
          break;
        case 'gully_plug':
          markerColor = '#a855f7'; // purple
          iconSymbol = 'GP';
          break;
        case 'percolation_tank':
          markerColor = '#10b981'; // emerald
          iconSymbol = 'PT';
          break;
        case 'afforestation':
          markerColor = '#22c55e'; // green
          iconSymbol = 'AF';
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-struct-marker',
        html: `
          <div style="background-color: ${markerColor};" class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 border border-white shadow-md transform hover:scale-125 transition-transform">
            ${iconSymbol}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([struct.lat, struct.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="p-1 space-y-1.5 text-xs text-slate-100 min-w-[200px]">
          <div class="font-bold text-sm text-cyan-300">${struct.name}</div>
          <div class="text-slate-400 capitalize">${struct.type.replace('_', ' ')} · ${struct.status}</div>
          <div class="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-700">
            <div>Elevation: <span class="font-mono text-slate-200">${struct.elevationM} m</span></div>
            <div>Storage: <span class="font-mono text-slate-200">${struct.storageCapacityM3.toLocaleString()} m³</span></div>
            <div>Catchment: <span class="font-mono text-slate-200">${struct.catchmentAreaHa} ha</span></div>
            <div>Budget: <span class="font-mono text-slate-200">₹${(struct.costEstimateINR / 1000).toFixed(0)}k</span></div>
          </div>
          <p class="text-[11px] text-slate-300 mt-1">${struct.description}</p>
        </div>
      `);

      layerGroup.addLayer(marker);
    });
  }, [activeStructures, showStructures]);

  // Update Geo-Tagged Field Photos Layer (Step 4: Colored by condition)
  useEffect(() => {
    const photosGroup = photosLayerRef.current;
    const bufferGroup = bufferLayerRef.current;
    if (!photosGroup || !bufferGroup) return;

    photosGroup.clearLayers();
    bufferGroup.clearLayers();

    if (!showPhotoMarkers) return;

    photos.forEach((photo) => {
      const condition = photo.aiAnalysis?.condition || 'good';
      let color = '#10b981'; // Green for good
      if (condition === 'moderate') color = '#f59e0b'; // Orange for moderate
      if (condition === 'poor') color = '#ef4444'; // Red for poor

      // 500m Buffer Zone (Step 4 & 5)
      if (show500mBuffer) {
        const bufferCircle = L.circle([photo.lat, photo.lng], {
          radius: 500,
          color: color,
          weight: 1,
          dashArray: '3, 4',
          fillColor: color,
          fillOpacity: 0.06,
        });
        bufferCircle.bindTooltip(
          `<div class="text-[10px] font-mono">500m Buffer Zone around ${photo.aiAnalysis?.structure_type || 'structure'}</div>`,
          { sticky: true }
        );
        bufferGroup.addLayer(bufferCircle);
      }

      // Custom Geo-Tagged Photo Marker Icon
      const photoMarkerIcon = L.divIcon({
        className: 'custom-photo-marker',
        html: `
          <div style="background-color: ${color};" class="w-7 h-7 rounded-full flex items-center justify-center text-slate-950 font-bold text-[10px] border-2 border-white shadow-xl cursor-pointer hover:scale-125 transition-transform">
            📷
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([photo.lat, photo.lng], { icon: photoMarkerIcon });

      const analysis = photo.aiAnalysis;
      marker.bindPopup(`
        <div class="p-1 space-y-2 text-xs text-slate-100 max-w-[220px]">
          <div class="w-full h-24 overflow-hidden rounded border border-slate-700">
            <img src="${photo.imageUrl}" alt="${photo.fileName}" class="w-full h-full object-cover" />
          </div>
          <div class="flex items-center justify-between">
            <span class="font-bold text-cyan-300 capitalize">${analysis?.structure_type || 'Field Photo'}</span>
            <span style="color: ${color};" class="font-bold uppercase text-[10px]">${analysis?.condition || 'UNKNOWN'}</span>
          </div>
          <div class="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-700 font-mono">
            <div>Water: <span class="text-slate-200 capitalize">${analysis?.water_presence || 'none'}</span></div>
            <div>Veg: <span class="text-emerald-400">${analysis?.vegetation_cover_percent || 0}%</span></div>
            <div>Phase: <span class="text-cyan-300 uppercase">${photo.phase}</span></div>
            <div>Impact: <span class="text-amber-300 font-bold">${analysis?.impact_score || 0}/100</span></div>
          </div>
          <div class="text-[10px] text-slate-400 font-mono">
            ${photo.lat.toFixed(4)}°N, ${photo.lng.toFixed(4)}°E
          </div>
          <p class="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
            "${analysis?.remarks || ''}"
          </p>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectPhoto) onSelectPhoto(photo);
      });

      photosGroup.addLayer(marker);
    });
  }, [photos, showPhotoMarkers, show500mBuffer, onSelectPhoto]);

  // Handle Map Clicks for Inspect, Transect, and Structure placement
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Calculate synthetic yet physically constrained values based on distance to center & bounds
      const distFromCenter = Math.sqrt(
        Math.pow(lat - watershed.center[0], 2) + Math.pow(lng - watershed.center[1], 2)
      );
      const normalizedDist = Math.min(1, distFromCenter / 0.05);

      const calculatedElevation = Math.round(
        watershed.elevationMinM + normalizedDist * (watershed.elevationMaxM - watershed.elevationMinM)
      );
      const calculatedSlope = parseFloat((3 + normalizedDist * 22).toFixed(1));
      const calculatedNdvi = parseFloat((0.68 - normalizedDist * 0.42).toFixed(2));
      const lulcClass =
        normalizedDist > 0.65
          ? 'Barren Ridge Escarpment / Degraded Scrub'
          : normalizedDist > 0.35
          ? 'Rainfed Agriculture (Sorghum/Pigeonpea)'
          : 'Valley Irrigated Crop / Riparian Buffer';
      const erosionRisk =
        calculatedSlope > 18 ? 'Severe' : calculatedSlope > 8 ? 'Moderate' : 'Low';
      const curveNumber = calculatedSlope > 18 ? 86 : calculatedSlope > 8 ? 79 : 68;

      let treatment = 'In-situ moisture conservation & contour bunding';
      if (calculatedSlope > 20) {
        treatment = 'Continuous Contour Trenches (CCT) & Agave buffer';
      } else if (normalizedDist < 0.25) {
        treatment = 'Masonry Check Dam / Percolation pond site';
      }

      onUpdateInspection({
        lat: parseFloat(lat.toFixed(5)),
        lng: parseFloat(lng.toFixed(5)),
        elevationM: calculatedElevation,
        slopePercent: calculatedSlope,
        lulcClass,
        ndviValue: calculatedNdvi,
        soilGroup: watershed.hydrologicalSoilGroup,
        erosionRisk,
        curveNumber,
        recommendedTreatment: treatment,
      });

      if (interactionMode === 'transect') {
        if (transectPoints.length === 0) {
          setTransectPoints([[lat, lng]]);
        } else {
          const start = transectPoints[0];
          const end: [number, number] = [lat, lng];
          setTransectPoints([]);
          setInteractionMode('inspect');
          onOpenTransectModal(start, end);
        }
      } else if (interactionMode === 'add_structure') {
        const newStruct: SWCStructure = {
          id: `custom-${Date.now()}`,
          name: `Proposed ${structureTypeToAdd.replace('_', ' ').toUpperCase()} #${activeStructures.length + 1}`,
          type: structureTypeToAdd,
          lat: parseFloat(lat.toFixed(5)),
          lng: parseFloat(lng.toFixed(5)),
          elevationM: calculatedElevation,
          storageCapacityM3: structureTypeToAdd === 'check_dam' ? 25000 : structureTypeToAdd === 'farm_pond' ? 5000 : 1500,
          catchmentAreaHa: structureTypeToAdd === 'check_dam' ? 1200 : 40,
          costEstimateINR: structureTypeToAdd === 'check_dam' ? 380000 : 90000,
          status: 'proposed',
          description: `Custom conservation structure proposed during geospatial planning session at ${calculatedElevation}m elevation.`,
        };
        onAddStructure(newStruct);
        setInteractionMode('inspect');
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [
    watershed,
    interactionMode,
    transectPoints,
    structureTypeToAdd,
    activeStructures,
    onAddStructure,
    onOpenTransectModal,
    onUpdateInspection,
  ]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Top Map Toolbar Ribbon */}
      <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between text-xs text-slate-300 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{watershed.name}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-400">
            {watershed.areaHa.toLocaleString()} ha · Perim: {watershed.perimeterKm} km
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Elev: {watershed.elevationMinM}m – {watershed.elevationMaxM}m ASL
          </span>
        </div>

        {/* Action Modes */}
        <div className="flex items-center gap-2">
          {onNavigateToWorldMap && (
            <button
              onClick={onNavigateToWorldMap}
              className="px-2.5 py-1 bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950 hover:from-emerald-900 hover:to-cyan-900 border border-emerald-500/60 rounded text-emerald-300 font-medium text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
              title="Open Continuous 360° Planetary Live World Map"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Live World Map</span>
              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">LIVE</span>
            </button>
          )}

          {onOpenBhuvanModal && (
            <button
              onClick={onOpenBhuvanModal}
              className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 rounded text-cyan-300 font-medium text-[11px] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Bhuvan/ISRO Data Integration</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => {
                setInteractionMode('inspect');
                setTransectPoints([]);
              }}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                interactionMode === 'inspect'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crosshair className="w-3 h-3" />
              <span>Inspect Pixel</span>
            </button>
            <button
              onClick={() => {
                setInteractionMode('transect');
                setTransectPoints([]);
              }}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                interactionMode === 'transect'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ruler className="w-3 h-3" />
              <span>{transectPoints.length === 1 ? 'Click Point B' : 'Draw Transect'}</span>
            </button>
            <button
              onClick={() => {
                setInteractionMode('add_structure');
                setTransectPoints([]);
              }}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                interactionMode === 'add_structure'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>Place SWC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Stage */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Active Bhuvan WMS Overlay Card */}
        {bhuvanOverlay && (
          <div className="absolute top-3 left-72 z-10 w-80 bg-slate-900/95 backdrop-blur border border-cyan-500/50 rounded-lg p-3 text-xs shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="font-bold text-cyan-300">ISRO Bhuvan WMS Active</span>
              </div>
              {onClearBhuvanOverlay && (
                <button
                  onClick={onClearBhuvanOverlay}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title="Remove Bhuvan Overlay"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-slate-100 text-[12px]">{bhuvanOverlay.name}</div>
              <div className="text-[10px] text-cyan-400/90 font-mono flex items-center justify-between">
                <span>{bhuvanOverlay.wmsLayerName}</span>
                <span className="text-slate-400">{bhuvanOverlay.category}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                {bhuvanOverlay.description}
              </p>
            </div>

            {/* Opacity Scrubber */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>WMS Opacity</span>
                <span>{Math.round(bhuvanOverlay.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={bhuvanOverlay.opacity}
                onChange={(e) => onUpdateBhuvanOpacity?.(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              {onOpenBhuvanModal && (
                <button
                  onClick={onOpenBhuvanModal}
                  className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  Change Bhuvan Layer
                </button>
              )}
              <span className="text-[10px] text-slate-500 font-mono">NRSC Geoportal WMS</span>
            </div>
          </div>
        )}

        {/* Floating Layer Control Floating Panel (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 w-64 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Spectral & DEM Layers</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">10m Res</span>
          </div>

          {/* Layer Selector */}
          <div className="space-y-1">
            {SPECTRAL_INDICES_META.map((meta) => (
              <button
                key={meta.id}
                onClick={() => onSelectLayer(meta.id as LayerType)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors flex items-center justify-between ${
                  selectedLayer === meta.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{meta.name}</span>
                {selectedLayer === meta.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>

          {/* Opacity Scrubber */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Raster Opacity</span>
              <span>{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Vector Overlays Toggle */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[11px] font-medium text-slate-300">Vector Features</div>
            <label className="flex items-center justify-between text-[11px] text-slate-400 cursor-pointer">
              <span>Drainage Channels (Orders 1-3)</span>
              <input
                type="checkbox"
                checked={showStreams}
                onChange={(e) => setShowStreams(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>
            <label className="flex items-center justify-between text-[11px] text-slate-400 cursor-pointer">
              <span>Erosion Hazard Polygons</span>
              <input
                type="checkbox"
                checked={showErosionZones}
                onChange={(e) => setShowErosionZones(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>
            <label className="flex items-center justify-between text-[11px] text-slate-400 cursor-pointer">
              <span>SWC Structure Points</span>
              <input
                type="checkbox"
                checked={showStructures}
                onChange={(e) => setShowStructures(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>
            <label className="flex items-center justify-between text-[11px] text-slate-400 cursor-pointer">
              <span>Geo-Tagged Photos (GPS)</span>
              <input
                type="checkbox"
                checked={showPhotoMarkers}
                onChange={(e) => setShowPhotoMarkers(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>
            <label className="flex items-center justify-between text-[11px] text-slate-400 cursor-pointer">
              <span>500m Buffer Zone Circles</span>
              <input
                type="checkbox"
                checked={show500mBuffer}
                onChange={(e) => setShow500mBuffer(e.target.checked)}
                className="accent-cyan-400"
              />
            </label>
          </div>

          {/* Base Map Style */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-400 mb-1">Base Map</div>
            <div className="grid grid-cols-3 gap-1">
              {(['satellite', 'dark', 'topo'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setBaseMapType(style)}
                  className={`py-1 text-[10px] capitalize rounded text-center transition-colors ${
                    baseMapType === style
                      ? 'bg-slate-700 text-cyan-300 font-medium'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Structure Placement Palette (When in Add Structure mode) */}
        {interactionMode === 'add_structure' && (
          <div className="absolute top-3 left-72 z-10 bg-slate-900/90 backdrop-blur border border-amber-500/40 rounded-lg p-3 text-xs shadow-xl space-y-2 max-w-xs animate-in fade-in">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Select Conservation Structure to Place</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Click anywhere on a drainage stream or ridge contour to place the proposed structure.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {(
                [
                  { id: 'check_dam', label: 'Check Dam' },
                  { id: 'farm_pond', label: 'Farm Pond' },
                  { id: 'cct', label: 'Contour Trench' },
                  { id: 'gully_plug', label: 'Gully Plug' },
                  { id: 'percolation_tank', label: 'Percolation Tank' },
                  { id: 'afforestation', label: 'Agroforestry Block' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStructureTypeToAdd(item.id)}
                  className={`p-1.5 rounded text-[11px] text-left transition-colors border ${
                    structureTypeToAdd === item.id
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-medium'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Inspector HUD Card */}
        {inspectionData && (
          <div className="absolute bottom-4 left-4 right-16 z-10 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-3 shadow-2xl text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Geospatial Pixel Probe</span>
                </span>
                <span className="font-mono text-cyan-300 text-[11px]">
                  {inspectionData.lat}° N · {inspectionData.lng}° E
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                LULC: <span className="text-slate-200">{inspectionData.lulcClass}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2 text-[11px]">
              <div>
                <div className="text-slate-500 uppercase tracking-wider text-[10px]">Elevation</div>
                <div className="font-mono font-semibold text-slate-100 text-sm">
                  {inspectionData.elevationM} <span className="text-xs text-slate-400">m ASL</span>
                </div>
              </div>

              <div>
                <div className="text-slate-500 uppercase tracking-wider text-[10px]">Slope Gradient</div>
                <div className="font-mono font-semibold text-slate-100 text-sm">
                  {inspectionData.slopePercent} <span className="text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <div className="text-slate-500 uppercase tracking-wider text-[10px]">NDVI Vigor</div>
                <div className="font-mono font-semibold text-emerald-400 text-sm">
                  {inspectionData.ndviValue}
                </div>
              </div>

              <div>
                <div className="text-slate-500 uppercase tracking-wider text-[10px]">Soil Group</div>
                <div className="font-mono font-semibold text-slate-100 text-sm">
                  HSG {inspectionData.soilGroup}
                </div>
              </div>

              <div>
                <div className="text-slate-500 uppercase tracking-wider text-[10px]">Erosion Hazard</div>
                <div
                  className={`font-mono font-semibold text-sm ${
                    inspectionData.erosionRisk === 'Severe'
                      ? 'text-rose-400'
                      : inspectionData.erosionRisk === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {inspectionData.erosionRisk}
                </div>
              </div>

              <div>
                <div className="text-slate-500 uppercase tracking-wider text-[10px]">Curve No. (CN)</div>
                <div className="font-mono font-semibold text-cyan-300 text-sm">
                  {inspectionData.curveNumber}
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Recommended Treatment:</span>{' '}
                <span className="text-cyan-200 font-medium">
                  {inspectionData.recommendedTreatment}
                </span>
              </div>
              <button
                onClick={() => {
                  const newStruct: SWCStructure = {
                    id: `probe-${Date.now()}`,
                    name: `Auto-Recommended Structure at ${inspectionData.elevationM}m`,
                    type: inspectionData.slopePercent > 15 ? 'cct' : 'check_dam',
                    lat: inspectionData.lat,
                    lng: inspectionData.lng,
                    elevationM: inspectionData.elevationM,
                    storageCapacityM3: 15000,
                    catchmentAreaHa: 450,
                    costEstimateINR: 280000,
                    status: 'proposed',
                    description: `Placed via pixel probe based on ${inspectionData.slopePercent}% slope and ${inspectionData.erosionRisk} erosion risk.`,
                  };
                  onAddStructure(newStruct);
                }}
                className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-medium"
              >
                Adopt As Proposed Intervention
              </button>
            </div>
          </div>
        )}

        {/* Floating AI Chat Assistant Widget */}
        <AIChatAssistant
          watershed={watershed}
          inspectionData={inspectionData}
          selectedLayer={selectedLayer}
          bhuvanOverlay={bhuvanOverlay}
          onOpenBhuvanModal={onOpenBhuvanModal}
          onPlaceStructure={(structureType) => {
            if (structureType) {
              setStructureTypeToAdd(structureType);
            }
            setInteractionMode('add_structure');
          }}
        />
      </div>
    </div>
  );
};
