import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ListingsPanel from '../../components/property/ListingsPanel';
import MapPanel from '../../components/search/MapPanel';
import SeoManager from '../../components/common/SeoManager';
import useAuth from '../../hooks/useAuth';
import useProperties from '../../hooks/useProperties';
import seoService from '../../services/seoService';
import { buildPropertyApiParams, parseSearchParams } from '../../utils/queryParams';
import { toTitleCase, unslugify } from '../../utils/slugify';
import './LocationListingsPage.css';
import './BuyPage.css';

const typeFilters = {
  pg: { label: 'PG', propertyType: 'PG / Hostel', category: 'residential' },
  land: { label: 'Land', propertyType: 'Plot / Land' },
  apartment: { label: 'Apartment', propertyType: 'Flat / Apartment', category: 'residential' },
  office: { label: 'Office', propertyType: 'Office Space', category: 'commercial' },
};

const intentFilters = [
  { key: 'buy', label: 'Buy', intent: 'sell' },
  { key: 'sell', label: 'Sell', intent: 'sell' },
  { key: 'rent', label: 'Rent', intent: 'rent' },
];

const buildLocationParagraph = ({ label, intentLabel, kind }) => {
  if (kind === 'landmark') {
    return `Looking for ${intentLabel.toLowerCase()} properties near ${label}? Explore verified listings around ${label} with easy access to key conveniences, transport, and community hotspots. Use the filters above to narrow your search and compare the best options quickly.`;
  }

  return `Explore ${intentLabel.toLowerCase()} properties in ${label} with verified listings, pricing insights, and neighborhood details. Filter by property type and intent to find the right home or investment match in ${label} today.`;
};

const buildSchema = ({ properties, label, kind, origin }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: kind === 'landmark' ? `Properties near ${label}` : `Properties in ${label}`,
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  itemListElement: properties.slice(0, 10).map((property, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${origin}/property/${property._id}`,
    name: property.title || `${property.propertyType || 'Property'} in ${property.locality || label}`,
    item: {
      '@type': 'RealEstateListing',
      name: property.title || `${property.propertyType || 'Property'} in ${property.locality || label}`,
      description: property.description || '',
      url: `${origin}/property/${property._id}`,
      image: property.photos?.[0] || property.images?.[0]?.url || '',
      priceCurrency: 'INR',
      price: property.price,
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.locality || '',
        addressRegion: property.city || '',
        addressCountry: 'IN',
      },
    },
  })),
});

export default function LocationListingsPage({ mode = 'location' }) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hoveredPropertyId, setHoveredPropertyId] = React.useState('');
  const [nearby, setNearby] = React.useState([]);
  const routeFilters = React.useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const slug = mode === 'landmark' ? params.landmark : params.location;
  const locationLabel = toTitleCase(unslugify(slug || ''));
  const selectedType = (searchParams.get('type') || '').toLowerCase();
  const intentKey = (searchParams.get('intentKey') || (routeFilters.intent === 'rent' ? 'rent' : 'buy')).toLowerCase();
  const typePreset = typeFilters[selectedType] || {};
  const activeIntent = intentKey === 'rent' ? 'rent' : 'sell';

  const apiParams = React.useMemo(() => buildPropertyApiParams({
    ...routeFilters,
    intent: activeIntent,
    category: typePreset.category || routeFilters.category,
    propertyType: typePreset.propertyType || routeFilters.propertyType,
    location: mode === 'location' ? locationLabel : '',
    landmark: mode === 'landmark' ? locationLabel : '',
    limit: 24,
  }), [routeFilters, activeIntent, typePreset.category, typePreset.propertyType, mode, locationLabel]);

  const { properties, loading } = useProperties(apiParams);
  const { savedPropertyIds, toggleSavedProperty, isAuthenticated } = useAuth();

  const intentLabel = intentKey === 'rent' ? 'Rental' : intentKey === 'sell' ? 'Sell' : 'Buy';
  const typeLabel = typePreset.label ? `${typePreset.label} ` : '';
  const headingLabel = mode === 'landmark' ? `Properties near ${locationLabel}` : `Properties in ${locationLabel}`;
  const seoTitle = `${intentLabel} ${typeLabel}Properties ${mode === 'landmark' ? 'near' : 'in'} ${locationLabel} | Purandar Properties`;
  const seoDescription = `Browse ${intentLabel.toLowerCase()} ${typeLabel.toLowerCase()}properties ${mode === 'landmark' ? 'near' : 'in'} ${locationLabel}. Compare prices, photos, and verified listings to find the right fit faster.`;
  const canonicalPath = mode === 'landmark' ? `/property-near-${slug}` : `/property-in-${slug}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const schema = React.useMemo(() => buildSchema({ properties, label: locationLabel, kind: mode, origin }), [properties, locationLabel, mode, origin]);

  React.useEffect(() => {
    let active = true;
    const loadNearby = async () => {
      try {
        const response = await seoService.getNearby({ location: locationLabel, kind: mode === 'landmark' ? 'landmark' : 'location' });
        if (!active) return;
        setNearby(response.data?.data || []);
      } catch (_error) {
        if (active) setNearby([]);
      }
    };
    if (locationLabel) {
      loadNearby();
    }
    return () => {
      active = false;
    };
  }, [locationLabel, mode]);

  const updateQuery = React.useCallback((updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    navigate(`${canonicalPath}?${nextParams.toString()}`);
  }, [searchParams, navigate, canonicalPath]);

  const handleSortChange = React.useCallback((sort) => {
    updateQuery({ sort });
  }, [updateQuery]);

  const handleIntentChange = (nextKey) => {
    const target = intentFilters.find((item) => item.key === nextKey);
    updateQuery({ intentKey: nextKey, intent: target?.intent || 'sell' });
  };

  const handleTypeChange = (typeKey) => {
    const nextType = selectedType === typeKey ? '' : typeKey;
    updateQuery({ type: nextType });
  };

  return (
    <>
      <SeoManager
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        schema={schema}
        siteName="Purandar Properties"
      />

      <section className="location-hero">
        <div className="location-hero-content">
          <p className="location-eyebrow">Location insights</p>
          <h1>{headingLabel}</h1>
          <h2>{intentLabel} {typeLabel}options {mode === 'landmark' ? `near ${locationLabel}` : `in ${locationLabel}`}</h2>
          <p className="location-copy">{buildLocationParagraph({ label: locationLabel, intentLabel, kind: mode })}</p>

          <div className="location-filters">
            <div className="filter-group">
              <span className="filter-label">Intent</span>
              <div className="filter-chips">
                {intentFilters.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`filter-chip-btn ${intentKey === option.key ? 'active' : ''}`}
                    onClick={() => handleIntentChange(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Property Type</span>
              <div className="filter-chips">
                {Object.entries(typeFilters).map(([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    className={`filter-chip-btn ${selectedType === key ? 'active' : ''}`}
                    onClick={() => handleTypeChange(key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {nearby.length ? (
          <div className="nearby-links">
            <p className="nearby-title">Nearby locations</p>
            <div className="nearby-chip-row">
              {nearby.map((item) => (
                <Link
                  key={item.slug}
                  to={item.kind === 'landmark' ? `/property-near-${item.slug}` : `/property-in-${item.slug}`}
                  className="nearby-chip"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="buy-page-content location-listings">
        <div className="listings-container">
          <ListingsPanel
            title={headingLabel}
            subtitle="properties found"
            properties={properties}
            loading={loading}
            savedPropertyIds={savedPropertyIds}
            onToggleSave={isAuthenticated ? toggleSavedProperty : undefined}
            onPropertyHover={setHoveredPropertyId}
            activePropertyId={hoveredPropertyId}
            sortValue={routeFilters.sort || 'newest'}
            onSortChange={handleSortChange}
          />
        </div>
        <div className="map-wrapper">
          <MapPanel properties={properties} activePropertyId={hoveredPropertyId} intent={activeIntent} />
        </div>
      </div>
    </>
  );
}
