import React, { useState } from 'react';
import './Home.css';

// --- SUB-COMPONENTS --- //

const HeroBanner = () => {
    return (
        <section className="hero-banner">
            <div className="hero-content">
                <div className="hero-left">
                    <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Apartments" />
                </div>
                <div className="hero-center">
                    <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="House" />
                </div>
                <div className="hero-right">
                    <span className="hero-builder-logo">CASAGRAND CALADIUM</span>
                    <h2 className="hero-headline">MUCH MORE SOPHISTICATION SINGAPORE-STYLE APARTMENTS</h2>
                    <p className="hero-subtext">Spacious 3 BHK Apartments @ ₹ 1.69 Cr*</p>
                    <button className="hero-btn">Explore Now &rarr;</button>

                    <div className="hero-qr">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=example" alt="QR" />
                    </div>
                </div>
            </div>
            {/* Carousel navigation placeholder */}
            <button className="carousel-btn prev">&#10094;</button>
            <button className="carousel-btn next">&#10095;</button>
        </section>
    );
};

const SearchWidget = () => {
    const tabs = ['Buy', 'Rent', 'New Launch', 'Commercial', 'Plots/Land', 'Projects', 'Post Property'];
    const [activeTab, setActiveTab] = useState('Buy');

    return (
        <section className="search-widget-container">
            <div className="search-card">
                <div className="search-tabs">
                    {tabs.map((t, idx) => (
                        <div
                            key={idx}
                            className={`search-tab ${t === activeTab ? 'active' : ''}`}
                            onClick={() => setActiveTab(t)}
                        >
                            {t}
                            {t === 'New Launch' && <span className="badge"></span>}
                        </div>
                    ))}
                </div>
                <div className="search-row">
                    <select className="search-dropdown">
                        <option>All Residential</option>
                        <option>Apartments</option>
                        <option>Villas</option>
                    </select>
                    <div className="search-input-wrapper">
                        <input type="text" className="search-input" placeholder="Search '3 BHK for sale in Mumbai'" />
                        <button className="search-icon-btn" title="Location">&#128205;</button>
                        <button className="search-icon-btn" title="Microphone" style={{ marginLeft: '0' }}>&#127897;</button>
                    </div>
                    <button className="search-btn">Search</button>
                </div>
            </div>
        </section>
    );
};

const PropertySection = () => {
    const props = [1, 2, 3, 4];

    return (
        <section className="main-content-row">
            <div className="left-column">
                <p className="section-subtitle" style={{ marginBottom: '0.5rem' }}>Continue browsing...</p>
                <div className="section-chips">
                    <button className="chip">&#127968; Buy in Pune West</button>
                    <button className="chip">&#128205; Explore New City</button>
                </div>

                <div className="section-head">
                    <h3 className="section-title">Recommended Properties</h3>
                    <p className="section-subtitle">Curated especially for you</p>
                </div>

                <div className="properties-scroll-row">
                    {props.map(p => (
                        <div className="property-card" key={p}>
                            <div className="property-card-img-wrap">
                                <img className="property-card-img" src={`https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`} alt="Prop" />
                                <span className="card-badge">Verified &#10003;</span>
                                <button className="card-heart">&#9825;</button>
                            </div>
                            <div className="property-card-body">
                                <div className="prop-price">&#8377; 85 Lac</div>
                                <div className="prop-title">3 BHK Flat</div>
                                <div className="prop-loc">Wakad, Pune</div>
                                <div className="prop-meta">
                                    <span>1250 sq.ft</span>
                                </div>
                                <div className="prop-tag">Posted by Owner</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="right-column">
                <div className="guest-card">
                    <div className="guest-avatar">&#128100;</div>
                    <h3 className="guest-title">Guest User</h3>
                    <p className="guest-text">Your Recent Activity<br /><span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>No activity yet! Start browsing properties...</span></p>
                    <a href="/login" className="guest-btn">LOGIN / REGISTER</a>
                </div>
            </div>
        </section>
    );
};

const CategoriesGrid = () => {
    const cats = [
        { icon: '&#127970;', label: 'Flats/Apartments' },
        { icon: '&#127968;', label: 'Independent House' },
        { icon: '&#127959;', label: 'Builder Floor' },
        { icon: '&#127807;', label: 'Farm House' },
        { icon: '&#127970;', label: 'Office Space' },
        { icon: '&#127978;', label: 'Shop/Showroom' },
        { icon: '&#127976;', label: 'PG/Co-living' },
        { icon: '&#128230;', label: 'Warehouse' }
    ];

    return (
        <section className="section-container">
            <h3 className="section-title mb-4">Browse by Category</h3>
            <div className="category-grid">
                {cats.map((c, i) => (
                    <div className="category-card" key={i}>
                        <div className="cat-icon" dangerouslySetInnerHTML={{ __html: c.icon }}></div>
                        <div className="cat-label">{c.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const PopularLocalities = () => {
    const locs = ['Wakad', 'Hinjewadi', 'Baner', 'Aundh', 'Kothrud', 'Pimple Saudagar', 'Bavdhan', 'Pashan'];
    return (
        <section className="section-container" style={{ paddingTop: '3rem' }}>
            <h3 className="section-title">Properties in Popular Localities</h3>
            <p className="section-subtitle mb-4">Pune West</p>
            <div className="localities-row">
                {locs.map((l, i) => (
                    <button className="locality-chip" key={i}>{l}</button>
                ))}
            </div>
        </section>
    );
};

const NewLaunchProjects = () => {
    const projs = [1, 2, 3];
    return (
        <section className="section-container" style={{ paddingTop: '3rem' }}>
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="section-title">New Launch Projects</h3>
                <a href="#" style={{ color: 'var(--indigo-600)', fontWeight: 600, textDecoration: 'none' }}>View All &rarr;</a>
            </div>
            <div className="project-grid">
                {projs.map((p, i) => (
                    <div className="project-card" key={i}>
                        <div className="project-img-box">
                            <span className="project-badge">NEW LAUNCH</span>
                        </div>
                        <div className="project-info">
                            <div className="project-name">Godrej Hillside</div>
                            <div className="project-builder">by Godrej Properties</div>
                            <div className="project-loc">&#128205; Mahalunge, Pune</div>
                            <div className="project-price">&#8377; 65 Lac - 1.2 Cr</div>
                            <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>2, 3 BHK</div>
                            <button className="project-btn">Explore</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const InsightsArticles = () => {
    const articles = [1, 2, 3, 4];
    return (
        <section className="section-container" style={{ paddingTop: '3rem' }}>
            <h3 className="section-title mb-4">Insights & News</h3>
            <div className="insights-row">
                {articles.map((a, i) => (
                    <div className="insight-card" key={i}>
                        <div className="insight-img"></div>
                        <div className="insight-body">
                            <span className="insight-tag">Market Trends</span>
                            <div className="insight-title">Real Estate Market Shows Signs of Recovery in Q3 2026</div>
                            <div className="insight-footer">
                                <span className="insight-date">Oct 15, 2026</span>
                                <a href="#" className="insight-link">Read More &rarr;</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const AppBanner = () => {
    return (
        <section className="app-banner">
            <div className="app-banner-left">
                <h2>Search on the go!</h2>
                <p>Download our app for the best property search experience.</p>
                <div className="store-btns">
                    <a href="#" className="store-btn">App Store</a>
                    <a href="#" className="store-btn">Google Play</a>
                </div>
            </div>
            <div className="app-banner-right">
                <span style={{ fontSize: '3rem', opacity: 0.5 }}>📱</span>
            </div>
        </section>
    );
};

const Footer = () => {
    const [cookiesAccepted, setCookiesAccepted] = useState(false);

    return (
        <footer className="home-footer">
            <div className="footer-content">
                <div className="footer-col">
                    <h4>About</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>For Buyers</h4>
                    <ul>
                        <li><a href="#">Search Properties</a></li>
                        <li><a href="#">Home Loans</a></li>
                        <li><a href="#">EMI Calculator</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>For Owners</h4>
                    <ul>
                        <li><a href="#">Post Property (Free)</a></li>
                        <li><a href="#">Lease Commercial</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Feedback</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div>&copy; 2026 Purandar Estate. All rights reserved.</div>
                <div className="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Cookie Policy</a>
                </div>
            </div>

            {!cookiesAccepted && (
                <div className="cookie-consent">
                    <span>This site uses cookies to ensure you get the best experience on our website.</span>
                    <button className="cookie-btn" onClick={() => setCookiesAccepted(true)}>Okay</button>
                </div>
            )}
        </footer>
    );
};


// --- MAIN PAGE --- //

export default function Home() {
    return (
        <div className="home-container">
            <HeroBanner />
            <SearchWidget />
            <PropertySection />
            <CategoriesGrid />
            <PopularLocalities />
            <NewLaunchProjects />
            <InsightsArticles />
            <AppBanner />
            <Footer />
        </div>
    );
}
