import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Building, Wallet, Bed, SlidersHorizontal, Search, X, ChevronDown, MoveHorizontal, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildSearchQueryString, getAreaParams, getBudgetParams, parseSearchParams } from '../../utils/queryParams';
import './SearchBar.css';

const propertyTypes = [
  { label: 'Flat / Apartment', category: 'residential', needsBhk: true },
  { label: 'Independent House / Villa', category: 'residential', needsBhk: true },
  { label: 'Builder Floor', category: 'residential', needsBhk: true },
  { label: 'Plot / Land', category: 'residential', needsBhk: false },
  { label: '1 RK / Studio Apartment', category: 'residential', needsBhk: true },
  { label: 'Serviced Apartment', category: 'residential', needsBhk: true },
  { label: 'PG / Hostel', category: 'residential', needsBhk: false },
  { label: 'Farmhouse', category: 'residential', needsBhk: true },
  { label: 'Office Space', category: 'commercial', needsBhk: false },
  { label: 'Shop / Showroom', category: 'commercial', needsBhk: false },
  { label: 'Commercial Land', category: 'commercial', needsBhk: false },
  { label: 'Warehouse / Godown', category: 'commercial', needsBhk: false },
  { label: 'Industrial Building', category: 'commercial', needsBhk: false },
];

const bhkOptions = [
  { label: '1 BHK', value: '1' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4 BHK', value: '4' },
  { label: '5+ BHK', value: '5' },
];

const budgetOptions = [
  { label: 'Under INR 50L', value: 'under50l' },
  { label: 'INR 50L - INR 1Cr', value: 'from50lto1cr' },
  { label: 'INR 1Cr - INR 2Cr', value: 'from1crto2cr' },
  { label: 'INR 2Cr - INR 5Cr', value: 'from2crto5cr' },
  { label: 'Above INR 5Cr', value: 'above5cr' },
];

const areaOptions = [
  { label: 'Under 500 sq.ft', value: 'under500' },
  { label: '500-1000 sq.ft', value: 'from500to1000' },
  { label: '1000-2000 sq.ft', value: 'from1000to2000' },
  { label: '2000-5000 sq.ft', value: 'from2000to5000' },
  { label: 'Above 5000 sq.ft', value: 'above5000' },
];

const tenantOptions = [
  { label: 'Bachelors', value: 'bachelors' },
  { label: 'Family', value: 'family' },
];

const FilterChip = ({ icon: Icon, label, hasClose, hasDropdown, active, onClick, onDelete }) => (
  <div className={`filter-chip ${active ? 'active' : ''}`} onClick={onClick}>
    {Icon ? <Icon className="icon" /> : null}
    <span>{label}</span>
    {hasClose ? (
      <button className="btn-close" onClick={(event) => { event.stopPropagation(); onDelete?.(); }}>
        <X className="w-[14px] h-[14px]" />
      </button>
    ) : null}
    {hasDropdown ? <ChevronDown className="chevron-down" /> : null}
  </div>
);

export default function SearchBar({ intent = 'sell' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const routeFilters = useMemo(() => parseSearchParams(new URLSearchParams(location.search)), [location.search]);
  const [city, setCity] = useState(routeFilters.city || '');
  const [propertyType, setPropertyType] = useState(routeFilters.propertyType || '');
  const [bhk, setBhk] = useState(routeFilters.bedrooms || '');
  const [budget, setBudget] = useState(routeFilters.budget || '');
  const [area, setArea] = useState(routeFilters.area || '');
  const [tenantPreference, setTenantPreference] = useState(routeFilters.tenantPreference || '');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setCity(routeFilters.city || '');
    setPropertyType(routeFilters.propertyType || '');
    setBhk(routeFilters.bedrooms || '');
    setBudget(routeFilters.budget || '');
    setArea(routeFilters.area || '');
    setTenantPreference(routeFilters.tenantPreference || '');
  }, [routeFilters.city, routeFilters.propertyType, routeFilters.bedrooms, routeFilters.budget, routeFilters.area, routeFilters.tenantPreference]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTypeObj = propertyTypes.find((type) => type.label === propertyType);
  const showBhk = !propertyType || selectedTypeObj?.needsBhk;
  const showArea = !propertyType || !selectedTypeObj?.needsBhk || selectedTypeObj?.category === 'commercial';
  const showTenantPreference = intent === 'rent'
    && ['Flat / Apartment', '1 RK / Studio Apartment', 'Serviced Apartment'].includes(propertyType);

  useEffect(() => {
    if (!showTenantPreference && tenantPreference) {
      setTenantPreference('');
    }
  }, [showTenantPreference, tenantPreference]);

  const navigateWithFilters = ({
    nextCity = city,
    nextPropertyType = propertyType,
    nextBhk = bhk,
    nextBudget = budget,
    nextArea = area,
    nextTenantPreference = tenantPreference,
  } = {}) => {
    const targetPath = intent === 'rent' ? '/rent' : '/buy';
    const queryString = buildSearchQueryString({
      city: nextCity,
      propertyType: nextPropertyType,
      bedrooms: nextBhk,
      budget: nextBudget,
      area: nextArea,
      intent,
      tenantPreference: nextTenantPreference,
      sort: routeFilters.sort || 'newest',
      ...getBudgetParams(nextBudget),
      ...getAreaParams(nextArea),
    });

    navigate(`${targetPath}?${queryString}`);
  };

  const runSearch = () => {
    setMobileFiltersOpen(false);
    navigateWithFilters();
  };

  const clearField = (field) => {
    if (field === 'propertyType') {
      setPropertyType('');
      setBhk('');
      setArea('');
      setTenantPreference('');
      setActiveDropdown(null);
      navigateWithFilters({ nextPropertyType: '', nextBhk: '', nextArea: '', nextTenantPreference: '' });
      return;
    }
    if (field === 'bhk') {
      setBhk('');
      setActiveDropdown(null);
      navigateWithFilters({ nextBhk: '' });
      return;
    }
    if (field === 'area') {
      setArea('');
      setActiveDropdown(null);
      navigateWithFilters({ nextArea: '' });
      return;
    }
    if (field === 'budget') {
      setBudget('');
      setActiveDropdown(null);
      navigateWithFilters({ nextBudget: '' });
      return;
    }
    if (field === 'tenantPreference') {
      setTenantPreference('');
      setActiveDropdown(null);
      navigateWithFilters({ nextTenantPreference: '' });
    }
  };

  const clearAllFilters = () => {
    setCity('');
    setPropertyType('');
    setBhk('');
    setBudget('');
    setArea('');
    setTenantPreference('');
    setActiveDropdown(null);
    setMobileFiltersOpen(false);
    navigate(`${intent === 'rent' ? '/rent' : '/buy'}`);
  };

  const cityControl = (extraClass = '') => (
    <div className={`filter-city-input ${extraClass}`.trim()}>
      <MapPin className="icon" />
      <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Search city" className="filter-city-field" />
    </div>
  );

  const filterControls = (
    <>
      <div className="filter-dropdown-container">
        <FilterChip icon={Building} label={propertyType || 'Property Type'} hasDropdown active={!!propertyType} onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')} hasClose={!!propertyType} onDelete={() => clearField('propertyType')} />
        {activeDropdown === 'type' ? (
          <div className="dropdown-menu dropdown-grid">
            <p className="dropdown-label full-width">Residential</p>
            {propertyTypes.filter((item) => item.category === 'residential').map((type) => (
              <div key={type.label} className={`dropdown-item ${propertyType === type.label ? 'active' : ''}`} onClick={() => { setPropertyType(type.label); setActiveDropdown(null); }}>
                {type.label}
              </div>
            ))}
            <div className="dropdown-divider full-width" />
            <p className="dropdown-label full-width">Commercial</p>
            {propertyTypes.filter((item) => item.category === 'commercial').map((type) => (
              <div key={type.label} className={`dropdown-item ${propertyType === type.label ? 'active' : ''}`} onClick={() => { setPropertyType(type.label); setActiveDropdown(null); }}>
                {type.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showBhk ? (
        <div className="filter-dropdown-container">
          <FilterChip icon={Bed} label={bhkOptions.find((option) => option.value === bhk)?.label || 'BHK'} hasDropdown active={!!bhk} onClick={() => setActiveDropdown(activeDropdown === 'bhk' ? null : 'bhk')} hasClose={!!bhk} onDelete={() => clearField('bhk')} />
          {activeDropdown === 'bhk' ? (
            <div className="dropdown-menu">
              {bhkOptions.map((option) => (
                <div key={option.value} className={`dropdown-item ${bhk === option.value ? 'active' : ''}`} onClick={() => { setBhk(option.value); setActiveDropdown(null); }}>
                  {option.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showArea ? (
        <div className="filter-dropdown-container">
          <FilterChip icon={MoveHorizontal} label={areaOptions.find((option) => option.value === area)?.label || 'Area'} hasDropdown active={!!area} onClick={() => setActiveDropdown(activeDropdown === 'area' ? null : 'area')} hasClose={!!area} onDelete={() => clearField('area')} />
          {activeDropdown === 'area' ? (
            <div className="dropdown-menu">
              {areaOptions.map((option) => (
                <div key={option.value} className={`dropdown-item ${area === option.value ? 'active' : ''}`} onClick={() => { setArea(option.value); setActiveDropdown(null); }}>
                  {option.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {showTenantPreference ? (
        <div className="filter-dropdown-container">
          <FilterChip
            icon={Users}
            label={tenantOptions.find((option) => option.value === tenantPreference)?.label || 'Tenant'}
            hasDropdown
            active={!!tenantPreference}
            onClick={() => setActiveDropdown(activeDropdown === 'tenant' ? null : 'tenant')}
            hasClose={!!tenantPreference}
            onDelete={() => clearField('tenantPreference')}
          />
          {activeDropdown === 'tenant' ? (
            <div className="dropdown-menu">
              {tenantOptions.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-item ${tenantPreference === option.value ? 'active' : ''}`}
                  onClick={() => { setTenantPreference(option.value); setActiveDropdown(null); }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="filter-dropdown-container">
        <FilterChip icon={Wallet} label={budgetOptions.find((option) => option.value === budget)?.label || 'Budget'} hasDropdown active={!!budget} onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')} hasClose={!!budget} onDelete={() => clearField('budget')} />
        {activeDropdown === 'budget' ? (
          <div className="dropdown-menu">
            {budgetOptions.map((option) => (
              <div key={option.value} className={`dropdown-item ${budget === option.value ? 'active' : ''}`} onClick={() => { setBudget(option.value); setActiveDropdown(null); }}>
                {option.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="search-bar-wrapper" ref={searchRef}>
      <div className="search-bar">
        <div className="filter-row filter-row-desktop scrollbar-hide">
          {cityControl('filter-city-input--desktop')}
          {filterControls}
        </div>

        <div className="mobile-city-row">
          {cityControl('filter-city-input--mobile')}
        </div>

        <div className="search-actions">
          <button className={`btn-icon ${mobileFiltersOpen ? 'active' : ''}`} type="button" onClick={() => setMobileFiltersOpen((open) => !open)}>
            <SlidersHorizontal className="w-[18px] h-[18px]" />
            <span className="btn-icon-label">Filters</span>
          </button>
          <button className="btn-search" type="button" onClick={runSearch}>
            <Search className="w-4 h-4 text-white" />
            <span>Search</span>
          </button>
        </div>

        <div className={`mobile-filter-sheet ${mobileFiltersOpen ? 'open' : ''}`}>
          <div className="filter-row mobile-filter-grid">
            {filterControls}
          </div>
          <div className="mobile-filter-footer">
            <button className="mobile-clear-btn" type="button" onClick={clearAllFilters}>Clear all</button>
            <button className="mobile-apply-btn" type="button" onClick={runSearch}>Apply filters</button>
          </div>
        </div>
      </div>
    </div>
  );
}
