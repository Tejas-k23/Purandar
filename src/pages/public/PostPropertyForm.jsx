import React, { useReducer, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1BasicDetails from '../../components/forms/post-property/Step1BasicDetails';
import Step2LocationDetails from '../../components/forms/post-property/Step2LocationDetails';
import Step3PropertyProfile from '../../components/forms/post-property/Step3PropertyProfile';
import Step4MediaUpload from '../../components/forms/post-property/Step4MediaUpload';
import Step5Amenities from '../../components/forms/post-property/Step5Amenities';
import './PostPropertyForm.css';

/* ── initial state ────────────────────────────────────── */
const initialState = {
    userName: 'User',
    // Step 1
    intent: 'sell',
    category: 'residential',
    propertyType: '',
    // Step 2
    city: '',
    locality: '',
    subLocality: '',
    landmark: '',
    flatNo: '',
    totalFloors: '',
    floorNo: '',
    // Step 3
    bedrooms: '',
    bathrooms: '',
    balconies: '',
    totalArea: '',
    areaUnit: 'sq.ft',
    carpetArea: '',
    furnishing: '',
    availability: '',
    possessionMonth: '',
    possessionYear: '',
    propertyAge: '',
    ownership: '',
    price: '',
    priceNegotiable: false,
    securityDeposit: '',
    maintenance: '',
    mealsIncluded: false,
    plotArea: '',
    plotLength: '',
    plotWidth: '',
    boundaryWall: '',
    openSides: '',
    constructionDone: '',
    superBuiltUpArea: '',
    washroom: '',
    personalWashroom: '',
    pantry: '',
    coveredParking: '',
    openParking: '',
    warehouseHeight: '',
    loadingUnloading: '',
    floorsInProperty: '',
    floorArea: '',
    // Step 4
    photos: [],
    videoFile: null,
    videoUrl: '',
    audioFile: null,
    audioURL: '',
    // Step 5
    societyAmenities: [],
    flatAmenities: [],
    facing: '',
    overlooking: [],
    waterSupply: '',
    gatedCommunity: '',
    description: '',
};

function formReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

/* ── step metadata ────────────────────────────────────── */
const STEPS = [
    { label: 'Basic Details', subtitle: 'Step 1' },
    { label: 'Location Details', subtitle: 'Step 2' },
    { label: 'Property Profile', subtitle: 'Step 3' },
    { label: 'Photos & Media', subtitle: 'Step 4' },
    { label: 'Amenities', subtitle: 'Step 5' },
];

/* ── property score calculator ────────────────────────── */
const PLOT_TYPES = ['Plot / Land', 'Commercial Land'];
const HOUSE_NEED_FLOOR = ['Flat / Apartment', '1 RK / Studio Apartment', 'Builder Floor', 'Serviced Apartment'];

function calculateScore(data) {
    let filled = 0;
    let total = 0;

    // Step 1
    total += 3;
    if (data.intent) filled++;
    if (data.category) filled++;
    if (data.propertyType) filled++;

    // Step 2
    total += 2;
    if (data.city) filled++;
    if (data.locality) filled++;
    if (!PLOT_TYPES.includes(data.propertyType)) {
        total += 1;
        if (data.totalFloors) filled++;
    }
    if (HOUSE_NEED_FLOOR.includes(data.propertyType)) {
        total += 1;
        if (data.floorNo) filled++;
    }
    // bonus
    total += 1;
    if (data.subLocality) filled += 0.5;
    if (data.landmark) filled += 0.5;

    // Step 3
    total += 2;
    if (data.price) filled++;
    if (data.totalArea || data.plotArea || data.carpetArea) filled++;
    total += 3;
    if (data.furnishing) filled++;
    if (data.ownership) filled++;
    if (data.availability || PLOT_TYPES.includes(data.propertyType)) filled++;

    // Step 4
    total += 3;
    if (data.photos.length >= 3) filled += 3;
    else if (data.photos.length >= 1) filled += data.photos.length;

    // Step 5
    total += 3;
    if ((data.societyAmenities || []).length > 0) filled++;
    if (data.facing) filled++;
    if (data.description && data.description.length > 20) filled++;

    return Math.min(100, Math.round((filled / total) * 100));
}

/* ── per-step validation ──────────────────────────────── */
function validateStep(step, data) {
    const errors = {};

    if (step === 1) {
        if (!data.propertyType) errors.propertyType = 'Please select a property type';
    }

    if (step === 2) {
        if (!data.city) errors.city = 'City is required';
        if (!data.locality) errors.locality = 'Locality is required';
        if (!PLOT_TYPES.includes(data.propertyType)) {
            if (!data.totalFloors) errors.totalFloors = 'Total floors is required';
        }
        if (HOUSE_NEED_FLOOR.includes(data.propertyType)) {
            if (!data.floorNo) errors.floorNo = 'Floor number is required';
        }
    }

    if (step === 3) {
        if (!data.price) errors.price = 'Price is required';
        const isFlat = ['Flat / Apartment', '1 RK / Studio Apartment', 'Builder Floor',
            'Serviced Apartment', 'Independent House / Villa', 'Farmhouse'].includes(data.propertyType);
        if (isFlat && !data.totalArea) errors.totalArea = 'Area is required';
        if (PLOT_TYPES.includes(data.propertyType) && !data.plotArea) errors.plotArea = 'Plot area is required';
        if (['Office Space', 'Shop / Showroom'].includes(data.propertyType) && !data.carpetArea)
            errors.carpetArea = 'Carpet area is required';
        if (['Warehouse / Godown', 'Industrial Building'].includes(data.propertyType) && !data.plotArea)
            errors.plotArea = 'Plot area is required';
    }

    // Steps 4 & 5 have no blocking required fields
    return errors;
}

/* ── SVG components ───────────────────────────────────── */
function CheckIcon() {
    return (
        <svg className="check-svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function PropertyScoreRing({ score }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="ppf-score-ring-wrapper">
            <svg viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--indigo-500)" />
                        <stop offset="100%" stopColor="var(--violet-500)" />
                    </linearGradient>
                </defs>
                <circle className="ppf-score-bg" cx="50" cy="50" r={radius} />
                <circle
                    className="ppf-score-fill"
                    cx="50" cy="50" r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="ppf-score-value">{score}%</div>
        </div>
    );
}

/* ── main page component ──────────────────────────────── */
export default function PostPropertyForm() {
    const [formData, dispatch] = useReducer(formReducer, initialState);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const updateField = useCallback((field, value) => {
        dispatch({ type: 'UPDATE_FIELD', field, value });
    }, []);

    const score = useMemo(() => calculateScore(formData), [formData]);

    const handleNext = () => {
        const stepErrors = validateStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        setCurrentStep((s) => Math.min(s + 1, 5));
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setErrors({});
        setCurrentStep((s) => Math.max(s - 1, 1));
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = () => {
        const stepErrors = validateStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        console.log('📦 Property Submission:', formData);
        setShowSuccess(true);
    };

    const getStepStatus = (stepNum) => {
        if (stepNum < currentStep) return 'completed';
        if (stepNum === currentStep) return 'active';
        return 'upcoming';
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1BasicDetails formData={formData} updateField={updateField} errors={errors} />;
            case 2:
                return <Step2LocationDetails formData={formData} updateField={updateField} errors={errors} />;
            case 3:
                return <Step3PropertyProfile formData={formData} updateField={updateField} errors={errors} />;
            case 4:
                return <Step4MediaUpload formData={formData} updateField={updateField} />;
            case 5:
                return <Step5Amenities formData={formData} updateField={updateField} errors={errors} />;
            default:
                return null;
        }
    };

    /* ── success screen ── */
    if (showSuccess) {
        return (
            <section className="ppf-page" id="post-property-form">
                <div className="ppf-layout" style={{ justifyContent: 'center' }}>
                    <div className="ppf-main" style={{ maxWidth: 600 }}>
                        <div className="ppf-form-card">
                            <div className="ppf-success">
                                <div className="ppf-success-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h2>Property Listed Successfully! 🎉</h2>
                                <p>
                                    Your property has been submitted for review. You'll receive
                                    enquiries once it goes live. Check your dashboard for updates.
                                </p>
                                <button
                                    className="ppf-success-btn"
                                    onClick={() => navigate('/')}
                                >
                                    Go to Homepage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="ppf-page" id="post-property-form">
            <div className="ppf-layout">
                {/* ═══ LEFT SIDEBAR ═══ */}
                <aside className="ppf-sidebar">
                    {/* Stepper */}
                    <div className="ppf-stepper">
                        <ul className="ppf-stepper-list">
                            {STEPS.map((step, i) => {
                                const num = i + 1;
                                const status = getStepStatus(num);
                                return (
                                    <li key={num} className={`ppf-step-item ${status}`}>
                                        <div className="ppf-step-circle">
                                            {status === 'completed' ? (
                                                <CheckIcon />
                                            ) : status === 'active' ? (
                                                <span className="inner-dot" />
                                            ) : (
                                                num
                                            )}
                                        </div>
                                        <div className="ppf-step-text">
                                            <span className="ppf-step-label">{step.label}</span>
                                            <span className="ppf-step-subtitle">{step.subtitle}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Property Score */}
                    <div className="ppf-score-card">
                        <PropertyScoreRing score={score} />
                        <h3 className="ppf-score-title">Property Score</h3>
                        <p className="ppf-score-subtitle">
                            Better your property score, greater your visibility
                        </p>
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ppf-main">
                    <div className="ppf-form-card">
                        {renderStepContent()}

                        {/* Navigation */}
                        <div className="ppf-nav-buttons">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        className="ppf-btn-back"
                                        onClick={handleBack}
                                    >
                                        ← Back
                                    </button>
                                )}
                            </div>
                            <div>
                                {currentStep < 5 ? (
                                    <button
                                        type="button"
                                        className="ppf-btn-continue"
                                        onClick={handleNext}
                                    >
                                        Continue →
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="ppf-btn-submit"
                                        onClick={handleSubmit}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                            strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Submit Listing
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* ═══ RIGHT PANEL ═══ */}
                <aside className="ppf-right-panel">
                    <div className="ppf-help-widget">
                        <p className="ppf-help-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07
                                    19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0
                                    1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09
                                    9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84
                                    0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            Need help?
                        </p>
                        <p className="ppf-help-text">
                            Email us at<br />
                            <a href="mailto:support@urbanpremier.com">support@urbanpremier.com</a>
                            <br /><br />
                            Or call us at<br />
                            <strong>1800-123-4567</strong> (Toll-Free)
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}
