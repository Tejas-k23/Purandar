import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Heart, Phone, Share2, UserRound } from 'lucide-react';
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
import { getPropertyVideoUrl } from '../../utils/propertyVideos';
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
  const { isAuthenticated, savedPropertyIds, toggleSavedProperty, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [hasTouchedMessage, setHasTouchedMessage] = useState(false);
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

  useEffect(() => {
    if (!property || hasTouchedMessage) return;
    const locationLabel = [property.locality, property.city].filter(Boolean).join(', ');
    const areaValue = property.totalArea || property.plotArea || property.carpetArea;
    const areaText = areaValue ? `${areaValue} ${property.areaUnit || 'sq.ft'}` : '';
    const priceText = property.price ? formatCurrency(property.price) : '';
    const titleBase = property.title || `${property.propertyType || 'Property'} in ${locationLabel || 'Purandar'}`;
    const detailBits = [locationLabel ? `Location: ${locationLabel}` : '', areaText ? `Area: ${areaText}` : '', priceText ? `Price: ${priceText}` : '']
      .filter(Boolean)
      .join(' • ');
    const prefilled = `Hi, I'm interested in ${titleBase}.${detailBits ? ` (${detailBits})` : ''} Please share availability and a good time for a site visit.`;
    setEnquiry((current) => ({ ...current, message: prefilled }));
  }, [property, hasTouchedMessage]);

  const submitEnquiry = async (event) => {
    event.preventDefault();
    try {
      if (!enquiry.name.trim() || !enquiry.email.trim()) {
        setMessage('Please enter your name and email to submit the enquiry.');
        return;
      }
      if (!isAuthenticated && !enquiry.phone.trim()) {
        setMessage('Please enter your phone number to submit the enquiry.');
        return;
      }
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

    const mode = property.contactDisplayMode || (property.useOriginalSellerContact === false ? 'custom' : 'original');
    
    // If it's custom or company, we already have the details via resolveContact
    if (mode === 'custom' || mode === 'company') {
      setSellerDetails(visibleContact);
      setShowSellerDetails(true);
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
  const resolvedVideoUrl = getPropertyVideoUrl(property.videoUrl || '');
  const videoEmbedUrl = getYoutubeEmbedUrl(resolvedVideoUrl);
  const uploadedDate = formatDate(property.createdAt);
  const pageUrl = `${window.location.origin}/property/${property._id}`;
  const whatsappMessage = `WhatsApp chat started for ${titleBase}`;
  const handleWhatsappClick = async () => {
    if (isAuthenticated && user?.email) {
      try {
        await propertyService.createEnquiry(id, {
          name: user?.name || 'User',
          email: user?.email,
          phone: user?.phone || '',
          message: whatsappMessage,
          leadType: 'whatsapp',
        });
      } catch (_error) {
        // ignore logging errors
      }
    }
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const shareProperty = async () => {
    if (!property?._id) return;
    const url = `${window.location.origin}/property/${property._id}`;
    const title = property.title || 'Property';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareMessage('Share link copied to clipboard.');
        window.setTimeout(() => setShareMessage(''), 2500);
        return;
      }
    } catch (_error) {
      // fall back to prompt
    }
    window.prompt('Copy link to share this property:', url);
  };
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
        title={`${titleBase} | Purandar Prime Propertys`}
        description={seoDescription}
        canonicalPath={`/property/${property._id}`}
        schema={schema}
        image={primaryImage}
        type="product"
        siteName="Purandar Prime Propertys"
      />
      <div className="pd-layout">
        <div className="pd-main">
          <button onClick={() => navigate(-1)} className="pd-back-btn">Back to listings</button>
          <PropertyGallery photos={property.photos} images={property.images} intent={property.intent} />
          {resolvedVideoUrl ? (
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
                  <video controls src={resolvedVideoUrl} />
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
              <div className="pd-title-actions">
                <button className="pd-icon-btn" onClick={shareProperty} aria-label="Share property">
                  <Share2 size={18} />
                </button>
                {isAuthenticated ? (
                  <button className="pd-icon-btn pd-icon-btn--heart" onClick={() => toggleSavedProperty(property._id)} aria-label="Save property">
                    <Heart size={18} fill={savedPropertyIds.has(property._id) ? 'currentColor' : 'none'} />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="pd-cta-group">
              <button className="pd-cta-primary" onClick={revealSellerDetails} disabled={sellerLoading}>
                {sellerLoading ? 'Loading...' : isAuthenticated ? (showSellerDetails ? 'Hide Seller Details' : 'Get Seller Details') : 'Login to Get Seller Details'}
              </button>
            </div>

            {sellerMessage ? <p style={{ marginTop: 12 }}>{sellerMessage}</p> : null}
            {shareMessage ? <p style={{ marginTop: 8 }}>{shareMessage}</p> : null}

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
            <div className="pd-contact-card">
              <h3>WhatsApp</h3>
              <p>{property.responseTime || 'Chat directly for quick updates.'}</p>
              <button
                type="button"
                className="pd-contact-btn pd-contact-btn--whatsapp"
                onClick={handleWhatsappClick}
              >
                <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                Chat on WhatsApp
              </button>
            </div>
          ) : null}

          <div className="pd-contact-card" id="property-enquiry-form">
            <h3>Send an enquiry</h3>
            <form onSubmit={submitEnquiry} style={{ display: 'grid', gap: 10 }}>
              <input value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} placeholder="Your name" className="styled-input" />
              <input value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} placeholder="Email" className="styled-input" />
              <input value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} placeholder="Phone" className="styled-input" />
              <textarea
                value={enquiry.message}
                onChange={(e) => {
                  setHasTouchedMessage(true);
                  setEnquiry({ ...enquiry, message: e.target.value });
                }}
                placeholder="Message"
                className="styled-textarea"
                rows={4}
              />
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

