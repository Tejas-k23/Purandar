const SHARED_DIRECTION_OPTIONS = [
  'East',
  'West',
  'North',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
];

const SHARED_OVERLOOKING_OPTIONS = ['Garden', 'Pool', 'Road', 'Other'];
const SHARED_WATER_SUPPLY_OPTIONS = ['Corporation', 'Borewell', 'Both'];
const OWNERSHIP_OPTIONS = ['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'];
const BOOLEAN_PILL_OPTIONS = ['Yes', 'No'];
const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
const COMMERCIAL_FURNISHING_OPTIONS = ['Bare Shell', 'Warm Shell', 'Fully Furnished'];
const AVAILABILITY_OPTIONS = ['Ready to Move', 'Under Construction'];
const AGE_OPTIONS = ['0-1', '1-5', '5-10', '10+'];

export const PROPERTY_TYPE_OPTIONS = {
  residential: [
    'Flat',
    'Apartment',
    'House',
    'Villa',
    'Builder Floor',
    'Plot',
    'PG',
    'Farmhouse',
  ],
  commercial: [
    'Office Space',
    'Shop',
    'Warehouse',
    'Industrial',
  ],
};

const PROPERTY_TYPE_ALIASES = {
  'Flat / Apartment': 'Flat',
  'Independent House / Villa': 'House',
  'Plot / Land': 'Plot',
  'PG / Hostel': 'PG',
  'Shop / Showroom': 'Shop',
  'Warehouse / Godown': 'Warehouse',
  'Industrial Building': 'Industrial',
  'Commercial Land': 'Plot',
  '1 RK / Studio Apartment': 'Apartment',
  'Serviced Apartment': 'Apartment',
};

const COMMON_BUILDING_AMENITIES = [
  'Lift',
  'CCTV',
  'Security',
  'Power Backup',
  'Visitor Parking',
  '24x7 Water Supply',
  'Fire Safety',
];

const RESIDENTIAL_SOCIETY_AMENITIES = [
  ...COMMON_BUILDING_AMENITIES,
  'Gymnasium',
  'Swimming Pool',
  'Club House',
  'Garden',
  "Children's Play Area",
  'Gas Pipeline',
  'Rain Water Harvesting',
  'Waste Disposal',
  'Jogging Track',
  'Indoor Games',
  'Multipurpose Hall',
  'Senior Citizen Zone',
  'Landscaped Garden',
  'EV Charging',
  'Terrace Garden',
  'Pet Park',
  'Yoga Deck',
  'Mini Theatre',
  'Sewage Treatment Plant',
];

const UNIT_AMENITIES = [
  'Air Conditioner',
  'Modular Kitchen',
  'Geyser',
  'RO System',
  'Intercom',
  'WiFi',
  'TV',
  'Fridge',
  'Washing Machine',
  'Microwave',
  'Sofa',
  'Beds',
];

export const PROPERTY_TYPE_CONFIG = {
  Flat: {
    category: 'residential',
    label: 'Flat',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: true },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Bedrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Total Area', required: true },
      { key: 'carpetArea', type: 'area', label: 'Carpet Area' },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
      { key: 'availability', type: 'pill', label: 'Availability', options: AVAILABILITY_OPTIONS },
      { key: 'propertyAge', type: 'select', label: 'Age of Property', options: AGE_OPTIONS },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
      { key: 'tenantPreference', type: 'pill', label: 'Tenant Preference', options: ['family', 'bachelors', ''], optionLabels: { family: 'Family', bachelors: 'Bachelors', '': 'Anyone' }, showWhen: ({ intent }) => intent === 'rent' },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Society / Building Amenities', options: RESIDENTIAL_SOCIETY_AMENITIES },
      { key: 'flatAmenities', label: 'Flat / Unit Amenities', options: [...UNIT_AMENITIES, 'Lift', 'Parking'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: true,
      gatedCommunity: true,
    },
  },
  Apartment: {
    category: 'residential',
    label: 'Apartment',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: true },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Bedrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Total Area', required: true },
      { key: 'carpetArea', type: 'area', label: 'Carpet Area' },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
      { key: 'availability', type: 'pill', label: 'Availability', options: AVAILABILITY_OPTIONS },
      { key: 'propertyAge', type: 'select', label: 'Age of Property', options: AGE_OPTIONS },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
      { key: 'tenantPreference', type: 'pill', label: 'Tenant Preference', options: ['family', 'bachelors', ''], optionLabels: { family: 'Family', bachelors: 'Bachelors', '': 'Anyone' }, showWhen: ({ intent }) => intent === 'rent' },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Society / Building Amenities', options: RESIDENTIAL_SOCIETY_AMENITIES },
      { key: 'flatAmenities', label: 'Flat / Unit Amenities', options: [...UNIT_AMENITIES, 'Lift', 'Parking'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: true,
      gatedCommunity: true,
    },
  },
  House: {
    category: 'residential',
    label: 'House',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: false },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Bedrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Built-up Area', required: true },
      { key: 'carpetArea', type: 'area', label: 'Carpet Area' },
      { key: 'plotArea', type: 'area', label: 'Plot Area', required: true },
      { key: 'floorsInProperty', type: 'number', label: 'No. of Floors in Property', min: 1 },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
      { key: 'availability', type: 'pill', label: 'Availability', options: AVAILABILITY_OPTIONS },
      { key: 'propertyAge', type: 'select', label: 'Age of Property', options: AGE_OPTIONS },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Property Amenities', options: [...COMMON_BUILDING_AMENITIES, 'Garden', 'Parking'] },
      { key: 'flatAmenities', label: 'Home Amenities', options: [...UNIT_AMENITIES, 'Beds'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: true,
      gatedCommunity: true,
    },
  },
  Villa: {
    category: 'residential',
    label: 'Villa',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: false },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Bedrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Built-up Area', required: true },
      { key: 'carpetArea', type: 'area', label: 'Carpet Area' },
      { key: 'plotArea', type: 'area', label: 'Plot Area', required: true },
      { key: 'floorsInProperty', type: 'number', label: 'No. of Floors in Villa', min: 1 },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
      { key: 'availability', type: 'pill', label: 'Availability', options: AVAILABILITY_OPTIONS },
      { key: 'propertyAge', type: 'select', label: 'Age of Property', options: AGE_OPTIONS },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Community Amenities', options: RESIDENTIAL_SOCIETY_AMENITIES },
      { key: 'flatAmenities', label: 'Villa Amenities', options: [...UNIT_AMENITIES, 'Private Garden', 'Private Pool', 'Parking'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: true,
      gatedCommunity: true,
    },
  },
  'Builder Floor': {
    category: 'residential',
    label: 'Builder Floor',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: true },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Bedrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Total Area', required: true },
      { key: 'carpetArea', type: 'area', label: 'Carpet Area' },
      { key: 'plotArea', type: 'area', label: 'Plot Area' },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
      { key: 'availability', type: 'pill', label: 'Availability', options: AVAILABILITY_OPTIONS },
      { key: 'propertyAge', type: 'select', label: 'Age of Property', options: AGE_OPTIONS },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Building Amenities', options: COMMON_BUILDING_AMENITIES },
      { key: 'flatAmenities', label: 'Unit Amenities', options: [...UNIT_AMENITIES, 'Lift', 'Parking'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: true,
      gatedCommunity: true,
    },
  },
  Plot: {
    category: 'residential',
    label: 'Plot',
    intentOptions: ['sell'],
    location: { showFlatNo: false, showTotalFloors: false, showFloorNo: false },
    profileFields: [
      { key: 'plotArea', type: 'area', label: 'Plot Area', required: true },
      { key: 'plotLength', type: 'number', label: 'Length', suffix: 'ft' },
      { key: 'plotWidth', type: 'number', label: 'Width', suffix: 'ft' },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
      { key: 'boundaryWall', type: 'pill', label: 'Boundary Wall', options: BOOLEAN_PILL_OPTIONS },
      { key: 'openSides', type: 'count', label: 'Open Sides', options: ['1', '2', '3', '4'] },
      { key: 'constructionDone', type: 'pill', label: 'Any Construction Done?', options: BOOLEAN_PILL_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Plot Features', options: ['Boundary Wall', 'Corner Plot', 'Gated Community', 'Road Access', 'Drainage', 'Electricity'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: false,
      gatedCommunity: true,
    },
  },
  PG: {
    category: 'residential',
    label: 'PG',
    intentOptions: ['pg'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: true },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Rooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Property Area', required: true },
      { key: 'bedCount', type: 'number', label: 'Bed Count', min: 1 },
      { key: 'mealsIncluded', type: 'toggle', label: 'Meals Included' },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'PG Amenities', options: ['Security', 'CCTV', 'Lift', 'Power Backup', 'Laundry', 'WiFi', 'Meals', 'Housekeeping'] },
      { key: 'flatAmenities', label: 'Room Amenities', options: ['Beds', 'WiFi', 'Air Conditioner', 'Study Table', 'Geyser', 'Laundry'] },
    ],
    additionalDetails: {
      facing: false,
      overlooking: false,
      waterSupply: false,
      gatedCommunity: false,
    },
  },
  Farmhouse: {
    category: 'residential',
    label: 'Farmhouse',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: true, showTotalFloors: true, showFloorNo: false },
    profileFields: [
      { key: 'bedrooms', type: 'count', label: 'Bedrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'bathrooms', type: 'count', label: 'Bathrooms', options: ['1', '2', '3', '4', '4+'] },
      { key: 'balconies', type: 'count', label: 'Balconies', options: ['0', '1', '2', '3', '3+'] },
      { key: 'totalArea', type: 'area', label: 'Built-up Area', required: true },
      { key: 'plotArea', type: 'area', label: 'Land Area', required: true },
      { key: 'floorsInProperty', type: 'number', label: 'No. of Floors', min: 1 },
      { key: 'furnishing', type: 'pill', label: 'Furnishing Status', options: FURNISHING_OPTIONS },
      { key: 'availability', type: 'pill', label: 'Availability', options: AVAILABILITY_OPTIONS },
      { key: 'propertyAge', type: 'select', label: 'Age of Property', options: AGE_OPTIONS },
      { key: 'ownership', type: 'pill', label: 'Ownership', options: OWNERSHIP_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Property Amenities', options: ['Garden', 'Parking', 'Security', 'Power Backup', 'Water Storage'] },
      { key: 'flatAmenities', label: 'Farmhouse Amenities', options: [...UNIT_AMENITIES, 'Private Garden'] },
    ],
    additionalDetails: {
      facing: true,
      overlooking: true,
      waterSupply: true,
      gatedCommunity: false,
    },
  },
  'Office Space': {
    category: 'commercial',
    label: 'Office Space',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: false, showTotalFloors: true, showFloorNo: true },
    profileFields: [
      { key: 'carpetArea', type: 'area', label: 'Carpet Area', required: true },
      { key: 'superBuiltUpArea', type: 'area', label: 'Super Built-up Area' },
      { key: 'furnishing', type: 'pill', label: 'Furnishing', options: COMMERCIAL_FURNISHING_OPTIONS },
      { key: 'washroom', type: 'pill', label: 'Washroom', options: BOOLEAN_PILL_OPTIONS },
      { key: 'personalWashroom', type: 'pill', label: 'Personal Washroom', options: BOOLEAN_PILL_OPTIONS },
      { key: 'pantry', type: 'pill', label: 'Pantry', options: BOOLEAN_PILL_OPTIONS },
      { key: 'cabinCount', type: 'number', label: 'Cabins', min: 0 },
      { key: 'maintenance', type: 'number', label: 'Avg. Monthly Maintenance', suffix: 'Rs.' },
      { key: 'coveredParking', type: 'number', label: 'Covered Parking', min: 0 },
      { key: 'openParking', type: 'number', label: 'Open Parking', min: 0 },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Building Amenities', options: [...COMMON_BUILDING_AMENITIES, 'Reception Lobby', 'Conference Room', 'Business Lounge'] },
      { key: 'flatAmenities', label: 'Office Amenities', options: ['Pantry', 'Cabins', 'Server Room', 'Central AC', 'Reception', 'Washroom'] },
    ],
    additionalDetails: {
      facing: false,
      overlooking: false,
      waterSupply: false,
      gatedCommunity: false,
    },
  },
  Shop: {
    category: 'commercial',
    label: 'Shop',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: false, showTotalFloors: true, showFloorNo: true },
    profileFields: [
      { key: 'carpetArea', type: 'area', label: 'Carpet Area', required: true },
      { key: 'superBuiltUpArea', type: 'area', label: 'Super Built-up Area' },
      { key: 'furnishing', type: 'pill', label: 'Furnishing', options: COMMERCIAL_FURNISHING_OPTIONS },
      { key: 'washroom', type: 'pill', label: 'Washroom', options: BOOLEAN_PILL_OPTIONS },
      { key: 'pantry', type: 'pill', label: 'Pantry', options: BOOLEAN_PILL_OPTIONS },
      { key: 'coveredParking', type: 'number', label: 'Covered Parking', min: 0 },
      { key: 'openParking', type: 'number', label: 'Open Parking', min: 0 },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Building Amenities', options: [...COMMON_BUILDING_AMENITIES, 'Reception Lobby'] },
      { key: 'flatAmenities', label: 'Retail Amenities', options: ['Display Frontage', 'Storage Area', 'Washroom', 'Pantry'] },
    ],
    additionalDetails: {
      facing: false,
      overlooking: false,
      waterSupply: false,
      gatedCommunity: false,
    },
  },
  Warehouse: {
    category: 'commercial',
    label: 'Warehouse',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: false, showTotalFloors: false, showFloorNo: false },
    profileFields: [
      { key: 'plotArea', type: 'area', label: 'Plot Area', required: true },
      { key: 'floorArea', type: 'area', label: 'Floor Area' },
      { key: 'warehouseHeight', type: 'number', label: 'Warehouse Height', suffix: 'ft', min: 0 },
      { key: 'loadingUnloading', type: 'pill', label: 'Loading / Unloading', options: BOOLEAN_PILL_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Warehouse Features', options: ['Dock Levelers', 'Power Backup', 'Security', 'Fire Safety', 'Truck Access'] },
    ],
    additionalDetails: {
      facing: false,
      overlooking: false,
      waterSupply: false,
      gatedCommunity: false,
    },
  },
  Industrial: {
    category: 'commercial',
    label: 'Industrial',
    intentOptions: ['sell', 'rent'],
    location: { showFlatNo: false, showTotalFloors: false, showFloorNo: false },
    profileFields: [
      { key: 'plotArea', type: 'area', label: 'Plot Area', required: true },
      { key: 'floorArea', type: 'area', label: 'Floor Area' },
      { key: 'warehouseHeight', type: 'number', label: 'Clear Height', suffix: 'ft', min: 0 },
      { key: 'loadingUnloading', type: 'pill', label: 'Loading / Unloading', options: BOOLEAN_PILL_OPTIONS },
    ],
    amenityGroups: [
      { key: 'societyAmenities', label: 'Industrial Features', options: ['Power Connection', 'Fire Safety', 'Security', 'Truck Access', 'Drainage'] },
    ],
    additionalDetails: {
      facing: false,
      overlooking: false,
      waterSupply: false,
      gatedCommunity: false,
    },
  },
};

const PROPERTY_FIELD_KEYS = [
  'bedrooms',
  'bathrooms',
  'balconies',
  'totalArea',
  'areaUnit',
  'carpetArea',
  'furnishing',
  'availability',
  'possessionMonth',
  'possessionYear',
  'propertyAge',
  'ownership',
  'securityDeposit',
  'maintenance',
  'mealsIncluded',
  'plotArea',
  'plotLength',
  'plotWidth',
  'boundaryWall',
  'openSides',
  'constructionDone',
  'superBuiltUpArea',
  'washroom',
  'personalWashroom',
  'pantry',
  'coveredParking',
  'openParking',
  'warehouseHeight',
  'loadingUnloading',
  'floorsInProperty',
  'floorArea',
  'tenantPreference',
  'societyAmenities',
  'flatAmenities',
  'facing',
  'overlooking',
  'waterSupply',
  'gatedCommunity',
  'bedCount',
  'cabinCount',
];

const LOCATION_FIELD_KEYS = ['flatNo', 'totalFloors', 'floorNo'];

export const PROPERTY_DEFAULTS = {
  societyAmenities: [],
  flatAmenities: [],
  overlooking: [],
  facing: '',
  waterSupply: '',
  gatedCommunity: '',
  mealsIncluded: false,
  bedCount: '',
  cabinCount: '',
  possessionMonth: '',
  possessionYear: '',
};

export function getPropertyTypeConfig(propertyType) {
  return PROPERTY_TYPE_CONFIG[PROPERTY_TYPE_ALIASES[propertyType] || propertyType] || null;
}

export function normalizePropertyType(propertyType) {
  if (!propertyType) return '';
  const capitalized = propertyType.replace(/\b\w/g, l => l.toUpperCase());
  return PROPERTY_TYPE_ALIASES[capitalized] || capitalized;
}

export function getIntentOptions(propertyType, fallbackCategory = 'residential') {
  const config = getPropertyTypeConfig(propertyType);
  if (config?.intentOptions?.length) return config.intentOptions;
  return fallbackCategory === 'residential' ? ['sell', 'rent', 'pg'] : ['sell', 'rent'];
}

export function getPropertyTypesByCategory(category) {
  return PROPERTY_TYPE_OPTIONS[category] || [];
}

export function getVisiblePropertyFieldKeys(propertyType, intent) {
  const config = getPropertyTypeConfig(propertyType);
  const visible = new Set(['price', 'priceNegotiable']);

  if (!config) return visible;

  for (const field of config.profileFields) {
    if (!field.showWhen || field.showWhen({ intent, propertyType })) {
      visible.add(field.key);
      if (field.type === 'area') visible.add('areaUnit');
    }
  }

  if (config.profileFields.some((field) => field.key === 'availability') && intent !== 'rent' && intent !== 'pg') {
    visible.add('possessionMonth');
    visible.add('possessionYear');
  }

  if (intent === 'rent' || intent === 'pg') {
    visible.add('securityDeposit');
    visible.add('maintenance');
  }

  return visible;
}

export function getVisibleLocationFieldKeys(propertyType, category) {
  const config = getPropertyTypeConfig(propertyType);
  const visible = new Set(['city', 'locality', 'subLocality', 'landmark', 'latitude', 'longitude']);
  const location = config?.location;

  if (!location && category === 'residential') visible.add('flatNo');
  if (location?.showFlatNo) visible.add('flatNo');
  if (location?.showTotalFloors) visible.add('totalFloors');
  if (location?.showFloorNo) visible.add('floorNo');

  return visible;
}

export function prunePropertyFormData(data) {
  const next = { ...data, propertyType: normalizePropertyType(data.propertyType) };
  const visibleProfileKeys = getVisiblePropertyFieldKeys(next.propertyType, next.intent);
  const visibleLocationKeys = getVisibleLocationFieldKeys(next.propertyType, next.category);
  const config = getPropertyTypeConfig(next.propertyType);

  for (const key of PROPERTY_FIELD_KEYS) {
    if (!visibleProfileKeys.has(key)) {
      if (Array.isArray(PROPERTY_DEFAULTS[key])) next[key] = [...PROPERTY_DEFAULTS[key]];
      else if (typeof PROPERTY_DEFAULTS[key] === 'boolean') next[key] = PROPERTY_DEFAULTS[key];
      else next[key] = PROPERTY_DEFAULTS[key] ?? '';
    }
  }

  for (const key of LOCATION_FIELD_KEYS) {
    if (!visibleLocationKeys.has(key)) {
      next[key] = '';
    }
  }

  if (!config?.additionalDetails?.facing) next.facing = '';
  if (!config?.additionalDetails?.overlooking) next.overlooking = [];
  if (!config?.additionalDetails?.waterSupply) next.waterSupply = '';
  if (!config?.additionalDetails?.gatedCommunity) next.gatedCommunity = '';

  if (next.intent !== 'pg') {
    next.mealsIncluded = false;
    next.bedCount = '';
  }

  if (!visibleProfileKeys.has('tenantPreference')) {
    next.tenantPreference = '';
  }

  return next;
}

export function getAmenitySections(propertyType) {
  const config = getPropertyTypeConfig(propertyType);
  return config?.amenityGroups || [];
}

export function getAdditionalDetailOptions() {
  return {
    directions: SHARED_DIRECTION_OPTIONS,
    overlooking: SHARED_OVERLOOKING_OPTIONS,
    waterSupply: SHARED_WATER_SUPPLY_OPTIONS,
  };
}

export function getPropertyValidationErrors(step, data) {
  const errors = {};
  const config = getPropertyTypeConfig(data.propertyType);
  const visibleFields = getVisiblePropertyFieldKeys(data.propertyType, data.intent);
  const visibleLocationFields = getVisibleLocationFieldKeys(data.propertyType, data.category);

  if (step === 1) {
    if (!data.propertyType) errors.propertyType = 'Please select a property type';
    if (data.contactDisplayMode === 'custom') {
      if (!data.displaySellerName?.trim()) errors.displaySellerName = 'Seller name is required';
      if (!data.displaySellerPhone?.trim()) errors.displaySellerPhone = 'Seller phone is required';
      if (!data.displaySellerEmail?.trim()) errors.displaySellerEmail = 'Seller email is required';
    }
    if (data.showWhatsappButton && data.whatsappDisplayMode === 'custom' && !data.customWhatsappNumber?.trim()) {
      errors.customWhatsappNumber = 'Custom WhatsApp number is required';
    }
  }

  if (step === 2) {
    if (!data.city?.trim()) errors.city = 'City is required';
    if (!data.locality?.trim()) errors.locality = 'Locality is required';
    if (visibleLocationFields.has('totalFloors') && !String(data.totalFloors || '').trim()) errors.totalFloors = 'Total floors is required';
    if (visibleLocationFields.has('floorNo') && !String(data.floorNo || '').trim()) errors.floorNo = 'Floor number is required';
  }

  if (step === 3) {
    if (!String(data.price || '').trim()) errors.price = 'Price is required';
    if (config) {
      for (const field of config.profileFields) {
        if (!visibleFields.has(field.key) || !field.required) continue;
        if (!String(data[field.key] ?? '').trim()) {
          errors[field.key] = `${field.label} is required`;
        }
      }
    }
    if (visibleFields.has('availability') && data.availability === 'Under Construction') {
      if (!data.possessionMonth) errors.possessionMonth = 'Expected possession month is required';
      if (!data.possessionYear) errors.possessionYear = 'Expected possession year is required';
    }
  }

  if (step === 4) {
    if ((data.photos || []).length > 5) errors.photos = 'You can upload up to 5 images';
    if (data.videoUrl?.trim() && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(data.videoUrl.trim())) {
      errors.videoUrl = 'Enter a valid YouTube URL';
    }
  }

  return errors;
}
