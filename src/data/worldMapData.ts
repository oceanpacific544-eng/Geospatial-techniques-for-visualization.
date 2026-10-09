export interface GlobalRiverBasin {
  id: string;
  name: string;
  river: string;
  continent: string;
  countries: string[];
  areaKm2: number;
  dischargeM3s: number;
  lengthKm: number;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  polygonPoints: [number, number][];
  status: 'stable' | 'stressed' | 'critical';
  populationMillions: number;
  keyDams: string[];
  climateZone: string;
  majorIssues: string[];
  description: string;
}

export interface GlobalHydroHotspot {
  id: string;
  name: string;
  category: 'mega-dam' | 'shrinking-lake' | 'groundwater-depletion' | 'glacial-tower' | 'delta-wetland';
  country: string;
  lat: number;
  lng: number;
  capacityOrArea: string;
  status: 'critical' | 'alert' | 'operational' | 'monitoring';
  description: string;
  hydroImpact: string;
}

export interface GlobalSatelliteTrack {
  id: string;
  name: string;
  agency: string;
  type: 'Earth Observation' | 'Multispectral Radar' | 'Thermal & Weather';
  altitudeKm: number;
  inclinationDeg: number;
  currentLat: number;
  currentLng: number;
  swathWidthKm: number;
  color: string;
  mission: string;
}

export const GLOBAL_TILE_PROVIDERS = [
  {
    id: 'esri-satellite',
    name: 'High-Res Satellite (Esri World)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    isDark: true,
  },
  {
    id: 'carto-dark',
    name: 'CartoDB Dark Matter GIS',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
    maxZoom: 19,
    isDark: true,
  },
  {
    id: 'opentopo',
    name: 'OpenTopoMap (Topographic Contours)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
    isDark: false,
  },
  {
    id: 'osm',
    name: 'OpenStreetMap Global Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    isDark: false,
  },
  {
    id: 'carto-voyager',
    name: 'CartoDB Voyager (Geopolitical Reference)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxZoom: 19,
    isDark: false,
  },
];

export const GLOBAL_RIVER_BASINS: GlobalRiverBasin[] = [
  {
    id: 'amazon',
    name: 'Amazon River Basin',
    river: 'Amazon (Rio Amazonas)',
    continent: 'South America',
    countries: ['Brazil', 'Peru', 'Bolivia', 'Colombia', 'Ecuador', 'Venezuela', 'Guyana'],
    areaKm2: 7050000,
    dischargeM3s: 209000,
    lengthKm: 6992,
    center: [-3.4653, -62.2159],
    bounds: [[-18.0, -79.0], [5.0, -48.0]],
    polygonPoints: [
      [4.5, -51.5], [1.0, -48.0], [-1.5, -49.0], [-3.0, -44.0], [-8.0, -46.0],
      [-13.0, -48.0], [-16.5, -53.0], [-18.0, -64.0], [-16.0, -72.0], [-12.0, -76.0],
      [-6.0, -78.5], [0.0, -78.0], [3.5, -74.0], [5.0, -64.0], [4.5, -57.0]
    ],
    status: 'stressed',
    populationMillions: 35,
    keyDams: ['Belo Monte (11,233 MW)', 'Jirau (3,750 MW)', 'Santo Antônio (3,568 MW)'],
    climateZone: 'Af / Am - Tropical Rainforest & Monsoon',
    majorIssues: ['Amazon deforestation tipping point', 'Drought in Rio Negro tributaries', 'Hydropower run-of-river sediment disruption'],
    description: 'The largest drainage basin on Earth, containing 20% of global river discharge into the oceans. Regulates the South American atmospheric flying rivers.'
  },
  {
    id: 'nile',
    name: 'Nile River Basin',
    river: 'Nile (White & Blue Nile)',
    continent: 'Africa',
    countries: ['Egypt', 'Sudan', 'South Sudan', 'Ethiopia', 'Uganda', 'Rwanda', 'Burundi', 'DR Congo', 'Tanzania', 'Kenya'],
    areaKm2: 3254555,
    dischargeM3s: 2830,
    lengthKm: 6650,
    center: [16.5, 31.5],
    bounds: [[-4.0, 23.0], [32.0, 40.0]],
    polygonPoints: [
      [31.8, 30.5], [31.5, 32.5], [26.0, 34.0], [18.0, 38.0], [12.0, 39.5],
      [8.0, 39.0], [2.0, 36.5], [-3.5, 33.5], [-3.0, 29.5], [3.0, 28.0],
      [8.0, 24.5], [16.0, 27.0], [23.0, 29.0], [29.0, 30.0]
    ],
    status: 'critical',
    populationMillions: 280,
    keyDams: ['Grand Ethiopian Renaissance Dam (GERD - 74 BCM)', 'Aswan High Dam (132 BCM)', 'Merowe Dam'],
    climateZone: 'BWh / BSh / Cwb - Arid Desert to Ethiopian Highlands',
    majorIssues: ['GERD filling disputes & Nile transboundary tensions', 'Intense agricultural irrigation salinity in Nile Delta', 'Sea-level rise saltwater intrusion'],
    description: 'Longest river system in Africa sustaining civilisations for millennia. Severe geopolitical competition between upstream Ethiopia and downstream Egypt and Sudan.'
  },
  {
    id: 'ganges-brahmaputra',
    name: 'Ganges - Brahmaputra - Meghna Basin',
    river: 'Ganga & Brahmaputra (Tsangpo)',
    continent: 'South Asia',
    countries: ['India', 'Bangladesh', 'Nepal', 'China (Tibet)', 'Bhutan'],
    areaKm2: 1745000,
    dischargeM3s: 38129,
    lengthKm: 2525,
    center: [25.5, 84.5],
    bounds: [[21.5, 73.0], [31.5, 96.0]],
    polygonPoints: [
      [31.2, 77.0], [31.5, 81.5], [30.5, 87.0], [29.8, 93.5], [28.0, 96.5],
      [25.0, 93.0], [22.0, 91.5], [21.5, 88.0], [22.5, 84.0], [24.0, 78.5],
      [27.0, 75.0], [29.5, 75.5]
    ],
    status: 'stressed',
    populationMillions: 650,
    keyDams: ['Tehri Dam (260.5m high)', 'Farakka Barrage', 'Zangmu Hydropower Station (Tibet)'],
    climateZone: 'Cwa / Am - Subtropical Monsoon & Alpine Himalayan',
    majorIssues: ['Groundwater overexploitation in Gangetic plain', 'Glacial lake outburst floods (GLOF) in Himalayas', 'Sundarbans delta subsidence and salinity'],
    description: 'The most densely populated river basin on the planet, sustaining over 650 million people. Fed by both South Asian monsoon rains and Himalayan glacial melt.'
  },
  {
    id: 'mississippi',
    name: 'Mississippi - Missouri River Basin',
    river: 'Mississippi & Missouri',
    continent: 'North America',
    countries: ['United States', 'Canada'],
    areaKm2: 3220000,
    dischargeM3s: 16792,
    lengthKm: 6275,
    center: [38.5, -92.5],
    bounds: [[28.5, -114.0], [49.5, -78.0]],
    polygonPoints: [
      [49.0, -113.0], [49.2, -100.0], [48.0, -89.0], [42.5, -79.0], [38.0, -80.0],
      [34.0, -84.0], [30.0, -89.0], [29.0, -89.5], [29.5, -94.0], [32.0, -98.0],
      [36.0, -105.0], [42.0, -111.0], [46.0, -114.0]
    ],
    status: 'stressed',
    populationMillions: 75,
    keyDams: ['Fort Peck Dam', 'Garrison Dam', 'Kentucky Dam (TVA System)'],
    climateZone: 'Cfa / Dfa / BSk - Humid Subtropical to Continental Plains',
    majorIssues: ['Nutrient runoff leading to Gulf of Mexico hypoxic dead zone', 'Drought-induced low water levels halting barge traffic', 'Aging levee infrastructure'],
    description: 'Drains 41% of the contiguous United States spanning 31 states. Prime artery for global agricultural transport and industrial supply chains.'
  },
  {
    id: 'yangtze',
    name: 'Yangtze River Basin (Chang Jiang)',
    river: 'Yangtze',
    continent: 'East Asia',
    countries: ['China'],
    areaKm2: 1800000,
    dischargeM3s: 30166,
    lengthKm: 6300,
    center: [30.5, 112.0],
    bounds: [[24.5, 90.0], [35.5, 122.5]],
    polygonPoints: [
      [33.5, 92.0], [34.0, 102.0], [33.0, 111.0], [32.5, 119.0], [31.5, 122.0],
      [29.5, 120.0], [26.0, 116.0], [25.0, 110.0], [26.5, 102.0], [28.0, 98.0],
      [31.0, 93.0]
    ],
    status: 'stressed',
    populationMillions: 430,
    keyDams: ['Three Gorges Dam (22,500 MW)', 'Baihetan Dam (16,000 MW)', 'Xiluodu Dam (13,860 MW)'],
    climateZone: 'Cfa / Dwb - Humid Subtropical & Tibetan Alpine',
    majorIssues: ['Poyang and Dongting Lake seasonal shrinkage', 'Severe heatwave and low-flow events in Sichuan basin', 'Downstream delta industrial pollution controls'],
    description: 'Longest river in Eurasia. Produces roughly 40% of China GDP and contains the highest density of mega-hydroelectric cascade projects globally.'
  },
  {
    id: 'congo',
    name: 'Congo River Basin',
    river: 'Congo (Lualaba)',
    continent: 'Africa',
    countries: ['DR Congo', 'Republic of the Congo', 'Central African Republic', 'Zambia', 'Angola', 'Cameroon', 'Tanzania'],
    areaKm2: 4014500,
    dischargeM3s: 41000,
    lengthKm: 4700,
    center: [-1.5, 23.0],
    bounds: [[-13.0, 11.0], [9.0, 32.0]],
    polygonPoints: [
      [8.0, 18.0], [7.0, 25.0], [4.0, 30.0], [-3.0, 31.0], [-9.0, 31.0],
      [-12.0, 26.0], [-11.0, 18.0], [-6.0, 12.5], [-1.0, 13.0], [4.0, 14.5]
    ],
    status: 'stable',
    populationMillions: 95,
    keyDams: ['Inga I & Inga II Dams', 'Grand Inga Project (planned 40,000 MW)'],
    climateZone: 'Af / Aw - Equatorial Rainforest & Savanna',
    majorIssues: ['Vast untapped hydropower potential amidst severe energy poverty', 'Peatland forest carbon sink preservation', 'River navigation dredging'],
    description: 'Second largest river by discharge in the world and the deepest recorded river (>220 meters). Encompasses the world second largest tropical peatland.'
  },
  {
    id: 'danube',
    name: 'Danube River Basin',
    river: 'Danube (Donau)',
    continent: 'Europe',
    countries: ['Germany', 'Austria', 'Slovakia', 'Hungary', 'Croatia', 'Serbia', 'Romania', 'Bulgaria', 'Moldova', 'Ukraine'],
    areaKm2: 801463,
    dischargeM3s: 6500,
    lengthKm: 2857,
    center: [46.5, 20.0],
    bounds: [[42.0, 8.0], [50.0, 30.0]],
    polygonPoints: [
      [48.0, 8.5], [49.5, 12.0], [49.8, 18.0], [48.5, 24.0], [47.5, 27.5],
      [45.5, 29.5], [43.5, 28.0], [42.5, 23.0], [43.0, 18.5], [45.0, 14.5],
      [47.0, 10.0]
    ],
    status: 'stable',
    populationMillions: 83,
    keyDams: ['Iron Gate I (Đerdap I - 2,160 MW)', 'Iron Gate II', 'Gabčíkovo Dam'],
    climateZone: 'Cfb / Dfb - Oceanic to Humid Continental',
    majorIssues: ['Microplastic and chemical residue monitoring', 'Danube Delta biosphere reserve restoration', 'Navigation channel depths during summer heatwaves'],
    description: 'The most international river basin on Earth, traversing or draining 19 European nations from the Black Forest to the Black Sea.'
  },
  {
    id: 'indus',
    name: 'Indus River Basin',
    river: 'Indus (Sindhu)',
    continent: 'South Asia',
    countries: ['Pakistan', 'India', 'China (Tibet)', 'Afghanistan'],
    areaKm2: 1120000,
    dischargeM3s: 6600,
    lengthKm: 3180,
    center: [29.5, 71.5],
    bounds: [[23.5, 66.0], [37.0, 82.0]],
    polygonPoints: [
      [36.5, 73.0], [35.0, 80.0], [32.0, 81.0], [31.0, 77.0], [28.5, 73.5],
      [24.0, 68.5], [24.5, 67.0], [29.0, 67.5], [33.5, 69.5], [35.5, 71.0]
    ],
    status: 'critical',
    populationMillions: 270,
    keyDams: ['Tarbela Dam (largest earth-filled dam by volume)', 'Mangla Dam', 'Diamer-Bhasha Dam (under construction)'],
    climateZone: 'BWh / BSh / ET - Arid Desert to Karakoram Alpine',
    majorIssues: ['High vulnerability to catastrophic climate floods (e.g. 2022 megafloods)', 'Severe siltation of major storage reservoirs', 'Transboundary Indus Waters Treaty governance'],
    description: 'Lifeline of Pakistan agriculture and hydrology. Heavily dependent on glacial melt from the Karakoram and Hindu Kush ranges.'
  },
  {
    id: 'murray-darling',
    name: 'Murray - Darling Basin',
    river: 'Murray & Darling',
    continent: 'Oceania (Australia)',
    countries: ['Australia'],
    areaKm2: 1061000,
    dischargeM3s: 767,
    lengthKm: 3672,
    center: [-32.5, 144.5],
    bounds: [[-37.5, 138.0], [-25.0, 152.0]],
    polygonPoints: [
      [-26.0, 147.0], [-28.0, 151.5], [-32.0, 150.0], [-36.5, 148.0], [-37.5, 142.5],
      [-36.0, 139.0], [-33.5, 140.0], [-30.0, 141.5], [-27.5, 144.0]
    ],
    status: 'critical',
    populationMillions: 3.5,
    keyDams: ['Dartmouth Dam', 'Hume Dam', 'Eildon Dam'],
    climateZone: 'BSh / Csa - Semi-Arid to Mediterranean',
    majorIssues: ['Salinization of soil and river reaches', 'Fish kill events during prolonged droughts and flash hypoxic floods', 'Water buyback and environmental flow politics'],
    description: 'Australia food bowl, producing one-third of the nation food supply. Subject to extreme Millennium Drought cycles and intensive water extraction management.'
  },
  {
    id: 'colorado',
    name: 'Colorado River Basin',
    river: 'Colorado',
    continent: 'North America',
    countries: ['United States', 'Mexico'],
    areaKm2: 640000,
    dischargeM3s: 640,
    lengthKm: 2330,
    center: [36.5, -111.0],
    bounds: [[31.0, -116.0], [43.5, -105.0]],
    polygonPoints: [
      [43.0, -110.0], [41.0, -106.0], [38.5, -106.0], [33.5, -108.5], [31.5, -113.5],
      [32.0, -115.5], [35.5, -115.5], [38.5, -113.0], [42.0, -112.5]
    ],
    status: 'critical',
    populationMillions: 40,
    keyDams: ['Hoover Dam / Lake Mead', 'Glen Canyon Dam / Lake Powell'],
    climateZone: 'BWk / BSk - Cold Desert to Semi-Arid',
    majorIssues: ['Chronic 23-year megadrought depleting Lake Mead and Powell', 'Over-allocation under the 1922 Colorado River Compact', 'Desiccation of the Colorado River Delta in Mexico'],
    description: 'Supplies water to Los Angeles, Phoenix, Las Vegas, and 5.5 million acres of farmland. Facing existential structural deficit water cuts.'
  },
  {
    id: 'mekong',
    name: 'Mekong River Basin',
    river: 'Mekong (Lancang)',
    continent: 'Southeast Asia',
    countries: ['China', 'Myanmar', 'Laos', 'Thailand', 'Cambodia', 'Vietnam'],
    areaKm2: 795000,
    dischargeM3s: 15000,
    lengthKm: 4350,
    center: [16.0, 104.0],
    bounds: [[9.0, 94.0], [33.0, 107.0]],
    polygonPoints: [
      [32.0, 95.0], [29.0, 99.0], [24.0, 100.5], [20.0, 102.5], [17.5, 105.5],
      [14.0, 107.0], [10.0, 106.5], [9.5, 104.5], [12.0, 103.0], [16.0, 101.0],
      [20.5, 99.5], [25.0, 98.0]
    ],
    status: 'stressed',
    populationMillions: 70,
    keyDams: ['Xiaowan Dam (292m high)', 'Nuozhadu Dam', 'Xayaburi Dam (Laos)'],
    climateZone: 'Aw / Am - Tropical Savanna & Monsoon',
    majorIssues: ['Disruption of Tonle Sap reverse flow pulse', 'Sediment trapping starving the Mekong Delta in Vietnam', 'Upstream cascade dams altering dry season flows'],
    description: 'The world largest inland fishery basin. The seasonal flow reversal of Cambodia Tonle Sap lake is one of nature greatest hydrological marvels.'
  }
];

export const GLOBAL_HYDRO_HOTSPOTS: GlobalHydroHotspot[] = [
  {
    id: 'three-gorges',
    name: 'Three Gorges Dam (Sanxia)',
    category: 'mega-dam',
    country: 'China (Hubei)',
    lat: 30.826,
    lng: 111.007,
    capacityOrArea: '39.3 Billion m³ Storage · 22,500 MW Capacity',
    status: 'operational',
    description: 'World largest power station by installed capacity. Controls Yangtze River flood peak flows from 1 million km² catchment area.',
    hydroImpact: 'Regulates 100-year flood levels; altered downstream sediment deposition and river delta morphological stability.'
  },
  {
    id: 'gerd-dam',
    name: 'Grand Ethiopian Renaissance Dam (GERD)',
    category: 'mega-dam',
    country: 'Ethiopia (Benishangul-Gumuz)',
    lat: 11.215,
    lng: 35.093,
    capacityOrArea: '74 Billion m³ Reservoir · 5,150 MW',
    status: 'operational',
    description: 'Largest hydroelectric dam in Africa built on the Blue Nile, 15 km east of the border with Sudan.',
    hydroImpact: 'Transforms Blue Nile seasonal flood surge into steady baseline discharge; focal point of regional Nile basin water diplomacy.'
  },
  {
    id: 'hoover-dam',
    name: 'Hoover Dam & Lake Mead',
    category: 'mega-dam',
    country: 'United States (Nevada/Arizona)',
    lat: 36.015,
    lng: -114.737,
    capacityOrArea: '35.2 Billion m³ Max Capacity · Elevation 1,065 ft',
    status: 'alert',
    description: 'Iconic concrete arch-gravity dam on the Colorado River creating Lake Mead, America largest reservoir by volume.',
    hydroImpact: 'Facing historic low water elevations triggering Tier 2 water shortage declarations for Lower Basin states.'
  },
  {
    id: 'aral-sea',
    name: 'Aral Sea Crisis Basin',
    category: 'shrinking-lake',
    country: 'Kazakhstan / Uzbekistan',
    lat: 45.0,
    lng: 59.0,
    capacityOrArea: 'Lost 90% Surface Area since 1960',
    status: 'critical',
    description: 'Once the fourth largest lake on Earth. Desiccated after Soviet diversion of the Amu Darya and Syr Darya rivers for cotton monoculture.',
    hydroImpact: 'Created the Aralkum desert; toxic salt dust storms now impact regional climate, health, and glacier melting in Central Asia.'
  },
  {
    id: 'lake-chad',
    name: 'Lake Chad Basin',
    category: 'shrinking-lake',
    country: 'Chad / Cameroon / Niger / Nigeria',
    lat: 13.0,
    lng: 14.5,
    capacityOrArea: 'Shrunk from 25,000 km² (1963) to ~1,500 km²',
    status: 'critical',
    description: 'Endorheic freshwater lake in the Sahel providing water to over 30 million people across four sovereign nations.',
    hydroImpact: 'Intense climate variability and irrigation extraction have driven acute water scarcity and socio-ecological displacement.'
  },
  {
    id: 'dead-sea',
    name: 'Dead Sea Desiccation Zone',
    category: 'shrinking-lake',
    country: 'Jordan / Israel / Palestine',
    lat: 31.5,
    lng: 35.5,
    capacityOrArea: 'Water Level: -438m below sea level (dropping ~1m/yr)',
    status: 'critical',
    description: 'Lowest land elevation on Earth. Suffers from over 95% reduction in Jordan River inflows and mineral extraction evaporation ponds.',
    hydroImpact: 'Over 6,000 catastrophic sinkholes have formed along the western shoreline due to subterranean freshwater dissolution of salt strata.'
  },
  {
    id: 'third-pole',
    name: 'Himalayan Third Pole Water Tower',
    category: 'glacial-tower',
    country: 'India / Nepal / Bhutan / China',
    lat: 28.5,
    lng: 85.0,
    capacityOrArea: 'Over 100,000 km² Glacier & Snow Cover',
    status: 'alert',
    description: 'Contains the third largest accumulation of ice and snow on Earth after Antarctica and Greenland.',
    hydroImpact: 'Supplies baseline dry season water to 10 major river systems sustaining 1.9 billion people across South, East, and Southeast Asia.'
  },
  {
    id: 'ogallala-aquifer',
    name: 'Ogallala (High Plains) Aquifer',
    category: 'groundwater-depletion',
    country: 'United States (Great Plains)',
    lat: 38.0,
    lng: -101.0,
    capacityOrArea: '450,000 km² Area · 3.6 Trillion m³ Fossil Water',
    status: 'critical',
    description: 'Shallow water table aquifer beneath the Great Plains spanning 8 states. Powers 30% of US irrigated agricultural groundwater.',
    hydroImpact: 'Water level drops of over 30 meters in Kansas and Texas panhandle; recharge rate is only a fraction of annual extraction.'
  },
  {
    id: 'indo-gangetic-aquifer',
    name: 'Indo-Gangetic Deep Aquifer Depletion',
    category: 'groundwater-depletion',
    country: 'India (Punjab, Haryana, UP) & Pakistan',
    lat: 30.0,
    lng: 75.5,
    capacityOrArea: 'GRACE Satellite Hotspot: -20 mm/yr Equivalent Water Height',
    status: 'critical',
    description: 'The world most intensively exploited groundwater region, driven by subsidized agricultural tube-wells and paddy rotation.',
    hydroImpact: 'Critical water table decline exceeding 0.7m/year; arsenic and salinity contamination increasing in deeper aquifers.'
  },
  {
    id: 'sardar-sarovar',
    name: 'Sardar Sarovar Dam & Narmada Canal',
    category: 'mega-dam',
    country: 'India (Gujarat)',
    lat: 21.832,
    lng: 73.748,
    capacityOrArea: '9.5 Billion m³ Gross Storage · 1,450 MW Power',
    status: 'operational',
    description: 'Terminal mega-dam on the Narmada River with the world longest irrigation canal network (458 km main canal reaching Rajasthan border).',
    hydroImpact: 'Brought surface irrigation and drinking water to drought-prone Saurashtra and Kutch, while submerging 37,000 hectares.'
  }
];

export const GLOBAL_QUICK_REGIONS = [
  { id: 'world', name: '🌍 Entire World', center: [20.0, 0.0] as [number, number], zoom: 2 },
  { id: 'india', name: '🇮🇳 India & South Asia', center: [22.0, 78.5] as [number, number], zoom: 5 },
  { id: 'amazon', name: '🇧🇷 Amazon Basin', center: [-3.5, -62.0] as [number, number], zoom: 4 },
  { id: 'nile', name: '🇪🇬 Nile & North Africa', center: [18.0, 32.0] as [number, number], zoom: 5 },
  { id: 'north-america', name: '🇺🇸 North America', center: [39.0, -96.0] as [number, number], zoom: 4 },
  { id: 'europe', name: '🇪🇺 Europe (Danube/Rhine)', center: [48.0, 16.0] as [number, number], zoom: 5 },
  { id: 'east-asia', name: '🇨🇳 East Asia (Yangtze)', center: [31.0, 112.0] as [number, number], zoom: 5 },
  { id: 'congo', name: '🇨🇩 Congo Basin', center: [-1.0, 23.0] as [number, number], zoom: 5 },
  { id: 'australia', name: '🇦🇺 Australia', center: [-27.0, 134.0] as [number, number], zoom: 4 },
  { id: 'himalayas', name: '🏔️ Third Pole Glaciers', center: [29.5, 85.0] as [number, number], zoom: 6 },
];

export const GLOBAL_SATELLITE_TRACKS: GlobalSatelliteTrack[] = [
  {
    id: 'landsat-9',
    name: 'Landsat 9 (USGS / NASA)',
    agency: 'USGS / NASA',
    type: 'Multispectral Radar',
    altitudeKm: 705,
    inclinationDeg: 98.2,
    currentLat: 34.2,
    currentLng: 68.4,
    swathWidthKm: 185,
    color: '#06b6d4',
    mission: 'OLI-2 & TIRS-2 30m multispectral Earth Observation'
  },
  {
    id: 'sentinel-2a',
    name: 'Sentinel-2A (Copernicus ESA)',
    agency: 'ESA Copernicus',
    type: 'Earth Observation',
    altitudeKm: 786,
    inclinationDeg: 98.62,
    currentLat: -14.6,
    currentLng: -48.2,
    swathWidthKm: 290,
    color: '#10b981',
    mission: '10m VNIR resolution for global vegetation and water index mapping'
  },
  {
    id: 'terra-modis',
    name: 'Terra (MODIS / NASA)',
    agency: 'NASA Earth Science',
    type: 'Thermal & Weather',
    altitudeKm: 705,
    inclinationDeg: 98.2,
    currentLat: 52.1,
    currentLng: 13.8,
    swathWidthKm: 2330,
    color: '#f59e0b',
    mission: 'Daily global surface temperature, snow cover, and aerosol monitoring'
  },
  {
    id: 'cartosat-3',
    name: 'Cartosat-3 (ISRO Bhuvan)',
    agency: 'ISRO',
    type: 'Earth Observation',
    altitudeKm: 505,
    inclinationDeg: 97.5,
    currentLat: 18.5,
    currentLng: 79.2,
    swathWidthKm: 16,
    color: '#a855f7',
    mission: 'High-resolution panchromatic (0.28m) & 4-band multispectral terrain cartography'
  }
];

// Calculate approximate day/night terminator line based on current UTC time
export function calculateTerminatorPoints(): [number, number][] {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) / 86400000);
  // Solar declination approximation (in radians)
  const declination = -23.44 * (Math.PI / 180) * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  // Greenwich hour angle of the sun (in degrees)
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const sunLng = (12 - utcHours) * 15; // subsolar longitude

  const points: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 5) {
    const lonDiffRad = (lon - sunLng) * (Math.PI / 180);
    // tan(lat) = -cos(lonDiff) / tan(declination)
    const tanLat = -Math.cos(lonDiffRad) / Math.tan(declination);
    const lat = Math.atan(tanLat) * (180 / Math.PI);
    points.push([lat, lon]);
  }
  return points;
}
