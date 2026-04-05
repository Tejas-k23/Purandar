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
import useAuth from '../../hooks/useAuth';
import './PostPropertyForm.css';

const initialState = {
  userName: 'User',
  displaySellerName: '',
  displaySellerPhone: '',
  displaySellerEmail: '',
  useOriginalSellerContact: true,
  contactDisplayMode: 'original',
  title: '',
  intent: 'sell', category: 'residential', propertyType: '', city: '', locality: '', subLocality: '', landmark: '', flatNo: '', totalFloors: '', floorNo: '',
  bedrooms: '', bathrooms: '', balconies: '', totalArea: '', areaUnit: 'sq.ft', carpetArea: '', furnishing: '', availability: '', possessionMonth: '', possessionYear: '', propertyAge: '', ownership: '', price: '', priceNegotiable: false,
  securityDeposit: '', maintenance: '', mealsIncluded: false, plotArea: '', plotLength: '', plotWidth: '', boundaryWall: '', openSides: '', constructionDone: '', superBuiltUpArea: '', washroom: '', personalWashroom: '', pantry: '', coveredParking: '', openParking: '', warehouseHeight: '', loadingUnloading: '', floorsInProperty: '', floorArea: '',
  tenantPreference: '',
  latitude: '',
  longitude: '',
  photos: [], videoUrl: '', audioURL: '', societyAmenities: [], flatAmenities: [], facing: '', overlooking: [], waterSupply: '', gatedCommunity: '', description: '',
};

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

const validateStep = (step, data) => {
  const errors = {};
  if (step === 1) {
    if (!data.propertyType) errors.propertyType = 'Please select a property type';
    if (data.contactDisplayMode === 'custom') {
      if (!data.displaySellerName?.trim()) errors.displaySellerName = 'Seller name is required';
      if (!data.displaySellerPhone?.trim()) errors.displaySellerPhone = 'Seller phone is required';
      if (!data.displaySellerEmail?.trim()) errors.displaySellerEmail = 'Seller email is required';
    }
  }
  if (step === 2) {
    if (!data.city) errors.city = 'City is required';
    if (!data.locality) errors.locality = 'Locality is required';
  }
  if (step === 3 && !data.price) errors.price = 'Price is required';
  return errors;
};

const mapPhotosForForm = (photos = []) => photos.map((photo, index) => ({
  id: Date.now() + index,
  url: typeof photo === 'string' ? photo : photo.url,
  category: 'Other',
  isCover: index === 0,
  isLocal: false,
}));

const buildPayload = (formData) => ({
  ...formData,
  contactDisplayMode: formData.contactDisplayMode || (formData.useOriginalSellerContact ? 'original' : 'custom'),
  useOriginalSellerContact: (formData.contactDisplayMode || (formData.useOriginalSellerContact ? 'original' : 'custom')) === 'original',
  intent: formData.intent === 'pg' ? 'rent' : formData.intent,
  photos: (formData.photos || [])
    .filter((photo) => !photo?.isLocal)
    .map((photo) => (typeof photo === 'string' ? photo : photo.url))
    .filter(Boolean),
});

export default function PostPropertyForm() {
  const [formData, dispatch] = useReducer(reducer, initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const editId = searchParams.get('edit');
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadProperty = async () => {
      if (!editId) return;
      setLoading(true);
      try {
        const response = isAdminPath ? await adminService.getProperty(editId) : await propertyService.getById(editId);
        const property = response.data.data;
        const contactDisplayMode = property.contactDisplayMode || (property.useOriginalSellerContact === false ? 'custom' : 'original');
        dispatch({
          type: 'bulk',
          value: {
            ...property,
            contactDisplayMode,
            useOriginalSellerContact: contactDisplayMode === 'original',
            photos: mapPhotosForForm(property.photos),
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [editId]);

  const score = useMemo(() => {
    const fields = ['title', 'propertyType', 'city', 'locality', 'price', 'description'];
    const filled = fields.filter((field) => formData[field]).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  const updateField = (field, value) => dispatch({ type: 'set', field, value });

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

    setSubmitting(true);
    setStatusMessage('');
    try {
      if (!isAdmin && (formData.photos || []).some((photo) => photo?.isLocal)) {
        setStatusMessage('Only admin can upload images.');
        return;
      }

      const payload = buildPayload(formData);
      let propertyId = editId;
      if (editId) {
        const response = await propertyService.update(editId, payload);
        propertyId = response?.data?.data?._id || editId;
        setStatusMessage('Property updated successfully.');
      } else {
        const response = await propertyService.create(payload);
        propertyId = response?.data?.data?._id;
        setStatusMessage('Property submitted successfully.');
      }

      const newImages = (formData.photos || []).filter((photo) => photo?.isLocal && photo?.file);
      if (isAdmin && propertyId && newImages.length) {
        await propertyService.uploadImages(propertyId, newImages.map((photo) => photo.file));
      }

      setTimeout(() => navigate(isAdminPath ? '/admin/properties' : '/profile/properties'), 800);
    } catch (error) {
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

