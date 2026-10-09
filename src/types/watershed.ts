export interface PhotoAiAnalysis {
  structure_type: 'check dam' | 'farm pond' | 'contour trench' | 'gully plug' | 'plantation' | 'none';
  condition: 'good' | 'moderate' | 'poor';
  water_presence: 'none' | 'low' | 'medium' | 'high';
  vegetation_cover_percent: number;
  soil_erosion_signs: boolean;
  issues: string[];
  impact_score: number;
  remarks: string;
  verifiedByUser?: boolean;
}

export interface GeoTaggedPhoto {
  id: string;
  fileName: string;
  imageUrl: string;
  lat: number;
  lng: number;
  elevationM?: number;
  timestamp: string;
  projectName: string;
  district: string;
  state?: string;
  agency?: 'ISRO Bhuvan' | 'USGS EarthExplorer' | 'PMKSY Drishti' | 'Field Drone Survey';
  bhuvanPhotoId?: string;
  earthExplorerSceneId?: string;
  phase: 'before' | 'after';
  siteId: string;
  hasExifGps: boolean;
  aiAnalysis?: PhotoAiAnalysis;
  isAnalyzing?: boolean;
}

export interface EarthExplorerScene {
  entityId: string;
  satellite: string;
  agency: 'USGS EarthExplorer' | 'ISRO Bhuvan NRSC' | 'NASA / USGS' | 'ESA / Copernicus';
  pathRowOrTile: string; // e.g. "Path 144 / Row 050" or "Tile 43QDF"
  acquisitionDate: string;
  cloudCoverPercent: number;
  sunElevationAngle: number;
  resolutionM: number;
  bandsAvailable: string[];
  thumbnailUrl: string;
  dataUrl?: string;
  watershedCoverage: string;
  recommendedUse: string;
}

export interface BhuvanOverlay {
  id: string;
  name: string;
  wmsLayerName: string;
  category: string;
  description: string;
  opacity: number;
  legendUrl?: string;
}

export type LayerType = 
  | 'satellite_rgb' 
  | 'fcc_infrared' 
  | 'ndvi_vegetation' 
  | 'dem_elevation' 
  | 'slope_gradient' 
  | 'drainage_flow' 
  | 'erosion_hazard';

export type StructureType = 
  | 'check_dam' 
  | 'farm_pond' 
  | 'cct' 
  | 'gully_plug' 
  | 'percolation_tank' 
  | 'afforestation';

export interface SWCStructure {
  id: string;
  name: string;
  type: StructureType;
  lat: number;
  lng: number;
  elevationM: number;
  storageCapacityM3: number;
  catchmentAreaHa: number;
  costEstimateINR: number;
  status: 'existing' | 'proposed' | 'planned';
  streamOrder?: number;
  description: string;
  yearImplemented?: number;
}

export interface StreamSegment {
  id: string;
  name: string;
  order: 1 | 2 | 3 | 4; // Strahler stream order
  coordinates: [number, number][]; // [lat, lng][]
  lengthKm: number;
}

export interface WatershedCatchment {
  id: string;
  name: string;
  code: string;
  stateDistrict: string;
  areaHa: number;
  perimeterKm: number;
  center: [number, number];
  bounds: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
  elevationMinM: number;
  elevationMaxM: number;
  averageAnnualRainfallMm: number;
  dominantSoilType: string;
  hydrologicalSoilGroup: 'A' | 'B' | 'C' | 'D';
  baselineCurveNumber: number;
  treatedCurveNumber: number;
  morphometry: {
    drainageDensityKmPerSqKm: number;
    streamFrequencyPerSqKm: number;
    bifurcationRatio: number;
    formFactor: number;
    circulatoryRatio: number;
    timeOfConcentrationHours: number;
  };
  boundaryGeoJson: [number, number][];
  streams: StreamSegment[];
  existingStructures: SWCStructure[];
  proposedStructures: SWCStructure[];
  erosionRiskZones: {
    severity: 'Severe' | 'Moderate' | 'Slight';
    areaHa: number;
    color: string;
    coordinates: [number, number][];
  }[];
  imagery: {
    rgbSatellite: string;
    fccInfrared: string;
    erosionSurvey: string;
    interventionsAerial: string;
  };
}

export interface InspectionData {
  lat: number;
  lng: number;
  elevationM: number;
  slopePercent: number;
  lulcClass: string;
  ndviValue: number;
  soilGroup: 'A' | 'B' | 'C' | 'D';
  erosionRisk: 'Severe' | 'Moderate' | 'Low';
  curveNumber: number;
  recommendedTreatment: string;
}

export interface SimulationInputs {
  designRainfallMm: number;
  catchmentAreaHa: number;
  selectedSoilGroup: 'A' | 'B' | 'C' | 'D';
  rainfallDurationHours: number;
  checkDamCount: number;
  farmPondCount: number;
  cctLengthM: number;
  gullyPlugCount: number;
  afforestationAreaHa: number;
}

export interface SimulationOutputs {
  baselineS: number;
  baselineRunoffMm: number;
  baselineRunoffVolumeM3: number;
  baselinePeakDischargeM3s: number;
  treatedS: number;
  treatedRunoffMm: number;
  treatedRunoffVolumeM3: number;
  treatedPeakDischargeM3s: number;
  attenuatedRunoffM3: number;
  attenuationPercent: number;
  harvestedStorageCapacityM3: number;
  estimatedGroundwaterRechargeM3: number;
  annualSoilLossReductionTons: number;
  additionalIrrigationPotentialHa: number;
  estimatedTotalBudgetINR: number;
}

export interface ElevationTransectPoint {
  distanceKm: number;
  elevationM: number;
  slopePercent: number;
  zone: 'Ridge' | 'Middle Slope' | 'Valley Bottom';
  streamIntersection?: string;
  recommendedStructure?: string;
}

export interface AiDiagnosisResult {
  isAiGenerated: boolean;
  summary: string;
  lulcClassification: {
    category: string;
    percentage: number;
    erosionRisk: string;
    recommendedAction: string;
  }[];
  diagnosticFindings: string[];
  recommendedInterventions: {
    type: string;
    location: string;
    elevation: string;
    purpose: string;
    estimatedCost: string;
  }[];
  projectedOutcomes: {
    surfaceRunoffReductionPercent: number;
    annualGroundwaterRechargeM3: number;
    soilLossReductionTonHaYear: number;
    potentialIrrigationCommandHa: number;
  };
}
