import React, { useState, useMemo, useRef, useEffect } from 'react';

const cityData = {
    'Pune': [
        'Hinjewadi', 'Baner', 'Wakad', 'Kothrud', 'Hadapsar', 'Viman Nagar',
        'Koregaon Park', 'Aundh', 'Pimpri-Chinchwad', 'Kharadi', 'Wagholi',
        'Undri', 'Kondhwa', 'Bavdhan', 'Pashan', 'Saswad', 'Jejuri', 'Purandar',
        'Narayanpur', 'Baramati', 'Daund', 'Indapur',
    ],
    'Mumbai': [
        'Andheri', 'Bandra', 'Powai', 'Thane', 'Goregaon', 'Malad',
        'Borivali', 'Kandivali', 'Juhu', 'Worli', 'Lower Parel', 'BKC',
        'Navi Mumbai', 'Panvel', 'Kharghar', 'Vashi',
    ],
    'Bangalore': [
        'Whitefield', 'Electronic City', 'Koramangala', 'Indiranagar',
        'HSR Layout', 'Marathahalli', 'Sarjapur Road', 'JP Nagar',
        'Hebbal', 'Yelahanka', 'Devanahalli',
    ],
    'Hyderabad': [
        'Gachibowli', 'HITEC City', 'Kondapur', 'Madhapur',
        'Kukatpally', 'Miyapur', 'Secunderabad', 'Banjara Hills',
    ],
    'Delhi NCR': [
        'Gurugram', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad',
        'Dwarka', 'Rohini', 'Vasant Kunj', 'Saket',
    ],
    'Chennai': [
        'OMR', 'Adyar', 'T. Nagar', 'Velachery', 'Anna Nagar',
        'Tambaram', 'Porur', 'Sholinganallur',
    ],
};

const cities = Object.keys(cityData);

function SearchableDropdown({ label, required, value, options, onChange, placeholder, error }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const filtered = useMemo(() => {
        if (!query) return options;
        return options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
    }, [query, options]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="ppf-field ppf-search-dropdown" ref={ref}>
            <label className="ppf-field-label">
                {label}{required && <span className="required">*</span>}
            </label>
            <input
                className={`ppf-input ${error ? 'error' : ''}`}
                type="text"
                placeholder={placeholder}
                value={open ? query : value}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (!open) setOpen(true);
                }}
                onFocus={() => {
                    setOpen(true);
                    setQuery('');
                }}
            />
            {open && filtered.length > 0 && (
                <div className="ppf-dropdown-list">
                    {filtered.map((opt) => (
                        <div
                            key={opt}
                            className={`ppf-dropdown-item ${opt === value ? 'highlighted' : ''}`}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                                setQuery('');
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="ppf-input-error">{error}</p>}
        </div>
    );
}

export default function Step2LocationDetails({ formData, updateField, errors }) {
    const localities = formData.city ? (cityData[formData.city] || []) : [];
    const isPlot = formData.propertyType === 'Plot / Land' || formData.propertyType === 'Commercial Land';
    const isHouse = formData.propertyType === 'Independent House / Villa';
    const showFloorNo = !isPlot && !isHouse;

    return (
        <div className="ppf-step-content" key="step2">
            <h2 className="ppf-heading">Where is your property located?</h2>

            <div className="ppf-form-row">
                <SearchableDropdown
                    label="City"
                    required
                    value={formData.city}
                    options={cities}
                    onChange={(val) => {
                        updateField('city', val);
                        updateField('locality', '');
                    }}
                    placeholder="Search city..."
                    error={errors.city}
                />
                <SearchableDropdown
                    label="Locality / Area"
                    required
                    value={formData.locality}
                    options={localities}
                    onChange={(val) => updateField('locality', val)}
                    placeholder={formData.city ? 'Search locality...' : 'Select city first'}
                    error={errors.locality}
                />
            </div>

            <div className="ppf-form-row">
                <div className="ppf-field">
                    <label className="ppf-field-label">Sub-locality</label>
                    <input
                        className="ppf-input"
                        type="text"
                        placeholder="Enter sub-locality"
                        value={formData.subLocality}
                        onChange={(e) => updateField('subLocality', e.target.value)}
                    />
                </div>
                <div className="ppf-field">
                    <label className="ppf-field-label">Landmark</label>
                    <input
                        className="ppf-input"
                        type="text"
                        placeholder="Nearby landmark"
                        value={formData.landmark}
                        onChange={(e) => updateField('landmark', e.target.value)}
                    />
                </div>
            </div>

            {formData.category === 'residential' && (
                <div className="ppf-field">
                    <label className="ppf-field-label">House / Flat No.</label>
                    <input
                        className="ppf-input"
                        type="text"
                        placeholder="e.g. A-102"
                        value={formData.flatNo}
                        onChange={(e) => updateField('flatNo', e.target.value)}
                        style={{ maxWidth: 280 }}
                    />
                </div>
            )}

            {!isPlot && (
                <div className="ppf-form-row">
                    <div className="ppf-field">
                        <label className="ppf-field-label">
                            Total Floors<span className="required">*</span>
                        </label>
                        <input
                            className={`ppf-input ${errors.totalFloors ? 'error' : ''}`}
                            type="number"
                            min="0"
                            placeholder="e.g. 12"
                            value={formData.totalFloors}
                            onChange={(e) => updateField('totalFloors', e.target.value)}
                            style={{ maxWidth: 200 }}
                        />
                        {errors.totalFloors && <p className="ppf-input-error">{errors.totalFloors}</p>}
                    </div>
                    {showFloorNo && (
                        <div className="ppf-field">
                            <label className="ppf-field-label">
                                Floor No.<span className="required">*</span>
                            </label>
                            <input
                                className={`ppf-input ${errors.floorNo ? 'error' : ''}`}
                                type="number"
                                min="0"
                                placeholder="e.g. 5"
                                value={formData.floorNo}
                                onChange={(e) => updateField('floorNo', e.target.value)}
                                style={{ maxWidth: 200 }}
                            />
                            {errors.floorNo && <p className="ppf-input-error">{errors.floorNo}</p>}
                        </div>
                    )}
                </div>
            )}

            <div className="ppf-field" style={{ marginTop: 'var(--space-4)' }}>
                <button
                    type="button"
                    className="ppf-pill"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    onClick={() => {/* Map integration placeholder */}}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Mark on map
                </button>
            </div>
        </div>
    );
}
