import React, { useState } from 'react';
import { MapPinned } from 'lucide-react';
import MapPickerModal from '../../common/MapPickerModal';
import VillageFirstCityInput from '../../common/VillageFirstCityInput';
import env from '../../../config/env';
import { getVisibleLocationFieldKeys } from '../../../utils/propertyFormConfig';

export default function Step2LocationDetails({ formData, updateField, errors }) {
    const visibleLocationFields = getVisibleLocationFieldKeys(formData.propertyType, formData.category);
    const showFlatNo = visibleLocationFields.has('flatNo');
    const showTotalFloors = visibleLocationFields.has('totalFloors');
    const showFloorNo = visibleLocationFields.has('floorNo');
    const [mapOpen, setMapOpen] = useState(false);
    const hasCoords = formData.latitude && formData.longitude;
    const mapDisabled = !env.mapboxAccessToken;

    const handleCitySelect = ({ source, feature, village }) => {
        if (source === 'village' && village) {
            updateField('city', village.name);
            updateField('latitude', village.latitude);
            updateField('longitude', village.longitude);
            return;
        }

        const city = feature?.text || feature?.place_name || '';
        const [longitude, latitude] = feature?.center || [];

        if (city) {
            updateField('city', city);
        }
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            updateField('latitude', latitude);
            updateField('longitude', longitude);
        }
    };

    return (
        <div className="ppf-step-content" key="step2">
            <h2 className="ppf-heading"><span className="ppf-heading-icon"><MapPinned size={18} /></span>Where is your property located?</h2>

            <div className="ppf-form-row">
                <div className="ppf-field">
                    <label className="ppf-field-label">
                        City<span className="required">*</span>
                    </label>
                    <VillageFirstCityInput
                        name="city"
                        value={formData.city}
                        placeholder="Search village or city"
                        onChange={(val) => {
                            updateField('city', val);
                            updateField('locality', '');
                            updateField('latitude', '');
                            updateField('longitude', '');
                        }}
                        onSelect={handleCitySelect}
                        error={!!errors.city}
                    />
                    {errors.city && <p className="ppf-input-error">{errors.city}</p>}
                </div>
                <div className="ppf-field">
                    <label className="ppf-field-label">
                        Locality / Area<span className="required">*</span>
                    </label>
                    <input
                        name="locality"
                        className={`ppf-input ${errors.locality ? 'error' : ''}`}
                        type="text"
                        placeholder="Type locality or area"
                        value={formData.locality}
                        onChange={(e) => updateField('locality', e.target.value)}
                    />
                    {errors.locality && <p className="ppf-input-error">{errors.locality}</p>}
                </div>
            </div>

            <div className="ppf-form-row">
                <div className="ppf-field">
                    <label className="ppf-field-label">Sub-locality</label>
                    <input
                        name="subLocality"
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
                        name="landmark"
                        className="ppf-input"
                        type="text"
                        placeholder="Nearby landmark"
                        value={formData.landmark}
                        onChange={(e) => updateField('landmark', e.target.value)}
                    />
                </div>
            </div>

            {showFlatNo ? (
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
            ) : null}

            {showTotalFloors ? (
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
                    {showFloorNo ? (
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
                    ) : null}
                </div>
            ) : null}

            <div className="ppf-field" style={{ marginTop: 'var(--space-4)' }}>
                <label className="ppf-field-label">
                    Pin on Map<span className="required">*</span>
                </label>
                <button
                    type="button"
                    className={`ppf-pill ${errors.latitude || errors.longitude ? 'error' : ''}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    onClick={() => setMapOpen(true)}
                    disabled={mapDisabled}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Mark on map
                </button>
                {hasCoords ? (
                    <p className="ppf-field-hint" style={{ marginTop: 8 }}>
                        Selected: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                    </p>
                ) : null}
                {errors.latitude || errors.longitude ? (
                    <p className="ppf-input-error" style={{ marginTop: 8 }}>
                        {errors.latitude || errors.longitude}
                    </p>
                ) : null}
                {mapDisabled ? (
                    <p className="ppf-input-error" style={{ marginTop: 8 }}>
                        Mapbox token missing. Add `VITE_MAPBOX_ACCESS_TOKEN` to enable map selection.
                    </p>
                ) : null}
            </div>

            <MapPickerModal
                open={mapOpen}
                title="Mark property on map"
                initialLocation={hasCoords ? { latitude: Number(formData.latitude), longitude: Number(formData.longitude) } : undefined}
                onClose={() => setMapOpen(false)}
                onSelect={({ latitude, longitude }) => {
                    updateField('latitude', latitude);
                    updateField('longitude', longitude);
                    setMapOpen(false);
                }}
            />
        </div>
    );
}

