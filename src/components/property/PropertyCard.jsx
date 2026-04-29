import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Heart, ShieldCheck, BedDouble, Bath, Ruler, ChevronLeft, ChevronRight, Share2, Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompactPrice } from '../../utils/formatPrice';
import { getPropertyImageUrls } from '../../utils/propertyImages';
import { resolveContact } from '../common/ContactCard';
import Modal from '../common/Modal';
import PropertyGallery from './PropertyGallery';
import './PropertyCard.css';

const getLocation = (property) => [property.subLocality, property.locality, property.city].filter(Boolean).join(', ');
const getFallbackImage = () => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

export default function PropertyCard({ property, isSaved = false, onToggleSave, onHover, isActive = false, variant = 'default' }) {
  const navigate = useNavigate();
  const images = useMemo(() => {
    const urls = getPropertyImageUrls(property);
    return urls.length ? urls : [getFallbackImage()];
  }, [property]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const contact = useMemo(() => resolveContact(property), [property]);
  const showBachelorsBadge = property.propertyType === 'PG / Hostel' || property.tenantPreference === 'bachelors';
  const [imageErrors, setImageErrors] = useState(new Set());

  const handleImageError = (imageUrl) => {
    setImageErrors(prev => new Set([...prev, imageUrl]));
  };

  const getCurrentImage = () => {
    const currentImage = images[activeImageIndex];
    if (imageErrors.has(currentImage)) {
      // Find next valid image
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!imageErrors.has(img)) {
          return img;
        }
      }
      return getFallbackImage();
    }
    return currentImage;
  };

  useEffect(() => {
    setActiveImageIndex(0);
    setImageErrors(new Set());
  }, [property._id]);

  useEffect(() => {
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [images.length, activeImageIndex]);

  const showCarouselControls = images.length > 1;

  const goPrevImage = (event) => {
    event.stopPropagation();
    setActiveImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const goNextImage = (event) => {
    event.stopPropagation();
    setActiveImageIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const shareProperty = async (event) => {
    event.stopPropagation();
    const url = `${window.location.origin}/property/${property._id}`;
    const title = property.title || 'Property';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return;
      }
    } catch (_error) {
      // fall back to prompt
    }
    window.prompt('Copy link to share this property:', url);
  };

  return (
    <div
      className={`property-card ${isActive ? 'property-card-active' : ''} ${variant === 'compact' ? 'property-card-compact' : ''}`}
      onClick={() => navigate(`/property/${property._id}`)}
      onMouseEnter={() => onHover?.(property._id)}
    >
      <div className="property-image-container">
        <img
          src={getCurrentImage()}
          alt={property.title}
          className="property-image"
          loading="lazy"
          decoding="async"
          onError={() => handleImageError(images[activeImageIndex])}
        />
        {showCarouselControls ? (
          <>
            <button type="button" className="property-carousel-btn property-carousel-btn-left" onClick={goPrevImage} aria-label="Previous image">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" className="property-carousel-btn property-carousel-btn-right" onClick={goNextImage} aria-label="Next image">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="property-carousel-dots">
              {images.map((image, index) => (
                <button
                  key={`${property._id}-${image}-${index}`}
                  type="button"
                  className={`property-carousel-dot ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
        <div className="card-top-overlay">
          <div className="card-badges-stack">
            {property.status === 'approved' ? <div className="verified-badge"><ShieldCheck className="w-3.5 h-3.5" /><span>Verified</span></div> : null}
            <div className="listing-mode-badge">{property.intent === 'rent' ? 'For Rent' : 'For Sale'}</div>
            {showBachelorsBadge ? <div className="listing-mode-badge listing-mode-badge--bachelors">Bachelors Allowed</div> : null}
          </div>
          <div className="card-action-buttons">
            <button className="save-btn share-btn" onClick={shareProperty} aria-label="Share property">
              <Share2 className="w-4 h-4" />
            </button>
            {images.length > 1 ? (
              <button className="save-btn gallery-btn" onClick={(event) => { event.stopPropagation(); setShowGalleryModal(true); }} aria-label="View all images">
                <Images className="w-4 h-4" />
              </button>
            ) : null}
            {onToggleSave ? (
              <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={(event) => { event.stopPropagation(); onToggleSave(property._id); }}>
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="property-details">
        <div className="price-tag">
          <span className="price-value">{formatCompactPrice(property.price)}</span>
          <span className="property-type-badge">{property.propertyType}</span>
        </div>

        <h3 className="property-title">{property.title || `${property.propertyType} in ${property.locality}`}</h3>
        <div className="property-location">
          <MapPin className="w-3.5 h-3.5" />
          <span>{getLocation(property)}</span>
        </div>
        <p className="property-owner-line">Seller: {contact.name || 'Owner'}</p>

        <div className="property-features property-features-rich">
          {property.bedrooms ? <span className="feature-item"><BedDouble size={15} /> <span className="feature-val">{property.bedrooms} BHK</span></span> : null}
          {property.bathrooms ? <span className="feature-item"><Bath size={15} /> <span className="feature-val">{property.bathrooms} Bath</span></span> : null}
          <span className="feature-item"><Ruler size={15} /> <span className="feature-val">{property.totalArea || property.plotArea || property.carpetArea || '-'} {property.areaUnit || 'sq.ft'}</span></span>
        </div>
      </div>
      <Modal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} className="property-gallery-modal">
        <PropertyGallery photos={property.photos} images={property.images} intent={property.intent} />
      </Modal>
    </div>
  );
}
