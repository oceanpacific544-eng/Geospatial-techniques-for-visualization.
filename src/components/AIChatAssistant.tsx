import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Trash2,
  Copy,
  Check,
  MapPin,
  Layers,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Flame,
  Droplets,
  Mountain,
  RefreshCw,
  Compass,
  Cpu,
  CornerDownLeft,
  Info,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  WatershedCatchment,
  InspectionData,
  BhuvanOverlay,
  LayerType,
  StructureType,
  SWCStructure
} from '../types/watershed';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  inspectionSnapshot?: Partial<InspectionData> | null;
  category?: 'inspection' | 'soil' | 'conservation' | 'general';
  suggestedAction?: {
    label: string;
    actionType: 'place_structure' | 'switch_layer' | 'open_bhuvan';
    structureType?: StructureType;
  };
}

export interface AIChatAssistantProps {
  watershed: WatershedCatchment;
  inspectionData?: InspectionData | null;
  selectedLayer?: LayerType;
  bhuvanOverlay?: BhuvanOverlay | null;
  onPlaceStructure?: (structureType?: StructureType) => void;
  onOpenBhuvanModal?: () => void;
  className?: string;
}

/**
 * Intelligent Simulated LLM Response Handler for Watershed & Hydrological Intelligence
 */
function generateSimulatedLLMResponse(
  query: string,
  watershed: WatershedCatchment,
  inspectionData?: InspectionData | null,
  selectedLayer: LayerType = 'satellite_rgb'
): { content: string; suggestedAction?: ChatMessage['suggestedAction'] } {
  const q = query.toLowerCase().trim();

  // 1. QUERY CONCERNING CURRENT INSPECTION DATA / PIXEL PROBE
  if (
    q.includes('inspect') ||
    q.includes('pixel') ||
    q.includes('point') ||
    q.includes('current location') ||
    q.includes('current data') ||
    q.includes('coordinates') ||
    q.includes('elevation') ||
    q.includes('slope')
  ) {
    if (inspectionData) {
      const slopeDesc =
        inspectionData.slopePercent > 20
          ? 'Very Steep (>20%) — High erosion velocity risk'
          : inspectionData.slopePercent > 12
          ? 'Moderately Steep (12–20%) — Requires contour trenching'
          : inspectionData.slopePercent > 5
          ? 'Gently Undulating (5–12%) — Suitable for graded bunds'
          : 'Nearly Level (<5%) — Valley deposition zone';

      const suggestedStructType: StructureType =
        inspectionData.slopePercent > 15
          ? 'cct'
          : inspectionData.slopePercent > 8
          ? 'gully_plug'
          : 'check_dam';

      return {
        content: `### 📍 Active Point Inspection Diagnosis\n\n` +
          `**Probe Coordinates:** \`${inspectionData.lat.toFixed(4)}°N, ${inspectionData.lng.toFixed(4)}°E\`\n\n` +
          `• **Topographic Elevation:** **${inspectionData.elevationM} m** ASL\n` +
          `• **Slope Gradient:** **${inspectionData.slopePercent}%** (${slopeDesc})\n` +
          `• **LULC Classification:** **${inspectionData.lulcClass}**\n` +
          `• **Canopy Density (NDVI):** **${inspectionData.ndviValue.toFixed(2)}** ${
            inspectionData.ndviValue < 0.25 ? '(Sparse / Degraded Cover)' : '(Moderate to Dense Biomass)'
          }\n` +
          `• **Hydrologic Soil Group (HSG):** **Group ${inspectionData.soilGroup}**\n` +
          `• **SCS Runoff Curve Number (CN):** **${inspectionData.curveNumber}**\n` +
          `• **Erosion Vulnerability:** **${inspectionData.erosionRisk} Hazard**\n\n` +
          `**Recommended Engineering Treatment:**\n` +
          `> **${inspectionData.recommendedTreatment}**\n\n` +
          `*Recommendation Rationale:* At a ${inspectionData.slopePercent}% gradient with CN ${inspectionData.curveNumber}, immediate slope-length interruption is required to prevent rill formation and dissipate concentrated surface runoff.`,
        suggestedAction: {
          label: `Adopt ${inspectionData.recommendedTreatment} on Map`,
          actionType: 'place_structure',
          structureType: suggestedStructType,
        },
      };
    } else {
      return {
        content: `### 🌐 Current Inspection Status\n\n` +
          `*No specific map pixel is currently selected.*\n\n` +
          `**To inspect telemetry:** Click on any location within the **${watershed.name}** boundary map.\n\n` +
          `**Catchment Overview Summary:**\n` +
          `• **Total Catchment Area:** **${watershed.areaHa.toLocaleString()} ha**\n` +
          `• **Perimeter:** ${watershed.perimeterKm} km\n` +
          `• **Elevation Range:** **${watershed.elevationMinM} m – ${watershed.elevationMaxM} m** (Relief: ${watershed.elevationMaxM - watershed.elevationMinM} m)\n` +
          `• **Dominant Soil Group:** **HSG ${watershed.hydrologicalSoilGroup}** (${watershed.dominantSoilType})\n` +
          `• **Baseline Curve Number:** **CN ${watershed.baselineCurveNumber}** (Target with SWC: CN ${watershed.treatedCurveNumber})\n\n` +
          `*Tip: Probe any upper ridge or drainage gully to inspect slope gradients and auto-generate site-specific interventions!*`,
      };
    }
  }

  // 2. QUERY CONCERNING SOIL CONDITIONS & INFILTRATION
  if (
    q.includes('soil') ||
    q.includes('infiltration') ||
    q.includes('hsg') ||
    q.includes('texture') ||
    q.includes('permeability') ||
    q.includes('vertisol') ||
    q.includes('loam')
  ) {
    const hsg = watershed.hydrologicalSoilGroup;
    const soilType = watershed.dominantSoilType;

    let infiltrationRate = '1.25 – 3.8 mm/hr';
    let runoffPotential = 'High';
    let textureDetails = 'Clay loam to shallow gravelly loam with low saturated hydraulic conductivity.';

    if (hsg === 'A') {
      infiltrationRate = '> 7.6 mm/hr';
      runoffPotential = 'Low';
      textureDetails = 'Deep, well-drained coarse sand and gravel with rapid water transmission.';
    } else if (hsg === 'B') {
      infiltrationRate = '3.8 – 7.6 mm/hr';
      runoffPotential = 'Moderate';
      textureDetails = 'Moderately deep to deep sandy loam and silt loam with moderate permeability.';
    } else if (hsg === 'D') {
      infiltrationRate = '< 1.25 mm/hr';
      runoffPotential = 'Very High (Severe)';
      textureDetails = 'Heavy swelling clays (Vertisols) or shallow claypan over impervious basalt/bedrock.';
    }

    return {
      content: `### 🌱 Soil Conditions & Hydrological Characterization\n\n` +
        `**Watershed:** ${watershed.name} (${watershed.stateDistrict})\n\n` +
        `• **Dominant Soil Classification:** **${soilType}**\n` +
        `• **Hydrological Soil Group (USDA/SCS):** **Group ${hsg}**\n` +
        `• **Saturated Infiltration Rate:** **${infiltrationRate}**\n` +
        `• **Monsoon Runoff Potential:** **${runoffPotential}**\n` +
        `• **Soil Texture Profile:** ${textureDetails}\n` +
        (inspectionData
          ? `• **Inspected Pixel Soil Group:** Group ${inspectionData.soilGroup} (Curve Number: ${inspectionData.curveNumber})\n`
          : '') +
        `\n**Hydrological Agronomic Implications:**\n` +
        `1. **Low Infiltration Storage:** Under HSG ${hsg}, rainfall rates exceeding ${infiltrationRate.split(' ')[0]} mm/hr immediately convert into overland sheet runoff, causing severe topsoil scour.\n` +
        `2. **In-situ Moisture Conservation:**\n` +
        `   - Implement **Broad Bed & Furrows (BBF)** and vegetative barriers (*Vetiver zizanioides* / *Cenchrus ciliaris*).\n` +
        `   - Apply bio-mulch and green manuring (*Sesbania* / Sunnhemp) to enhance soil organic carbon (SOC) and aggregation.\n` +
        `3. **Pore Space Management:** Deep chisel plowing (subsoiling) prior to monsoon onset to shatter compacted sub-surface hardpans.`,
    };
  }

  // 3. QUERY CONCERNING RECOMMENDED CONSERVATION PRACTICES (R2V)
  if (
    q.includes('conservation') ||
    q.includes('practice') ||
    q.includes('recommend') ||
    q.includes('treatment') ||
    q.includes('ridge to valley') ||
    q.includes('r2v') ||
    q.includes('structure') ||
    q.includes('check dam') ||
    q.includes('trench') ||
    q.includes('swc')
  ) {
    const inspectedNote = inspectionData
      ? `\n\n> 🎯 **For Inspected Point (${inspectionData.elevationM}m, Slope ${inspectionData.slopePercent}%):**\n` +
        `> Recommended Action: **${inspectionData.recommendedTreatment}** (Status: High Priority)`
      : '';

    return {
      content: `### 🛡️ Recommended Soil & Water Conservation (SWC) Practices\n\n` +
        `Based on the **Ridge-to-Valley (R2V)** principle under WDC-PMKSY national watershed guidelines:\n\n` +
        `#### 1. Upper Ridge Escarpment & Catchment (Slopes > 15%)\n` +
        `• **Continuous Contour Trenches (CCT):** Cross-section 0.5m × 0.5m excavated along true contour lines to break slope momentum and recharge fractured bedrock aquifers.\n` +
        `• **Staggered Contour Trenches (SCT):** On rocky spurs to arrest sheet erosion and support silvi-pastoral afforestation.\n` +
        `• **Loose Boulder Check Dams (LBCD):** Across 1st-order stream incisions to trap sediment before entering valley reservoirs.\n\n` +
        `#### 2. Mid-Slope & Arable Lands (Slopes 3% – 8%)\n` +
        `• **Earthen Graded Bunds:** With stone surplus weirs to safely evacuate peak discharge without scouring fields.\n` +
        `• **Farm Ponds (5,000 – 12,000 m³ capacity):** Strategically sited at micro-drainage confluences for supplemental life-saving irrigation during dry spells.\n` +
        `• **Vegetative Contour Strips:** Vetiver and Stylosanthes grass strips planted along bund contours.\n\n` +
        `#### 3. Drainage Lines & Stream Network (Strahler Orders 2–4)\n` +
        `• **Gabion Wire-Crate Structures:** Flexible drop structures across scouring gully beds.\n` +
        `• **Masonry Check Dams & Percolation Tanks:** Placed in 3rd & 4th order channels to induce deep percolation into basalt/alluvial aquifers and sustain open irrigation wells.${inspectedNote}`,
      suggestedAction: {
        label: inspectionData ? 'Place Structure on Inspected Point' : 'Add Proposed Check Dam',
        actionType: 'place_structure',
        structureType: inspectionData && inspectionData.slopePercent > 15 ? 'cct' : 'check_dam',
      },
    };
  }

  // 4. QUERY CONCERNING RUNOFF, PRECIPITATION, WATER HARVESTING
  if (
    q.includes('runoff') ||
    q.includes('harvest') ||
    q.includes('rain') ||
    q.includes('water balance') ||
    q.includes('yield') ||
    q.includes('curve number') ||
    q.includes('cn')
  ) {
    const area = watershed.areaHa;
    const rainfall = watershed.averageAnnualRainfallMm;
    const runoffCoeff = watershed.hydrologicalSoilGroup === 'D' ? 0.42 : watershed.hydrologicalSoilGroup === 'C' ? 0.35 : 0.22;
    const totalYieldM3 = Math.round(area * 10000 * (rainfall / 1000) * runoffCoeff);
    const harvestingTargetM3 = Math.round(totalYieldM3 * 0.38);

    return {
      content: `### 💧 Catchment Hydrological Water Balance & Harvesting Potential\n\n` +
        `**Precipitation & Yield Metrics for ${watershed.name}:**\n\n` +
        `• **Catchment Extent:** **${area.toLocaleString()} ha** (${(area / 100).toFixed(1)} km²)\n` +
        `• **Mean Annual Precipitation (P):** **${rainfall} mm/year**\n` +
        `• **Baseline SCS Curve Number:** **CN ${watershed.baselineCurveNumber}** (High Runoff Response)\n` +
        `• **Post-Treatment Curve Number:** **CN ${watershed.treatedCurveNumber}** (Enhanced Infiltration)\n` +
        `• **Runoff Coefficient (C):** **${runoffCoeff}** (HSG ${watershed.hydrologicalSoilGroup})\n\n` +
        `**Annual Runoff Volume Estimates:**\n` +
        `• **Gross Surface Runoff Yield:** **~${(totalYieldM3 / 1000000).toFixed(2)} Million m³** (${(totalYieldM3 / 100000).toFixed(1)} Lakh m³)\n` +
        `• **Recommended Storage Interception (38% target):** **~${(harvestingTargetM3 / 1000000).toFixed(2)} Million m³**\n\n` +
        `*Hydro-Strategy:* Intercepting 38% of monsoon surface yield via a cascade of 4 Masonry Check Dams and 12 Farm Ponds creates sufficient baseflow to elevate groundwater tables by **1.8 – 2.5 meters** across the valley command area.`,
    };
  }

  // 5. QUERY CONCERNING BHUVAN, SATELLITE, REMOTE SENSING
  if (
    q.includes('bhuvan') ||
    q.includes('isro') ||
    q.includes('satellite') ||
    q.includes('ndvi') ||
    q.includes('cartodem') ||
    q.includes('dem') ||
    q.includes('layer')
  ) {
    return {
      content: `### 🛰️ ISRO Bhuvan & Remote Sensing Integration\n\n` +
        `The spatial layers currently configured for **${watershed.name}** include:\n\n` +
        `• **CartoDEM Topographic Elevation & Slope:** 30m stereo Cartosat-1 digital elevation model for drainage basin delineations.\n` +
        `• **ISRO Bhuvan 1:50,000 LULC:** High-resolution Land Use/Land Cover raster layers classifying Kharif Cropland, Double Cropped, Scrubland, and Water Bodies.\n` +
        `• **Drainage Stream Network:** Multi-order Strahler stream vector lines computed from hydrological flow accumulation.\n` +
        `• **Spectral Vegetation Indices:** Real-time Sentinel-2 / Landsat NDVI surface reflectance calibrated for crop health monitoring.\n\n` +
        `*Click "Bhuvan WMS" in the map toolbar to toggle real-time ISRO spatial thematic overlays.*`,
      suggestedAction: {
        label: 'Open Bhuvan WMS Overlay Catalog',
        actionType: 'open_bhuvan',
      },
    };
  }

  // 6. DEFAULT COMPREHENSIVE INTELLIGENCE ADVICE
  return {
    content: `### 🤖 HydroGeo AI Watershed Advisor\n\n` +
      `I am actively analyzing **${watershed.name}** (${watershed.stateDistrict}).\n\n` +
      `**Catchment Baseline:**\n` +
      `• Area: **${watershed.areaHa} ha** | Relief: **${watershed.elevationMinM}m – ${watershed.elevationMaxM}m**\n` +
      `• Dominant Soil: **${watershed.dominantSoilType}** (HSG **${watershed.hydrologicalSoilGroup}**)\n` +
      `• Mean Rainfall: **${watershed.averageAnnualRainfallMm} mm/year**\n` +
      (inspectionData
        ? `• **Inspected Pixel:** Slope **${inspectionData.slopePercent}%**, CN **${inspectionData.curveNumber}**, Erosion **${inspectionData.erosionRisk}**\n`
        : '• *Tip: Click any pixel on the map to inspect slope, elevation, and site-specific SWC recommendations.*\n') +
      `\n**You can query me on:**\n` +
      `1. **Current Inspection Data:** Topographic elevation, slope%, LULC, NDVI, and CN.\n` +
      `2. **Soil Conditions:** HSG classification, infiltration rates, and compaction management.\n` +
      `3. **Recommended Conservation Practices:** Ridge-to-Valley (R2V) structures, check dam siting, and contour bunding.\n` +
      `4. **Water Harvesting:** Annual runoff volume and aquifer recharge potential.\n\n` +
      `*How can I assist your watershed planning right now?*`,
  };
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  watershed,
  inspectionData,
  selectedLayer = 'satellite_rgb',
  bhuvanOverlay,
  onPlaceStructure,
  onOpenBhuvanModal,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Message history stack
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 🤖 Watershed AI Hydrologist Online\n\n` +
        `Ready to assist with **${watershed.name}** geospatial telemetry & conservation planning.\n\n` +
        `• **Current Soil Group:** **HSG ${watershed.hydrologicalSoilGroup}** (${watershed.dominantSoilType})\n` +
        `• **Drainage Area:** **${watershed.areaHa.toLocaleString()} ha** | Annual Rain: **${watershed.averageAnnualRainfallMm} mm**\n\n` +
        `*Click any pixel on the map to probe slope & elevation, or use the quick query chips below.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of message stack
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Flash / notify when a new point is inspected
  const lastInspectedCoordsRef = useRef<string | null>(null);
  const inspectedCoordsKey = inspectionData ? `${inspectionData.lat}-${inspectionData.lng}` : null;

  useEffect(() => {
    if (inspectionData && inspectedCoordsKey && inspectedCoordsKey !== lastInspectedCoordsRef.current) {
      lastInspectedCoordsRef.current = inspectedCoordsKey;
      // If chat is open, optionally add a subtle system probe badge in history
      if (isOpen) {
        // Just keep inspectionData updated in context
      }
    }
  }, [inspectionData, inspectedCoordsKey, isOpen]);

  // Handle User Message Submission with Simulated LLM Engine (+ API fallback)
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputMessage).trim();
    if (!textToSend || isTyping) return;

    const userMessageId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectionSnapshot: inspectionData ? { ...inspectionData } : null,
      category: textToSend.toLowerCase().includes('soil')
        ? 'soil'
        : textToSend.toLowerCase().includes('practice') || textToSend.toLowerCase().includes('structure')
        ? 'conservation'
        : textToSend.toLowerCase().includes('inspect')
        ? 'inspection'
        : 'general',
    };

    // Push into message history stack
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulated LLM Response Handler with realistic thinking delay
    const responseDelayMs = 450 + Math.random() * 300;

    setTimeout(async () => {
      let finalReply: { content: string; suggestedAction?: ChatMessage['suggestedAction'] };

      try {
        // Try server endpoint first for real Gemini synthesis if available
        const res = await fetch('/api/watershed-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            history: messages.slice(-6).map((m) => ({ role: m.role, text: m.content })),
            watershed: {
              name: watershed.name,
              code: watershed.code,
              areaHa: watershed.areaHa,
              perimeterKm: watershed.perimeterKm,
              elevationMinM: watershed.elevationMinM,
              elevationMaxM: watershed.elevationMaxM,
              averageAnnualRainfallMm: watershed.averageAnnualRainfallMm,
              dominantSoilType: watershed.dominantSoilType,
              hydrologicalSoilGroup: watershed.hydrologicalSoilGroup,
            },
            inspectionData: inspectionData || null,
            activeLayer: selectedLayer,
            bhuvanOverlay: bhuvanOverlay || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            finalReply = { content: data.reply };
          } else {
            finalReply = generateSimulatedLLMResponse(textToSend, watershed, inspectionData, selectedLayer);
          }
        } else {
          finalReply = generateSimulatedLLMResponse(textToSend, watershed, inspectionData, selectedLayer);
        }
      } catch {
        // Seamless fallback to the offline Simulated LLM response handler
        finalReply = generateSimulatedLLMResponse(textToSend, watershed, inspectionData, selectedLayer);
      }

      const assistantMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: finalReply.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: userMsg.category,
        suggestedAction: finalReply.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, responseDelayMs);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Message history cleared. Ready for your next query on **${watershed.name}**.\n\nAsk about soil conditions, current inspection telemetry, or Ridge-to-Valley SWC recommendations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ]);
  };

  // Quick Action Prompts
  const quickPrompts = useMemo(() => {
    const list = [
      {
        label: inspectionData
          ? `📍 Query Inspected Point (${inspectionData.slopePercent}% slope)`
          : '📍 Query Inspection Data',
        query: inspectionData
          ? `Analyze current inspection data for pixel at elevation ${inspectionData.elevationM}m, slope ${inspectionData.slopePercent}%, and LULC ${inspectionData.lulcClass}.`
          : 'What is the current map pixel inspection data, and how do I probe a point?',
      },
      {
        label: `🌱 Soil Conditions (HSG ${watershed.hydrologicalSoilGroup})`,
        query: `Detail the soil conditions, infiltration rate, and runoff behavior for Hydrological Soil Group ${watershed.hydrologicalSoilGroup} in ${watershed.name}.`,
      },
      {
        label: '🛡️ Recommended SWC Practices (R2V)',
        query: `What are the recommended conservation practices and Ridge-to-Valley treatments for ${watershed.name} based on slope gradients and drainage?`,
      },
      {
        label: '💧 Runoff & Harvesting Yield',
        query: `Estimate annual runoff yield and rainwater harvesting potential for this ${watershed.areaHa} ha catchment with ${watershed.averageAnnualRainfallMm} mm annual rainfall.`,
      },
    ];
    return list;
  }, [watershed, inspectionData]);

  // Markdown line-by-line renderer
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-cyan-300 font-semibold text-xs tracking-wide mt-2 mb-1 flex items-center gap-1.5 border-b border-cyan-900/40 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{line.replace(/^###\s*/, '')}</span>
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="text-emerald-300 font-medium text-[11px] tracking-wide mt-2 mb-0.5">
            {line.replace(/^####\s*/, '')}
          </h5>
        );
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        const quoteText = line.replace(/^>\s*/, '');
        return (
          <div key={idx} className="border-l-2 border-emerald-500/70 bg-emerald-950/25 px-2.5 py-1.5 my-1.5 rounded-r text-[11px] text-emerald-200">
            <span dangerouslySetInnerHTML={{ __html: formatInline(quoteText) }} />
          </div>
        );
      }

      // Bullets
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.replace(/^([•\-\*]\s*)/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 ml-1 text-[11px] text-slate-200 leading-relaxed">
            <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(bulletText) }} className="flex-1" />
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        const numText = line.replace(/^\d+\.\s*/, '');
        const match = line.match(/^(\d+)\./);
        const num = match ? match[1] : '1';
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 ml-1 text-[11px] text-slate-200 leading-relaxed">
            <span className="text-amber-400 font-mono text-[10px] font-bold bg-amber-500/10 px-1 py-0.2 rounded shrink-0 mt-0.5">
              {num}.
            </span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(numText) }} className="flex-1" />
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} className="my-0.5 text-[11px] text-slate-200 leading-relaxed" />
      );
    });
  };

  const formatInline = (str: string) => {
    let res = str;
    // Bolding
    res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-200 font-semibold">$1</strong>');
    // Inline code / coordinates
    res = res.replace(/`([^`]+)`/g, '<code class="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono text-[10px] border border-slate-800">$1</code>');
    // Italics
    res = res.replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>');
    return res;
  };

  return (
    <div className={`pointer-events-none ${className}`}>
      {/* 1. FLOATING LAUNCHER BUTTON (When Closed) */}
      {!isOpen && (
        <div className="pointer-events-auto absolute bottom-5 right-5 z-20 flex flex-col items-end gap-2 group">
          {/* Active Inspection Ping Badge */}
          {inspectionData && (
            <button
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
                handleSendMessage(`Analyze current inspection data for pixel at elevation ${inspectionData.elevationM}m, slope ${inspectionData.slopePercent}%, and LULC ${inspectionData.lulcClass}.`);
              }}
              className="bg-slate-900/95 backdrop-blur border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-xl shadow-cyan-950/60 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer animate-pulse"
              title="Click to ask AI about this inspected point"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Probe Active: <strong>{inspectionData.slopePercent}% Slope</strong></span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          )}

          {/* Main Floating Trigger Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-900 via-cyan-950 to-emerald-950 hover:from-slate-800 hover:via-cyan-900 hover:to-emerald-900 text-white font-medium text-xs rounded-full shadow-2xl shadow-cyan-950/80 border border-cyan-400/40 hover:border-cyan-300 transition-all duration-200 hover:scale-105 cursor-pointer group"
            title="Open Watershed AI Chat Assistant"
          >
            <div className="relative">
              <Bot className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                AI Chat Assistant
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono border border-cyan-500/30">
                  PMKSY
                </span>
              </span>
              <span className="text-[10px] text-slate-400">
                {watershed.name.split(' ')[0]} • HSG {watershed.hydrologicalSoilGroup}
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse ml-0.5" />
          </button>
        </div>
      )}

      {/* 2. FLOATING CHAT ASSISTANT MODAL (DARK THEME) */}
      {isOpen && (
        <div
          className={`pointer-events-auto absolute z-30 transition-all duration-200 flex flex-col ${
            isMinimized
              ? 'bottom-5 right-5 w-80 h-14'
              : isExpanded
              ? 'top-4 right-4 bottom-4 w-[620px] max-w-[calc(100vw-2rem)]'
              : 'bottom-5 right-5 w-[420px] max-w-[calc(100vw-2.5rem)] h-[620px] max-h-[calc(100vh-6rem)]'
          } bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/80 rounded-2xl overflow-hidden text-slate-100`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 shrink-0">
                <Bot className="w-4 h-4 text-cyan-300" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-xs text-white truncate">
                    AIChatAssistant
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>{watershed.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-400 font-mono">HSG {watershed.hydrologicalSoilGroup}</span>
                </div>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                title="Clear Message History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:block"
                title={isExpanded ? 'Restore Size' : 'Expand Width'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                title="Close Assistant"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Active Inspected Point Status Banner */}
              {inspectionData ? (
                <div className="px-3.5 py-2 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-emerald-950/40 border-b border-cyan-900/30 flex items-center justify-between text-[11px] shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-300 truncate">
                      Inspected: <strong className="text-cyan-300">{inspectionData.elevationM}m</strong>,{' '}
                      <strong className="text-amber-300">{inspectionData.slopePercent}% slope</strong>,{' '}
                      <span className="text-slate-400 font-mono">CN {inspectionData.curveNumber}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSendMessage(
                        `Query current inspection data for pixel: Elevation ${inspectionData.elevationM}m, Slope ${inspectionData.slopePercent}%, LULC ${inspectionData.lulcClass}, Soil Group ${inspectionData.soilGroup}, Curve Number ${inspectionData.curveNumber}. What are the recommended conservation practices?`
                      );
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-colors font-medium shrink-0 ml-2"
                  >
                    Query Pixel
                  </button>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
                  <span className="flex items-center gap-1.5 truncate">
                    <Info className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Click anywhere on the map to inspect pixel elevation, slope & soil.</span>
                  </span>
                  <span className="font-mono text-cyan-400/80 shrink-0">{watershed.code}</span>
                </div>
              )}

              {/* Message History Stack */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs custom-scrollbar">
                {messages.map((msg) => {
                  const isAssistant = msg.role === 'assistant';
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        {isAssistant ? (
                          <>
                            <Bot className="w-3 h-3 text-cyan-400" />
                            <span className="font-medium text-cyan-300">AI Hydrologist</span>
                          </>
                        ) : (
                          <span className="font-medium text-slate-300">You</span>
                        )}
                        <span>•</span>
                        <span className="font-mono text-slate-500">{msg.timestamp}</span>

                        {isAssistant && (
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 hover:text-white"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Message Bubble Card */}
                      <div
                        className={`rounded-xl px-3.5 py-2.5 max-w-[92%] transition-all ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white rounded-tr-none shadow-md shadow-cyan-950/40'
                            : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md shadow-black/40'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {renderFormattedMarkdown(msg.content)}

                            {/* Optional Action Button inside Assistant Response */}
                            {msg.suggestedAction && (
                              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                                <button
                                  onClick={() => {
                                    if (
                                      msg.suggestedAction?.actionType === 'place_structure' &&
                                      onPlaceStructure
                                    ) {
                                      onPlaceStructure(msg.suggestedAction.structureType);
                                    } else if (
                                      msg.suggestedAction?.actionType === 'open_bhuvan' &&
                                      onOpenBhuvanModal
                                    ) {
                                      onOpenBhuvanModal();
                                    }
                                  }}
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:from-emerald-600/40 hover:to-cyan-600/40 border border-emerald-500/40 text-emerald-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{msg.suggestedAction.label}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Simulated LLM Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                      <Bot className="w-3 h-3 text-cyan-400 animate-spin" />
                      <span className="font-medium text-cyan-300">Synthesizing GIS Telemetry...</span>
                    </div>
                    <div className="rounded-xl rounded-tl-none px-3 py-2 bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                        Computing SCS-CN & R2V Interventions...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Query Prompt Chips */}
              <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.query)}
                      disabled={isTyping}
                      className="px-2.5 py-1 text-[10px] rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask about soil, inspection data, or conservation practices..."
                      disabled={isTyping}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md shadow-cyan-950/60 cursor-pointer shrink-0"
                    title="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-mono px-1">
                  <span>Engine: WDC-PMKSY R2V Expert Handler</span>
                  <span>Press [Enter] to send</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIChatAssistant;
