import React from 'react';

/* ── helpers ──────────────────────────────────────────── */
function CountSelector({ label, value, options, onChange }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <p className="ppf-field-label">{label}</p>
            <div className="ppf-count-selector">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        className={`ppf-count-pill ${value === opt ? 'active' : ''}`}
                        onClick={() => onChange(opt)}
                    >
                        {opt}
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
                {label}{required && <span className="required">*</span>}
            </label>
            <div className={`ppf-area-input-group ${error ? 'error' : ''}`}>
                <input
                    type="number"
                    placeholder="Enter area"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    min="0"
                />
                <div className="ppf-unit-toggle">
                    {['sq.ft', 'sq.mt', 'sq.yards'].map((u) => (
                        <button
                            key={u}
                            type="button"
                            className={`ppf-unit-btn ${unit === u ? 'active' : ''}`}
                            onClick={() => onUnitChange(u)}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>
            {error && <p className="ppf-input-error">{error}</p>}
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

/* property type classifiers */
const FLAT_TYPES = ['Flat / Apartment', '1 RK / Studio Apartment', 'Builder Floor', 'Serviced Apartment'];
const HOUSE_TYPES = ['Independent House / Villa', 'Farmhouse'];
const PLOT_TYPES = ['Plot / Land', 'Commercial Land'];
const COMMERCIAL_TYPES = ['Office Space', 'Shop / Showroom'];
const WAREHOUSE_TYPES = ['Warehouse / Godown', 'Industrial Building'];

function getTypeGroup(propertyType) {
    if (FLAT_TYPES.includes(propertyType)) return 'flat';
    if (HOUSE_TYPES.includes(propertyType)) return 'house';
    if (PLOT_TYPES.includes(propertyType)) return 'plot';
    if (COMMERCIAL_TYPES.includes(propertyType)) return 'commercial';
    if (WAREHOUSE_TYPES.includes(propertyType)) return 'warehouse';
    return 'flat'; // default
}

/* ── main component ───────────────────────────────────── */
export default function Step3PropertyProfile({ formData, updateField, errors }) {
    const typeGroup = getTypeGroup(formData.propertyType);
    const isRent = formData.intent === 'rent';
    const isPG = formData.intent === 'pg';
    const isSell = formData.intent === 'sell';

    const autoPerSqFt = (formData.price && formData.totalArea)
        ? Math.round(Number(formData.price) / Number(formData.totalArea))
        : null;

    return (
        <div className="ppf-step-content" key="step3">
            <h2 className="ppf-heading">Tell us about your property</h2>

            {/* ── Flat / Apartment / Builder Floor / House ── */}
            {(typeGroup === 'flat' || typeGroup === 'house') && (
                <>
                    <CountSelector
                        label="Bedrooms"
                        value={formData.bedrooms}
                        options={['1', '2', '3', '4', '4+']}
                        onChange={(v) => updateField('bedrooms', v)}
                    />
                    <CountSelector
                        label="Bathrooms"
                        value={formData.bathrooms}
                        options={['1', '2', '3', '4', '4+']}
                        onChange={(v) => updateField('bathrooms', v)}
                    />
                    <CountSelector
                        label="Balconies"
                        value={formData.balconies}
                        options={['0', '1', '2', '3', '3+']}
                        onChange={(v) => updateField('balconies', v)}
                    />

                    <div className="ppf-form-row">
                        <AreaInput
                            label="Total Area"
                            required
                            value={formData.totalArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('totalArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                            error={errors.totalArea}
                        />
                        <AreaInput
                            label="Carpet Area"
                            value={formData.carpetArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('carpetArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                        />
                    </div>

                    {typeGroup === 'house' && (
                        <div className="ppf-form-row">
                            <AreaInput
                                label="Plot Area"
                                required
                                value={formData.plotArea}
                                unit={formData.areaUnit}
                                onValueChange={(v) => updateField('plotArea', v)}
                                onUnitChange={(u) => updateField('areaUnit', u)}
                                error={errors.plotArea}
                            />
                            <div className="ppf-field">
                                <label className="ppf-field-label">
                                    No. of floors in property
                                </label>
                                <input
                                    className="ppf-input"
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 2"
                                    value={formData.floorsInProperty}
                                    onChange={(e) => updateField('floorsInProperty', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {formData.propertyType === 'Builder Floor' && (
                        <AreaInput
                            label="Plot Area"
                            value={formData.plotArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('plotArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                        />
                    )}

                    {/* Furnishing */}
                    <p className="ppf-section-label">Furnishing Status</p>
                    <div className="ppf-pill-group">
                        {['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map((f) => (
                            <button
                                key={f}
                                type="button"
                                className={`ppf-pill ${formData.furnishing === f ? 'active' : ''}`}
                                onClick={() => updateField('furnishing', f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Availability */}
                    <p className="ppf-section-label">Availability</p>
                    <div className="ppf-pill-group">
                        {['Ready to Move', 'Under Construction'].map((a) => (
                            <button
                                key={a}
                                type="button"
                                className={`ppf-pill ${formData.availability === a ? 'active' : ''}`}
                                onClick={() => updateField('availability', a)}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    {formData.availability === 'Under Construction' && (
                        <div className="ppf-form-row">
                            <div className="ppf-field">
                                <label className="ppf-field-label">Expected Possession Month</label>
                                <select
                                    className="ppf-select"
                                    value={formData.possessionMonth || ''}
                                    onChange={(e) => updateField('possessionMonth', e.target.value)}
                                >
                                    <option value="">Month</option>
                                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                                        <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ppf-field">
                                <label className="ppf-field-label">Year</label>
                                <select
                                    className="ppf-select"
                                    value={formData.possessionYear || ''}
                                    onChange={(e) => updateField('possessionYear', e.target.value)}
                                >
                                    <option value="">Year</option>
                                    {[2026, 2027, 2028, 2029, 2030].map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Age of Property */}
                    <div className="ppf-field">
                        <label className="ppf-field-label">Age of Property</label>
                        <select
                            className="ppf-select"
                            value={formData.propertyAge}
                            onChange={(e) => updateField('propertyAge', e.target.value)}
                            style={{ maxWidth: 280 }}
                        >
                            <option value="">Select</option>
                            <option value="0-1">0 – 1 Year</option>
                            <option value="1-5">1 – 5 Years</option>
                            <option value="5-10">5 – 10 Years</option>
                            <option value="10+">10+ Years</option>
                        </select>
                    </div>

                    {/* Ownership */}
                    <p className="ppf-section-label">Ownership</p>
                    <div className="ppf-pill-group">
                        {['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'].map((o) => (
                            <button
                                key={o}
                                type="button"
                                className={`ppf-pill ${formData.ownership === o ? 'active' : ''}`}
                                onClick={() => updateField('ownership', o)}
                            >
                                {o}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* ── Plot / Land ── */}
            {typeGroup === 'plot' && (
                <>
                    <AreaInput
                        label="Plot Area"
                        required
                        value={formData.plotArea}
                        unit={formData.areaUnit}
                        onValueChange={(v) => updateField('plotArea', v)}
                        onUnitChange={(u) => updateField('areaUnit', u)}
                        error={errors.plotArea}
                    />

                    <p className="ppf-section-label">Plot Dimensions (optional)</p>
                    <div className="ppf-form-row">
                        <div className="ppf-field">
                            <label className="ppf-field-label">Length (ft)</label>
                            <input
                                className="ppf-input"
                                type="number"
                                placeholder="Length"
                                value={formData.plotLength}
                                onChange={(e) => updateField('plotLength', e.target.value)}
                            />
                        </div>
                        <div className="ppf-field">
                            <label className="ppf-field-label">Width (ft)</label>
                            <input
                                className="ppf-input"
                                type="number"
                                placeholder="Width"
                                value={formData.plotWidth}
                                onChange={(e) => updateField('plotWidth', e.target.value)}
                            />
                        </div>
                    </div>

                    <p className="ppf-section-label">Ownership</p>
                    <div className="ppf-pill-group">
                        {['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney'].map((o) => (
                            <button
                                key={o}
                                type="button"
                                className={`ppf-pill ${formData.ownership === o ? 'active' : ''}`}
                                onClick={() => updateField('ownership', o)}
                            >
                                {o}
                            </button>
                        ))}
                    </div>

                    <p className="ppf-section-label">Boundary Wall</p>
                    <div className="ppf-pill-group">
                        {['Yes', 'No'].map((v) => (
                            <button
                                key={v}
                                type="button"
                                className={`ppf-pill ${formData.boundaryWall === v ? 'active' : ''}`}
                                onClick={() => updateField('boundaryWall', v)}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <CountSelector
                        label="Open Sides"
                        value={formData.openSides}
                        options={['1', '2', '3', '4']}
                        onChange={(v) => updateField('openSides', v)}
                    />

                    <p className="ppf-section-label">Any Construction Done?</p>
                    <div className="ppf-pill-group">
                        {['Yes', 'No'].map((v) => (
                            <button
                                key={v}
                                type="button"
                                className={`ppf-pill ${formData.constructionDone === v ? 'active' : ''}`}
                                onClick={() => updateField('constructionDone', v)}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* ── Commercial (Office / Shop) ── */}
            {typeGroup === 'commercial' && (
                <>
                    <div className="ppf-form-row">
                        <AreaInput
                            label="Carpet Area"
                            required
                            value={formData.carpetArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('carpetArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                            error={errors.carpetArea}
                        />
                        <AreaInput
                            label="Super Built-up Area"
                            value={formData.superBuiltUpArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('superBuiltUpArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                        />
                    </div>

                    <p className="ppf-section-label">Furnishing</p>
                    <div className="ppf-pill-group">
                        {['Bare Shell', 'Warm Shell', 'Fully Furnished'].map((f) => (
                            <button
                                key={f}
                                type="button"
                                className={`ppf-pill ${formData.furnishing === f ? 'active' : ''}`}
                                onClick={() => updateField('furnishing', f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="ppf-form-row">
                        <div>
                            <p className="ppf-section-label">Washroom</p>
                            <div className="ppf-pill-group">
                                {['Yes', 'No'].map((v) => (
                                    <button key={v} type="button"
                                        className={`ppf-pill ${formData.washroom === v ? 'active' : ''}`}
                                        onClick={() => updateField('washroom', v)}>{v}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="ppf-section-label">Personal Washroom</p>
                            <div className="ppf-pill-group">
                                {['Yes', 'No'].map((v) => (
                                    <button key={v} type="button"
                                        className={`ppf-pill ${formData.personalWashroom === v ? 'active' : ''}`}
                                        onClick={() => updateField('personalWashroom', v)}>{v}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="ppf-section-label">Pantry</p>
                    <div className="ppf-pill-group">
                        {['Yes', 'No'].map((v) => (
                            <button key={v} type="button"
                                className={`ppf-pill ${formData.pantry === v ? 'active' : ''}`}
                                onClick={() => updateField('pantry', v)}>{v}</button>
                        ))}
                    </div>

                    <div className="ppf-form-row">
                        <div className="ppf-field">
                            <label className="ppf-field-label">Avg. Monthly Maintenance (₹)</label>
                            <input className="ppf-input" type="number" placeholder="e.g. 5000"
                                value={formData.maintenance}
                                onChange={(e) => updateField('maintenance', e.target.value)} />
                        </div>
                    </div>

                    <p className="ppf-section-label">Car Parking</p>
                    <div className="ppf-form-row">
                        <div className="ppf-field">
                            <label className="ppf-field-label">Covered</label>
                            <input className="ppf-input" type="number" min="0" placeholder="0"
                                value={formData.coveredParking}
                                onChange={(e) => updateField('coveredParking', e.target.value)}
                                style={{ maxWidth: 120 }} />
                        </div>
                        <div className="ppf-field">
                            <label className="ppf-field-label">Open</label>
                            <input className="ppf-input" type="number" min="0" placeholder="0"
                                value={formData.openParking}
                                onChange={(e) => updateField('openParking', e.target.value)}
                                style={{ maxWidth: 120 }} />
                        </div>
                    </div>
                </>
            )}

            {/* ── Warehouse / Industrial ── */}
            {typeGroup === 'warehouse' && (
                <>
                    <div className="ppf-form-row">
                        <AreaInput
                            label="Plot Area"
                            required
                            value={formData.plotArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('plotArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                            error={errors.plotArea}
                        />
                        <AreaInput
                            label="Floor Area"
                            value={formData.floorArea}
                            unit={formData.areaUnit}
                            onValueChange={(v) => updateField('floorArea', v)}
                            onUnitChange={(u) => updateField('areaUnit', u)}
                        />
                    </div>

                    <div className="ppf-field">
                        <label className="ppf-field-label">Height of Warehouse (ft)</label>
                        <input className="ppf-input" type="number" placeholder="e.g. 20"
                            value={formData.warehouseHeight}
                            onChange={(e) => updateField('warehouseHeight', e.target.value)}
                            style={{ maxWidth: 200 }} />
                    </div>

                    <p className="ppf-section-label">Loading / Unloading</p>
                    <div className="ppf-pill-group">
                        {['Yes', 'No'].map((v) => (
                            <button key={v} type="button"
                                className={`ppf-pill ${formData.loadingUnloading === v ? 'active' : ''}`}
                                onClick={() => updateField('loadingUnloading', v)}>{v}</button>
                        ))}
                    </div>
                </>
            )}

            <hr className="ppf-divider" />

            {/* ── Pricing (all types) ── */}
            <p className="ppf-section-label" style={{ fontSize: '1.05rem' }}>💰 Pricing</p>

            {isSell && (
                <>
                    <div className="ppf-field">
                        <label className="ppf-field-label">
                            Total Price (₹)<span className="required">*</span>
                        </label>
                        <input
                            className={`ppf-input ${errors.price ? 'error' : ''}`}
                            type="number"
                            placeholder="e.g. 5000000"
                            value={formData.price}
                            onChange={(e) => updateField('price', e.target.value)}
                            style={{ maxWidth: 320 }}
                        />
                        {autoPerSqFt && (
                            <p className="ppf-auto-calc">
                                ≈ ₹{autoPerSqFt.toLocaleString('en-IN')} per {formData.areaUnit}
                            </p>
                        )}
                        {errors.price && <p className="ppf-input-error">{errors.price}</p>}
                    </div>
                </>
            )}

            {isRent && (
                <div className="ppf-form-row">
                    <div className="ppf-field">
                        <label className="ppf-field-label">
                            Monthly Rent (₹)<span className="required">*</span>
                        </label>
                        <input
                            className={`ppf-input ${errors.price ? 'error' : ''}`}
                            type="number" placeholder="e.g. 25000"
                            value={formData.price}
                            onChange={(e) => updateField('price', e.target.value)} />
                        {errors.price && <p className="ppf-input-error">{errors.price}</p>}
                    </div>
                    <div className="ppf-field">
                        <label className="ppf-field-label">Security Deposit (₹)</label>
                        <input className="ppf-input" type="number" placeholder="e.g. 50000"
                            value={formData.securityDeposit}
                            onChange={(e) => updateField('securityDeposit', e.target.value)} />
                    </div>
                    <div className="ppf-field">
                        <label className="ppf-field-label">Maintenance (₹/month)</label>
                        <input className="ppf-input" type="number" placeholder="e.g. 3000"
                            value={formData.maintenance}
                            onChange={(e) => updateField('maintenance', e.target.value)} />
                    </div>
                </div>
            )}

            {isPG && (
                <>
                    <div className="ppf-form-row">
                        <div className="ppf-field">
                            <label className="ppf-field-label">
                                Monthly Rent (₹)<span className="required">*</span>
                            </label>
                            <input
                                className={`ppf-input ${errors.price ? 'error' : ''}`}
                                type="number" placeholder="e.g. 8000"
                                value={formData.price}
                                onChange={(e) => updateField('price', e.target.value)} />
                            {errors.price && <p className="ppf-input-error">{errors.price}</p>}
                        </div>
                        <div className="ppf-field">
                            <label className="ppf-field-label">Security Deposit (₹)</label>
                            <input className="ppf-input" type="number" placeholder="e.g. 10000"
                                value={formData.securityDeposit}
                                onChange={(e) => updateField('securityDeposit', e.target.value)} />
                        </div>
                    </div>
                    <Toggle
                        label="Meals Included"
                        value={formData.mealsIncluded}
                        onChange={(v) => updateField('mealsIncluded', v)}
                    />
                </>
            )}

            <Toggle
                label="Price Negotiable"
                value={formData.priceNegotiable}
                onChange={(v) => updateField('priceNegotiable', v)}
            />
        </div>
    );
}
