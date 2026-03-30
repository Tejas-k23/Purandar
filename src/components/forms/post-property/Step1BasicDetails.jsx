import React from 'react';

const residentialTypes = [
    'Flat / Apartment',
    'Independent House / Villa',
    'Builder Floor',
    'Plot / Land',
    '1 RK / Studio Apartment',
    'Serviced Apartment',
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

export default function Step1BasicDetails({ formData, updateField, errors }) {
    const types = formData.category === 'residential' ? residentialTypes : commercialTypes;

    return (
        <div className="ppf-step-content" key="step1">
            <h2 className="ppf-heading">
                Welcome back <span>{formData.userName || 'User'}</span>, Fill out basic details
            </h2>

            {/* Intent */}
            <p className="ppf-section-label">I'm looking to</p>
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

            {/* Category */}
            <p className="ppf-section-label">What kind of property do you have?</p>
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

            {/* Property Type Chips */}
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
            {errors.propertyType && (
                <p className="ppf-input-error">{errors.propertyType}</p>
            )}
        </div>
    );
}
