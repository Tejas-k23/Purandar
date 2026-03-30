import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PostProperty.css';

/* ── property‑type data ───────────────────────────── */
const residentialTypes = [
    'Flat / Apartment',
    'Independent House / Villa',
    'Builder Floor',
    'Plot / Land',
];
const residentialExtra = [
    'Serviced Apartment',
    'Studio Apartment',
    'Farmhouse',
    '1 RK / Studio',
];

const commercialTypes = [
    'Office Space',
    'Shop / Showroom',
    'Commercial Land',
    'Warehouse / Godown',
];
const commercialExtra = [
    'Industrial Shed',
    'Industrial Building',
    'Co-working Space',
    'Restaurant / Café',
];

/* ── inline SVG illustration ──────────────────────── */
function Illustration() {
    return (
        <svg viewBox="0 0 460 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Desk */}
            <rect x="100" y="220" width="260" height="12" rx="6" fill="#c7d2fe" />
            <rect x="140" y="232" width="8" height="80" rx="4" fill="#a5b4fc" />
            <rect x="312" y="232" width="8" height="80" rx="4" fill="#a5b4fc" />
            <rect x="120" y="308" width="50" height="8" rx="4" fill="#e0e7ff" />
            <rect x="290" y="308" width="50" height="8" rx="4" fill="#e0e7ff" />

            {/* Laptop base */}
            <rect x="150" y="178" width="160" height="44" rx="6" fill="#818cf8" />
            <rect x="155" y="183" width="150" height="34" rx="4" fill="#312e81" />
            {/* Screen content bars */}
            <rect x="165" y="191" width="60" height="4" rx="2" fill="#a5b4fc" />
            <rect x="165" y="199" width="90" height="4" rx="2" fill="#6366f1" />
            <rect x="165" y="207" width="45" height="4" rx="2" fill="#a5b4fc" />

            {/* Coffee mug */}
            <rect x="335" y="196" width="22" height="26" rx="4" fill="#fbbf24" />
            <path d="M357 202 C367 202 367 216 357 216" stroke="#fbbf24" strokeWidth="3" fill="none" />
            <path d="M339 193 C341 187 343 187 345 193" stroke="#9ca3af" strokeWidth="1.5" fill="none" opacity="0.5" />

            {/* Person — torso */}
            <ellipse cx="230" cy="168" rx="32" ry="18" fill="#6366f1" />
            {/* Person — head */}
            <circle cx="230" cy="134" r="22" fill="#fcd34d" />
            {/* Hair */}
            <path d="M210 128 Q215 108 230 112 Q245 108 250 128" fill="#92400e" />
            {/* Eyes */}
            <circle cx="222" cy="136" r="2.5" fill="#1e1b4b" />
            <circle cx="238" cy="136" r="2.5" fill="#1e1b4b" />
            {/* Smile */}
            <path d="M224 144 Q230 150 236 144" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />

            {/* Arms */}
            <path d="M200 172 L170 196" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
            <path d="M260 172 L290 196" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
            {/* Hands */}
            <circle cx="170" cy="196" r="6" fill="#fcd34d" />
            <circle cx="290" cy="196" r="6" fill="#fcd34d" />

            {/* Plant */}
            <rect x="64" y="230" width="16" height="28" rx="4" fill="#a78bfa" />
            <ellipse cx="72" cy="224" rx="14" ry="12" fill="#34d399" />
            <ellipse cx="62" cy="218" rx="8" ry="9" fill="#6ee7b7" />
            <ellipse cx="82" cy="220" rx="7" ry="8" fill="#6ee7b7" />

            {/* Floating documents */}
            <g opacity="0.9">
                <rect x="350" y="130" width="50" height="60" rx="6" fill="#e0e7ff" />
                <rect x="358" y="140" width="34" height="3" rx="1.5" fill="#818cf8" />
                <rect x="358" y="148" width="24" height="3" rx="1.5" fill="#a5b4fc" />
                <rect x="358" y="156" width="30" height="3" rx="1.5" fill="#818cf8" />
                <rect x="358" y="164" width="18" height="3" rx="1.5" fill="#c7d2fe" />
                <rect x="358" y="172" width="28" height="3" rx="1.5" fill="#a5b4fc" />
            </g>

            {/* Sparkles */}
            <g fill="#fbbf24">
                <polygon points="105,140 108,146 114,146 109,150 111,156 105,152 99,156 101,150 96,146 102,146" />
                <polygon points="380,110 382,114 386,114 383,117 384,121 380,118 376,121 377,117 374,114 378,114" transform="scale(0.7) translate(180,50)" />
            </g>
        </svg>
    );
}

/* ── main component ───────────────────────────────── */
export default function PostProperty() {
    const [intent, setIntent] = useState('sell');
    const [category, setCategory] = useState('residential');
    const [selectedType, setSelectedType] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const baseTypes = category === 'residential' ? residentialTypes : commercialTypes;
    const extraTypes = category === 'residential' ? residentialExtra : commercialExtra;
    const visibleTypes = showMore ? [...baseTypes, ...extraTypes] : baseTypes;

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setSelectedType('');
        setShowMore(false);
    };

    const validatePhone = (value) => {
        if (!value) return 'Phone number is required';
        if (!/^\d{10}$/.test(value)) return 'Enter a valid 10-digit phone number';
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);

        const error = validatePhone(phone);
        setPhoneError(error);
        if (error) return;

        // Navigate to multi-step form
        navigate('/post-property/form');
    };

    return (
        <section className="post-property-page" id="post-property-page">
            <div className="pp-container">
                {/* ─── LEFT ─── */}
                <div className="pp-left">
                    <h1 className="pp-heading">
                        Sell or Rent Property{' '}
                        <span className="accent">online faster</span>{' '}
                        with&nbsp;UrbanPremier
                    </h1>

                    <ul className="pp-benefits">
                        <li>
                            <span className="check-icon">✓</span>
                            Advertise for FREE
                        </li>
                        <li>
                            <span className="check-icon">✓</span>
                            Get unlimited enquiries
                        </li>
                        <li>
                            <span className="check-icon">✓</span>
                            Get shortlisted buyers and tenants
                            <span className="note">*</span>
                        </li>
                        <li>
                            <span className="check-icon">✓</span>
                            Assistance in co-ordinating site visits
                            <span className="note">*</span>
                        </li>
                    </ul>

                    <div className="pp-illustration">
                        <Illustration />
                    </div>
                </div>

                {/* ─── RIGHT — FORM CARD ─── */}
                <div className="pp-right">
                    <form className="pp-form-card" onSubmit={handleSubmit} noValidate>
                        <h2 className="pp-form-title">
                            Start posting your property, it's free
                        </h2>
                        <p className="pp-form-subtitle">Add Basic Details</p>

                        {/* Step 1 — Intent */}
                        <p className="pp-step-label">You're looking to …</p>
                        <div className="pp-pill-group" role="group" aria-label="Listing intent">
                            {['sell', 'rent', 'pg'].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    id={`pp-intent-${val}`}
                                    className={`pp-pill ${intent === val ? 'active' : ''}`}
                                    onClick={() => setIntent(val)}
                                >
                                    {val === 'pg'
                                        ? 'PG'
                                        : val === 'rent'
                                            ? 'Rent / Lease'
                                            : 'Sell'}
                                </button>
                            ))}
                        </div>

                        {/* Step 2 — Category */}
                        <p className="pp-step-label">And it's a …</p>
                        <div className="pp-radio-group">
                            <label className="pp-radio-label" htmlFor="pp-cat-res">
                                <input
                                    type="radio"
                                    id="pp-cat-res"
                                    name="pp-category"
                                    checked={category === 'residential'}
                                    onChange={() => handleCategoryChange('residential')}
                                />
                                Residential
                            </label>
                            <label className="pp-radio-label" htmlFor="pp-cat-com">
                                <input
                                    type="radio"
                                    id="pp-cat-com"
                                    name="pp-category"
                                    checked={category === 'commercial'}
                                    onChange={() => handleCategoryChange('commercial')}
                                />
                                Commercial
                            </label>
                        </div>

                        {/* Property type chips */}
                        <div className="pp-chip-group" role="group" aria-label="Property type">
                            {visibleTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`pp-chip ${selectedType === type ? 'active' : ''}`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                            {!showMore && (
                                <button
                                    type="button"
                                    className="pp-chip more-btn"
                                    onClick={() => setShowMore(true)}
                                >
                                    + {extraTypes.length} more
                                </button>
                            )}
                        </div>

                        <hr className="pp-divider" />

                        {/* Contact Details */}
                        <p className="pp-contact-heading">
                            Your contact details for the buyer to reach you
                        </p>

                        <div className="pp-phone-wrapper">
                            <span className="pp-phone-prefix">+91</span>
                            <input
                                id="pp-phone-input"
                                className={`pp-phone-input ${submitted && phoneError ? 'error' : ''}`}
                                type="tel"
                                maxLength={10}
                                placeholder="Mobile number"
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setPhone(val);
                                    if (submitted) setPhoneError(validatePhone(val));
                                }}
                            />
                        </div>
                        <p className="pp-phone-error">
                            {submitted && phoneError ? phoneError : ''}
                        </p>

                        <span className="pp-login-link">
                            Are you a registered user?{' '}
                            <Link to="/login">Login</Link>
                        </span>

                        {/* CTA */}
                        <button type="submit" className="pp-cta-btn" id="pp-start-now-btn">
                            Start now
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
