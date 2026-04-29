import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import PropertyCard from './PropertyCard';
import ProjectCard from '../project/ProjectCard';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import './ListingsPanel.css';

export default function ListingsPanel({
  title = 'Properties',
  subtitle = '',
  properties = [],
  projects = [],
  loading = false,
  savedPropertyIds = new Set(),
  savedProjectIds = new Set(),
  onToggleSave,
  onToggleProjectSave,
  onPropertyHover,
  activePropertyId,
  sortValue = 'newest',
  onSortChange,
}) {
  const totalResults = properties.length + projects.length;
  const hoverTimeoutRef = React.useRef(null);

  const clearPendingHover = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleCardHover = React.useCallback((propertyId) => {
    clearPendingHover();
    hoverTimeoutRef.current = window.setTimeout(() => {
      onPropertyHover?.(propertyId);
      hoverTimeoutRef.current = null;
    }, 120);
  }, [clearPendingHover, onPropertyHover]);

  const handleListingsLeave = React.useCallback(() => {
    clearPendingHover();
  }, [clearPendingHover]);

  React.useEffect(() => () => clearPendingHover(), [clearPendingHover]);

  return (
    <div className="listings-panel scrollbar-hide" onMouseLeave={handleListingsLeave}>
      <div className="listings-header">
        <div className="header-text-group">
          <h1>{title}</h1>
          <p className="listing-count-subtitle">
            <span className="count-highlight">{totalResults}</span> {subtitle || 'results available'}
          </p>
        </div>

        <div className="listings-controls">
          <label className="btn-sort" htmlFor="listing-sort">
            <ArrowDownUp className="w-4 h-4" />
            <span>Sort by</span>
            <select
              id="listing-sort"
              className="listing-sort-select"
              value={sortValue}
              onChange={(event) => onSortChange?.(event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? <Loader label="Loading listings..." /> : null}
      {!loading && totalResults === 0 ? <EmptyState title="No properties or projects found" description="Try another filter combination." /> : null}

      <div className="listings-grid">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            isSaved={savedPropertyIds.has(property._id)}
            onToggleSave={onToggleSave}
            onHover={handleCardHover}
            isActive={activePropertyId === property._id}
          />
        ))}
        {projects.map((project) => (
          <div
            key={project._id}
            className="listing-project-card-wrap"
            onMouseEnter={() => handleCardHover(project._id)}
          >
            <ProjectCard
              project={project}
              isSaved={savedProjectIds.has(project._id)}
              onToggleSave={onToggleProjectSave}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
