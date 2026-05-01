import React, { useState } from 'react';
import { ArrowRight, Building2, FolderKanban, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './PostProperty.css';

const options = [
  {
    title: 'Post Property',
    description: 'List an individual property for sale or rent with photos, details, and seller contact information.',
    points: ['Real property record', 'Visible in search and map views', 'Managed from your profile'],
    to: '/post-property/form',
    icon: Building2,
  },
  {
    title: 'Post Project',
    description: 'Add a full residential or commercial project with configurations, amenities, media, and project contact details.',
    points: ['Ideal for builders and developers', 'Project detail page with gallery', 'Admin and public project listing'],
    to: '/post-project/form',
    icon: FolderKanban,
  },
];

export default function PostProperty() {
  const { isAuthenticated } = useAuth();
  const loginTarget = '/login';
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="post-property-page" id="post-property-page">
      <div className="pp-container pp-choice-layout">
        <div className="pp-left pp-choice-left">
          <div className="pp-eyebrow"><Sparkles size={16} /> Add Listing</div>
          <h1 className="pp-heading">Choose what you want to <span className="heading-accent">publish</span> on Purandar Prime Properties.</h1>
          <p className="pp-intro">Start with the listing type that matches your inventory. You can continue to the correct form in one step.</p>
          <ul className="pp-benefits">
            <li><span className="check-icon"><ShieldCheck size={14} /></span> Keep property and project workflows separate and cleaner</li>
            <li><span className="check-icon"><ShieldCheck size={14} /></span> Use the right fields, media, amenities, and contact details</li>
            <li><span className="check-icon"><ShieldCheck size={14} /></span> Publish listings in the right section from the start</li>
          </ul>
        </div>

        <div className="pp-right pp-choice-grid">
          <div className="pp-mobile-toggle" role="tablist" aria-label="Choose listing type">
            {options.map(({ title }, index) => (
              <button
                key={title}
                type="button"
                className={`pp-mobile-toggle-btn ${activeIndex === index ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                role="tab"
                aria-selected={activeIndex === index}
              >
                {title}
              </button>
            ))}
          </div>
          {options.map(({ title, description, points, to, icon: Icon }, index) => (
            <article
              key={title}
              className={`pp-choice-card ${activeIndex === index ? 'pp-choice-card-active' : 'pp-choice-card-inactive'}`}
              data-active={activeIndex === index ? 'true' : 'false'}
            >
              <div className="pp-choice-icon"><Icon size={22} /></div>
              <h2 className="pp-form-title"><span className="heading-accent">{title.split(' ')[0]}</span> {title.split(' ').slice(1).join(' ')}</h2>
              <p className="pp-form-subtitle">{description}</p>
              <div className="pp-choice-points">
                {points.map((point) => (
                  <div key={point} className="pp-choice-point">
                    <span className="pp-choice-dot" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link
                to={isAuthenticated ? to : loginTarget}
                className="pp-cta-btn"
                style={{ display: 'inline-flex', justifyContent: 'center', textDecoration: 'none' }}
              >
                <span>{isAuthenticated ? `Continue to ${title}` : 'Login to continue'}</span>
                <ArrowRight size={18} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
