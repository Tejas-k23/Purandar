import React, { useState } from 'react';
import {
    Home, MapPin, Layers, Ruler, Bed, Bath, Wind,
    Building2, Tag, CheckCircle, CalendarDays, Key,
    Droplets, Shield, AlignLeft, ChevronDown, ChevronUp,
    IndianRupee, Wallet
} from 'lucide-react';

/* ── single stat cell (used in 2-col grid) ── */
function StatCell({ icon: Icon, label, value }) {
    if (!value || value === '' || value === '0' || value === 'N/A') return null;
    return (
        <div className="pd-stat-cell">
            <div className="pd-stat-cell-icon">
                <Icon size={15} />
            </div>
            <div className="pd-stat-cell-body">
                <span className="pd-stat-cell-label">{label}</span>
                <span className="pd-stat-cell-value">{value}</span>
            </div>
        </div>
    );
}

/* ── chip list ── */
function ChipList({ items = [] }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="pd-chip-list">
            {items.map(item => (
                <span key={item} className="pd-info-chip">
                    <CheckCircle size={11} />
                    {item}
                </span>
            ))}
        </div>
    );
}

/* ── section wrapper ── */
function InfoSection({ title, children }) {
    return (
        <div className="pd-info-section">
            <h3 className="pd-info-section-title">{title}</h3>
            {children}
        </div>
    );
}

/* ── main component ── */
export default function PropertyInfoPanel({ property = {} }) {
    const [showAllSociety, setShowAllSociety] = useState(false);
    const [showAllFlat, setShowAllFlat] = useState(false);

    const {
        intent = 'sell',
        category = 'residential',
        propertyType = 'Flat / Apartment',
        city = '',
        locality = '',
        subLocality = '',
        landmark = '',
        flatNo = '',
        totalFloors = '',
        floorNo = '',
        bedrooms = '',
        bathrooms = '',
        balconies = '',
        totalArea = '',
        areaUnit = 'sq.ft',
        carpetArea = '',
        plotArea = '',
        furnishing = '',
        availability = '',
        possessionMonth = '',
        possessionYear = '',
        propertyAge = '',
        ownership = '',
        price = '',
        priceNegotiable = false,
        securityDeposit = '',
        maintenance = '',
        societyAmenities = [],
        flatAmenities = [],
        facing = '',
        overlooking = [],
        waterSupply = '',
        gatedCommunity = '',
    } = property;

    const intentLabel = intent === 'sell' ? 'For Sale' : intent === 'rent' ? 'For Rent' : 'PG / Hostel';
    const catLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
    const floorStr = (floorNo && totalFloors) ? `${floorNo} / ${totalFloors}` : totalFloors ? `${totalFloors}` : '';
    const possession = availability === 'Under Construction' && (possessionMonth || possessionYear)
        ? `Under Construction${possessionYear ? ` (${possessionYear})` : ''}`
        : availability || '';
    const address = [flatNo, locality, subLocality, city].filter(Boolean).join(', ');
    const VISIBLE = 9;

    return (
        <div className="pd-info-panel">
            <h2 className="pd-section-title">Property Details</h2>

            {/* ── Basic info: 2-col grid ── */}
            <InfoSection title="Overview">
                <div className="pd-stat-grid-2">
                    <StatCell icon={Tag}          label="Listing Type"    value={intentLabel} />
                    <StatCell icon={Home}          label="Category"        value={catLabel} />
                    <StatCell icon={Building2}     label="Property Type"   value={propertyType} />
                    <StatCell icon={Key}           label="Ownership"       value={ownership} />
                    <StatCell icon={CheckCircle}   label="Availability"    value={possession} />
                    <StatCell icon={CalendarDays}  label="Property Age"    value={propertyAge ? `${propertyAge} yrs` : ''} />
                    <StatCell icon={Shield}        label="Gated Community" value={gatedCommunity} />
                    <StatCell icon={AlignLeft}     label="Facing"          value={facing} />
                    <StatCell icon={Droplets}      label="Water Supply"    value={waterSupply} />
                    <StatCell icon={AlignLeft}     label="Overlooking"     value={overlooking?.join(', ')} />
                </div>
            </InfoSection>

            {/* ── Location ── */}
            {(address || landmark) && (
                <InfoSection title="Location">
                    <div className="pd-stat-grid-2">
                        {address && <StatCell icon={MapPin} label="Address"   value={address} />}
                        {landmark && <StatCell icon={MapPin} label="Landmark"  value={`Near ${landmark}`} />}
                        {floorStr && <StatCell icon={Layers} label="Floor"     value={floorStr} />}
                    </div>
                </InfoSection>
            )}

            {/* ── Size ── */}
            {(bedrooms || bathrooms || balconies || totalArea || carpetArea || plotArea) && (
                <InfoSection title="Size & Structure">
                    <div className="pd-stat-grid-2">
                        {bedrooms  && <StatCell icon={Bed}   label="Bedrooms"    value={`${bedrooms} BHK`} />}
                        {bathrooms && <StatCell icon={Bath}  label="Bathrooms"   value={bathrooms} />}
                        {balconies && <StatCell icon={Wind}  label="Balconies"   value={balconies} />}
                        {furnishing && <StatCell icon={Home} label="Furnishing"  value={furnishing} />}
                        {totalArea && <StatCell icon={Ruler} label="Total Area"  value={`${totalArea} ${areaUnit}`} />}
                        {carpetArea && <StatCell icon={Ruler} label="Carpet Area" value={`${carpetArea} ${areaUnit}`} />}
                        {plotArea  && <StatCell icon={Ruler} label="Plot Area"   value={`${plotArea} ${areaUnit}`} />}
                    </div>
                </InfoSection>
            )}

            {/* ── Pricing ── */}
            {(price || securityDeposit || maintenance) && (
                <InfoSection title="Pricing">
                    <div className="pd-stat-grid-2">
                        {price && (
                            <StatCell
                                icon={IndianRupee}
                                label={intent === 'sell' ? 'Total Price' : 'Monthly Rent'}
                                value={`₹${Number(price).toLocaleString('en-IN')}${priceNegotiable ? ' (Negotiable)' : ''}`}
                            />
                        )}
                        {securityDeposit && (
                            <StatCell icon={Shield}  label="Security Deposit" value={`₹${Number(securityDeposit).toLocaleString('en-IN')}`} />
                        )}
                        {maintenance && (
                            <StatCell icon={Wallet}  label="Maintenance"      value={`₹${Number(maintenance).toLocaleString('en-IN')}/mo`} />
                        )}
                    </div>
                </InfoSection>
            )}

            {/* ── Society Amenities ── */}
            {societyAmenities?.length > 0 && (
                <InfoSection title="🏢 Society Amenities">
                    <ChipList items={showAllSociety ? societyAmenities : societyAmenities.slice(0, VISIBLE)} />
                    {societyAmenities.length > VISIBLE && (
                        <button className="pd-show-more-btn" onClick={() => setShowAllSociety(s => !s)}>
                            {showAllSociety
                                ? <><ChevronUp size={13} /> Show less</>
                                : <><ChevronDown size={13} /> +{societyAmenities.length - VISIBLE} more</>}
                        </button>
                    )}
                </InfoSection>
            )}

            {/* ── Flat Amenities ── */}
            {flatAmenities?.length > 0 && (
                <InfoSection title="🏠 Flat / Unit Amenities">
                    <ChipList items={showAllFlat ? flatAmenities : flatAmenities.slice(0, VISIBLE)} />
                    {flatAmenities.length > VISIBLE && (
                        <button className="pd-show-more-btn" onClick={() => setShowAllFlat(s => !s)}>
                            {showAllFlat
                                ? <><ChevronUp size={13} /> Show less</>
                                : <><ChevronDown size={13} /> +{flatAmenities.length - VISIBLE} more</>}
                        </button>
                    )}
                </InfoSection>
            )}
        </div>
    );
}
