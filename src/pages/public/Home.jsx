import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Building2, MessageSquareMore, PlusCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useProperties from '../../hooks/useProperties';
import useProjects from '../../hooks/useProjects';
import useAuth from '../../hooks/useAuth';
import PropertyCard from '../../components/property/PropertyCard';
import ProjectCard from '../../components/project/ProjectCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import blogService from '../../services/blogService';
import { buildSearchQueryString } from '../../utils/queryParams';
import userService from '../../services/userService';
import AppInstallBanner from '../../components/home/AppInstallBanner';
import './Home.css';

const HeroBanner = () => (
  <section className="hero-banner">
    <img src="/home.png" alt="Home" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </section>
);

const SearchWidget = () => {
  const tabs = ['Buy', 'Rent', 'New Launch', 'Commercial', 'Plots/Land', 'Projects', 'Post Property'];
  const [activeTab, setActiveTab] = useState('Buy');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const navigate = useNavigate();

  const runSearch = () => {
    if (activeTab === 'Post Property') {
      navigate('/post-property');
      return;
    }

    if (activeTab === 'Projects' || activeTab === 'New Launch') {
      navigate('/projects');
      return;
    }

    const targetPath = activeTab === 'Rent' ? '/rent' : '/buy';
    const category = activeTab === 'Commercial' ? 'commercial' : '';
    const resolvedPropertyType = activeTab === 'Plots/Land' && !propertyType ? 'Plot / Land' : propertyType;
    const queryString = buildSearchQueryString({
      city,
      propertyType: resolvedPropertyType,
      category,
      intent: targetPath === '/rent' ? 'rent' : 'sell',
    });
    navigate(`${targetPath}?${queryString}`);
  };

  return (
    <section className="search-widget-container">
      <div className="search-card">
        <div className="search-tabs">
          {tabs.map((tab) => (
            <div key={tab} className={`search-tab ${tab === activeTab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
              {tab === 'New Launch' ? <span className="badge"></span> : null}
            </div>
          ))}
        </div>
        <div className="search-row">
          <select className="search-dropdown" value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
            <option value="">All Types</option>
            <option value="Flat / Apartment">Apartments</option>
            <option value="Independent House / Villa">Villas</option>
            <option value="Plot / Land">Plots</option>
            <option value="PG / Hostel">PG / Hostel</option>
            <option value="Office Space">Office Space</option>
            <option value="Shop / Showroom">Shop / Showroom</option>
          </select>
          <div className="search-input-wrapper">
            <input type="text" className="search-input" placeholder="Search by city" value={city} onChange={(event) => setCity(event.target.value)} />
          </div>
          <button type="button" onClick={runSearch} className="search-btn">Search</button>
        </div>
      </div>
    </section>
  );
};

const useAutoScrollRow = (rowRef, { speed = 24, pauseOnHover = true } = {}) => {
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    // More robust mobile detection
    const isMobile = window.matchMedia('(max-width: 1024px)').matches || 
                     window.matchMedia('(pointer: coarse)').matches;

    // Disable auto-scroll completely on mobile/touch devices to avoid conflicts with native swipe
    if (isMobile) {
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const pause = () => {
      isPausedRef.current = true;
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };

    const resume = () => {
      // Delay resume to ensure native momentum scroll has finished
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        isPausedRef.current = false;
        lastTime = performance.now(); // Reset time to avoid jump
      }, 1000);
    };

    if (pauseOnHover) {
      row.addEventListener('mouseenter', pause);
      row.addEventListener('mouseleave', resume);
    }

    row.addEventListener('mousedown', pause);
    window.addEventListener('mouseup', resume);
    row.addEventListener('touchstart', pause, { passive: true });
    row.addEventListener('touchend', resume, { passive: true });

    const tick = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isPausedRef.current) {
        const maxScroll = row.scrollWidth - row.clientWidth;
        if (maxScroll > 0) {
          const next = row.scrollLeft + (speed * delta) / 1000;
          row.scrollLeft = next >= maxScroll ? 0 : next;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (pauseOnHover) {
        row.removeEventListener('mouseenter', pause);
        row.removeEventListener('mouseleave', resume);
      }
      row.removeEventListener('mousedown', pause);
      window.removeEventListener('mouseup', resume);
      row.removeEventListener('touchstart', pause);
      row.removeEventListener('touchend', resume);
    };
  }, [rowRef, speed, pauseOnHover]);
};

function PropertySection() {
  const location = useLocation();
  const { properties, loading } = useProperties({
    limit: 8,
    sort: 'newest',
    featuredOnHome: true,
    fields: [
      'title',
      'propertyType',
      'city',
      'locality',
      'subLocality',
      'price',
      'bedrooms',
      'bathrooms',
      'totalArea',
      'plotArea',
      'carpetArea',
      'areaUnit',
      'photos',
      'images',
      'intent',
      'status',
      'displaySellerName',
      'userName',
      'contactDisplayMode',
      'useOriginalSellerContact',
    ].join(','),
  });
  const { savedProperties, savedPropertyIds, toggleSavedProperty, isAuthenticated, user } = useAuth();
  const [activity, setActivity] = useState({ properties: 0, leads: 0, loading: false });
  const featured = useMemo(() => properties.slice(0, 4), [properties]);
  const propertiesRowRef = useRef(null);

  useAutoScrollRow(propertiesRowRef, { speed: 26 });

  useEffect(() => {
    let active = true;

    const loadActivity = async () => {
      if (!user) {
        return;
      }

      setActivity((current) => ({ ...current, loading: true }));

      try {
        const [propertiesResponse, enquiriesResponse] = await Promise.all([
          userService.getMyProperties(),
          userService.getMyEnquiries(),
        ]);

        if (!active) return;

        const data = propertiesResponse.data.data || [];
        const propertyList = Array.isArray(data) ? data : (data.properties || []);
        setActivity({
          properties: propertyList.length,
          leads: (enquiriesResponse.data.data || []).length,
          loading: false,
        });
      } catch (_error) {
        if (!active) return;
        setActivity((current) => ({ ...current, loading: false }));
      }
    };

    loadActivity();

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <section className="main-content-row">
      <div className="left-column">
        <p className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Continue browsing...</p>
        <div className="section-chips">
          <Link className="chip" to="/buy?city=Pune">Buy in Purandar</Link>
          <Link className="chip" to="/rent?city=Pune">Explore rentals</Link>
        </div>

        <div className="section-head">
          <h3 className="section-title"><span className="heading-accent">Recommended</span> Properties</h3>
          <p className="section-subtitle">Your live listings from the database</p>
        </div>

        {loading ? <Loader label="Loading recommended properties..." /> : null}
        {!loading && featured.length === 0 ? <EmptyState title="No properties available yet" /> : null}

        <div className="properties-scroll-row home-live-grid" ref={propertiesRowRef}>
          {featured.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              isSaved={savedPropertyIds.has(property._id)}
              onToggleSave={isAuthenticated ? toggleSavedProperty : undefined}
              variant="compact"
            />
          ))}
        </div>
      </div>

      <div className="right-column right-column-sticky">
        {!user ? (
          <div className="guest-card">
            <div className="guest-avatar">&#128100;</div>
            <div className="guest-badge">Guest Access</div>
            <h3 className="guest-title">Guest</h3>
            <p className="guest-text">
              Save properties, contact sellers, and post listings once you log in.
            </p>
            <div className="guest-actions">
              <Link to="/login" state={{ backgroundLocation: location }} className="guest-btn">Login</Link>
              <Link to="/signup" state={{ backgroundLocation: location }} className="guest-btn guest-btn-secondary">Create Account</Link>
            </div>
          </div>
        ) : (
          <div className="activity-card">
            <div className="activity-card-top">
              <div className="activity-badge">My Activity</div>
              <h3 className="activity-title">{user.name || 'Member'}</h3>
              <p className="activity-text">Your shortcuts, stats, and recent account momentum in one place.</p>
            </div>

            <div className="activity-grid">
              <div className="activity-stat">
                <div className="activity-stat-icon"><Bookmark className="w-4 h-4" /></div>
                <div className="activity-stat-value">{savedProperties.length}</div>
                <div className="activity-stat-label">Saved</div>
              </div>
              <div className="activity-stat">
                <div className="activity-stat-icon"><Building2 className="w-4 h-4" /></div>
                <div className="activity-stat-value">{activity.loading ? '...' : activity.properties}</div>
                <div className="activity-stat-label">Listings</div>
              </div>
              <div className="activity-stat">
                <div className="activity-stat-icon"><MessageSquareMore className="w-4 h-4" /></div>
                <div className="activity-stat-value">{activity.loading ? '...' : activity.leads}</div>
                <div className="activity-stat-label">Leads</div>
              </div>
            </div>

            <div className="activity-actions">
              <Link to="/profile/dashboard" className="activity-btn">Open Dashboard</Link>
              <Link to="/profile/saved" className="activity-btn activity-btn-secondary">View Saved</Link>
              <Link to="/post-property" className="activity-btn activity-btn-ghost"><PlusCircle className="w-4 h-4" /> Post Property</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const CategoriesGrid = () => {
  const cats = [
    { icon: '&#127970;', label: 'Flats/Apartments' },
    { icon: '&#127968;', label: 'Independent House' },
    { icon: '&#127959;', label: 'Builder Floor' },
    { icon: '&#127807;', label: 'Farm House' },
    { icon: '&#127970;', label: 'Office Space' },
    { icon: '&#127978;', label: 'Shop/Showroom' },
    { icon: '&#127976;', label: 'PG/Co-living' },
    { icon: '&#128230;', label: 'Warehouse' },
  ];

  return (
    <section className="section-container">
      <h3 className="section-title mb-4"><span className="heading-accent">Browse</span> by Category</h3>
      <div className="category-grid">
        {cats.map((cat) => (
          <div className="category-card" key={cat.label}>
            <div className="cat-icon" dangerouslySetInnerHTML={{ __html: cat.icon }}></div>
            <div className="cat-label">{cat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PopularLocalities = () => {
  const locs = ['Saswad', 'Jejuri', 'Narayanpur', 'Belsar', 'Dive', 'Purandar Hills', 'Temple View', 'Market Yard'];
  return (
    <section className="section-container" style={{ paddingTop: '3rem' }}>
      <h3 className="section-title">Properties in <span className="heading-accent">Popular</span> Localities</h3>
      <p className="section-subtitle mb-4">Purandar and nearby Pune belt</p>
      <div className="localities-row">
        {locs.map((loc) => (
          <Link className="locality-chip" key={loc} to={`/buy?${buildSearchQueryString({ city: loc })}`}>{loc}</Link>
        ))}
      </div>
    </section>
  );
};

const NewLaunchProjects = () => {
  const { projects, loading } = useProjects({ featuredOnHome: true });
  const featured = projects.slice(0, 3);
  return (
    <section className="section-container" style={{ paddingTop: '3rem' }}>
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title"><span className="heading-accent">Featured</span> Projects</h3>
          <p className="section-subtitle">Same premium card feel, now for new launches and communities.</p>
        </div>
        <Link to="/projects" style={{ color: 'var(--indigo-600)', fontWeight: 600, textDecoration: 'none' }}>View All Projects &rarr;</Link>
      </div>
      <div className="project-grid">
        {loading ? <Loader label="Loading featured projects..." /> : null}
        {!loading && featured.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </section>
  );
};

const InsightsArticles = () => {
  const [articles, setArticles] = useState([]);
  const insightsRowRef = useRef(null);

  useAutoScrollRow(insightsRowRef, { speed: 22 });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await blogService.getAll({ limit: 4 });
        if (!active) return;
        setArticles(response.data.data.items || []);
      } catch (_error) {
        if (!active) return;
        setArticles([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section-container" style={{ paddingTop: '3rem' }}>
      <h3 className="section-title mb-4"><span className="heading-accent">Insights</span> & News</h3>
      <div className="insights-row" ref={insightsRowRef}>
        {articles.map((article) => (
          <Link to={`/news-insights/${article.slug}`} className="insight-card" key={article._id}>
            <img className="insight-img" src={article.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'} alt={article.title} loading="lazy" />
            <div className="insight-body">
              <span className="insight-tag">{article.category || 'Market Trends'}</span>
              <div className="insight-title">{article.title}</div>
              <div className="insight-footer">
                <span className="insight-date">{new Date(article.publishDate || article.createdAt).toLocaleDateString('en-IN')}</span>
                <span className="insight-link">Read More &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="home-footer">
    <div className="footer-content">
      <div className="footer-col">
        <h4>About</h4>
        <ul>
          <li><Link to="/contact">About Us</Link></li>
          <li><a href="#">Careers</a></li>
          <li><Link to="/terms">Terms & Conditions</Link></li>
          <li><Link to="/privacy-policy">Privacy Policy</Link></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>For Buyers</h4>
        <ul>
          <li><Link to="/buy">Search Properties</Link></li>
          <li><a href="#">Home Loans</a></li>
          <li><a href="#">EMI Calculator</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>For Owners</h4>
        <ul>
          <li><Link to="/post-property">Post Property</Link></li>
          <li><a href="#">Lease Commercial</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="#">Help Center</a></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><a href="#">Feedback</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div>&copy; 2026 Purandar Prime Propertys. All rights reserved.</div>
      <div className="footer-bottom-links">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <a href="#">Cookie Policy</a>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="home-container">
      <HeroBanner />
      <SearchWidget />
      <PropertySection />
      <PopularLocalities />
      <NewLaunchProjects />
      <InsightsArticles />
      <CategoriesGrid />
      <AppInstallBanner />
      <Footer />
    </div>
  );
}

