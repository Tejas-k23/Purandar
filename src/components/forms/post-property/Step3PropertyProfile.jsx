import React from 'react';
import { HousePlus } from 'lucide-react';
import { getPropertyTypeConfig } from '../../../utils/propertyFormConfig';

function CountSelector({ label, value, options, onChange }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <p className="ppf-field-label">{label}</p>
            <div className="ppf-count-selector">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        className={`ppf-count-pill ${value === option ? 'active' : ''}`}
                        onClick={() => onChange(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

function AreaInput({ label, required, value, unit, onValueChange, onUnitChange, error }) {
    return (
        <div className="ppf-field">
            <label className="ppf-field-label">
                {label}{required ? <span className="required">*</span> : null}
            </label>
            <div className={`ppf-area-input-group ${error ? 'error' : ''}`}>
                <input
                    type="number"
                    placeholder="Enter area"
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                    min="0"
                />
                <div className="ppf-unit-toggle">
                    {['sq.ft', 'sq.mt', 'sq.yards'].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`ppf-unit-btn ${unit === item ? 'active' : ''}`}
                            onClick={() => onUnitChange(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
            {error ? <p className="ppf-input-error">{error}</p> : null}
        </div>
    );
}

function Toggle({ label, value, onChange }) {
    return (
        <div className="ppf-toggle-wrapper">
            <button
                type="button"
                className={`ppf-toggle ${value ? 'on' : ''}`}
                onClick={() => onChange(!value)}
                aria-pressed={value}
            />
            <span className="ppf-toggle-label">{label}</span>
        </div>
    );
}

function NumberInput({ label, value, onChange, error, min = 0, suffix = '' }) {
    return (
        <div className="ppf-field">
            <label className="ppf-field-label">{label}</label>
            <input
                className={`ppf-input ${error ? 'error' : ''}`}
                type="number"
                min={min}
                placeholder={suffix ? `Enter value in ${suffix}` : 'Enter value'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            {error ? <p className="ppf-input-error">{error}</p> : null}
        </div>
    );
}

function SelectInput({ label, value, options, onChange, error }) {
    return (
        <div className="ppf-field">
            <label className="ppf-field-label">{label}</label>
            <select className={`ppf-select ${error ? 'error' : ''}`} value={value || ''} onChange={(event) => onChange(event.target.value)}>
                <option value="">Select</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            {error ? <p className="ppf-input-error">{error}</p> : null}
        </div>
    );
}

function PillSelector({ label, value, options, onChange, optionLabels = {} }) {
    return (
        <>
            <p className="ppf-section-label">{label}</p>
            <div className="ppf-pill-group">
                {options.map((option) => (
                    <button
                        key={`${label}-${option}`}
                        type="button"
                        className={`ppf-pill ${value === option ? 'active' : ''}`}
                        onClick={() => onChange(option)}
                    >
                        {optionLabels[option] || option}
                    </button>
                ))}
            </div>
        </>
    );
}

function renderField(field, formData, updateField, errors) {
    switch (field.type) {
        case 'count':
            return (
                <CountSelector
                    key={field.key}
                    label={field.label}
                    value={formData[field.key]}
                    options={field.options}
                    onChange={(value) => updateField(field.key, value)}
                />
            );
        case 'area':
            return (
                <AreaInput
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    value={formData[field.key]}
                    unit={formData.areaUnit}
                    onValueChange={(value) => updateField(field.key, value)}
                    onUnitChange={(value) => updateField('areaUnit', value)}
                    error={errors[field.key]}
                />
            );
        case 'number':
            return (
                <NumberInput
                    key={field.key}
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(value) => updateField(field.key, value)}
                    error={errors[field.key]}
                    min={field.min}
                    suffix={field.suffix}
                />
            );
        case 'toggle':
            return <Toggle key={field.key} label={field.label} value={Boolean(formData[field.key])} onChange={(value) => updateField(field.key, value)} />;
        case 'select':
            return <SelectInput key={field.key} label={field.label} value={formData[field.key]} options={field.options} onChange={(value) => updateField(field.key, value)} error={errors[field.key]} />;
        case 'pill':
            return <PillSelector key={field.key} label={field.label} value={formData[field.key]} options={field.options} optionLabels={field.optionLabels} onChange={(value) => updateField(field.key, value)} />;
        default:
            return null;
    }
}

export default function Step3PropertyProfile({ formData, updateField, errors }) {
    const config = getPropertyTypeConfig(formData.propertyType);
    const isSell = formData.intent === 'sell';
    const isRent = formData.intent === 'rent';
    const isPG = formData.intent === 'pg';
    const autoBaseArea = formData.totalArea || formData.carpetArea || formData.plotArea || formData.floorArea;
    const autoPerSqFt = (formData.price && autoBaseArea)
        ? Math.round(Number(formData.price) / Number(autoBaseArea))
        : null;
    const visibleFields = (config?.profileFields || []).filter((field) => !field.showWhen || field.showWhen({ intent: formData.intent, propertyType: formData.propertyType }));
    const rows = [];

    for (let index = 0; index < visibleFields.length; index += 2) {
        rows.push(visibleFields.slice(index, index + 2));
    }

    return (
        <div className="ppf-step-content" key="step3">
            <h2 className="ppf-heading"><span className="ppf-heading-icon"><HousePlus size={18} /></span>Tell us about your property</h2>

            {rows.map((row, index) => (
                <div key={`profile-row-${index}`} className={row.length > 1 ? 'ppf-form-row' : ''}>
                    {row.map((field) => (
                        <div key={field.key} style={{ flex: 1 }}>
                            {renderField(field, formData, updateField, errors)}
                        </div>
                    ))}
                </div>
            ))}

            {visibleFields.some((field) => field.key === 'availability') && formData.availability === 'Under Construction' ? (
                <div className="ppf-form-row">
                    <div className="ppf-field">
                        <label className="ppf-field-label">Expected Possession Month</label>
                        <select className={`ppf-select ${errors.possessionMonth ? 'error' : ''}`} value={formData.possessionMonth || ''} onChange={(event) => updateField('possessionMonth', event.target.value)}>
                            <option value="">Month</option>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, monthIndex) => (
                                <option key={month} value={String(monthIndex + 1).padStart(2, '0')}>{month}</option>
                            ))}
                        </select>
                        {errors.possessionMonth ? <p className="ppf-input-error">{errors.possessionMonth}</p> : null}
                    </div>
                    <div className="ppf-field">
                        <label className="ppf-field-label">Year</label>
                        <select className={`ppf-select ${errors.possessionYear ? 'error' : ''}`} value={formData.possessionYear || ''} onChange={(event) => updateField('possessionYear', event.target.value)}>
                            <option value="">Year</option>
                            {[2026, 2027, 2028, 2029, 2030, 2031].map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        {errors.possessionYear ? <p className="ppf-input-error">{errors.possessionYear}</p> : null}
                    </div>
                </div>
            ) : null}

            <hr className="ppf-divider" />

            <p className="ppf-section-label" style={{ fontSize: '1.05rem' }}>Pricing</p>

            <div className={isSell ? '' : 'ppf-form-row'}>
                <div className="ppf-field">
                    <label className="ppf-field-label">
                        {isSell ? 'Total Price (Rs.)' : 'Monthly Rent (Rs.)'}
                        <span className="required">*</span>
                    </label>
                    <input
                        className={`ppf-input ${errors.price ? 'error' : ''}`}
                        type="number"
                        placeholder={isSell ? 'e.g. 5000000' : 'e.g. 25000'}
                        value={formData.price}
                        onChange={(event) => updateField('price', event.target.value)}
                    />
                    {autoPerSqFt ? <p className="ppf-auto-calc">Approx. Rs.{autoPerSqFt.toLocaleString('en-IN')} per {formData.areaUnit}</p> : null}
                    {errors.price ? <p className="ppf-input-error">{errors.price}</p> : null}
                </div>

                {isRent || isPG ? (
                    <div className="ppf-field">
                        <label className="ppf-field-label">Security Deposit (Rs.)</label>
                        <input className="ppf-input" type="number" placeholder="e.g. 50000" value={formData.securityDeposit} onChange={(event) => updateField('securityDeposit', event.target.value)} />
                    </div>
                ) : null}

                {isRent ? (
                    <div className="ppf-field">
                        <label className="ppf-field-label">Maintenance (Rs./month)</label>
                        <input className="ppf-input" type="number" placeholder="e.g. 3000" value={formData.maintenance} onChange={(event) => updateField('maintenance', event.target.value)} />
                    </div>
                ) : null}
            </div>

            {isPG && !visibleFields.some((field) => field.key === 'mealsIncluded') ? (
                <Toggle label="Meals Included" value={formData.mealsIncluded} onChange={(value) => updateField('mealsIncluded', value)} />
            ) : null}

            <Toggle label="Price Negotiable" value={formData.priceNegotiable} onChange={(value) => updateField('priceNegotiable', value)} />
        </div>
    );
}
