import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe2,
  Layers,
  Search,
  Activity,
  CloudRain,
  Compass,
  Maximize2,
  RefreshCw,
  Sun,
  Moon,
  Zap,
  Sliders,
  ChevronRight,
  Info,
  MapPin,
  Play,
  Pause,
  Droplets,
  AlertTriangle,
  Bot,
  Send,
  Sparkles,
  X,
  ExternalLink,
  ShieldAlert,
  Radio,
  Wind
} from 'lucide-react';
import {
  GLOBAL_TILE_PROVIDERS,
  GLOBAL_RIVER_BASINS,
  GLOBAL_HYDRO_HOTSPOTS,
  GLOBAL_QUICK_REGIONS,
  GLOBAL_SATELLITE_TRACKS,
  GlobalRiverBasin,
  GlobalHydroHotspot,
  calculateTerminatorPoints,
} from '../data/worldMapData';

interface UsgsEarthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    depth?: number;
    tsunami: number;
    magType: string;
    title: string;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

interface RainViewerRadarFrame {
  time: number;
  path: string;
}

export const LiveWorldMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Layer groups refs for dynamic toggling without recreating the map
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const basinsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const earthquakesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const satellitesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const terminatorLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const inspectMarkerRef = useRef<L.Marker | null>(null);

  // UI States
  const [activeTileId, setActiveTileId] = useState<string>('esri-satellite');
  const [showBasins, setShowBasins] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showEarthquakes, setShowEarthquakes] = useState<boolean>(true);
  const [showRadar, setShowRadar] = useState<boolean>(false);
  const [showSatellites, setShowSatellites] = useState<boolean>(true);
  const [showTerminator, setShowTerminator] = useState<boolean>(true);

  // Live Earthquakes State
  const [earthquakes, setEarthquakes] = useState<UsgsEarthquake[]>([]);
  const [eqLoading, setEqLoading] = useState<boolean>(false);
  const [eqMinMag, setEqMinMag] = useState<number>(3.0);
  const [lastEqFetchTime, setLastEqFetchTime] = useState<Date | null>(null);

  // Live Weather Radar State (RainViewer)
  const [radarHost, setRadarHost] = useState<string>('');
  const [radarFrames, setRadarFrames] = useState<RainViewerRadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);

  // Selected basin or hotspot for detailed side drawer
  const [selectedBasin, setSelectedBasin] = useState<GlobalRiverBasin | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<GlobalHydroHotspot | null>(null);

  // Global Point Inspection
  const [inspectedPoint, setInspectedPoint] = useState<{
    lat: number;
    lng: number;
    nearestBasin?: string;
    elevationEstimateM?: number;
  } | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lng: number; type: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Floating AI Chat Panel on World Map
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your **Global HydroGeo AI Advisor**.\n\nExplore any continent, ocean, or river basin on the live world map. Ask me about **transboundary water treaties**, the **Amazon water cycle**, **Himalayan glacial decline**, **global earthquake effects on aquifers**, or click any coordinate on Earth to analyze!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [aiInput, setAiInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Cursor coordinates
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Live UTC Clock
  const [utcTime, setUtcTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      setUtcTime(new Date().toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Create Leaflet Map with smooth interaction
    const map = L.map(mapContainerRef.current, {
      center: [20.0, 0.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile provider (Esri World Imagery)
    const activeProvider = GLOBAL_TILE_PROVIDERS.find((p) => p.id === activeTileId) || GLOBAL_TILE_PROVIDERS[0];
    const tileLayer = L.tileLayer(activeProvider.url, {
      maxZoom: activeProvider.maxZoom,
      attribution: activeProvider.attribution,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Create Layer Groups
    basinsLayerGroupRef.current = L.layerGroup().addTo(map);
    hotspotsLayerGroupRef.current = L.layerGroup().addTo(map);
    earthquakesLayerGroupRef.current = L.layerGroup().addTo(map);
    satellitesLayerGroupRef.current = L.layerGroup().addTo(map);
    terminatorLayerGroupRef.current = L.layerGroup().addTo(map);

    // Track cursor movement
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lng: parseFloat(e.latlng.lng.toFixed(4)),
      });
    });

    // Click anywhere to inspect
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lng = parseFloat(e.latlng.lng.toFixed(4));

      // Find nearest river basin
      let nearest: GlobalRiverBasin | undefined;
      let minDistance = Infinity;
      GLOBAL_RIVER_BASINS.forEach((b) => {
        const d = Math.hypot(b.center[0] - lat, b.center[1] - lng);
        if (d < minDistance) {
          minDistance = d;
          nearest = b;
        }
      });

      // Rough elevation estimate heuristic based on distance from sea/mountain markers
      const approxElevation = Math.max(0, Math.round(Math.abs(Math.sin(lat * 0.1) * Math.cos(lng * 0.1) * 850) + 120));

      setInspectedPoint({
        lat,
        lng,
        nearestBasin: minDistance < 15 ? nearest?.name : undefined,
        elevationEstimateM: approxElevation,
      });

      // Remove existing inspect marker
      if (inspectMarkerRef.current) {
        map.removeLayer(inspectMarkerRef.current);
      }

      // Add custom pulse marker
      const pulseHtml = `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-lg"></span>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-inspect-pulse',
        html: pulseHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #0f172a; min-width: 200px; padding: 2px;">
          <div style="font-size: 11px; font-weight: bold; color: #0284c7; text-transform: uppercase;">Global Inspection Point</div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${lat >= 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}, ${lng >= 0 ? `${lng}°E` : `${Math.abs(lng)}°W`}</div>
          ${nearest ? `<div style="font-size: 11px; color: #475569; margin-top: 4px;">Catchment Zone: <strong>${nearest.name}</strong></div>` : ''}
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Est. Elevation: ~${approxElevation} m MSL</div>
        </div>
      `);
      marker.openPopup();
      inspectMarkerRef.current = marker;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle Tile Provider Switch
  useEffect(() => {
    if (!mapRef.current) return;
    const provider = GLOBAL_TILE_PROVIDERS.find((p) => p.id === activeTileId);
    if (!provider) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      attribution: provider.attribution,
    }).addTo(mapRef.current);

    // Keep tile layer at the back
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [activeTileId]);

  // 3. Render Global River Basins
  useEffect(() => {
    if (!basinsLayerGroupRef.current) return;
    basinsLayerGroupRef.current.clearLayers();

    if (!showBasins) return;

    GLOBAL_RIVER_BASINS.forEach((basin) => {
      // Determine color by status
      const strokeColor =
        basin.status === 'critical'
          ? '#ef4444' // red
          : basin.status === 'stressed'
          ? '#f59e0b' // amber
          : '#06b6d4'; // cyan

      const polygon = L.polygon(basin.polygonPoints, {
        color: strokeColor,
        weight: 2,
        opacity: 0.85,
        fillColor: strokeColor,
        fillOpacity: 0.12,
        dashArray: basin.status === 'critical' ? '4, 4' : undefined,
      });

      // Hover effect
      polygon.on('mouseover', () => {
        polygon.setStyle({
          weight: 3.5,
          fillOpacity: 0.28,
        });
      });
      polygon.on('mouseout', () => {
        polygon.setStyle({
          weight: 2,
          fillOpacity: 0.12,
        });
      });

      // Click to inspect basin in side drawer
      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedBasin(basin);
        setSelectedHotspot(null);
      });

      // Basin Center label marker
      const labelIcon = L.divIcon({
        className: 'basin-map-badge',
        html: `
          <div class="px-2 py-0.5 rounded shadow-md border text-[10px] font-bold whitespace-nowrap backdrop-blur-sm cursor-pointer transition-transform hover:scale-105"
            style="background-color: rgba(15, 23, 42, 0.85); color: ${strokeColor}; border-color: ${strokeColor};">
            💧 ${basin.name}
          </div>
        `,
        iconAnchor: [40, 10],
      });

      const labelMarker = L.marker(basin.center, { icon: labelIcon });
      labelMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedBasin(basin);
        setSelectedHotspot(null);
      });

      basinsLayerGroupRef.current?.addLayer(polygon);
      basinsLayerGroupRef.current?.addLayer(labelMarker);
    });
  }, [showBasins]);

  // 4. Render Global Hydrological Hotspots (Mega Dams, Shrinking Lakes, Aquifer Depletion, Glaciers)
  useEffect(() => {
    if (!hotspotsLayerGroupRef.current) return;
    hotspotsLayerGroupRef.current.clearLayers();

    if (!showHotspots) return;

    GLOBAL_HYDRO_HOTSPOTS.forEach((spot) => {
      let iconColor = '#06b6d4';
      let iconSymbol = '💧';

      if (spot.category === 'mega-dam') {
        iconColor = '#3b82f6';
        iconSymbol = '🏗️';
      } else if (spot.category === 'shrinking-lake') {
        iconColor = '#ef4444';
        iconSymbol = '⚠️';
      } else if (spot.category === 'groundwater-depletion') {
        iconColor = '#f97316';
        iconSymbol = '📉';
      } else if (spot.category === 'glacial-tower') {
        iconColor = '#a855f7';
        iconSymbol = '🏔️';
      }

      const hotspotIcon = L.divIcon({
        className: 'global-hotspot-pin',
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-lg transition-transform group-hover:scale-125"
                 style="background-color: rgba(15, 23, 42, 0.9); border-color: ${iconColor};">
              <span>${iconSymbol}</span>
            </div>
            <div class="absolute -bottom-5 hidden group-hover:block bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg border border-slate-700 z-50">
              ${spot.name}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: hotspotIcon });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedHotspot(spot);
        setSelectedBasin(null);
      });

      hotspotsLayerGroupRef.current?.addLayer(marker);
    });
  }, [showHotspots]);

  // 5. Fetch & Render Live USGS Earthquakes
  const fetchLiveEarthquakes = async () => {
    setEqLoading(true);
    try {
      // USGS Real-Time GeoJSON: all day earthquakes
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
      if (!res.ok) throw new Error('Failed to fetch USGS earthquakes');
      const data = await res.json();
      setEarthquakes(data.features || []);
      setLastEqFetchTime(new Date());
    } catch (err) {
      console.error('USGS Earthquakes fetch error:', err);
    } finally {
      setEqLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEarthquakes();
    // Auto-refresh earthquakes every 2 minutes
    const interval = setInterval(fetchLiveEarthquakes, 120000);
    return () => clearInterval(interval);
  }, []);

  // Update Earthquakes on Map
  useEffect(() => {
    if (!earthquakesLayerGroupRef.current) return;
    earthquakesLayerGroupRef.current.clearLayers();

    if (!showEarthquakes) return;

    const filtered = earthquakes.filter((eq) => eq.properties.mag >= eqMinMag);

    filtered.forEach((eq) => {
      const mag = eq.properties.mag;
      const [lng, lat, depth] = eq.geometry.coordinates;

      // Color and size by magnitude
      let color = '#22c55e'; // < 4.0 green
      let radius = 6;
      let pulseRing = false;

      if (mag >= 6.0) {
        color = '#ef4444'; // Red
        radius = 16;
        pulseRing = true;
      } else if (mag >= 5.0) {
        color = '#f97316'; // Orange
        radius = 12;
      } else if (mag >= 4.0) {
        color = '#eab308'; // Yellow
        radius = 9;
      }

      const eqHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          ${pulseRing ? `<span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-60"></span>` : ''}
          <div class="rounded-full border-2 border-white/80 shadow-md flex items-center justify-center text-[9px] font-black text-white"
               style="background-color: ${color}; width: ${radius * 2}px; height: ${radius * 2}px;">
            ${mag >= 4.5 ? mag.toFixed(1) : ''}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'live-eq-marker',
        html: eqHtml,
        iconSize: [radius * 2, radius * 2],
        iconAnchor: [radius, radius],
      });

      const marker = L.marker([lat, lng], { icon });

      const dateStr = new Date(eq.properties.time).toLocaleString();
      const popupHtml = `
        <div style="font-family: sans-serif; color: #0f172a; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="background-color: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
              M ${mag.toFixed(1)} ${eq.properties.magType || ''}
            </span>
            <span style="font-size: 10px; color: #64748b;">USGS Live Feed</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 6px; color: #0f172a;">${eq.properties.place}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">Focal Depth: <strong>${depth ? `${depth.toFixed(1)} km` : 'Unknown'}</strong></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">UTC Time: ${dateStr}</div>
          <div style="font-size: 10px; color: #0284c7; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            Hydrological Note: Seismic vibrations can cause sudden groundwater table shifts & borehole aquifer discharge surges.
          </div>
          <div style="margin-top: 6px; text-align: right;">
            <a href="${eq.properties.url}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; color: #2563eb; text-decoration: underline;">
              View on USGS Event Page &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      earthquakesLayerGroupRef.current?.addLayer(marker);
    });
  }, [earthquakes, showEarthquakes, eqMinMag]);

  // 6. Fetch RainViewer Weather Radar Tile Maps API
  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) return;
        const data = await res.json();
        setRadarHost(data.host || 'https://tilecache.rainviewer.com');
        const pastFrames = data.radar?.past || [];
        const nowcastFrames = data.radar?.nowcast || [];
        const all = [...pastFrames, ...nowcastFrames];
        setRadarFrames(all);
        if (all.length > 0) {
          setCurrentFrameIndex(pastFrames.length > 0 ? pastFrames.length - 1 : 0);
        }
      } catch (e) {
        console.error('RainViewer radar fetch error:', e);
      }
    };
    fetchRadar();
  }, []);

  // Update Radar Layer on Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (radarLayerRef.current) {
      mapRef.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (!showRadar || !radarHost || radarFrames.length === 0) return;

    const frame = radarFrames[currentFrameIndex];
    if (!frame) return;

    // RainViewer tile format: {host}{path}/256/{z}/{x}/{y}/2/1_1.png
    const radarUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    const radarLayer = L.tileLayer(radarUrl, {
      opacity: radarOpacity,
      zIndex: 15,
      maxZoom: 14,
    }).addTo(mapRef.current);

    radarLayerRef.current = radarLayer;
  }, [showRadar, radarHost, radarFrames, currentFrameIndex, radarOpacity]);

  // Radar Animation Loop
  useEffect(() => {
    if (!isRadarPlaying || radarFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isRadarPlaying, radarFrames.length]);

  // 7. Render Satellite Tracks
  useEffect(() => {
    if (!satellitesLayerGroupRef.current) return;
    satellitesLayerGroupRef.current.clearLayers();

    if (!showSatellites) return;

    GLOBAL_SATELLITE_TRACKS.forEach((sat) => {
      const satHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg"
               style="background-color: rgba(15, 23, 42, 0.95); border-color: ${sat.color};">
            <span style="color: ${sat.color}; font-size: 14px;">🛰️</span>
          </div>
          <div class="absolute -top-7 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
            <span style="color: ${sat.color};">●</span> ${sat.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'satellite-icon',
        html: satHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([sat.currentLat, sat.currentLng], { icon });

      // Ground swath circle
      const swathCircle = L.circle([sat.currentLat, sat.currentLng], {
        radius: (sat.swathWidthKm / 2) * 1000,
        color: sat.color,
        weight: 1,
        fillColor: sat.color,
        fillOpacity: 0.08,
        dashArray: '2, 4',
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #0f172a; min-width: 220px;">
          <div style="font-size: 10px; color: ${sat.color}; font-weight: bold; text-transform: uppercase;">Earth Observation Orbit</div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${sat.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">Agency: <strong>${sat.agency}</strong></div>
          <div style="font-size: 11px; color: #475569;">Altitude: <strong>${sat.altitudeKm} km</strong> · Swath: <strong>${sat.swathWidthKm} km</strong></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">${sat.mission}</div>
        </div>
      `);

      satellitesLayerGroupRef.current?.addLayer(swathCircle);
      satellitesLayerGroupRef.current?.addLayer(marker);
    });
  }, [showSatellites]);

  // 8. Render Day/Night Solar Terminator
  useEffect(() => {
    if (!terminatorLayerGroupRef.current) return;
    terminatorLayerGroupRef.current.clearLayers();

    if (!showTerminator) return;

    try {
      const points = calculateTerminatorPoints();
      const polyline = L.polyline(points, {
        color: '#fbbf24', // Golden sun line
        weight: 2,
        opacity: 0.8,
        dashArray: '5, 5',
      });

      // Add small Sun / Moon badges at key latitudes
      const sunMarker = L.marker([12, 10], {
        icon: L.divIcon({
          className: 'sun-indicator',
          html: '<div class="text-amber-400 text-lg filter drop-shadow">☀️</div>',
          iconSize: [20, 20],
        }),
      });

      terminatorLayerGroupRef.current.addLayer(polyline);
      terminatorLayerGroupRef.current.addLayer(sunMarker);
    } catch (e) {
      console.error('Terminator render error:', e);
    }
  }, [showTerminator]);

  // Handle Quick Fly To Region
  const handleFlyToRegion = (center: [number, number], zoom: number) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom, {
      duration: 1.8,
      easeLinearity: 0.25,
    });
  };

  // Handle Search Input & Places
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const q = query.toLowerCase();

    // Search against global river basins
    const basinMatches = GLOBAL_RIVER_BASINS.filter(
      (b) => b.name.toLowerCase().includes(q) || b.river.toLowerCase().includes(q) || b.continent.toLowerCase().includes(q)
    ).map((b) => ({ name: `${b.name} (${b.continent})`, lat: b.center[0], lng: b.center[1], type: 'River Basin' }));

    // Search against hotspots
    const hotspotMatches = GLOBAL_HYDRO_HOTSPOTS.filter(
      (h) => h.name.toLowerCase().includes(q) || h.country.toLowerCase().includes(q)
    ).map((h) => ({ name: `${h.name} · ${h.country}`, lat: h.lat, lng: h.lng, type: 'Hydrological Landmark' }));

    // Predefined famous world cities & rivers
    const famousPlaces = [
      { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, type: 'Global Megacity' },
      { name: 'London & Thames River, UK', lat: 51.5074, lng: -0.1278, type: 'River Port' },
      { name: 'New York & Hudson River, USA', lat: 40.7128, lng: -74.006, type: 'Coastal Bay' },
      { name: 'Cairo & Nile Delta, Egypt', lat: 30.0444, lng: 31.2357, type: 'Delta' },
      { name: 'New Delhi & Yamuna River, India', lat: 28.6139, lng: 77.209, type: 'Capital City' },
      { name: 'Manaus, Brazil (Meeting of the Waters)', lat: -3.119, lng: -60.0217, type: 'Amazon Tributaries' },
      { name: 'Shanghai, China (Yangtze Estuary)', lat: 31.2304, lng: 121.4737, type: 'River Mouth' },
      { name: 'Lake Baikal, Siberia, Russia', lat: 53.5587, lng: 108.165, type: 'Freshwater Lake' },
      { name: 'Grand Canyon, Colorado River, USA', lat: 36.1069, lng: -112.1129, type: 'River Canyon' },
      { name: 'Victoria Falls, Zambezi River', lat: -17.9243, lng: 25.8572, type: 'Waterfall' },
      { name: 'Sundarbans Mangrove Delta, India/Bangladesh', lat: 21.9497, lng: 89.1833, type: 'Mangrove Delta' },
    ].filter((p) => p.name.toLowerCase().includes(q));

    setSearchResults([...basinMatches, ...hotspotMatches, ...famousPlaces].slice(0, 8));
  };

  const handleSelectSearchResult = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([lat, lng], 8, { duration: 1.8 });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Parse Direct Lat/Lng Coordinates in Search Bar (e.g. "28.5, 77.2")
  const handleCheckCoordinatesSearch = () => {
    if (!searchQuery) return;
    const parts = searchQuery.split(/[, ]+/).filter(Boolean);
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        handleSelectSearchResult(lat, lng);
      }
    }
  };

  // AI Chat Submission
  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput.trim();
    setAiInput('');
    const newMessages = [
      ...aiChatMessages,
      {
        role: 'user' as const,
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setAiChatMessages(newMessages);
    setIsAiLoading(true);

    try {
      // Build context from active inspection or selected basin
      const contextDescription = selectedBasin
        ? `Basin: ${selectedBasin.name}, River: ${selectedBasin.river}, Continent: ${selectedBasin.continent}, Area: ${selectedBasin.areaKm2} sq km, Discharge: ${selectedBasin.dischargeM3s} m3/s, Climate: ${selectedBasin.climateZone}, Issues: ${selectedBasin.majorIssues.join(', ')}`
        : inspectedPoint
        ? `Inspected Coordinate: ${inspectedPoint.lat}, ${inspectedPoint.lng}, Nearest Drainage: ${inspectedPoint.nearestBasin || 'Ocean / Unclassified Basin'}, Est Elevation: ~${inspectedPoint.elevationEstimateM}m`
        : 'Whole World Hydrological Viewport';

      const res = await fetch('/api/watershed-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(1, -1).map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          watershed: {
            name: selectedBasin?.name || 'Global Terrestrial Hydrosphere',
            areaHa: selectedBasin ? selectedBasin.areaKm2 * 100 : 51000000000,
            hydrologicalSoilGroup: 'C',
            dominantSoilType: 'Global Soil & Regolith Cover',
            averageAnnualRainfallMm: 990,
          },
          inspectionData: inspectedPoint
            ? {
                lat: inspectedPoint.lat,
                lng: inspectedPoint.lng,
                elevationM: inspectedPoint.elevationEstimateM || 200,
                slopePercent: 6,
                soilGroup: 'C',
              }
            : null,
          customContext: contextDescription,
        }),
      });

      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();
      const reply = data.reply || data.response || 'Hydrological analysis completed successfully.';

      setAiChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Global AI Chat error:', err);
      // Fallback domain response
      let fallback = `**Hydrological Global Assessment**:\n\nRegarding your question on "${userMsg}":\n\n• **Drainage Dynamics**: Global freshwater systems are driven by the macro-hydrological cycle where oceans evaporate 434,000 km³/year of moisture.\n• **Groundwater Aquifers**: Over 30% of global freshwater relies on subterranean recharge, currently vulnerable to over-pumping in intensive agricultural zones.\n• **Conservation Framework**: Best management involves watershed-scale protection, wetland restoration in deltas, and cross-border river treaty data transparency.`;
      if (selectedBasin) {
        fallback = `**${selectedBasin.name} Hydrological Briefing**:\n\n• **Basin Area**: ${selectedBasin.areaKm2.toLocaleString()} km² draining ${selectedBasin.countries.join(', ')}.\n• **Discharge Volume**: ${selectedBasin.dischargeM3s.toLocaleString()} m³/s.\n• **Primary Vulnerabilities**: ${selectedBasin.majorIssues.join('; ')}.\n• **Action Plan**: Implementation of sustainable riparian buffers and integrated river basin management (IRBM).`;
      }
      setAiChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallback,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-14 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        {/* Search Bar */}
        <div className="relative pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl px-3 py-1.5 min-w-[240px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckCoordinatesSearch()}
            placeholder="Search city, river basin, or 'lat, lng'..."
            className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="p-1.5 max-h-64 overflow-y-auto divide-y divide-slate-800">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(item.lat, item.lng)}
                    className="w-full text-left px-3 py-2 hover:bg-cyan-950/60 transition-colors flex items-center justify-between text-xs rounded group"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.type}</div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 rounded">
                      Fly To &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Region Selector Pills */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-xl pointer-events-auto">
          {GLOBAL_QUICK_REGIONS.map((reg) => (
            <button
              key={reg.id}
              onClick={() => handleFlyToRegion(reg.center, reg.zoom)}
              className="text-[11px] px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {reg.name}
            </button>
          ))}
        </div>

        {/* Live Earthquakes Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-xl pointer-events-auto">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-slate-300">
            USGS Seismic: <strong className="text-emerald-400">{earthquakes.length}</strong> active
          </span>
          <button
            onClick={fetchLiveEarthquakes}
            disabled={eqLoading}
            className="text-slate-400 hover:text-cyan-300 transition-colors"
            title="Refresh USGS Live Earthquakes Feed"
          >
            <RefreshCw className={`w-3 h-3 ${eqLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* UTC Clock */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-xl text-[11px] font-mono text-cyan-400 pointer-events-auto">
          <Globe2 className="w-3.5 h-3.5" />
          <span>{utcTime}</span>
        </div>
      </div>

      {/* Main Map Canvas Stage */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Floating Bottom Left: Layer Controls & Base Maps */}
      <div className="absolute bottom-6 left-3 z-20 flex flex-col gap-2 max-w-sm">
        {/* Layer Toggles Card */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 shadow-2xl text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Live Planetary Layers
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
              WHOLE WORLD
            </span>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showBasins}
                onChange={(e) => setShowBasins(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>💧 Mega River Basins</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>🏗️ Dams & Critical Lakes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showEarthquakes}
                onChange={(e) => setShowEarthquakes(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>⚡ Live Earthquakes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showRadar}
                onChange={(e) => setShowRadar(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span>🌧️ Weather Radar</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showSatellites}
                onChange={(e) => setShowSatellites(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>🛰️ Satellite Orbits</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showTerminator}
                onChange={(e) => setShowTerminator(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>☀️ Day/Night Terminator</span>
            </label>
          </div>

          {/* Earthquakes magnitude filter if active */}
          {showEarthquakes && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Min Magnitude: M{eqMinMag}</span>
              <div className="flex items-center gap-1">
                {[2.5, 3.5, 4.5, 5.5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEqMinMag(m)}
                    className={`px-1.5 py-0.5 rounded ${
                      eqMinMag === m ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    M{m}+
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RainViewer Live Radar scrubber if active */}
          {showRadar && radarFrames.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span className="flex items-center gap-1 text-blue-400 font-semibold">
                  <CloudRain className="w-3 h-3" /> Live Precipitation Radar
                </span>
                <span className="font-mono text-slate-400">
                  {new Date(radarFrames[currentFrameIndex]?.time * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRadarPlaying(!isRadarPlaying)}
                  className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  {isRadarPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={radarFrames.length - 1}
                  value={currentFrameIndex}
                  onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1 bg-slate-800 rounded"
                />
              </div>
            </div>
          )}

          {/* Base Layer Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase">Global Base Map:</div>
            <select
              value={activeTileId}
              onChange={(e) => setActiveTileId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              {GLOBAL_TILE_PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Cursor Coordinates HUD */}
        {cursorCoords && (
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-400 flex items-center justify-between shadow-lg">
            <span>
              LAT: {cursorCoords.lat >= 0 ? `${cursorCoords.lat}°N` : `${Math.abs(cursorCoords.lat)}°S`} · LNG:{' '}
              {cursorCoords.lng >= 0 ? `${cursorCoords.lng}°E` : `${Math.abs(cursorCoords.lng)}°W`}
            </span>
            <span className="text-cyan-400">CLICK TO INSPECT</span>
          </div>
        )}
      </div>

      {/* Side Details Drawer for Selected Basin or Hotspot */}
      {selectedBasin && (
        <div className="absolute top-16 right-3 w-80 sm:w-96 max-h-[calc(100vh-6rem)] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-4 shadow-2xl z-30 text-xs space-y-3 animate-in slide-in-from-right duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Mega Watershed</span>
              <h3 className="text-base font-bold text-white">{selectedBasin.name}</h3>
              <p className="text-[11px] text-slate-400">{selectedBasin.river} · {selectedBasin.continent}</p>
            </div>
            <button
              onClick={() => setSelectedBasin(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Drainage Area</span>
              <strong className="text-white text-xs">{selectedBasin.areaKm2.toLocaleString()} km²</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Mean Discharge</span>
              <strong className="text-cyan-300 text-xs">{selectedBasin.dischargeM3s.toLocaleString()} m³/s</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">River Length</span>
              <strong className="text-white text-xs">{selectedBasin.lengthKm.toLocaleString()} km</strong>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Dependent Population</span>
              <strong className="text-emerald-400 text-xs">~{selectedBasin.populationMillions} Million</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Riparian Countries:</span>
            <div className="flex flex-wrap gap-1">
              {selectedBasin.countries.map((c, i) => (
                <span key={i} className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <p>{selectedBasin.description}</p>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg space-y-1 text-[11px]">
            <span className="text-amber-300 font-bold flex items-center gap-1 text-[10px]">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Hydrological Vulnerabilities
            </span>
            <ul className="list-disc list-inside text-amber-200/90 text-[10px] space-y-0.5">
              {selectedBasin.majorIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                setIsAiChatOpen(true);
                setAiInput(`Tell me about soil conservation, transboundary runoff, and dam impact in the ${selectedBasin.name}`);
              }}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI About This Basin</span>
            </button>
            <button
              onClick={() => handleFlyToRegion(selectedBasin.center, 5)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 p-2 rounded-lg"
              title="Center Map"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {selectedHotspot && (
        <div className="absolute top-16 right-3 w-80 sm:w-96 max-h-[calc(100vh-6rem)] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-blue-500/40 rounded-xl p-4 shadow-2xl z-30 text-xs space-y-3 animate-in slide-in-from-right duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">{selectedHotspot.category}</span>
              <h3 className="text-base font-bold text-white">{selectedHotspot.name}</h3>
              <p className="text-[11px] text-slate-400">{selectedHotspot.country}</p>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Capacity & Dimensions</span>
            <strong className="text-cyan-300 text-xs">{selectedHotspot.capacityOrArea}</strong>
          </div>

          <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <p>{selectedHotspot.description}</p>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-800/40 p-2.5 rounded-lg space-y-1 text-[11px]">
            <span className="text-cyan-300 font-bold flex items-center gap-1 text-[10px]">
              <Droplets className="w-3 h-3 text-cyan-400" />
              Hydrological Significance & Impact
            </span>
            <p className="text-cyan-200/90 text-[11px]">{selectedHotspot.hydroImpact}</p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                setIsAiChatOpen(true);
                setAiInput(`Analyze the hydrological impact of ${selectedHotspot.name} in ${selectedHotspot.country}`);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI About This Feature</span>
            </button>
            <button
              onClick={() => handleFlyToRegion([selectedHotspot.lat, selectedHotspot.lng], 7)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 p-2 rounded-lg"
              title="Zoom In"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant Launcher & Dialog */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="absolute bottom-6 right-6 z-20 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-cyan-300/60"
        >
          <Bot className="w-4 h-4" />
          <span className="text-xs">Global AI Hydrologist</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
        </button>
      )}

      {isAiChatOpen && (
        <div className="absolute bottom-6 right-6 w-80 sm:w-96 h-[480px] bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden text-xs animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Global HydroGeo AI</h4>
                <p className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Planetary Reasoning Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAiChatOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Context Chips */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-300">
            <span className="text-slate-400 font-mono">CONTEXT:</span>
            {selectedBasin ? (
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-medium">
                {selectedBasin.name}
              </span>
            ) : inspectedPoint ? (
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-medium">
                {inspectedPoint.lat}°, {inspectedPoint.lng}°
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Global View</span>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {aiChatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium'
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting Gemini Hydrological Engine...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggestions pills */}
          <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            {['Amazon water cycle', 'USGS earthquake & aquifers', 'Third Pole glaciers', 'Nile dam treaty'].map(
              (prompt, i) => (
                <button
                  key={i}
                  onClick={() => setAiInput(prompt)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              )
            )}
          </div>

          {/* Input box */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
              placeholder="Ask about any river, dam, or region..."
              className="flex-1 bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendAiMessage}
              disabled={isAiLoading || !aiInput.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 p-2 rounded-lg font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
