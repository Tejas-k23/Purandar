import React, { useMemo, useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPropertyImageUrls } from '../../utils/propertyImages';

export default function PropertyGallery({ photos = [], images = [], intent = 'sell' }) {
  const items = useMemo(() => {
    const urls = getPropertyImageUrls({ photos, images });
    return urls.length ? urls : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'];
  }, [photos, images]);
  const [activeIdx, setActiveIdx] = useState(0);
  const showGalleryControls = items.length > 1;

  return (
    <div className="pd-gallery">
      <div className="pd-gallery-hero">
        <img src={items[activeIdx]} alt="Property" key={activeIdx} />
        <div className="pd-gallery-overlay" />
        {showGalleryControls ? (
          <>
            <button
              type="button"
              onClick={() => setActiveIdx((current) => (current - 1 + items.length) % items.length)}
              className="pd-gallery-nav pd-gallery-nav--prev"
              aria-label="View previous property image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActiveIdx((current) => (current + 1) % items.length)}
              className="pd-gallery-nav pd-gallery-nav--next"
              aria-label="View next property image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        ) : null}
        <div className="pd-gallery-top-right">
          <span className="pd-badge pd-badge--sale">{intent === 'rent' ? 'For Rent' : 'For Sale'}</span>
          <span className="pd-badge pd-badge--verified"><CheckCircle size={12} />Verified</span>
        </div>
        <div className="pd-gallery-counter">{activeIdx + 1} / {items.length}</div>
      </div>
      <div className="pd-gallery-thumbs">
        {items.map((img, index) => (
          <button
            key={`${img}-${index}`}
            type="button"
            onClick={() => setActiveIdx(index)}
            className={`pd-gallery-thumb ${index === activeIdx ? 'pd-gallery-thumb--active' : ''}`}
            aria-label={`View property image ${index + 1}`}
          >
            <img src={img} alt={`View ${index + 1}`} />
          </button>
        ))}
      </div>
      {showGalleryControls ? (
        <div className="pd-gallery-dots" aria-label="Property image navigation">
          {items.map((img, index) => (
            <button
              key={`dot-${img}-${index}`}
              type="button"
              onClick={() => setActiveIdx(index)}
              className={`pd-gallery-dot ${index === activeIdx ? 'pd-gallery-dot--active' : ''}`}
              aria-label={`Go to property image ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
