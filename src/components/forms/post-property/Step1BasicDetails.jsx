import React from 'react';
import { Building2, HandCoins, Home, Mail, PenSquare, Phone, UserRound } from 'lucide-react';

const residentialTypes = [
    'Flat / Apartment',
    'Independent House / Villa',
    'Builder Floor',
    'Plot / Land',
    '1 RK / Studio Apartment',
    'Serviced Apartment',
    'PG / Hostel',
    'Farmhouse',
    'Other',
];

const commercialTypes = [
    'Office Space',
    'Shop / Showroom',
    'Commercial Land',
    'Warehouse / Godown',
    'Industrial Building',
    'Other',
];

export default function Step1BasicDetails({ formData, updateField, errors, isAdmin = false }) {
    const types = formData.category === 'residential' ? residentialTypes : commercialTypes;

    const setContactDisplayMode = (mode) => {
        updateField('contactDisplayMode', mode);
        updateField('useOriginalSellerContact', mode === 'original');
    };

    return (
        <div className="ppf-step-content" key="step1">
            <h2 className="ppf-heading">
                <span className="ppf-heading-icon"><Home size={18} /></span>
                Welcome back <span>{formData.userName || 'User'}</span>, Fill out basic details
            </h2>

            <p className="ppf-section-label"><span className="ppf-section-label-icon"><HandCoins size={15} /></span>I'm looking to</p>
            <div className="ppf-pill-group" role="group" aria-label="Listing intent">
                {[
                    { value: 'sell', label: 'Sell' },
                    { value: 'rent', label: 'Rent / Lease' },
                    { value: 'pg', label: 'PG' },
                ].map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        id={`ppf-intent-${value}`}
                        className={`ppf-pill ${formData.intent === value ? 'active' : ''}`}
                        onClick={() => updateField('intent', value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <p className="ppf-section-label"><span className="ppf-section-label-icon"><Building2 size={15} /></span>What kind of property do you have?</p>
            <div className="ppf-radio-group">
                <label className="ppf-radio-label" htmlFor="ppf-cat-res">
                    <input
                        type="radio"
                        id="ppf-cat-res"
                        name="ppf-category"
                        checked={formData.category === 'residential'}
                        onChange={() => {
                            updateField('category', 'residential');
                            updateField('propertyType', '');
                        }}
                    />
                    Residential
                </label>
                <label className="ppf-radio-label" htmlFor="ppf-cat-com">
                    <input
                        type="radio"
                        id="ppf-cat-com"
                        name="ppf-category"
                        checked={formData.category === 'commercial'}
                        onChange={() => {
                            updateField('category', 'commercial');
                            updateField('propertyType', '');
                        }}
                    />
                    Commercial
                </label>
            </div>

            <div className="ppf-chip-group" role="group" aria-label="Property type">
                {types.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`ppf-chip ${formData.propertyType === type ? 'active' : ''}`}
                        onClick={() => updateField('propertyType', type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
            {errors.propertyType ? <p className="ppf-input-error">{errors.propertyType}</p> : null}

            <div className="ppf-field" style={{ marginTop: 18 }}>
                <label className="ppf-field-label">
                    <span className="ppf-field-label-icon"><PenSquare size={14} /></span>
                    Property Title
                </label>
                <input
                    className="ppf-input"
                    type="text"
                    placeholder="e.g. 2 BHK with balcony in Saswad"
                    value={formData.title || ''}
                    onChange={(event) => updateField('title', event.target.value)}
                />
                <p className="ppf-input-hint">If left blank, we will auto-generate a title from type and location.</p>
            </div>

            <div className="ppf-admin-contact-card">
                <div className="ppf-admin-contact-head">
                    <div>
                        <h3 className="ppf-admin-contact-title">{isAdmin ? 'Seller Display on Website' : 'Contact Details on Website'}</h3>
                        <p className="ppf-admin-contact-subtitle">Toggle real seller details, or switch to company or custom contact info for this listing.</p>
                    </div>
                </div>

                <div className="ppf-toggle-wrapper">
                    <button
                        type="button"
                        className={`ppf-toggle ${formData.contactDisplayMode === 'original' ? 'on' : ''}`}
                        onClick={() => setContactDisplayMode(formData.contactDisplayMode === 'original' ? (isAdmin ? 'company' : 'custom') : 'original')}
                        aria-pressed={formData.contactDisplayMode === 'original'}
                    />
                    <span className="ppf-toggle-label">Show Real Seller Details</span>
                </div>

                {formData.contactDisplayMode !== 'original' ? (
                    <div className="ppf-radio-group" style={{ marginTop: 12 }}>
                        {isAdmin ? (
                            <label className="ppf-radio-label" htmlFor="ppf-contact-company">
                                <input
                                    type="radio"
                                    id="ppf-contact-company"
                                    name="ppf-contact-mode"
                                    checked={formData.contactDisplayMode === 'company'}
                                    onChange={() => setContactDisplayMode('company')}
                                />
                                Use company contact details
                            </label>
                        ) : null}
                        <label className="ppf-radio-label" htmlFor="ppf-contact-custom">
                            <input
                                type="radio"
                                id="ppf-contact-custom"
                                name="ppf-contact-mode"
                                checked={formData.contactDisplayMode === 'custom' || (!isAdmin && formData.contactDisplayMode !== 'original')}
                                onChange={() => setContactDisplayMode('custom')}
                            />
                            Use custom seller details
                        </label>
                    </div>
                ) : null}

                {formData.contactDisplayMode === 'custom' ? (
                    <div className="ppf-form-row">
                        <div className="ppf-field">
                            <label className="ppf-field-label"><span className="ppf-field-label-icon"><UserRound size={14} /></span>Custom Seller Name</label>
                            <input
                                className={`ppf-input ${errors.displaySellerName ? 'error' : ''}`}
                                type="text"
                                placeholder="Enter seller name shown on website"
                                value={formData.displaySellerName}
                                onChange={(event) => updateField('displaySellerName', event.target.value)}
                            />
                            {errors.displaySellerName ? <p className="ppf-input-error">{errors.displaySellerName}</p> : null}
                        </div>
                        <div className="ppf-field">
                            <label className="ppf-field-label"><span className="ppf-field-label-icon"><Phone size={14} /></span>Custom Seller Phone</label>
                            <input
                                className={`ppf-input ${errors.displaySellerPhone ? 'error' : ''}`}
                                type="text"
                                placeholder="Enter seller phone shown on website"
                                value={formData.displaySellerPhone}
                                onChange={(event) => updateField('displaySellerPhone', event.target.value)}
                            />
                            {errors.displaySellerPhone ? <p className="ppf-input-error">{errors.displaySellerPhone}</p> : null}
                        </div>
                        <div className="ppf-field">
                            <label className="ppf-field-label"><span className="ppf-field-label-icon"><Mail size={14} /></span>Custom Seller Email</label>
                            <input
                                className={`ppf-input ${errors.displaySellerEmail ? 'error' : ''}`}
                                type="email"
                                placeholder="Enter seller email shown on website"
                                value={formData.displaySellerEmail || ''}
                                onChange={(event) => updateField('displaySellerEmail', event.target.value)}
                            />
                            {errors.displaySellerEmail ? <p className="ppf-input-error">{errors.displaySellerEmail}</p> : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
