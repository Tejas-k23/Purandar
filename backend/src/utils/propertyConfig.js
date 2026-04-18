const BOOLEAN_FIELDS = ['mealsIncluded', 'priceNegotiable', 'showWhatsappButton', 'useCustomWhatsappDetails', 'useOriginalSellerContact'];

const PROPERTY_TYPE_CONFIG = {
  Flat: {
    requiredFields: ['totalArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'carpetArea', 'areaUnit', 'furnishing', 'availability', 'propertyAge', 'ownership', 'tenantPreference'],
    locationFields: ['flatNo', 'totalFloors', 'floorNo'],
    detailFields: ['facing', 'overlooking', 'waterSupply', 'gatedCommunity'],
  },
  Apartment: {
    requiredFields: ['totalArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'carpetArea', 'areaUnit', 'furnishing', 'availability', 'propertyAge', 'ownership', 'tenantPreference'],
    locationFields: ['flatNo', 'totalFloors', 'floorNo'],
    detailFields: ['facing', 'overlooking', 'waterSupply', 'gatedCommunity'],
  },
  House: {
    requiredFields: ['totalArea', 'plotArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'carpetArea', 'plotArea', 'areaUnit', 'floorsInProperty', 'furnishing', 'availability', 'propertyAge', 'ownership'],
    locationFields: ['flatNo', 'totalFloors'],
    detailFields: ['facing', 'overlooking', 'waterSupply', 'gatedCommunity'],
  },
  Villa: {
    requiredFields: ['totalArea', 'plotArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'carpetArea', 'plotArea', 'areaUnit', 'floorsInProperty', 'furnishing', 'availability', 'propertyAge', 'ownership'],
    locationFields: ['flatNo', 'totalFloors'],
    detailFields: ['facing', 'overlooking', 'waterSupply', 'gatedCommunity'],
  },
  'Builder Floor': {
    requiredFields: ['totalArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'carpetArea', 'plotArea', 'areaUnit', 'furnishing', 'availability', 'propertyAge', 'ownership'],
    locationFields: ['flatNo', 'totalFloors', 'floorNo'],
    detailFields: ['facing', 'overlooking', 'waterSupply', 'gatedCommunity'],
  },
  Plot: {
    requiredFields: ['plotArea'],
    visibleFields: ['plotArea', 'plotLength', 'plotWidth', 'ownership', 'boundaryWall', 'openSides', 'constructionDone', 'areaUnit'],
    locationFields: [],
    detailFields: ['facing', 'overlooking', 'gatedCommunity'],
  },
  PG: {
    requiredFields: ['totalArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'areaUnit', 'bedCount', 'mealsIncluded', 'furnishing'],
    locationFields: ['flatNo', 'totalFloors', 'floorNo'],
    detailFields: [],
  },
  Farmhouse: {
    requiredFields: ['totalArea', 'plotArea'],
    visibleFields: ['bedrooms', 'bathrooms', 'balconies', 'totalArea', 'plotArea', 'areaUnit', 'floorsInProperty', 'furnishing', 'availability', 'propertyAge', 'ownership'],
    locationFields: ['flatNo', 'totalFloors'],
    detailFields: ['facing', 'overlooking', 'waterSupply'],
  },
  'Office Space': {
    requiredFields: ['carpetArea'],
    visibleFields: ['carpetArea', 'superBuiltUpArea', 'areaUnit', 'furnishing', 'washroom', 'personalWashroom', 'pantry', 'maintenance', 'coveredParking', 'openParking', 'cabinCount'],
    locationFields: ['totalFloors', 'floorNo'],
    detailFields: [],
  },
  Shop: {
    requiredFields: ['carpetArea'],
    visibleFields: ['carpetArea', 'superBuiltUpArea', 'areaUnit', 'furnishing', 'washroom', 'pantry', 'coveredParking', 'openParking'],
    locationFields: ['totalFloors', 'floorNo'],
    detailFields: [],
  },
  Warehouse: {
    requiredFields: ['plotArea'],
    visibleFields: ['plotArea', 'floorArea', 'areaUnit', 'warehouseHeight', 'loadingUnloading'],
    locationFields: [],
    detailFields: [],
  },
  Industrial: {
    requiredFields: ['plotArea'],
    visibleFields: ['plotArea', 'floorArea', 'areaUnit', 'warehouseHeight', 'loadingUnloading'],
    locationFields: [],
    detailFields: [],
  },
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

const ALL_DYNAMIC_FIELDS = [
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
  'bedCount',
  'superBuiltUpArea',
  'washroom',
  'personalWashroom',
  'pantry',
  'cabinCount',
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
];

const ALL_LOCATION_FIELDS = ['flatNo', 'totalFloors', 'floorNo'];

const arrayDefaults = {
  societyAmenities: [],
  flatAmenities: [],
  overlooking: [],
};

const booleanDefaults = {
  mealsIncluded: false,
};

export function getPropertyTypeConfig(propertyType) {
  return PROPERTY_TYPE_CONFIG[PROPERTY_TYPE_ALIASES[propertyType] || propertyType] || null;
}

export function prunePropertyPayload(payload = {}) {
  const next = { ...payload };
  const capitalized = (next.propertyType || '').replace(/\b\w/g, l => l.toUpperCase());
  next.propertyType = PROPERTY_TYPE_ALIASES[capitalized] || capitalized;
  const config = getPropertyTypeConfig(next.propertyType);
  if (!config) return next;

  const visibleFields = new Set(config.visibleFields);
  const locationFields = new Set(config.locationFields);
  const detailFields = new Set(config.detailFields);

  if (next.intent === 'rent' || next.intent === 'pg') {
    visibleFields.add('securityDeposit');
    visibleFields.add('maintenance');
  }
  if (next.intent !== 'pg') {
    visibleFields.delete('mealsIncluded');
    visibleFields.delete('bedCount');
  }
  if (visibleFields.has('availability') && next.availability === 'Under Construction') {
    visibleFields.add('possessionMonth');
    visibleFields.add('possessionYear');
  }

  for (const field of ALL_DYNAMIC_FIELDS) {
    if (visibleFields.has(field)) continue;
    if (detailFields.has(field)) continue;
    if (field in arrayDefaults) next[field] = [];
    else if (field in booleanDefaults) next[field] = booleanDefaults[field];
    else next[field] = '';
  }

  for (const field of ALL_LOCATION_FIELDS) {
    if (!locationFields.has(field)) {
      next[field] = '';
    }
  }

  for (const field of ['facing', 'overlooking', 'waterSupply', 'gatedCommunity']) {
    if (!detailFields.has(field)) {
      next[field] = field === 'overlooking' ? [] : '';
    }
  }

  return next;
}

export function validatePropertyPayload(payload = {}) {
  const config = getPropertyTypeConfig(payload.propertyType);
  if (!config) {
    return ['Unsupported property type'];
  }

  const errors = [];
  for (const field of config.requiredFields) {
    if (!String(payload[field] ?? '').trim()) {
      errors.push(`${field} is required`);
    }
  }

  if (!String(payload.price ?? '').trim()) {
    errors.push('price is required');
  }
  if (payload.latitude === null || payload.latitude === undefined || payload.longitude === null || payload.longitude === undefined) {
    errors.push('Property map coordinates are required');
  }
  if ((payload.intent === 'rent' || payload.intent === 'pg') && !String(payload.securityDeposit ?? '').trim() && payload.securityDeposit !== 0 && payload.securityDeposit !== '0') {
    // Optional, keep relaxed.
  }
  if (config.locationFields.includes('totalFloors') && !String(payload.totalFloors ?? '').trim()) {
    errors.push('totalFloors is required');
  }
  if (config.locationFields.includes('floorNo') && !String(payload.floorNo ?? '').trim()) {
    errors.push('floorNo is required');
  }
  if (payload.contactDisplayMode === 'custom') {
    if (!payload.displaySellerName?.trim()) errors.push('displaySellerName is required');
    if (!payload.displaySellerPhone?.trim()) errors.push('displaySellerPhone is required');
    if (!payload.displaySellerEmail?.trim()) errors.push('displaySellerEmail is required');

    // Validate email format
    if (payload.displaySellerEmail?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.displaySellerEmail.trim())) {
        errors.push('displaySellerEmail must be a valid email address');
      }
    }

    // Validate phone - at least 10 digits
    if (payload.displaySellerPhone?.trim()) {
      const phoneDigits = String(payload.displaySellerPhone).replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        errors.push('displaySellerPhone must contain at least 10 digits');
      }
    }
  }
  if (payload.showWhatsappButton && payload.whatsappDisplayMode === 'custom' && !payload.customWhatsappNumber?.trim()) {
    errors.push('customWhatsappNumber is required');
  }
  if (payload.videoUrl?.trim() && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(payload.videoUrl.trim())) {
    errors.push('videoUrl must be a valid YouTube URL');
  }

  return errors;
}

export function normalizePropertyBooleans(payload = {}) {
  const next = { ...payload };
  for (const field of BOOLEAN_FIELDS) {
    if (!(field in next)) continue;
    if (next[field] === true || next[field] === 'true' || next[field] === 1 || next[field] === '1') next[field] = true;
    else if (next[field] === false || next[field] === 'false' || next[field] === 0 || next[field] === '0') next[field] = false;
    else next[field] = Boolean(next[field]);
  }
  return next;
}
