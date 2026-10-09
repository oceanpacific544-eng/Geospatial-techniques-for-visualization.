import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Bhuvan ISRO Data Integration Endpoints
app.get('/api/bhuvan/thematic-layers', (req, res) => {
  res.json({
    success: true,
    provider: 'ISRO National Remote Sensing Centre (NRSC) Bhuvan',
    wmsEndpoint: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms',
    layers: [
      {
        id: 'bhuvan:lulc_50k',
        name: 'Land Use / Land Cover (LULC 1:50,000)',
        wmsLayerName: 'lulc:LULC50K_1516',
        category: 'Land Resources',
        description: 'NRSC multitemporal IRS Resourcesat AWiFS/LISS-III derived 1:50k land use classification.',
        legendUrl: 'https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/legend/lulc50k.png',
        defaultOpacity: 0.75
      },
      {
        id: 'bhuvan:cartodem_slope',
        name: 'CartoDEM Topographic Slope (%)',
        wmsLayerName: 'dem:cartodem_slope_v3',
        category: 'Topography & Relief',
        description: 'Derived from ISRO Cartosat-1 stereo pairs (10m/30m GSD). Classifies 0-5% to >30% slope.',
        legendUrl: 'https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/legend/slope.png',
        defaultOpacity: 0.7
      },
      {
        id: 'bhuvan:drainage_network',
        name: 'Drainage Network & Stream Hierarchy',
        wmsLayerName: 'drainage:drainage_50k',
        category: 'Hydrology',
        description: 'Detailed Strahler 1st to 5th order drainage streams and waterbodies from CartoDEM hydrologic conditioning.',
        defaultOpacity: 0.9
      },
      {
        id: 'bhuvan:pmksy_watershed_50k',
        name: 'PMKSY-WDC Micro-Watershed Boundaries',
        wmsLayerName: 'watershed:pmksy_watershed_50k',
        category: 'Administrative & Planning',
        description: 'National Watershed Atlas delineation (Basin, Catchment, Sub-catchment, Watershed, Micro-watershed).',
        defaultOpacity: 0.85
      },
      {
        id: 'bhuvan:soil_erosion',
        name: 'Soil Erosion & Land Degradation',
        wmsLayerName: 'soil:land_degradation_50k',
        category: 'Soil & Conservation',
        description: 'Mapping of sheet erosion, rill erosion, gully/ravines, and waterlogged salt-affected soils.',
        defaultOpacity: 0.7
      }
    ]
  });
});

app.get('/api/bhuvan/watershed-boundary', (req, res) => {
  const { code = '4B2A' } = req.query;
  const upperCode = String(code).toUpperCase();

  // Map known PMKSY codes to rich boundary polygons
  let watershedGeoJson;
  if (upperCode.includes('MH') || upperCode.includes('MANJARA')) {
    watershedGeoJson = {
      type: 'Feature',
      properties: {
        code: 'WDC-PMKSY-MH-07B',
        name: 'Manjara Sub-Catchment',
        basin: 'Godavari Basin (4E)',
        state: 'Maharashtra',
        district: 'Latur / Solapur',
        areaHa: 5420,
        drainageDensity: 2.65,
        bhuvanRegistered: true,
        agency: 'DoLR / MahaBhumi / ISRO Bhuvan'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.560, 18.220],
          [76.540, 18.235],
          [76.545, 18.265],
          [76.575, 18.288],
          [76.615, 18.290],
          [76.630, 18.268],
          [76.610, 18.238],
          [76.560, 18.220]
        ]]
      }
    };
  } else if (upperCode.includes('KB') || upperCode.includes('BUNDEL')) {
    watershedGeoJson = {
      type: 'Feature',
      properties: {
        code: 'WDC-PMKSY-MP-03D',
        name: 'Ken-Betwa Micro-Basin #03',
        basin: 'Yamuna Lower Basin (2C)',
        state: 'Madhya Pradesh',
        district: 'Panna / Chhatarpur',
        areaHa: 6280,
        drainageDensity: 3.15,
        bhuvanRegistered: true,
        agency: 'DoLR / MP-SLNA / ISRO Bhuvan'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [80.140, 24.815],
          [80.110, 24.835],
          [80.125, 24.870],
          [80.165, 24.890],
          [80.200, 24.875],
          [80.190, 24.840],
          [80.140, 24.815]
        ]]
      }
    };
  } else if (upperCode.includes('KOSI') || upperCode.includes('12B')) {
    watershedGeoJson = {
      type: 'Feature',
      properties: {
        code: 'WDC-HIMAL-12B-04',
        name: 'Kosi Foothills Micro-Catchment #K-12B',
        basin: 'Ganga Himalayan Piedmont (2B)',
        state: 'Uttarakhand',
        district: 'Almora',
        areaHa: 3620,
        drainageDensity: 3.42,
        bhuvanRegistered: true,
        agency: 'UK-Watershed Directorate / ISRO Bhuvan'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.110, 29.450],
          [79.085, 29.465],
          [79.080, 29.495],
          [79.115, 29.518],
          [79.145, 29.520],
          [79.160, 29.498],
          [79.150, 29.470],
          [79.110, 29.450]
        ]]
      }
    };
  } else {
    // Default: Chinnar Micro-Watershed #4B2A
    watershedGeoJson = {
      type: 'Feature',
      properties: {
        code: 'WDC-PMKSY-4B2A-09',
        name: 'Chinnar Micro-Watershed Catchment',
        basin: 'Pennar Basin (4B)',
        catchment: 'Chinnar River Catchment',
        subWatershed: '4B2A',
        microWatershedCode: '4B2A-09',
        state: 'Andhra Pradesh',
        district: 'Kurnool / Anantapur',
        areaHa: 4850,
        drainageDensity: 2.84,
        bhuvanRegistered: true,
        agency: 'DoLR / AP-WDC / ISRO Bhuvan NRSC'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.765, 14.225],
          [77.745, 14.232],
          [77.740, 14.250],
          [77.748, 14.275],
          [77.772, 14.292],
          [77.805, 14.295],
          [77.828, 14.286],
          [77.835, 14.268],
          [77.822, 14.245],
          [77.795, 14.230],
          [77.765, 14.225]
        ]]
      }
    };
  }

  res.json({
    success: true,
    code: upperCode,
    watershed: watershedGeoJson,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/bhuvan/get-feature-info', (req, res) => {
  const { lat, lng, layer = 'lulc:LULC50K_1516' } = req.body;

  // Compute realistic ISRO Bhuvan thematic classification based on spatial parameters
  const isHighRelief = (lat > 28) || (lat > 14.27 && lng < 32.77);
  const lulcCode = isHighRelief ? 'FAL-03' : 'AGR-01';
  const lulcClass = isHighRelief 
    ? 'Barren Sheet Rocky / Open Scrubland' 
    : 'Agricultural Land - Crop Land (Kharif / Rabi)';

  res.json({
    success: true,
    coordinates: { lat, lng },
    queriedLayer: layer,
    bhuvanThematicRecord: {
      lulcClass,
      lulcCode,
      cartoDemElevationM: Math.round(520 + Math.abs(Math.sin(lat * 10)) * 240),
      slopeClass: isHighRelief ? '15 - 25% (Steep Ridge Escarpment)' : '3 - 8% (Gentle Pediment)',
      drainageContributingAreaHa: parseFloat((14.5 + Math.abs(Math.cos(lng * 8)) * 32).toFixed(1)),
      soilErosionSeverity: isHighRelief ? 'Severe Sheet & Gully Erosion' : 'Moderate Water Erosion',
      surveyAgency: 'National Remote Sensing Centre (NRSC) / ISRO Bhuvan'
    }
  });
});

// AI-Assisted Geo-Tagged Watershed Field Photo Analysis endpoint (Step 2)
app.post('/api/analyze-field-photo', async (req, res) => {
  try {
    const {
      imageBase64,
      imageMimeType = 'image/jpeg',
      photoId = 'FIELD-PHOTO',
      metadata = {}
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Intelligent fallback when API key is not yet set
      const isPostIntervention = metadata.phase === 'after' || metadata.structure_type === 'check dam' || metadata.structure_type === 'farm pond';
      const structureType = metadata.structure_type || (isPostIntervention ? 'check dam' : 'contour trench');
      const condition = isPostIntervention ? 'good' : 'moderate';
      const waterPresence: 'none' | 'low' | 'medium' | 'high' = isPostIntervention ? 'high' : 'low';
      const vegPercent = isPostIntervention ? 68 : 24;
      const erosionSigns = !isPostIntervention;
      
      // Calculate formula: 0.3*Water + 0.3*Veg + 0.2*Condition + 0.2*(1 - Erosion)
      const waterMap: Record<string, number> = { high: 100, medium: 66, low: 33, none: 0 };
      const waterVal = waterMap[waterPresence] ?? 0;
      const condMap: Record<string, number> = { good: 100, moderate: 65, poor: 25 };
      const condVal = condMap[condition] ?? 65;
      const erosionVal = erosionSigns ? 0 : 100;
      const calculatedImpact = Math.round(0.3 * waterVal + 0.3 * vegPercent + 0.2 * condVal + 0.2 * erosionVal);

      return res.json({
        success: true,
        isAiGenerated: false,
        structure_type: structureType,
        condition: condition,
        water_presence: waterPresence,
        vegetation_cover_percent: vegPercent,
        soil_erosion_signs: erosionSigns,
        issues: erosionSigns ? ['Scour at spillway apron', 'Upstream rill sedimentation'] : ['Minor siltation behind weir'],
        impact_score: calculatedImpact,
        remarks: isPostIntervention 
          ? 'Perennial water harvesting achieved with thriving vegetative buffer. Structure structurally intact.'
          : 'Degraded catchment exhibiting rill incisions and moisture deficit prior to treatment.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a watershed development expert (WDC-PMKSY / Drishti / Bhuvan specialist). Analyze the given geo-tagged field photo and return ONLY JSON with this exact schema:
{
  "structure_type": "check dam | farm pond | contour trench | gully plug | plantation | none",
  "condition": "good | moderate | poor",
  "water_presence": "none | low | medium | high",
  "vegetation_cover_percent": number,
  "soil_erosion_signs": true,
  "issues": ["list of physical defects or soil issues observed"],
  "impact_score": number,
  "remarks": "2 line summary of structure condition and watershed outcome"
}

Scoring criteria:
- impact_score should be between 0 and 100 based on formula: 0.3*Water + 0.3*Vegetation + 0.2*Condition + 0.2*(1 - Erosion).
Return strict JSON only without any markdown ticks.`;

    let contents: any[] = [];
    if (imageBase64) {
      contents = [
        {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64.replace(/^data:[a-zA-Z0-9/]+;base64,/, '')
          }
        },
        systemPrompt
      ];
    } else {
      contents = [systemPrompt];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsedData = match ? JSON.parse(match[0]) : {};
    }

    res.json({
      success: true,
      isAiGenerated: true,
      ...parsedData
    });
  } catch (error: any) {
    console.error('Field photo analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error analyzing field photo'
    });
  }
});

// AI-Assisted Geo-Coded Watershed Interpretation endpoint
app.post('/api/analyze-watershed', async (req, res) => {
  try {
    const {
      imageBase64,
      imageMimeType = 'image/jpeg',
      studyAreaName = 'Chinnar Micro-Watershed #4B2A',
      selectedLayer = 'FCC_Infrared',
      hydrologyContext = {}
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback rule-based domain analysis if API key not injected
      return res.json({
        success: true,
        isAiGenerated: false,
        summary: `Standard rule-based geospatial interpretation for ${studyAreaName} under ${selectedLayer} profile.`,
        lulcClassification: [
          { category: 'Degraded / Barren Ridge Slope', percentage: 38.5, erosionRisk: 'Severe', recommendedAction: 'Continuous Contour Trenches (CCT) & Agave fencing' },
          { category: 'Rainfed Agricultural Land', percentage: 34.0, erosionRisk: 'Moderate', recommendedAction: 'Contour bunding, Farm Ponds, In-situ moisture conservation' },
          { category: 'Riparian / Scrub Vegetation', percentage: 18.2, erosionRisk: 'Low to Moderate', recommendedAction: 'Bio-drainage buffer, Assisted Natural Regeneration' },
          { category: 'Drainage Channels & Gullies', percentage: 6.8, erosionRisk: 'Extreme', recommendedAction: 'Loose Boulder Check Dams & Gully Plugs' },
          { category: 'Surface Water / Farm Ponds', percentage: 2.5, erosionRisk: 'Negligible', recommendedAction: 'De-siltation & Inlet silt traps' }
        ],
        diagnosticFindings: [
          'Pronounced dendritic drainage network (3rd order stream junction) exhibits intense bank scarp erosion.',
          'Upper ridge slopes show thin lithic soils (<15cm depth) with low infiltration capacity (HSG Group D).',
          'Runoff coefficient under baseline degraded conditions is estimated at C = 0.52, causing rapid flash concentration.',
          'Post-treatment potential indicates 42% reduction in peak sediment discharge with recommended SWC interventions.'
        ],
        recommendedInterventions: [
          { type: 'Masonry Check Dam', location: '14.262°N, 32.788°E', elevation: '584m', purpose: 'Valley bottom runoff attenuation & water harvesting', estimatedCost: '₹3,80,000' },
          { type: 'Continuous Contour Trenches (CCT)', location: 'Upper slope transect 590-640m', elevation: '615m', purpose: 'Rainwater interception & groundwater recharge', estimatedCost: '₹1,90,000' },
          { type: 'Loose Boulder Gully Plugs (x14)', location: 'First-order rill junctions', elevation: '600-630m', purpose: 'Sediment trapping and gully progression arrest', estimatedCost: '₹1,25,000' },
          { type: 'Community Percolation Pond', location: '14.258°N, 32.795°E', elevation: '572m', purpose: 'Perennial aquifer recharge and livestock watering', estimatedCost: '₹4,50,000' }
        ],
        projectedOutcomes: {
          surfaceRunoffReductionPercent: 38.4,
          annualGroundwaterRechargeM3: 48500,
          soilLossReductionTonHaYear: 14.8,
          potentialIrrigationCommandHa: 42.5
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
You are a senior Hydrologist and Remote Sensing Geospatial Specialist inspecting geo-coded satellite/drone imagery for watershed development planning (following FAO and Indian Watershed Guidelines PMKSY-WDC/IWMP).

Study Area: ${studyAreaName}
Current Layer / Filter: ${selectedLayer}
Context details:
- Rainfall: ${hydrologyContext.rainfall || '750 mm/annum'}
- Dominant Soil: ${hydrologyContext.soil || 'Red Sandy Loam / Gravelly clay'}
- Slope Range: ${hydrologyContext.slope || '3% to 28%'}
- Drainage Order: Strahler 1st to 3rd order

Analyze this geo-coded watershed image. Provide a rigorous, scientific interpretation covering:
1. Executive Technical Summary of the catchment morphology, stream network, and vegetation state.
2. Land Use / Land Cover (LULC) breakdown with estimated percentage, erosion risk rating, and recommended treatment.
3. Key Diagnostic Findings (drainage density, gully incisions, soil exposure, runoff characteristics).
4. Recommended Soil & Water Conservation (SWC) Interventions with precise topological location rationale (Ridge-to-Valley approach).
5. Projected Watershed Outcomes (runoff reduction %, groundwater recharge m3, soil loss reduction ton/ha/yr).

Return your response strictly in the following JSON format without markdown ticks:
{
  "summary": "technical summary string",
  "lulcClassification": [
    { "category": "string", "percentage": 0.0, "erosionRisk": "string", "recommendedAction": "string" }
  ],
  "diagnosticFindings": [
    "string point 1",
    "string point 2",
    "string point 3",
    "string point 4"
  ],
  "recommendedInterventions": [
    { "type": "string", "location": "string", "elevation": "string", "purpose": "string", "estimatedCost": "string" }
  ],
  "projectedOutcomes": {
    "surfaceRunoffReductionPercent": 35.0,
    "annualGroundwaterRechargeM3": 45000,
    "soilLossReductionTonHaYear": 12.5,
    "potentialIrrigationCommandHa": 38.0
  }
}
`;

    let contents: any[] = [];
    if (imageBase64) {
      contents = [
        {
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64.replace(/^data:[a-zA-Z0-9/]+;base64,/, '')
          }
        },
        promptText
      ];
    } else {
      contents = [promptText];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsedData = match ? JSON.parse(match[0]) : {};
    }

    res.json({
      success: true,
      isAiGenerated: true,
      ...parsedData
    });
  } catch (error: any) {
    console.error('Watershed analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error executing watershed geospatial analysis'
    });
  }
});

// AI Chat Assistant for Watershed, Soil & Conservation Consultation
app.post('/api/watershed-chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      watershed = {},
      inspectionData = null,
      activeLayer = 'fcc',
      bhuvanOverlay = null
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid message string is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Context summary formatted for prompt or fallback
    const watershedContext = `
WATERSHED CONTEXT:
- Name: ${watershed.name || 'Micro-Watershed'} (Code: ${watershed.code || 'N/A'})
- Area: ${watershed.areaHa || 'N/A'} ha | Perimeter: ${watershed.perimeterKm || 'N/A'} km
- Elevation: ${watershed.elevationMinM || 'N/A'}m to ${watershed.elevationMaxM || 'N/A'}m ASL (Relief: ${(watershed.elevationMaxM && watershed.elevationMinM) ? watershed.elevationMaxM - watershed.elevationMinM : 'N/A'}m)
- Mean Annual Rainfall: ${watershed.averageAnnualRainfallMm || '750'} mm/year
- Dominant Soil: ${watershed.dominantSoilType || 'Red Sandy/Clay Loam'}
- Hydrological Soil Group (HSG): Group ${watershed.hydrologicalSoilGroup || 'C'} (Runoff Potential: ${watershed.hydrologicalSoilGroup === 'D' ? 'Very High' : watershed.hydrologicalSoilGroup === 'C' ? 'High' : watershed.hydrologicalSoilGroup === 'B' ? 'Moderate' : 'Low'})
- Active GIS/WMS Layer: ${activeLayer}
${bhuvanOverlay ? `- Active ISRO Bhuvan Layer: ${bhuvanOverlay.name} (${bhuvanOverlay.wmsLayerName})` : ''}
${inspectionData ? `CURRENT INSPECTED PIXEL / POINT:
- Coordinates: ${inspectionData.lat}° N, ${inspectionData.lng}° E
- Elevation: ${inspectionData.elevationM} m
- Topographic Slope: ${inspectionData.slopePercent} %
- Classified LULC: ${inspectionData.lulcClass}
- Spectral NDVI: ${inspectionData.ndviValue}
- SCS-CN Curve Number: ${inspectionData.curveNumber}
- Soil Erosion Vulnerability: ${inspectionData.erosionRisk}
- Recommended Field Treatment: ${inspectionData.recommendedTreatment}
` : 'No specific pixel currently inspected (general watershed queries).'}`;

    if (!apiKey) {
      // High-fidelity domain-expert fallback response engine
      const queryLower = message.toLowerCase();
      let reply = '';

      if (queryLower.includes('soil') || queryLower.includes('condition') || queryLower.includes('hsg')) {
        const soilType = watershed.dominantSoilType || 'Red Gravelly Loam';
        const hsg = watershed.hydrologicalSoilGroup || 'C';
        reply = `**Soil & Infiltration Assessment for ${watershed.name}:**\n\n` +
          `• **Dominant Soil Type:** ${soilType}.\n` +
          `• **Hydrological Soil Group:** **Group ${hsg}**\n` +
          (hsg === 'C' || hsg === 'D' 
            ? `  - Soils have low infiltration rates when thoroughly wetted and typically consist of shallow gravelly layers or clay horizons. This results in **high runoff generation potential** during intense monsoon showers (SCS Runoff Curve Number CN ~ 75–86).\n`
            : `  - Soils have moderate to good infiltration rates, favoring groundwater recharge with adequate surface mulch.\n`) +
          (inspectionData 
            ? `• **Inspected Site Specifics (${inspectionData.lat}°N, ${inspectionData.lng}°E):**\n  - Slope: **${inspectionData.slopePercent}%** with Curve Number **${inspectionData.curveNumber}**.\n  - Current Erosion Risk: **${inspectionData.erosionRisk}**.\n` 
            : '') +
          `• **Actionable Soil Conservation Recommendations:**\n` +
          `  1. Implement **contour bunding with vegetative vetiver/stylosanthes barriers** to arrest sheet erosion.\n` +
          `  2. Apply green manuring (Sunnhemp / Dhaincha) and in-situ mulching to improve topsoil organic carbon content.\n` +
          `  3. Avoid bare fallow during the pre-monsoon convective season.`;
      } else if (queryLower.includes('structure') || queryLower.includes('conservation practice') || queryLower.includes('recommend') || queryLower.includes('intervention')) {
        const slope = inspectionData ? inspectionData.slopePercent : 12;
        reply = `**Recommended Soil & Water Conservation (SWC) Practices:**\n\n` +
          `Following the **Ridge-to-Valley (R2V)** principle under WDC-PMKSY guidelines:\n\n` +
          `1. **Upper Ridge & Escarpment (Slopes > 15-20%):**\n` +
          `   - **Continuous Contour Trenches (CCT):** Intercept surface runoff, break slope length, and recharge upper aquifers.\n` +
          `   - **Staggered Contour Trenches (SCT)** with silvi-pastoral afforestation (*Acacia senegal*, *Hardwickia binata*).\n\n` +
          `2. **Middle Valley & Cultivated Lands (Slopes 3-8%):**\n` +
          `   - **Graded Bunds / Contour Bunds** with surplus weirs to prevent soil scouring.\n` +
          `   - **Farm Ponds (5,000 – 10,000 m³ capacity)** lined with LDPE film or bentonite for life-saving supplemental irrigation during dry spells.\n\n` +
          `3. **Drainage Drainage Line Treatments (Streams & Gullies):**\n` +
          `   - **Loose Boulder Check Dams (LBCD)** at 1st & 2nd order stream incisions to arrest gully head progression.\n` +
          `   - **Masonry / Gabion Check Dams** across 3rd-order streams for perennial water harvesting and baseflow stabilization.\n\n` +
          (inspectionData ? `*For your currently inspected pixel (Slope: ${inspectionData.slopePercent}%, LULC: ${inspectionData.lulcClass}), the recommended primary intervention is: **${inspectionData.recommendedTreatment}**.*` : '');
      } else if (queryLower.includes('bhuvan') || queryLower.includes('isro') || queryLower.includes('satellite') || queryLower.includes('earthexplorer')) {
        reply = `**Geospatial & Remote Sensing Intelligence:**\n\n` +
          `• **ISRO Bhuvan NRSC Data Integration:** Provides calibrated WMS layers including **1:50,000 Land Use/Cover (LULC)**, **CartoDEM Topographic Slope v3**, and **Drainage Stream Orders**.\n` +
          `• **USGS EarthExplorer Data:** Leverages Landsat 9 OLI-2 (30m multispectral) and Sentinel-2 MSI (10m VNIR) for multi-temporal NDVI vegetation index and NDWI water index calculation.\n` +
          `• **Interpretation Tip:** Click on the "Bhuvan/ISRO Data Integration" modal in the top toolbar to toggle the CartoDEM slope or LULC layers directly onto the map canvas!`;
      } else if (queryLower.includes('water') || queryLower.includes('runoff') || queryLower.includes('harvesting') || queryLower.includes('capacity')) {
        const rainfall = watershed.averageAnnualRainfallMm || 700;
        const area = watershed.areaHa || 4200;
        const runoffCoeff = watershed.hydrologicalSoilGroup === 'D' ? 0.45 : watershed.hydrologicalSoilGroup === 'C' ? 0.38 : 0.25;
        const totalVolumeM3 = Math.round(area * 10000 * (rainfall / 1000) * runoffCoeff);
        reply = `**Hydrological Runoff & Harvesting Potential:**\n\n` +
          `• **Catchment Area:** ${area.toLocaleString()} ha\n` +
          `• **Mean Annual Precipitation:** ${rainfall} mm\n` +
          `• **Estimated Runoff Coefficient (C):** ${runoffCoeff} (based on HSG ${watershed.hydrologicalSoilGroup})\n` +
          `• **Total Annual Surface Yield:** **~${(totalVolumeM3 / 1000000).toFixed(2)} Million m³**\n\n` +
          `With a well-designed network of masonry check dams, percolation tanks, and field farm ponds, approximately **30–40%** of this yield can be intercepted for in-situ groundwater recharge and micro-irrigation command.`;
      } else {
        reply = `**HydroGeo AI Watershed Advisor:**\n\n` +
          `I am analyzing **${watershed.name}** (${watershed.areaHa} ha, HSG ${watershed.hydrologicalSoilGroup}).\n\n` +
          (inspectionData 
            ? `At your inspected location (**${inspectionData.lat}°N, ${inspectionData.lng}°E**):\n` +
              `• **Slope:** ${inspectionData.slopePercent}%\n` +
              `• **LULC Class:** ${inspectionData.lulcClass}\n` +
              `• **Erosion Vulnerability:** ${inspectionData.erosionRisk}\n` +
              `• **Recommended Measure:** ${inspectionData.recommendedTreatment}\n\n`
            : '') +
          `Regarding your question: "${message}"\n\n` +
          `For optimal watershed development outcomes under PMKSY guidelines, all soil conservation measures must adhere to the **Ridge-to-Valley (R2V)** principle. In-situ moisture conservation (trenches, bunds) on upper ridges reduces runoff velocity before water reaches drainage lines, protecting masonry check dams downstream from premature siltation.\n\n` +
          `Feel free to ask about soil characteristics, check dam design criteria, Bhuvan thematic layers, or click any pixel on the map to inspect elevation & slope!`;
      }

      return res.json({
        success: true,
        reply: reply,
        isAiGenerated: false
      });
    }

    // Call live Google Gemini 2.5 Flash
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are "HydroGeo AI", an expert Hydrologist and Senior Remote Sensing Specialist for Watershed Development Planning (following FAO, WDC-PMKSY, and ISRO Bhuvan NRSC guidelines).
You are assisting watershed engineers, district planning officers, and geospatial analysts inspecting geo-coded satellite imagery, drone photos, and Bhuvan thematic layers.

Guidelines:
1. Provide scientifically rigorous, practical, and constructive guidance.
2. Reference the active watershed context, inspected pixel slope, elevation, soil type, and hydrological soil group (HSG) whenever applicable.
3. Adhere to the "Ridge-to-Valley" (R2V) conservation planning framework.
4. When discussing structures, provide realistic engineering criteria (e.g., Continuous Contour Trenches for upper ridges, Loose Boulder Check Dams for 1st-2nd order streams, Masonry Check Dams for 3rd order streams with sound foundations).
5. Format your answers clearly using clean Markdown (bullet points, bold text for key terms, numbered steps).
6. Keep responses focused, insightful, and accessible to field engineers.`;

    const formattedHistory: any[] = [];
    // Convert previous chat history
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role && item.text) {
          formattedHistory.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      }
    }

    const currentPrompt = `${watershedContext}\n\nUser Question: ${message}`;
    formattedHistory.push({
      role: 'user',
      parts: [{ text: currentPrompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
      }
    });

    const replyText = response.text || 'I apologize, but I could not formulate a response for that query. Please try rephrasing.';

    res.json({
      success: true,
      reply: replyText,
      isAiGenerated: true
    });
  } catch (error: any) {
    console.warn('Watershed chat falling back to domain engine:', error?.message || error);
    // Provide domain fallback when API call encounters transient errors
    const queryLower = (req.body?.message || '').toLowerCase();
    const watershed = req.body?.watershed || {};
    const inspectionData = req.body?.inspectionData;

    let fallbackReply = `**HydroGeo AI Watershed Advisor:**\n\n` +
      `Analyzing **${watershed.name || 'Micro-Watershed'}** (${watershed.areaHa || 4000} ha, HSG ${watershed.hydrologicalSoilGroup || 'C'}).\n\n`;

    if (queryLower.includes('slope') || queryLower.includes('structure') || queryLower.includes('conservation')) {
      fallbackReply += `**Soil & Water Conservation Recommendations (Ridge-to-Valley):**\n` +
        `• **Upper Ridges (Slope > 15%):** Excavate Continuous Contour Trenches (CCT) & Staggered Trenches with silvi-pastoral grass.\n` +
        `• **Mid Slopes (Slope 5-15%):** Construct contour bunds with vegetative barriers (Vetiver / Stylosanthes).\n` +
        `• **Drainage Lines:** Loose Boulder Check Dams (LBCD) on 1st/2nd-order rills, Masonry Check Dams on 3rd-order channels.\n`;
    } else {
      fallbackReply += `• **Dominant Soil:** ${watershed.dominantSoilType || 'Red Sandy/Clay Loam'} (HSG ${watershed.hydrologicalSoilGroup || 'C'}).\n` +
        `• **Annual Rainfall:** ${watershed.averageAnnualRainfallMm || 750} mm/year.\n` +
        `• **Hydrological Guidance:** In-situ moisture conservation should be prioritized on ridges to attenuate peak flood velocity and safeguard valley check dams downstream.\n`;
    }

    if (inspectionData) {
      fallbackReply += `\n*Inspected Point (${inspectionData.lat}°N, ${inspectionData.lng}°E): Slope ${inspectionData.slopePercent}%, Erosion Risk: ${inspectionData.erosionRisk}, Recommended: ${inspectionData.recommendedTreatment}*`;
    }

    res.json({
      success: true,
      reply: fallbackReply,
      isAiGenerated: false
    });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`HydroGeo Server running on port ${port}`);
  });
}

startServer();
