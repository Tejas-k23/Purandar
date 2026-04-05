import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bath, Building2, CalendarDays, CarFront, Dumbbell, FileText, Mail, MapPin, MapPinned, Phone, ShieldCheck, Trees, Waves, Users, Building, Lock, Blocks, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveContact, resolveWhatsappContact } from '../../components/common/ContactCard';
import Loader from '../../components/common/Loader';
import ProjectCard from '../../components/project/ProjectCard';
import projectService from '../../services/projectService';
import { getProjectTypeProfile } from '../../utils/projectTypeConfig';
import { formatCompactPrice } from '../../utils/formatPrice';
import useAuth from '../../hooks/useAuth';
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

const AMENITY_ICONS = {
  Parking: CarFront,
  Gym: Dumbbell,
  'Swimming Pool': Waves,
  Security: Lock,
  Garden: Trees,
  Lift: Building2,
  Clubhouse: Building,
  'Children Play Area': Users,
  'Power Backup': ShieldCheck,
};

const AMENITY_COLOR_CLASS = {
  Parking: 'pd-amenity--amber',
  Gym: 'pd-amenity--rose',
  'Swimming Pool': 'pd-amenity--cyan',
  Security: 'pd-amenity--emerald',
  Garden: 'pd-amenity--green',
  Lift: 'pd-amenity--indigo',
  Clubhouse: 'pd-amenity--violet',
  'Children Play Area': 'pd-amenity--orange',
  'Power Backup': 'pd-amenity--slate',
};

const INFO_COLOR_CLASS = [
  'pd-stat--violet',
  'pd-stat--cyan',
  'pd-stat--amber',
  'pd-stat--emerald',
  'pd-stat--rose',
  'pd-stat--slate',
];

function Gallery({ images = [], status }) {
  const items = images.length ? images : ['https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80'];
  const [activeIndex, setActiveIndex] = useState(0);
  const showGalleryControls = items.length > 1;

  return (
    <div className="pd-gallery">
      <div className="pd-gallery-hero">
        <img src={items[activeIndex]} alt="Project" />
        <div className="pd-gallery-overlay" />
        <div className="pd-gallery-top-right">
          <span className="pd-badge pd-badge--sale">{status}</span>
        </div>
        <div className="pd-gallery-counter">{activeIndex + 1} / {items.length}</div>
        {showGalleryControls ? (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current - 1 + items.length) % items.length)}
              className="pd-gallery-nav pd-gallery-nav--prev"
              aria-label="View previous project image"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => (current + 1) % items.length)}
              className="pd-gallery-nav pd-gallery-nav--next"
              aria-label="View next project image"
            >
              <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </>
        ) : null}
      </div>
      <div className="pd-gallery-thumbs">
        {items.map((image, index) => (
          <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`pd-gallery-thumb ${index === activeIndex ? 'pd-gallery-thumb--active' : ''}`}>
            <img src={image} alt={`Project view ${index + 1}`} />
          </button>
        ))}
      </div>
      {showGalleryControls ? (
        <div className="pd-gallery-dots" aria-label="Project image navigation">
          {items.map((image, index) => (
            <button
              key={`dot-${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`pd-gallery-dot ${index === activeIndex ? 'pd-gallery-dot--active' : ''}`}
              aria-label={`Go to project image ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InfoGrid({ project }) {
  const profile = getProjectTypeProfile(project.projectType);
  const cards = [
    { icon: Blocks, label: 'Configurations', value: project.configurationTypes?.concat(project.extraConfigurations || []).filter(Boolean).join(', ') || 'NA' },
    { icon: Bath, label: profile.labels.areaRange, value: project.areaRange || 'NA' },
    { icon: Building2, label: profile.labels.summaryLabel, value: profile.labels.summaryValue(project) },
    { icon: CalendarDays, label: profile.labels.possessionDate, value: project.possessionDate || 'NA' },
    { icon: Building, label: profile.labels.developer, value: project.developerName || 'NA' },
    { icon: ShieldCheck, label: profile.labels.rera, value: project.reraNumber || 'NA' },
  ];

  if (project.projectType === 'Plots') {
    cards.splice(2, 0, {
      icon: Building2,
      label: 'Price Per Sq.ft',
      value: project.pricePerSqFt ? `₹${project.pricePerSqFt} / ${project.plotUnit || 'sq.ft'}` : 'NA',
    });
    cards.splice(3, 0, {
      icon: Bath,
      label: 'Plot Size Range',
      value: project.minPlotSize && project.maxPlotSize
        ? `${project.minPlotSize} - ${project.maxPlotSize} ${project.plotUnit || 'sq.ft'}`
        : 'NA',
    });
    if (project.totalPlots) {
      cards.splice(4, 0, {
        icon: Blocks,
        label: 'Total Plots',
        value: project.totalPlots,
      });
    }
  }

  return (
    <div className="pd-stats-grid">
      {cards.map(({ icon: Icon, label, value }, index) => (
        <div key={label} className={`pd-stat ${INFO_COLOR_CLASS[index % INFO_COLOR_CLASS.length]}`}>
          <div className="pd-stat-icon"><Icon size={18} strokeWidth={1.8} /></div>
          <span className="pd-stat-value">{value}</span>
          <span className="pd-stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Amenities({ amenities = [] }) {
  return (
    <div>
      <h2 className="pd-section-title"><Sparkles size={18} />Amenities</h2>
      <div className="pd-amenities-grid">
        {amenities.map((amenity) => {
          const Icon = AMENITY_ICONS[amenity] || ShieldCheck;
          return (
            <div key={amenity} className={`pd-amenity ${AMENITY_COLOR_CLASS[amenity] || 'pd-amenity--indigo'}`}>
              <Icon size={18} />
              <span className="pd-amenity-label">{amenity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Description({ project }) {
  return (
    <div>
      <h2 className="pd-section-title"><FileText size={18} />Project Description</h2>
      <p className="pd-description-text" style={{ marginBottom: 14 }}>{project.shortDescription}</p>
      <p className="pd-description-text">{project.detailedDescription}</p>
    </div>
  );
}

function ProjectMap({ project }) {
  const src = project.mapLink?.startsWith('http')
    ? project.mapLink
    : `https://maps.google.com/maps?q=${encodeURIComponent(project.mapLink || `${project.area}, ${project.city}`)}&z=14&output=embed`;

  return (
    <div>
      <h2 className="pd-section-title"><MapPinned size={18} />Map & Location</h2>
      <div className="pd-map-container">
        <iframe title="Project map" src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ width: '100%', height: '100%', border: 0 }} />
      </div>
      <div className="pd-neighborhood-tags">
        {[project.area, project.city, project.address].filter(Boolean).map((item) => <span key={item} className="pd-hood-tag">{item}</span>)}
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', message: '' });
  const [message, setMessage] = useState('');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', rating: 0, feedback: '' });
  const [feedbackStatus, setFeedbackStatus] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [projectResponse, listResponse, feedbackResponse] = await Promise.all([
          projectService.getById(id),
          projectService.getAll(),
          projectService.getFeedback(id),
        ]);
        if (!active) return;
        setProject(projectResponse.data.data);
        setProjects(listResponse.data.data.items || []);
        setFeedbackItems(feedbackResponse.data.data || []);
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
      await projectService.createEnquiry(id, enquiry);
      setMessage('Enquiry submitted successfully.');
      setEnquiry({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setMessage(error.message || 'Unable to submit enquiry.');
    }
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    setFeedbackStatus('');

    if (!feedbackForm.name.trim()) {
      setFeedbackStatus('Please enter your name.');
      return;
    }
    if (!feedbackForm.rating) {
      setFeedbackStatus('Please select a rating.');
      return;
    }
    if (!feedbackForm.feedback.trim()) {
      setFeedbackStatus('Please add a short feedback.');
      return;
    }

    try {
      const response = await projectService.addFeedback(id, {
        name: feedbackForm.name.trim(),
        rating: feedbackForm.rating,
        feedback: feedbackForm.feedback.trim(),
      });
      setFeedbackItems((current) => [response.data.data, ...current]);
      setFeedbackForm({ name: '', rating: 0, feedback: '' });
      setFeedbackStatus('Thanks! Your feedback is submitted.');
    } catch (error) {
      setFeedbackStatus(error.message || 'Unable to submit feedback.');
    }
  };

  const similar = useMemo(() => projects.filter((item) => item._id !== project?._id).slice(0, 3), [projects, project]);

  if (loading) return <Loader label="Loading project details..." />;
  if (!project) return <div style={{ padding: '2rem' }}>Project not found.</div>;

  const starting = (project.startingPrice || 0) * (project.priceUnit === 'Crore' ? 10000000 : 100000);
  const ending = (project.endingPrice || 0) * (project.priceUnit === 'Crore' ? 10000000 : 100000);
  const profile = getProjectTypeProfile(project.projectType);
  const visibleContact = resolveContact(project);
  const whatsappContact = resolveWhatsappContact(project);
  const whatsappNumber = normalizeWhatsapp(whatsappContact.number);
  const videoEmbedUrl = getYoutubeEmbedUrl(project.videoUrl || '');
  const uploadedDate = formatDate(project.createdAt);
  const whatsappMessage = `WhatsApp chat started for ${project.projectName || 'Project'}`;
  const handleWhatsappClick = async () => {
    if (isAuthenticated && user?.email) {
      try {
        await projectService.createEnquiry(id, {
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

  return (
    <div className="pd-page" style={{ paddingBottom: '3rem' }}>
      <div className="pd-layout">
        <div className="pd-main">
          <button onClick={() => navigate(-1)} className="pd-back-btn"><ArrowLeft size={16} /> Back to projects</button>
          <Gallery images={project.projectImages} status={project.projectStatus} />
          {project.videoUrl ? (
            <div className="pd-card">
              <h2 className="pd-section-title">Project Video</h2>
              <div className="pd-video">
                {videoEmbedUrl ? (
                  <iframe
                    title="Project video"
                    src={videoEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls src={project.videoUrl} />
                )}
              </div>
            </div>
          ) : null}
          <div className="pd-card">
            <div className="pd-title-row">
              <div className="pd-title">
                <h1>{project.projectName}</h1>
                <div className="pd-title-meta">
                  <div className="pd-location"><MapPin size={15} /><span>{[project.area, project.city].filter(Boolean).join(', ')}</span></div>
                  <span className="pd-tag">{project.projectStatus}</span>
                </div>
              </div>
            </div>
            <div className="pd-tags">
              {(project.tags || []).map((tag) => <span key={tag} className="pd-tag">{tag}</span>)}
            </div>
          </div>
          {uploadedDate ? (
            <div className="pd-card">
              <h2 className="pd-section-title">Project Info</h2>
              <p className="pd-description-text">Uploaded on {uploadedDate}</p>
            </div>
          ) : null}
          <div className="pd-card"><InfoGrid project={project} /></div>
          <div className="pd-card"><Amenities amenities={project.amenities || []} /></div>
          <div className="pd-card"><Description project={project} /></div>
          <div className="pd-card"><ProjectMap project={project} /></div>
        </div>

        <div className="pd-sidebar">
          <div className="pd-price-card">
            <div className="pd-price-header">
              <div>
                <div className="pd-price-label">Price Range</div>
                <div className="pd-price-amount">{formatCompactPrice(starting)} - {formatCompactPrice(ending)}</div>
                <div className="pd-price-per-sqft">{project.projectType} � {project.areaRange}</div>
              </div>
            </div>
            <div className="pd-trust">
              <div className="pd-trust-badge">
                <div className="pd-trust-icon"><Building2 size={16} /></div>
                <span className="pd-trust-label">Developer</span>
              </div>
              <p className="pd-trust-text">{project.developerName}</p>
              <p className="pd-trust-text">{profile.labels.rera}: {project.reraNumber || 'Pending'}</p>
            </div>
          </div>

          <div className="pd-contact-card">
            <h3>Send an enquiry</h3>
            <form onSubmit={submitEnquiry} style={{ display: 'grid', gap: 10 }}>
              <input value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} placeholder="Your name" className="styled-input" />
              <input value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} placeholder="Email" className="styled-input" />
              <input value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} placeholder="Phone" className="styled-input" />
              <textarea value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} placeholder="Message" className="styled-textarea" rows={4} />
              <button type="submit" className="pd-contact-btn"><Phone size={16} /> Contact Developer</button>
            </form>
            {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
          </div>

          {project.showWhatsappButton && whatsappNumber ? (
            <div className="pd-contact-card">
              <h3>WhatsApp</h3>
              <p>{project.responseTime || 'Chat directly for brochure or site visits.'}</p>
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

          <div className="pd-contact-card">
            <h3>Quick Contact</h3>
            <p>Reach out directly for brochure, site visit, and latest availability.</p>
            <div className="pd-chip-list">
              <span className="pd-info-chip"><Phone size={14} /> {visibleContact.phone || '-'}</span>
              <span className="pd-info-chip"><Mail size={14} /> {visibleContact.email || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {similar.length ? (
        <section className="pd-similar-section">
          <div className="pd-similar-header">
            <h2 className="pd-similar-title">Similar Projects</h2>
          </div>
          <div className="pd-similar-grid">
            {similar.map((item) => <ProjectCard key={item._id} project={item} />)}
          </div>
        </section>
      ) : null}

      <section className="pd-feedback-section">
        <div className="pd-feedback-header">
          <h2 className="pd-similar-title">Project Feedback</h2>
          <p className="pd-feedback-subtitle">Share a rating and a short note (max 200 characters).</p>
        </div>

        <div className="pd-feedback-grid">
          <form className="pd-feedback-form" onSubmit={submitFeedback}>
            <label className="pd-feedback-label">Your Name</label>
            <input
              className="styled-input"
              value={feedbackForm.name}
              onChange={(event) => setFeedbackForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Enter your name"
            />

            <label className="pd-feedback-label">Rating</label>
            <div className="pd-feedback-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`pd-rating-star-btn ${feedbackForm.rating >= value ? 'active' : ''}`}
                  onClick={() => setFeedbackForm((current) => ({ ...current, rating: value }))}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="pd-feedback-label">Short Feedback</label>
            <textarea
              className="styled-textarea"
              rows={4}
              maxLength={200}
              value={feedbackForm.feedback}
              onChange={(event) => setFeedbackForm((current) => ({ ...current, feedback: event.target.value }))}
              placeholder="Write a short feedback..."
            />
            <div className="pd-feedback-count">{feedbackForm.feedback.length} / 200</div>

            <button type="submit" className="pd-contact-btn">Submit Feedback</button>
            {feedbackStatus ? <p style={{ marginTop: 10 }}>{feedbackStatus}</p> : null}
          </form>

          <div className="pd-feedback-list">
            {feedbackItems.length === 0 ? (
              <div className="pd-feedback-empty">No feedback yet. Be the first to share.</div>
            ) : (
              feedbackItems.map((item) => (
                <div key={item._id} className="pd-feedback-card">
                  <div className="pd-feedback-top">
                    <div>
                      <div className="pd-feedback-name">{item.name}</div>
                      <div className="pd-feedback-date">{new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div className="pd-feedback-stars">{'★'.repeat(item.rating || 0)}</div>
                  </div>
                  <p className="pd-feedback-text">{item.feedback}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

