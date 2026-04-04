import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/search/SearchBar';
import ListingsPanel from '../../components/property/ListingsPanel';
import MapPanel from '../../components/search/MapPanel';
import useProperties from '../../hooks/useProperties';
import useAuth from '../../hooks/useAuth';
import SeoManager from '../../components/common/SeoManager';
import { buildPropertyApiParams, buildSearchQueryString, parseSearchParams } from '../../utils/queryParams';
import './BuyPage.css';

export default function RentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hoveredPropertyId, setHoveredPropertyId] = React.useState('');
  const routeFilters = React.useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const apiParams = React.useMemo(() => buildPropertyApiParams({ ...routeFilters, intent: 'rent', limit: 24 }), [routeFilters]);
  const { properties, loading } = useProperties(apiParams);
  const { savedPropertyIds, toggleSavedProperty, isAuthenticated } = useAuth();
  const locationLabel = routeFilters.locality || routeFilters.city || 'Purandar';
  const propertyTypeLabel = routeFilters.propertyType ? `${routeFilters.propertyType} ` : '';
  const seoTitle = `Rental ${propertyTypeLabel}properties in ${locationLabel} | Purandar Properties`;
  const seoDescription = `Discover ${propertyTypeLabel}rental properties in ${locationLabel} with photos, pricing, and map insights for quick comparisons.`;

  const handleSortChange = React.useCallback((sort) => {
    const queryString = buildSearchQueryString({
      ...routeFilters,
      intent: 'rent',
      sort,
    });
    navigate(`/rent?${queryString}`);
  }, [navigate, routeFilters]);

  return (
    <>
      <SeoManager
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/rent"
        siteName="Purandar Properties"
      />
      <SearchBar intent="rent" />
      <div className="buy-page-content">
        <div className="listings-container">
          <ListingsPanel
            title={`Rental properties${routeFilters.city ? ` in ${routeFilters.city}` : ''}`}
            subtitle="rental listings found"
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
          <MapPanel properties={properties} activePropertyId={hoveredPropertyId} intent="rent" />
        </div>
      </div>
    </>
  );
}
