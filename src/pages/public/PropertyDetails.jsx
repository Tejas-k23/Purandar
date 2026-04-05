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
import { resolveContact, resolveWhatsappContact } from '../../components/common/ContactCard';
import SeoManager from '../../components/common/SeoManager';
import './PropertyDetails.css';

const getYoutubeEmbedUrl = (rawUrl = '') => {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace('www.', '');
    if (host === 'youtu.be') {
      return url.pathname.length > 1 ? `https://www.youtube.com/embed/${url.pathname.slice(1)}` : '';
    }
    if (host.endsWith('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) return rawUrl;
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch (_error) {
    return '';
  }
  return '';
};

const normalizeWhatsapp = (value = '') => String(value).replace(/\D/g, '');
const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

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
  const whatsappContact = resolveWhatsappContact(property);
  const whatsappNumber = normalizeWhatsapp(whatsappContact.number);
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
  const videoEmbedUrl = getYoutubeEmbedUrl(property.videoUrl || '');
  const uploadedDate = formatDate(property.createdAt);
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
          {property.videoUrl ? (
            <div className="pd-card">
              <h2 className="pd-section-title">Property Video</h2>
              <div className="pd-video">
                {videoEmbedUrl ? (
                  <iframe
                    title="Property video"
                    src={videoEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls src={property.videoUrl} />
                )}
              </div>
            </div>
          ) : null}
          <div className="pd-card"><PropertyTitleSection property={property} /></div>
          {uploadedDate ? (
            <div className="pd-card">
              <h2 className="pd-section-title">Listing Info</h2>
              <p className="pd-description-text">Uploaded on {uploadedDate}</p>
            </div>
          ) : null}
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

          {property.showWhatsappButton && whatsappNumber ? (
            <button
              type="button"
              className="pd-whatsapp-fab"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
              aria-label="Chat on WhatsApp"
            >
              <span className="pd-whatsapp-icon">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path fill="currentColor" d="M19.11 17.2c-.27-.14-1.6-.79-1.85-.88-.25-.1-.44-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.34-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.41.12-.55.13-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.35.98 2.65 1.12 2.83.14.18 1.94 2.96 4.69 4.15.65.28 1.16.45 1.56.58.65.21 1.23.18 1.69.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32M16.02 6.6c-5.25 0-9.53 4.27-9.53 9.52 0 1.68.44 3.25 1.2 4.62l-1.28 4.67 4.78-1.25c1.31.71 2.82 1.12 4.83 1.12 5.25 0 9.52-4.27 9.52-9.53 0-5.25-4.27-9.52-9.52-9.52m0 20.63c-1.86 0-3.58-.5-5.07-1.36l-.36-.21-2.84.74.76-2.76-.24-.39c-.82-1.42-1.25-3.04-1.25-4.67 0-5.12 4.17-9.29 9.3-9.29 2.48 0 4.81.97 6.56 2.72a9.25 9.25 0 0 1 2.73 6.57c0 5.12-4.17 9.29-9.29 9.29"/>
                </svg>
              </span>
              <span className="pd-whatsapp-tooltip">
                {property.responseTime || 'Chat on WhatsApp'}
              </span>
            </button>
          ) : null}

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

