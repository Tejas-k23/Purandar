import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Building, Wallet, Bed, SlidersHorizontal, Search, X, ChevronDown, MoveHorizontal } from 'lucide-react';
import './SearchBar.css';

const propertyTypes = [
    { label: 'Flat / Apartment', category: 'residential', needsBhk: true },
    { label: 'Independent House / Villa', category: 'residential', needsBhk: true },
    { label: 'Builder Floor', category: 'residential', needsBhk: true },
    { label: 'Plot / Land', category: 'residential', needsBhk: false },
    { label: '1 RK / Studio Apartment', category: 'residential', needsBhk: true },
    { label: 'Serviced Apartment', category: 'residential', needsBhk: true },
    { label: 'Farmhouse', category: 'residential', needsBhk: true },
    { label: 'Office Space', category: 'commercial', needsBhk: false },
    { label: 'Shop / Showroom', category: 'commercial', needsBhk: false },
    { label: 'Commercial Land', category: 'commercial', needsBhk: false },
    { label: 'Warehouse / Godown', category: 'commercial', needsBhk: false },
    { label: 'Industrial Building', category: 'commercial', needsBhk: false },
];

const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
const budgetOptions = ['Under ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr', 'Above ₹5Cr'];
const areaOptions = ['Under 500 sq.ft', '500-1000 sq.ft', '1000-2000 sq.ft', '2000-5000 sq.ft', 'Above 5000 sq.ft'];

const FilterChip = ({ icon: Icon, label, hasClose, hasDropdown, active, onClick, onDelete }) => {
    return (
        <div className={`filter-chip ${active ? 'active' : ''}`} onClick={onClick}>
            {Icon && <Icon className="icon" />}
            <span>{label}</span>
            {hasClose && (
                <button 
                    className="btn-close" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                >
                    <X className="w-[14px] h-[14px]" />
                </button>
            )}
            {hasDropdown && (
                <ChevronDown className="chevron-down" />
            )}
        </div>
    );
};

export default function SearchBar() {
    const [propertyType, setPropertyType] = useState('');
    const [bhk, setBhk] = useState('');
    const [budget, setBudget] = useState('');
    const [area, setArea] = useState('');
    const [location, setLocation] = useState('Budva, Montenegro');
    
    const [activeDropdown, setActiveDropdown] = useState(null); // 'type' | 'bhk' | 'budget' | 'area'
    const searchRef = useRef(null);

    const selectedTypeObj = propertyTypes.find(t => t.label === propertyType);
    const showBhk = !propertyType || selectedTypeObj?.needsBhk;
    const showArea = !propertyType || !selectedTypeObj?.needsBhk || selectedTypeObj?.category === 'commercial';

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const handleSelect = (setter, value) => {
        setter(value);
        setActiveDropdown(null);
    };

    const handleTypeSelect = (typeLabel) => {
        setPropertyType(typeLabel);
        setBhk(''); // Clear BHK when type changes
        setArea(''); // Clear Area when type changes
        setActiveDropdown(null);
    };

    return (
        <div className="search-bar-wrapper" ref={searchRef}>
            <div className="search-bar">
                {/* Scrollable Filters Row */}
                <div className="filter-row scrollbar-hide">
                    {/* Location */}
                    <FilterChip 
                        icon={MapPin} 
                        label={location} 
                        active={!!location}
                    />

                    {/* Property Type Dropdown */}
                    <div className="filter-dropdown-container">
                        <FilterChip 
                            icon={Building} 
                            label={propertyType || 'Property Type'} 
                            hasDropdown 
                            active={!!propertyType}
                            onClick={() => toggleDropdown('type')}
                            hasClose={!!propertyType}
                            onDelete={() => {
                                setPropertyType('');
                                setBhk('');
                                setArea('');
                            }}
                        />
                        {activeDropdown === 'type' && (
                            <div className="dropdown-menu dropdown-grid">
                                <p className="dropdown-label full-width">Residential</p>
                                {propertyTypes.filter(t => t.category === 'residential').map(type => (
                                    <div 
                                        key={type.label} 
                                        className={`dropdown-item ${propertyType === type.label ? 'active' : ''}`}
                                        onClick={() => handleTypeSelect(type.label)}
                                    >
                                        {type.label}
                                    </div>
                                ))}
                                <div className="dropdown-divider full-width" />
                                <p className="dropdown-label full-width">Commercial</p>
                                {propertyTypes.filter(t => t.category === 'commercial').map(type => (
                                    <div 
                                        key={type.label} 
                                        className={`dropdown-item ${propertyType === type.label ? 'active' : ''}`}
                                        onClick={() => handleTypeSelect(type.label)}
                                    >
                                        {type.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BHK Dropdown (Condition: Only for Residential Non-Land) */}
                    {showBhk && (
                        <div className="filter-dropdown-container">
                            <FilterChip 
                                icon={Bed} 
                                label={bhk || 'BHK'} 
                                hasDropdown 
                                active={!!bhk}
                                onClick={() => toggleDropdown('bhk')}
                                hasClose={!!bhk}
                                onDelete={() => setBhk('')}
                            />
                            {activeDropdown === 'bhk' && (
                                <div className="dropdown-menu">
                                    {bhkOptions.map(opt => (
                                        <div 
                                            key={opt} 
                                            className={`dropdown-item ${bhk === opt ? 'active' : ''}`}
                                            onClick={() => handleSelect(setBhk, opt)}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Area Dropdown (Condition: For Lands or Commercial) */}
                    {showArea && (
                        <div className="filter-dropdown-container">
                            <FilterChip 
                                icon={MoveHorizontal} 
                                label={area || 'Area'} 
                                hasDropdown 
                                active={!!area}
                                onClick={() => toggleDropdown('area')}
                                hasClose={!!area}
                                onDelete={() => setArea('')}
                            />
                            {activeDropdown === 'area' && (
                                <div className="dropdown-menu">
                                    {areaOptions.map(opt => (
                                        <div 
                                            key={opt} 
                                            className={`dropdown-item ${area === opt ? 'active' : ''}`}
                                            onClick={() => handleSelect(setArea, opt)}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Budget Dropdown */}
                    <div className="filter-dropdown-container">
                        <FilterChip 
                            icon={Wallet} 
                            label={budget || 'Budget'} 
                            hasDropdown 
                            active={!!budget}
                            onClick={() => toggleDropdown('budget')}
                            hasClose={!!budget}
                            onDelete={() => setBudget('')}
                        />
                        {activeDropdown === 'budget' && (
                            <div className="dropdown-menu">
                                {budgetOptions.map(opt => (
                                    <div 
                                        key={opt} 
                                        className={`dropdown-item ${budget === opt ? 'active' : ''}`}
                                        onClick={() => handleSelect(setBudget, opt)}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="search-actions">
                    <button className="btn-icon">
                        <SlidersHorizontal className="w-[18px] h-[18px]" />
                    </button>
                    <button className="btn-search">
                        <Search className="w-4 h-4 text-white" />
                        <span>Search</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

