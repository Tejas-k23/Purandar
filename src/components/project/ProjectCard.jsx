import React, { useMemo } from 'react';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompactPrice } from '../../utils/formatPrice';
import '../property/PropertyCard.css';

const fallbackImage = 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80';

export default function ProjectCard({ project, variant = 'default' }) {
  const navigate = useNavigate();
  const cover = useMemo(() => project.projectImages?.[0] || fallbackImage, [project]);
  const priceLabel = `${formatCompactPrice((project.startingPrice || 0) * (project.priceUnit === 'Crore' ? 10000000 : 100000))} - ${formatCompactPrice((project.endingPrice || 0) * (project.priceUnit === 'Crore' ? 10000000 : 100000))}`;
  const tags = project.tags || [];
  const visibleTags = tags.slice(0, 2);
  const remainingCount = tags.length - visibleTags.length;

  return (
    <div className={`property-card ${variant === 'compact' ? 'property-card-compact' : ''}`} onClick={() => navigate(`/projects/${project.slug || project._id}`)}>
      <div className="property-image-container">
        <img src={cover} alt={project.projectName} className="property-image" />
        <div className="card-top-overlay">
          <div className="card-badges-stack">
            <div className="verified-badge"><ShieldCheck className="w-3.5 h-3.5" /><span>{project.projectStatus}</span></div>
            <div className="listing-mode-badge">{project.projectType}</div>
          </div>
        </div>
      </div>

      <div className="property-details">
        <div className="price-tag">
          <span className="price-value">{priceLabel}</span>
          <span className="property-type-badge">{project.priceUnit}</span>
        </div>
        <h3 className="property-title">{project.projectName}</h3>
        {visibleTags.length ? (
          <div className="project-tag-row">
            {visibleTags.map((tag) => (
              <span key={tag} className="project-tag">{tag}</span>
            ))}
            {remainingCount > 0 ? (
              <span className="project-tag project-tag-muted">+{remainingCount} more</span>
            ) : null}
          </div>
        ) : null}
        <div className="property-location">
          <MapPin className="w-3.5 h-3.5" />
          <span>{[project.area, project.city].filter(Boolean).join(', ')}</span>
        </div>
        <p className="property-owner-line">Developer: {project.developerName}</p>
        <div className="property-features property-features-rich">
          <span className="feature-item"><Building2 size={15} /> <span className="feature-val">{project.configurationTypes?.join(', ') || 'Project'}</span></span>
          <span className="feature-item"><span className="feature-val">{project.areaRange || '-'}</span></span>
        </div>
      </div>
    </div>
  );
}
