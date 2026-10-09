import { WatershedCatchment, SWCStructure, StreamSegment } from '../types/watershed';

export const WATERSHED_STUDY_AREAS: WatershedCatchment[] = [
  {
    id: 'chinnar-4b2a',
    name: 'Chinnar Micro-Watershed Catchment',
    code: 'WDC-PMKSY-4B2A-09',
    stateDistrict: 'Rayalaseema Semi-Arid Basin',
    areaHa: 4850,
    perimeterKm: 32.4,
    center: [14.258, 77.785],
    bounds: [[14.225, 77.740], [14.295, 77.835]],
    elevationMinM: 520,
    elevationMaxM: 785,
    averageAnnualRainfallMm: 685,
    dominantSoilType: 'Red Gravelly Loam & Skeletal Lithosols',
    hydrologicalSoilGroup: 'C',
    baselineCurveNumber: 82,
    treatedCurveNumber: 68,
    morphometry: {
      drainageDensityKmPerSqKm: 2.84,
      streamFrequencyPerSqKm: 3.12,
      bifurcationRatio: 3.85,
      formFactor: 0.38,
      circulatoryRatio: 0.58,
      timeOfConcentrationHours: 2.45
    },
    imagery: {
      rgbSatellite: '/src/assets/images/watershed_rgb_satellite_1791549307729.jpg',
      fccInfrared: '/src/assets/images/watershed_fcc_infrared_1791549324069.jpg',
      erosionSurvey: '/src/assets/images/watershed_erosion_drone_1791549336878.jpg',
      interventionsAerial: '/src/assets/images/watershed_interventions_aerial_1791549348705.jpg'
    },
    boundaryGeoJson: [
      [14.225, 77.765],
      [14.232, 77.745],
      [14.250, 77.740],
      [14.275, 77.748],
      [14.292, 77.772],
      [14.295, 77.805],
      [14.286, 77.828],
      [14.268, 77.835],
      [14.245, 77.822],
      [14.230, 77.795],
      [14.225, 77.765]
    ],
    streams: [
      {
        id: 'stream-main-3',
        name: 'Chinnar Main Nala (Order 3)',
        order: 3,
        lengthKm: 9.8,
        coordinates: [
          [14.278, 77.752],
          [14.270, 77.765],
          [14.262, 77.776],
          [14.258, 77.785],
          [14.252, 77.798],
          [14.245, 77.812],
          [14.235, 77.820]
        ]
      },
      {
        id: 'stream-trib-north-2',
        name: 'North Ridge Tributary (Order 2)',
        order: 2,
        lengthKm: 4.6,
        coordinates: [
          [14.290, 77.782],
          [14.282, 77.780],
          [14.272, 77.781],
          [14.262, 77.776]
        ]
      },
      {
        id: 'stream-trib-south-2',
        name: 'South Valley Stream (Order 2)',
        order: 2,
        lengthKm: 5.1,
        coordinates: [
          [14.235, 77.755],
          [14.242, 77.770],
          [14.250, 77.780],
          [14.258, 77.785]
        ]
      },
      {
        id: 'stream-rill-1a',
        name: 'Upper Gully Rill 1A (Order 1)',
        order: 1,
        lengthKm: 2.2,
        coordinates: [
          [14.288, 77.762],
          [14.280, 77.768],
          [14.270, 77.765]
        ]
      },
      {
        id: 'stream-rill-1b',
        name: 'Eastern Escarpment Rill 1B (Order 1)',
        order: 1,
        lengthKm: 2.5,
        coordinates: [
          [14.282, 77.818],
          [14.272, 77.810],
          [14.260, 77.802],
          [14.252, 77.798]
        ]
      }
    ],
    existingStructures: [
      {
        id: 'struct-cd-01',
        name: 'Masonry Check Dam #1 (Valley Outlet)',
        type: 'check_dam',
        lat: 14.245,
        lng: 77.812,
        elevationM: 545,
        storageCapacityM3: 28000,
        catchmentAreaHa: 3400,
        costEstimateINR: 420000,
        status: 'existing',
        streamOrder: 3,
        description: 'Gravity masonry overflow check dam with stilling basin; perennial storage.',
        yearImplemented: 2021
      },
      {
        id: 'struct-fp-01',
        name: 'Percolation Farm Pond #A4',
        type: 'farm_pond',
        lat: 14.265,
        lng: 77.770,
        elevationM: 610,
        storageCapacityM3: 4500,
        catchmentAreaHa: 25,
        costEstimateINR: 95000,
        status: 'existing',
        description: 'Lined percolation tank capturing runoff from 25ha arable catchment.',
        yearImplemented: 2022
      },
      {
        id: 'struct-gp-01',
        name: 'Loose Boulder Gully Plug Cluster #01',
        type: 'gully_plug',
        lat: 14.280,
        lng: 77.768,
        elevationM: 685,
        storageCapacityM3: 1200,
        catchmentAreaHa: 14,
        costEstimateINR: 35000,
        status: 'existing',
        streamOrder: 1,
        description: 'Series of 6 boulder plugs trapping bed sediment in steep rills.',
        yearImplemented: 2023
      }
    ],
    proposedStructures: [
      {
        id: 'struct-prop-cd-02',
        name: 'Proposed Cement Nala Bund #02',
        type: 'check_dam',
        lat: 14.258,
        lng: 77.785,
        elevationM: 578,
        storageCapacityM3: 35000,
        catchmentAreaHa: 2200,
        costEstimateINR: 520000,
        status: 'proposed',
        streamOrder: 3,
        description: 'Sub-catchment confluence check dam to attenuate flash hydrograph peak.'
      },
      {
        id: 'struct-prop-cct-01',
        name: 'Upper Ridge Continuous Contour Trenches (CCT-A)',
        type: 'cct',
        lat: 14.285,
        lng: 77.775,
        elevationM: 715,
        storageCapacityM3: 18000,
        catchmentAreaHa: 320,
        costEstimateINR: 240000,
        status: 'proposed',
        description: '4.2 km of continuous contour trenches on 18% ridge slope to halt runoff velocity.'
      },
      {
        id: 'struct-prop-pt-01',
        name: 'Proposed Village Percolation Tank',
        type: 'percolation_tank',
        lat: 14.252,
        lng: 77.798,
        elevationM: 562,
        storageCapacityM3: 42000,
        catchmentAreaHa: 850,
        costEstimateINR: 650000,
        status: 'proposed',
        description: 'Strategic groundwater recharge structure recharging 18 downstream borewells.'
      },
      {
        id: 'struct-prop-aff-01',
        name: 'Silvi-Pasture Agroforestry Buffer (85 ha)',
        type: 'afforestation',
        lat: 14.275,
        lng: 77.792,
        elevationM: 660,
        storageCapacityM3: 9500,
        catchmentAreaHa: 85,
        costEstimateINR: 180000,
        status: 'proposed',
        description: 'Multi-tier indigenous tree canopy (Neem, Subabul, Vetiver grass) for slope stabilization.'
      }
    ],
    erosionRiskZones: [
      {
        severity: 'Severe',
        areaHa: 1240,
        color: '#ef4444',
        coordinates: [
          [14.275, 77.750],
          [14.290, 77.765],
          [14.285, 77.785],
          [14.270, 77.770],
          [14.275, 77.750]
        ]
      },
      {
        severity: 'Moderate',
        areaHa: 1850,
        color: '#f59e0b',
        coordinates: [
          [14.248, 77.755],
          [14.270, 77.770],
          [14.265, 77.810],
          [14.240, 77.790],
          [14.248, 77.755]
        ]
      },
      {
        severity: 'Slight',
        areaHa: 1760,
        color: '#10b981',
        coordinates: [
          [14.230, 77.780],
          [14.245, 77.812],
          [14.238, 77.830],
          [14.225, 77.800],
          [14.230, 77.780]
        ]
      }
    ]
  },
  {
    id: 'kosi-k12b',
    name: 'Kosi Foothills Micro-Catchment #K-12B',
    code: 'WDC-HIMAL-12B-04',
    stateDistrict: 'Sub-Himalayan Piedmont Terraces',
    areaHa: 3620,
    perimeterKm: 27.8,
    center: [29.485, 79.120],
    bounds: [[29.450, 79.080], [29.520, 79.160]],
    elevationMinM: 410,
    elevationMaxM: 1150,
    averageAnnualRainfallMm: 1180,
    dominantSoilType: 'Coarse Loamy Colluvial Soils',
    hydrologicalSoilGroup: 'B',
    baselineCurveNumber: 76,
    treatedCurveNumber: 62,
    morphometry: {
      drainageDensityKmPerSqKm: 3.42,
      streamFrequencyPerSqKm: 4.10,
      bifurcationRatio: 4.20,
      formFactor: 0.42,
      circulatoryRatio: 0.61,
      timeOfConcentrationHours: 1.65
    },
    imagery: {
      rgbSatellite: '/src/assets/images/watershed_rgb_satellite_1791549307729.jpg',
      fccInfrared: '/src/assets/images/watershed_fcc_infrared_1791549324069.jpg',
      erosionSurvey: '/src/assets/images/watershed_erosion_drone_1791549336878.jpg',
      interventionsAerial: '/src/assets/images/watershed_interventions_aerial_1791549348705.jpg'
    },
    boundaryGeoJson: [
      [29.450, 79.110],
      [29.465, 79.085],
      [29.495, 79.080],
      [29.518, 79.115],
      [29.520, 79.145],
      [29.498, 79.160],
      [29.470, 79.150],
      [29.450, 79.110]
    ],
    streams: [
      {
        id: 'kosi-main-stream',
        name: 'Main Piedmont Torrent (Order 3)',
        order: 3,
        lengthKm: 8.2,
        coordinates: [
          [29.515, 79.125],
          [29.498, 79.122],
          [29.485, 79.120],
          [29.472, 79.118],
          [29.455, 79.112]
        ]
      }
    ],
    existingStructures: [
      {
        id: 'kosi-cd-1',
        name: 'Wire Gabion Torrent Training Dam',
        type: 'check_dam',
        lat: 29.475,
        lng: 79.118,
        elevationM: 520,
        storageCapacityM3: 16000,
        catchmentAreaHa: 2100,
        costEstimateINR: 320000,
        status: 'existing',
        streamOrder: 3,
        description: 'Flexible gabion check dam designed for high velocity boulder flows.'
      }
    ],
    proposedStructures: [
      {
        id: 'kosi-cct-1',
        name: 'Step Terracing & Vegetated Waterways',
        type: 'cct',
        lat: 29.505,
        lng: 79.130,
        elevationM: 850,
        storageCapacityM3: 22000,
        catchmentAreaHa: 450,
        costEstimateINR: 380000,
        status: 'proposed',
        description: 'Contour terraces with Napier grass strips to mitigate flash landslide runoff.'
      }
    ],
    erosionRiskZones: [
      {
        severity: 'Severe',
        areaHa: 1450,
        color: '#ef4444',
        coordinates: [
          [29.495, 79.080],
          [29.518, 79.115],
          [29.505, 79.130],
          [29.485, 79.100],
          [29.495, 79.080]
        ]
      }
    ]
  },
  {
    id: 'manjara-mh07',
    name: 'Manjara Sub-Catchment #WDC-MH-07',
    code: 'WDC-PMKSY-MH-07B',
    stateDistrict: 'Latur-Solapur Deccan Basalt Trap, Maharashtra',
    areaHa: 5420,
    perimeterKm: 34.6,
    center: [18.254, 76.582],
    bounds: [[18.220, 76.540], [18.290, 76.630]],
    elevationMinM: 580,
    elevationMaxM: 690,
    averageAnnualRainfallMm: 790,
    dominantSoilType: 'Deep Black Cotton Vertisols & Calcareous Loam',
    hydrologicalSoilGroup: 'D',
    baselineCurveNumber: 85,
    treatedCurveNumber: 71,
    morphometry: {
      drainageDensityKmPerSqKm: 2.65,
      streamFrequencyPerSqKm: 2.95,
      bifurcationRatio: 3.65,
      formFactor: 0.36,
      circulatoryRatio: 0.54,
      timeOfConcentrationHours: 2.80
    },
    imagery: {
      rgbSatellite: '/src/assets/images/watershed_rgb_satellite_1791549307729.jpg',
      fccInfrared: '/src/assets/images/watershed_fcc_infrared_1791549324069.jpg',
      erosionSurvey: '/src/assets/images/watershed_erosion_drone_1791549336878.jpg',
      interventionsAerial: '/src/assets/images/watershed_interventions_aerial_1791549348705.jpg'
    },
    boundaryGeoJson: [
      [18.220, 76.560],
      [18.235, 76.540],
      [18.265, 76.545],
      [18.288, 76.575],
      [18.290, 76.615],
      [18.268, 76.630],
      [18.238, 76.610],
      [18.220, 76.560]
    ],
    streams: [
      {
        id: 'manjara-main',
        name: 'Manjara Nala Main Channel (Order 3)',
        order: 3,
        lengthKm: 10.4,
        coordinates: [
          [18.280, 76.560],
          [18.268, 76.575],
          [18.254, 76.582],
          [18.240, 76.595],
          [18.225, 76.610]
        ]
      }
    ],
    existingStructures: [
      {
        id: 'mh-cd-01',
        name: 'Cement Nala Bund #CNB-04',
        type: 'check_dam',
        lat: 18.254,
        lng: 76.582,
        elevationM: 615,
        storageCapacityM3: 32000,
        catchmentAreaHa: 2600,
        costEstimateINR: 480000,
        status: 'existing',
        streamOrder: 3,
        description: 'Reinforced concrete weir with silt trap apron on deep vertisol soil.'
      }
    ],
    proposedStructures: [
      {
        id: 'mh-fp-01',
        name: 'Dugout Compartmental Farm Pond Cluster',
        type: 'farm_pond',
        lat: 18.268,
        lng: 76.575,
        elevationM: 642,
        storageCapacityM3: 15000,
        catchmentAreaHa: 120,
        costEstimateINR: 210000,
        status: 'proposed',
        description: 'Polyethylene lined farm ponds for protective soybean & gram irrigation.'
      }
    ],
    erosionRiskZones: [
      {
        severity: 'Severe',
        areaHa: 1100,
        color: '#ef4444',
        coordinates: [
          [18.270, 76.550],
          [18.288, 76.575],
          [18.268, 76.575],
          [18.270, 76.550]
        ]
      }
    ]
  },
  {
    id: 'ken-betwa-kb03',
    name: 'Ken-Betwa Micro-Basin #KB-BUNDEL-03',
    code: 'WDC-PMKSY-MP-03D',
    stateDistrict: 'Bundelkhand Ravines & Granite Terraces, MP',
    areaHa: 6280,
    perimeterKm: 38.2,
    center: [24.852, 80.154],
    bounds: [[24.815, 80.110], [24.890, 80.200]],
    elevationMinM: 280,
    elevationMaxM: 450,
    averageAnnualRainfallMm: 920,
    dominantSoilType: 'Mixed Red & Black (Kabar & Rakar Soils)',
    hydrologicalSoilGroup: 'C',
    baselineCurveNumber: 84,
    treatedCurveNumber: 69,
    morphometry: {
      drainageDensityKmPerSqKm: 3.15,
      streamFrequencyPerSqKm: 3.80,
      bifurcationRatio: 4.10,
      formFactor: 0.35,
      circulatoryRatio: 0.52,
      timeOfConcentrationHours: 2.10
    },
    imagery: {
      rgbSatellite: '/src/assets/images/watershed_rgb_satellite_1791549307729.jpg',
      fccInfrared: '/src/assets/images/watershed_fcc_infrared_1791549324069.jpg',
      erosionSurvey: '/src/assets/images/watershed_erosion_drone_1791549336878.jpg',
      interventionsAerial: '/src/assets/images/watershed_interventions_aerial_1791549348705.jpg'
    },
    boundaryGeoJson: [
      [24.815, 24.815 > 0 ? 80.140 : 80.140],
      [24.835, 80.110],
      [24.870, 80.125],
      [24.890, 80.165],
      [24.875, 80.200],
      [24.840, 80.190],
      [24.815, 80.140]
    ],
    streams: [
      {
        id: 'kb-stream-main',
        name: 'Ken Ravine Tributary Nala (Order 3)',
        order: 3,
        lengthKm: 11.2,
        coordinates: [
          [24.875, 80.130],
          [24.862, 80.145],
          [24.852, 80.154],
          [24.838, 80.168],
          [24.825, 80.180]
        ]
      }
    ],
    existingStructures: [
      {
        id: 'kb-cd-01',
        name: 'Haveli Bandhi & Stone Check Dam',
        type: 'check_dam',
        lat: 24.852,
        lng: 80.154,
        elevationM: 310,
        storageCapacityM3: 45000,
        catchmentAreaHa: 3800,
        costEstimateINR: 590000,
        status: 'existing',
        streamOrder: 3,
        description: 'Traditional Bundelkhand Haveli rainwater harvesting system integrated with modern masonry spillway.'
      }
    ],
    proposedStructures: [
      {
        id: 'kb-gp-01',
        name: 'Ravine Stabilization Gully Plug Cascade (x25)',
        type: 'gully_plug',
        lat: 24.868,
        lng: 80.138,
        elevationM: 360,
        storageCapacityM3: 8500,
        catchmentAreaHa: 240,
        costEstimateINR: 190000,
        status: 'proposed',
        description: 'Wire-mesh crated gabion structures to halt severe finger ravine progression.'
      }
    ],
    erosionRiskZones: [
      {
        severity: 'Severe',
        areaHa: 1920,
        color: '#ef4444',
        coordinates: [
          [24.860, 80.125],
          [24.885, 80.150],
          [24.870, 80.170],
          [24.860, 80.125]
        ]
      }
    ]
  }
];

export const SPECTRAL_INDICES_META = [
  {
    id: 'satellite_rgb',
    name: 'True Color (RGB)',
    bands: 'Band 4 (Red) · Band 3 (Green) · Band 2 (Blue)',
    description: 'Natural visible spectrum representation. Optimal for structural baseline inspection and boundary mapping.',
    resolution: '0.3m Drone / 10m Sentinel-2',
    colorScale: 'Natural True Color'
  },
  {
    id: 'fcc_infrared',
    name: 'False Color Composite (FCC NIR)',
    bands: 'Band 8 (NIR) · Band 4 (Red) · Band 3 (Green)',
    description: 'High sensitivity to chlorophyll reflectance. Crimson/Red indicates healthy canopy; cyan/tan indicates bare soil; black indicates water bodies.',
    resolution: '10m Sentinel-2 MSI',
    colorScale: 'Standard Remote Sensing FCC'
  },
  {
    id: 'ndvi_vegetation',
    name: 'NDVI Vegetation Health',
    bands: '(NIR - Red) / (NIR + Red)',
    description: 'Normalized Difference Vegetation Index. Quantifies photosynthetic vigor from -0.2 (water) to +0.8 (dense irrigated crop).',
    resolution: 'Derived 10m raster',
    colorScale: 'Viridis / Red-Yellow-Green'
  },
  {
    id: 'dem_elevation',
    name: 'DEM Topographic Elevation',
    bands: 'ISRO CartoDEM 10m / SRTM 30m',
    description: 'Digital Elevation Model rendering hypsometric relief from valley floor to upper ridge line.',
    resolution: '10m CartoDEM / ALOS PALSAR',
    colorScale: 'Hypsometric Terrain Ramp'
  },
  {
    id: 'slope_gradient',
    name: 'Slope Analysis & Relief Gradient',
    bands: 'Derivative of DEM (dz/dx, dz/dy)',
    description: 'Slope steepness in percentage. Classifies 0-5% valley, 5-15% terraces, 15-30% moderate slope, >30% steep escarpment.',
    resolution: 'Computed terrain grid',
    colorScale: 'Green (<5%) to Red (>25%)'
  },
  {
    id: 'drainage_flow',
    name: 'Flow Accumulation & Stream Orders',
    bands: 'D8 Flow Direction Algorithm',
    description: 'Delineates upstream contributing pixel thresholds. Classifies Strahler 1st, 2nd, 3rd order streams for structure placement.',
    resolution: 'Hydrological network model',
    colorScale: 'Cyan-to-Deep Blue'
  },
  {
    id: 'erosion_hazard',
    name: 'ISRO Bhuvan LULC & Soil Erosion Map',
    bands: 'NRSC Bhuvan 1:50,000 WMS Layer',
    description: 'ISRO National Remote Sensing Centre (NRSC) degraded land and ravine erosion raster mapping.',
    resolution: 'ISRO NRSC 1:50k',
    colorScale: 'Red (Severe) to Green (Stable)'
  }
];

// Helper to calculate SCS-CN Runoff
export function calculateSCSCNRunoff(rainfallMm: number, cn: number): { sMm: number; runoffMm: number } {
  if (cn <= 0 || cn >= 100) return { sMm: 0, runoffMm: 0 };
  const sMm = (25400 / cn) - 254;
  const initialAbstraction = 0.2 * sMm;
  if (rainfallMm <= initialAbstraction) {
    return { sMm, runoffMm: 0 };
  }
  const runoffMm = Math.pow(rainfallMm - initialAbstraction, 2) / (rainfallMm + 0.8 * sMm);
  return { sMm, runoffMm: Math.max(0, runoffMm) };
}
