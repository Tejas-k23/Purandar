import React from 'react';
import { Grid2X2 } from 'lucide-react';
import { getAmenityMeta } from '../../../utils/amenityMeta';
import { getAdditionalDetailOptions, getAmenitySections, getPropertyTypeConfig } from '../../../utils/propertyFormConfig';

function AmenityChip({ label, selected, onClick }) {
    const { icon: Icon, colorClass } = getAmenityMeta(label);

    return (
        <button
            type="button"
            className={`ppf-amenity-chip ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <span className={`ppf-amenity-icon ppf-amenity-icon--${colorClass}`}>
                <Icon size={14} strokeWidth={1.9} />
            </span>
            <span className="chip-check">
                {selected ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                ) : null}
            </span>
            {label}
        </button>
    );
}

export default function Step5Amenities({ formData, updateField, errors = {} }) {
    const amenitySections = getAmenitySections(formData.propertyType);
    const additionalOptions = getAdditionalDetailOptions();
    const propertyConfig = getPropertyTypeConfig(formData.propertyType);

    const toggleAmenity = (field, value) => {
        const current = formData[field] || [];
        const updated = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        updateField(field, updated);
    };

    const toggleOverlooking = (value) => {
        const current = formData.overlooking || [];
        const updated = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        updateField('overlooking', updated);
    };

    return (
        <div className="ppf-step-content" key="step5">
            <h2 className="ppf-heading"><span className="ppf-heading-icon"><Grid2X2 size={18} /></span>What amenities does your property have?</h2>

            {amenitySections.map((section) => (
                <div key={section.key} className="ppf-amenity-section">
                    <h3 className="ppf-amenity-title">{section.label}</h3>
                    <div className="ppf-amenity-grid">
                        {section.options.map((amenity) => (
                            <AmenityChip
                                key={amenity}
                                label={amenity}
                                selected={(formData[section.key] || []).includes(amenity)}
                                onClick={() => toggleAmenity(section.key, amenity)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            <hr className="ppf-divider" />

            <h3 className="ppf-amenity-title">Additional Details</h3>

            {propertyConfig?.additionalDetails?.facing ? (
                <>
                    <p className="ppf-section-label">Facing Direction</p>
                    <div className="ppf-direction-grid">
                        {additionalOptions.directions.map((direction) => (
                            <button
                                key={direction}
                                type="button"
                                className={`ppf-direction-pill ${formData.facing === direction ? 'active' : ''}`}
                                onClick={() => updateField('facing', direction)}
                            >
                                {direction}
                            </button>
                        ))}
                    </div>
                </>
            ) : null}

            {propertyConfig?.additionalDetails?.overlooking ? (
                <>
                    <p className="ppf-section-label">Overlooking</p>
                    <div className="ppf-pill-group">
                        {additionalOptions.overlooking.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={`ppf-pill ${(formData.overlooking || []).includes(item) ? 'active' : ''}`}
                                onClick={() => toggleOverlooking(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </>
            ) : null}

            {propertyConfig?.additionalDetails?.waterSupply ? (
                <>
                    <p className="ppf-section-label">Water Supply</p>
                    <div className="ppf-pill-group">
                        {additionalOptions.waterSupply.map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={`ppf-pill ${formData.waterSupply === value ? 'active' : ''}`}
                                onClick={() => updateField('waterSupply', value)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </>
            ) : null}

            {propertyConfig?.additionalDetails?.gatedCommunity ? (
                <>
                    <p className="ppf-section-label">Gated Community</p>
                    <div className="ppf-pill-group">
                        {['Yes', 'No'].map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={`ppf-pill ${formData.gatedCommunity === value ? 'active' : ''}`}
                                onClick={() => updateField('gatedCommunity', value)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </>
            ) : null}

            <hr className="ppf-divider" />

            <div className="ppf-field">
                <label className="ppf-field-label">
                    Description <span className="required">*</span>
                </label>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 8 }}>
                    Write something unique about your property to attract buyers. Minimum 100 characters.
                </p>
                <textarea
                    className={`ppf-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Describe your property - location highlights, amenities, surroundings, transport links..."
                    maxLength={5000}
                    value={formData.description}
                    onChange={(event) => updateField('description', event.target.value)}
                />
                {errors.description ? <p className="ppf-input-error">{errors.description}</p> : null}
                <p className="ppf-char-count">
                    {(formData.description || '').length} / 5,000
                </p>
            </div>
        </div>
    );
}
