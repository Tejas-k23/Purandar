import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Heart, Phone, UserRound } from 'lucide-react';
import propertyService from '../../services/propertyService';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import PropertyGallery from '../../components/property/PropertyGallery';
import PropertyTitleSection from '../../components/property/PropertyTitleSection';
import PropertyStatsBar from '../../components/property/PropertyStatsBar';
import PropertyDescription from '../../components/property/PropertyDescription';
import PropertyInfoPanel from '../../components/property/PropertyInfoPanel';
import PropertyMap from '../../components/property/PropertyMap';
import SimilarProperties from '../../components/property/SimilarProperties';
import { formatCurrency } from '../../utils/formatPrice';
import { getPropertyImageUrls } from '../../utils/propertyImages';
import ContactCard, { resolveContact } from '../../components/common/ContactCard';
import SeoManager from '../../components/common/SeoManager';
import './PropertyDetails.css';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, savedPropertyIds, toggleSavedProperty } = useAuth();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sellerMessage, setSellerMessage] = useState('');
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await propertyService.getById(id);
        if (!active) return;
        const item = response.data.data;
        setProperty(item);

        const similarResponse = await propertyService.getAll({ intent: item.intent, city: item.city, limit: 4 });
        if (!active) return;
        setSimilar((similarResponse.data.data.items || []).filter((candidate) => candidate._id !== item._id).slice(0, 3));
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  const submitEnquiry = async (event) => {
    event.preventDefault();
    try {
      await propertyService.createEnquiry(id, enquiry);
      setMessage('Enquiry submitted successfully.');
      setEnquiry({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const revealSellerDetails = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { backgroundLocation: location } });
      return;
    }

    if (showSellerDetails) {
      setShowSellerDetails(false);
      return;
    }

    setSellerLoading(true);
    setSellerMessage('');
    try {
      const response = await propertyService.requestSellerDetails(id);
      setSellerDetails(response.data.data);
      setShowSellerDetails(true);
    } catch (error) {
      setSellerMessage(error.message);
    } finally {
      setSellerLoading(false);
    }
  };

  if (loading) return <Loader label="Loading property details..." />;
  if (!property) return <div style={{ padding: '2rem' }}>{message || 'Property not found'}</div>;

  const visibleContact = resolveContact(property);
  const titleBase = property.title || `${property.propertyType || 'Property'} in ${property.locality || property.city || 'Purandar'}`;
  const locationLabel = [property.locality, property.city].filter(Boolean).join(', ');
  const areaValue = property.totalArea || property.plotArea || property.carpetArea;
  const areaText = areaValue ? `${areaValue} ${property.areaUnit || 'sq.ft'}` : '';
  const intentLabel = property.intent === 'rent' ? 'Rental' : 'For sale';
  const summaryBits = [
    `${intentLabel} ${property.propertyType || 'property'}`,
    locationLabel ? `in ${locationLabel}` : '',
    property.bedrooms ? `${property.bedrooms} BHK` : '',
    areaText ? `• ${areaText}` : '',
    property.price ? `• Price ${formatCurrency(property.price)}` : '',
  ].filter(Boolean);
  const seoDescription = property.description || summaryBits.join(' ');
  const primaryImage = getPropertyImageUrls(property)[0] || '';
  const pageUrl = `${window.location.origin}/property/${property._id}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: titleBase,
    description: seoDescription,
    image: primaryImage ? [primaryImage] : [],
    url: pageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.locality || '',
      addressRegion: property.city || '',
      addressCountry: 'IN',
    },
    numberOfRooms: property.bedrooms || undefined,
    floorSize: areaValue ? {
      '@type': 'QuantitativeValue',
      value: areaValue,
      unitText: property.areaUnit || 'sq.ft',
    } : undefined,
    offers: property.price ? {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    } : undefined,
  };

  return (
    <div className="pd-page" style={{ paddingBottom: '3rem' }}>
      <SeoManager
        title={`${titleBase} | Purandar Properties`}
        description={seoDescription}
        canonicalPath={`/property/${property._id}`}
        schema={schema}
        image={primaryImage}
        type="product"
        siteName="Purandar Properties"
      />
      <div className="pd-layout">
        <div className="pd-main">
          <button onClick={() => navigate(-1)} className="pd-back-btn">Back to listings</button>
          <PropertyGallery photos={property.photos} images={property.images} intent={property.intent} />
          <div className="pd-card"><PropertyTitleSection property={property} /></div>
          <div className="pd-card"><PropertyStatsBar property={property} /></div>
          <div className="pd-card"><PropertyDescription property={property} /></div>
          <div className="pd-card"><PropertyInfoPanel property={property} /></div>
          <div className="pd-card"><PropertyMap property={property} /></div>
        </div>

        <div className="pd-sidebar">
          <div className="pd-price-card">
            <div className="pd-price-header">
              <div>
                <div className="pd-price-label">Listing Price</div>
                <div className="pd-price-amount">{formatCurrency(property.price)}</div>
                <div className="pd-price-per-sqft">{property.propertyType} • {[property.locality, property.city].filter(Boolean).join(', ')}</div>
              </div>
              {isAuthenticated ? <button className="pd-icon-btn pd-icon-btn--heart" onClick={() => toggleSavedProperty(property._id)}><Heart size={18} fill={savedPropertyIds.has(property._id) ? 'currentColor' : 'none'} /></button> : null}
            </div>

            <div className="pd-cta-group">
              <button className="pd-cta-primary" onClick={revealSellerDetails} disabled={sellerLoading}>
                {sellerLoading ? 'Loading...' : isAuthenticated ? (showSellerDetails ? 'Hide Seller Details' : 'Get Seller Details') : 'Login to Get Seller Details'}
              </button>
            </div>

            {sellerMessage ? <p style={{ marginTop: 12 }}>{sellerMessage}</p> : null}

            {showSellerDetails && sellerDetails ? (
              <div className="pd-trust" style={{ marginTop: 16 }}>
                <div className="pd-trust-badge">
                  <div className="pd-trust-icon"><UserRound size={16} /></div>
                  <span className="pd-trust-label">Seller Information</span>
                </div>
                <p className="pd-trust-text">Name: {sellerDetails.name || 'Owner'}</p>
                <p className="pd-trust-text">Phone: {sellerDetails.phone || 'Not available'}</p>
                <p className="pd-trust-text">Email: {sellerDetails.email || 'Not available'}</p>
              </div>
            ) : null}
          </div>

          <ContactCard
            item={{
              ...property,
              contactPersonName: visibleContact.name,
              phoneNumber: visibleContact.phone,
              email: visibleContact.email,
            }}
            buttonLabel="Enquire Now"
            onAction={() => document.getElementById('property-enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            helperText="Visible contact reflects your original, company, or custom seller settings."
          />

          <div className="pd-contact-card" id="property-enquiry-form">
            <h3>Send an enquiry</h3>
            <form onSubmit={submitEnquiry} style={{ display: 'grid', gap: 10 }}>
              <input value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} placeholder="Your name" className="styled-input" />
              <input value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} placeholder="Email" className="styled-input" />
              <input value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} placeholder="Phone" className="styled-input" />
              <textarea value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} placeholder="Message" className="styled-textarea" rows={4} />
              <button type="submit" className="pd-contact-btn"><Phone size={16} /> Contact Seller</button>
            </form>
            {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
          </div>
        </div>
      </div>
      <SimilarProperties properties={similar} />
    </div>
  );
}

