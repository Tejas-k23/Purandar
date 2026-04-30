import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Step1BasicDetails from '../../components/forms/post-property/Step1BasicDetails';
import Step2LocationDetails from '../../components/forms/post-property/Step2LocationDetails';
import Step3PropertyProfile from '../../components/forms/post-property/Step3PropertyProfile';
import Step4MediaUpload from '../../components/forms/post-property/Step4MediaUpload';
import Step5Amenities from '../../components/forms/post-property/Step5Amenities';
import propertyService from '../../services/propertyService';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import MobileVerificationCard from '../../components/auth/MobileVerificationCard';
import useAuth from '../../hooks/useAuth';
import { getIntentOptions, getPropertyValidationErrors, normalizePropertyType, prunePropertyFormData } from '../../utils/propertyFormConfig';
import './PostPropertyForm.css';

const initialState = {
  userName: 'User',
  displaySellerName: '',
  displaySellerPhone: '',
  displaySellerEmail: '',
  whatsappNumber: '',
  showWhatsappButton: false,
  responseTime: '',
  whatsappDisplayMode: 'original',
  useCustomWhatsappDetails: false,
  customWhatsappNumber: '',
  useOriginalSellerContact: true,
  contactDisplayMode: 'original',
  title: '',
  intent: 'sell', category: 'residential', propertyType: '', city: '', locality: '', subLocality: '', landmark: '', mapLink: '', flatNo: '', totalFloors: '', floorNo: '',
  bedrooms: '', bathrooms: '', balconies: '', totalArea: '', areaUnit: 'sq.ft', carpetArea: '', furnishing: '', availability: '', possessionMonth: '', possessionYear: '', propertyAge: '', ownership: '', price: '', priceNegotiable: false,
  securityDeposit: '', maintenance: '', mealsIncluded: false, plotArea: '', plotLength: '', plotWidth: '', boundaryWall: '', openSides: '', constructionDone: '', superBuiltUpArea: '', washroom: '', personalWashroom: '', pantry: '', coveredParking: '', openParking: '', warehouseHeight: '', loadingUnloading: '', floorsInProperty: '', floorArea: '',
  bedCount: '', cabinCount: '',
  tenantPreference: '',
  latitude: '',
  longitude: '',
  photos: [], videoUrl: '', societyAmenities: [], flatAmenities: [], facing: '', overlooking: [], waterSupply: '', gatedCommunity: '', description: '',
  videoFile: null,
};

const PROPERTY_DRAFT_KEY = 'purandar:property-form-draft';
const PROPERTY_STEP_KEY = 'purandar:property-form-step';

const STEPS = [
  { label: 'Basic Details', subtitle: 'Step 1' },
  { label: 'Location Details', subtitle: 'Step 2' },
  { label: 'Property Profile', subtitle: 'Step 3' },
  { label: 'Photos & Media', subtitle: 'Step 4' },
  { label: 'Amenities', subtitle: 'Step 5' },
];

function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'bulk':
      return { ...state, ...action.value };
    default:
      return state;
  }
}

const validateStep = (step, data) => getPropertyValidationErrors(step, data);

const mapPhotosForForm = (photos = []) => photos.map((photo, index) => ({
  id: Date.now() + index,
  url: typeof photo === 'string' ? photo : photo.url,
  category: 'Other',
  isCover: index === 0,
  isLocal: false,
}));

const buildPayload = (formData) => {
  const { videoFile: _videoFile, ...serializableData } = prunePropertyFormData(formData);
  return {
  ...serializableData,
  contactDisplayMode: formData.contactDisplayMode || (formData.useOriginalSellerContact ? 'original' : 'custom'),
  useOriginalSellerContact: (formData.contactDisplayMode || (formData.useOriginalSellerContact ? 'original' : 'custom')) === 'original',
  whatsappDisplayMode: formData.whatsappDisplayMode || (formData.useCustomWhatsappDetails ? 'custom' : 'original'),
  useCustomWhatsappDetails: (formData.whatsappDisplayMode || (formData.useCustomWhatsappDetails ? 'custom' : 'original')) === 'custom',
  intent: formData.intent === 'pg' ? 'rent' : formData.intent,
  photos: (formData.photos || [])
    .filter((photo) => !photo?.isLocal)
    .map((photo) => (typeof photo === 'string' ? photo : photo.url))
    .filter(Boolean),
  };
};

export default function PostPropertyForm() {
  const [formData, dispatch] = useReducer(reducer, initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showMobileVerificationPrompt, setShowMobileVerificationPrompt] = useState(true);
  const editId = searchParams.get('edit');
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadProperty = async () => {
      if (!editId) return;
      setLoading(true);
      try {
        let response;
        if (isAdminPath) {
          try {
            response = await adminService.getProperty(editId);
          } catch {
            response = await propertyService.getById(editId);
          }
        } else {
          response = await propertyService.getById(editId);
        }
        const property = response.data.data;
        const contactDisplayMode = property.contactDisplayMode || (property.useOriginalSellerContact === false ? 'custom' : 'original');
        const whatsappDisplayMode = property.whatsappDisplayMode || (property.useCustomWhatsappDetails ? 'custom' : 'original');
        dispatch({
          type: 'bulk',
          value: {
            ...property,
            propertyType: normalizePropertyType(property.propertyType),
            contactDisplayMode,
            useOriginalSellerContact: contactDisplayMode === 'original',
            whatsappDisplayMode,
            useCustomWhatsappDetails: whatsappDisplayMode === 'custom',
            photos: mapPhotosForForm(property.photos),
          },
        });
      } catch (error) {
        setStatusMessage(error.message || 'Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [editId, isAdminPath]);

  useEffect(() => {
    if (editId) return;
    try {
      const rawDraft = window.localStorage.getItem(PROPERTY_DRAFT_KEY);
      if (!rawDraft) return;
      const parsed = JSON.parse(rawDraft);
      dispatch({ type: 'bulk', value: prunePropertyFormData({ ...initialState, ...parsed, propertyType: normalizePropertyType(parsed.propertyType) }) });
    } catch {
      window.localStorage.removeItem(PROPERTY_DRAFT_KEY);
    }
  }, [editId]);

  useEffect(() => {
    if (editId) return;
    const savedStep = Number(window.localStorage.getItem(PROPERTY_STEP_KEY) || 1);
    if (savedStep >= 1 && savedStep <= STEPS.length) {
      setCurrentStep(savedStep);
    }
  }, [editId]);

  useEffect(() => {
    const target = document.getElementById('post-property-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const score = useMemo(() => {
    const fields = ['title', 'propertyType', 'city', 'locality', 'price', 'description'];
    const filled = fields.filter((field) => formData[field]).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  const updateField = (field, value) => dispatch({ type: 'set', field, value });

  useEffect(() => {
    const nextIntentOptions = getIntentOptions(formData.propertyType, formData.category);
    let nextState = formData;
    let changed = false;

    if (!nextIntentOptions.includes(formData.intent)) {
      nextState = { ...nextState, intent: nextIntentOptions[0] };
      changed = true;
    }

    const pruned = prunePropertyFormData(nextState);
    if (JSON.stringify(pruned) !== JSON.stringify(formData)) {
      dispatch({ type: 'bulk', value: pruned });
      return;
    }

    if (changed) {
      dispatch({ type: 'bulk', value: nextState });
    }
  }, [formData]);

  useEffect(() => {
    if (editId) return;
    const { photos, videoFile: _videoFile, ...serializableDraft } = formData;
    window.localStorage.setItem(PROPERTY_DRAFT_KEY, JSON.stringify({
      ...serializableDraft,
      photos: (photos || []).filter((photo) => !photo?.isLocal),
    }));
  }, [editId, formData]);

  useEffect(() => {
    if (editId) return;
    window.localStorage.setItem(PROPERTY_STEP_KEY, String(currentStep));
  }, [editId, currentStep]);

  const next = () => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((current) => Math.min(5, current + 1));
  };

  const submit = async () => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }

    if (!isAdminPath && user && !user.isMobileVerified) {
      setStatusMessage('Please verify your mobile number before submitting seller details.');
      navigate('/profile', {
        state: {
          verifyMobile: true,
          next: editId ? `/post-property/form?edit=${editId}` : '/post-property/form',
        },
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage('');
    try {
      const payload = buildPayload(formData);
      let propertyId = editId;
      if (editId) {
        const response = isAdminPath ? await adminService.updateProperty(editId, payload) : await propertyService.update(editId, payload);
        propertyId = response?.data?.data?._id || editId;
        setStatusMessage('Property updated successfully.');
      } else {
        const response = await propertyService.create(payload);
        propertyId = response?.data?.data?._id;
        setStatusMessage('');
      }

      const newImages = (formData.photos || []).filter((photo) => photo?.isLocal && photo?.file);
      if (propertyId && newImages.length) {
        await propertyService.uploadImages(propertyId, newImages.map((photo) => photo.file));
      }

      if (propertyId && formData.videoFile) {
        await propertyService.uploadVideos(propertyId, [formData.videoFile]);
      }

      if (!editId) {
        window.localStorage.removeItem(PROPERTY_DRAFT_KEY);
        window.localStorage.removeItem(PROPERTY_STEP_KEY);
        setSuccessDialog({
          title: 'Property submitted',
          message: 'Thanks! Our team will verify and approve your property. Once approved, it will appear in the listings.',
        });
      } else {
        setTimeout(() => navigate(isAdminPath ? '/admin/properties' : '/profile/properties'), 800);
      }
    } catch (error) {
      if (!editId && error?.status === 402) {
        setStatusMessage(error.message || 'Please buy a plan before posting a property.');
        setTimeout(() => navigate('/subscription'), 600);
        return;
      }
      setStatusMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1BasicDetails formData={formData} updateField={updateField} errors={errors} isAdmin={isAdmin} />;
      case 2: return <Step2LocationDetails formData={formData} updateField={updateField} errors={errors} />;
      case 3: return <Step3PropertyProfile formData={formData} updateField={updateField} errors={errors} />;
      case 4: return <Step4MediaUpload formData={formData} updateField={updateField} />;
      default: return <Step5Amenities formData={formData} updateField={updateField} errors={errors} />;
    }
  };

  if (loading) return <Loader label="Loading property for editing..." />;

  return (
    <section className="ppf-page" id="post-property-form">
      <ConfirmModal
        open={!!successDialog}
        title={successDialog?.title}
        message={successDialog?.message}
        confirmText="Got it"
        showCancel={false}
        tone="success"
        onClose={() => {
          setSuccessDialog(null);
          navigate(isAdminPath ? '/admin/properties' : '/profile/properties');
        }}
        onConfirm={() => {
          setSuccessDialog(null);
          navigate(isAdminPath ? '/admin/properties' : '/profile/properties');
        }}
      />
      <div className="ppf-layout">
        <aside className="ppf-sidebar">
          <div className="ppf-stepper">
            <ul className="ppf-stepper-list">
              {STEPS.map((step, index) => (
                <li key={step.label} className={`ppf-step-item ${index + 1 === currentStep ? 'active' : index + 1 < currentStep ? 'completed' : 'upcoming'}`}>
                  <div className="ppf-step-circle">{index + 1}</div>
                  <div className="ppf-step-text"><span className="ppf-step-label">{step.label}</span><span className="ppf-step-subtitle">{step.subtitle}</span></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ppf-score-card">
            <div className="ppf-score-value">{score}%</div>
            <h3 className="ppf-score-title">Listing readiness</h3>
          </div>
        </aside>
        <main className="ppf-main">
          <div className="ppf-form-card">
            {!isAdminPath && user && !user.isMobileVerified && showMobileVerificationPrompt ? (
              <div className="ppf-mobile-verify-banner">
                <MobileVerificationCard
                  title="Verify your mobile before publishing"
                  description="Verify your mobile number before you publish."
                  showSkip
                  onSkip={() => setShowMobileVerificationPrompt(false)}
                />
              </div>
            ) : null}
            {renderStep()}
            {statusMessage ? <p style={{ marginTop: 12 }}>{statusMessage}</p> : null}
            <div className="ppf-nav-buttons">
              <div>{currentStep > 1 ? <button type="button" className="ppf-btn-back" onClick={() => setCurrentStep((current) => current - 1)}>Back</button> : null}</div>
              <div>{currentStep < 5 ? <button type="button" className="ppf-btn-continue" onClick={next}>Continue</button> : <button type="button" className="ppf-btn-submit" onClick={submit} disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update Listing' : 'Submit Listing'}</button>}</div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

