import React, { useState } from 'react';
import { Play, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
];

export default function PropertyGallery() {
    const [activeIdx, setActiveIdx] = useState(0);

    const prev = () => setActiveIdx(i => (i - 1 + images.length) % images.length);
    const next = () => setActiveIdx(i => (i + 1) % images.length);

    return (
        <div className="pd-gallery">
            {/* Hero Image */}
            <div className="pd-gallery-hero">
                <img
                    src={images[activeIdx]}
                    alt="Property hero"
                    key={activeIdx}
                />
                <div className="pd-gallery-overlay" />

                {/* Navigation Arrows */}
                <button onClick={prev} className="pd-gallery-nav pd-gallery-nav--prev">
                    <ChevronLeft size={18} />
                </button>
                <button onClick={next} className="pd-gallery-nav pd-gallery-nav--next">
                    <ChevronRight size={18} />
                </button>

                {/* Top-left: Virtual Tour */}
                <div className="pd-gallery-top-left">
                    <button className="pd-badge pd-badge--tour">
                        <span className="pd-tour-icon">
                            <Play size={10} fill="#fff" />
                        </span>
                        Virtual Tour
                    </button>
                </div>

                {/* Top-right: Badges */}
                <div className="pd-gallery-top-right">
                    <span className="pd-badge pd-badge--sale">For Sale</span>
                    <span className="pd-badge pd-badge--verified">
                        <CheckCircle size={12} />
                        Verified
                    </span>
                </div>

                {/* Image count */}
                <div className="pd-gallery-counter">
                    {activeIdx + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            <div className="pd-gallery-thumbs">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`pd-gallery-thumb ${i === activeIdx ? 'pd-gallery-thumb--active' : ''}`}
                    >
                        <img src={img} alt={`View ${i + 1}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
