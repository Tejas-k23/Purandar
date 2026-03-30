import React from 'react';

const SOCIETY_AMENITIES = [
    'Lift', 'CCTV', 'Security', 'Gymnasium', 'Swimming Pool', 'Club House',
    'Power Backup', 'Visitor Parking', 'Garden', "Children's Play Area",
    'Gas Pipeline', 'Rain Water Harvesting', 'Waste Disposal', 'Fire Safety',
];

const FLAT_AMENITIES = [
    'Air Conditioner', 'Modular Kitchen', 'Geyser', 'RO System',
    'Intercom', 'WiFi', 'TV', 'Fridge', 'Washing Machine', 'Microwave', 'Sofa', 'Beds',
];

const DIRECTIONS = [
    'East', 'West', 'North', 'South',
    'North-East', 'North-West', 'South-East', 'South-West',
];

const OVERLOOKING = ['Garden', 'Pool', 'Road', 'Other'];
const WATER_SUPPLY = ['Corporation', 'Borewell', 'Both'];

function AmenityChip({ label, selected, onClick }) {
    return (
        <button
            type="button"
            className={`ppf-amenity-chip ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <span className="chip-check">
                {selected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </span>
            {label}
        </button>
    );
}

export default function Step5Amenities({ formData, updateField, errors }) {
    const toggleAmenity = (field, value) => {
        const current = formData[field] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateField(field, updated);
    };

    const toggleOverlooking = (value) => {
        const current = formData.overlooking || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateField('overlooking', updated);
    };

    return (
        <div className="ppf-step-content" key="step5">
            <h2 className="ppf-heading">What amenities does your property have?</h2>

            {/* Society / Building Amenities */}
            <div className="ppf-amenity-section">
                <h3 className="ppf-amenity-title">🏢 Society / Building Amenities</h3>
                <div className="ppf-amenity-grid">
                    {SOCIETY_AMENITIES.map((a) => (
                        <AmenityChip
                            key={a}
                            label={a}
                            selected={(formData.societyAmenities || []).includes(a)}
                            onClick={() => toggleAmenity('societyAmenities', a)}
                        />
                    ))}
                </div>
            </div>

            {/* Flat / Unit Amenities */}
            <div className="ppf-amenity-section">
                <h3 className="ppf-amenity-title">🏠 Flat / Unit Amenities</h3>
                <div className="ppf-amenity-grid">
                    {FLAT_AMENITIES.map((a) => (
                        <AmenityChip
                            key={a}
                            label={a}
                            selected={(formData.flatAmenities || []).includes(a)}
                            onClick={() => toggleAmenity('flatAmenities', a)}
                        />
                    ))}
                </div>
            </div>

            <hr className="ppf-divider" />

            {/* Additional Details */}
            <h3 className="ppf-amenity-title">📋 Additional Details</h3>

            {/* Facing Direction */}
            <p className="ppf-section-label">Facing Direction</p>
            <div className="ppf-direction-grid">
                {DIRECTIONS.map((d) => (
                    <button
                        key={d}
                        type="button"
                        className={`ppf-direction-pill ${formData.facing === d ? 'active' : ''}`}
                        onClick={() => updateField('facing', d)}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {/* Overlooking */}
            <p className="ppf-section-label">Overlooking</p>
            <div className="ppf-pill-group">
                {OVERLOOKING.map((o) => (
                    <button
                        key={o}
                        type="button"
                        className={`ppf-pill ${(formData.overlooking || []).includes(o) ? 'active' : ''}`}
                        onClick={() => toggleOverlooking(o)}
                    >
                        {o}
                    </button>
                ))}
            </div>

            {/* Water Supply */}
            <p className="ppf-section-label">Water Supply</p>
            <div className="ppf-pill-group">
                {WATER_SUPPLY.map((w) => (
                    <button
                        key={w}
                        type="button"
                        className={`ppf-pill ${formData.waterSupply === w ? 'active' : ''}`}
                        onClick={() => updateField('waterSupply', w)}
                    >
                        {w}
                    </button>
                ))}
            </div>

            {/* Gated Community */}
            <p className="ppf-section-label">Gated Community</p>
            <div className="ppf-pill-group">
                {['Yes', 'No'].map((v) => (
                    <button
                        key={v}
                        type="button"
                        className={`ppf-pill ${formData.gatedCommunity === v ? 'active' : ''}`}
                        onClick={() => updateField('gatedCommunity', v)}
                    >
                        {v}
                    </button>
                ))}
            </div>

            <hr className="ppf-divider" />

            {/* Description */}
            <div className="ppf-field">
                <label className="ppf-field-label">
                    Description <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional)</span>
                </label>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 8 }}>
                    Write something unique about your property to attract buyers
                </p>
                <textarea
                    className="ppf-textarea"
                    placeholder="Describe your property — location highlights, amenities, surroundings, transport links..."
                    maxLength={5000}
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                />
                <p className="ppf-char-count">
                    {(formData.description || '').length} / 5,000
                </p>
            </div>
        </div>
    );
}
