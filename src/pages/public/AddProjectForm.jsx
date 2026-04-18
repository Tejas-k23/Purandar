import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarDays, FileBadge2, IndianRupee, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import projectService from '../../services/projectService';
import { getAmenityMeta } from '../../utils/amenityMeta';
import { getProjectTypeProfile, PROJECT_TYPE_PROFILES } from '../../utils/projectTypeConfig';
import MapPickerModal from '../../components/common/MapPickerModal';
import MapboxSuggestInput from '../../components/common/MapboxSuggestInput';
import VillageFirstCityInput from '../../components/common/VillageFirstCityInput';
import ConfirmModal from '../../components/common/ConfirmModal';
import useAuth from '../../hooks/useAuth';
import env from '../../config/env';
import './PostPropertyForm.css';
import './AddProjectForm.css';

const SECTION_ITEMS = [
  { id: 'basic', label: 'Basic Details', subtitle: 'Section 1' },
  { id: 'location', label: 'Location Details', subtitle: 'Section 2' },
  { id: 'pricing', label: 'Pricing & Configurations', subtitle: 'Section 3' },
  { id: 'amenities', label: 'Amenities', subtitle: 'Section 4' },
  { id: 'media', label: 'Project Media', subtitle: 'Section 5' },
  { id: 'description', label: 'Description', subtitle: 'Section 6' },
  { id: 'additional', label: 'Additional Details', subtitle: 'Section 7' },
  { id: 'contact', label: 'Contact Details', subtitle: 'Section 8' },
];

const STEP_FIELDS = {
  basic: ['projectName', 'projectType', 'developerName', 'projectStatus', 'launchDate', 'possessionDate'],
  location: ['address', 'city', 'area', 'pincode', 'mapLink', 'latitude', 'longitude'],
  pricing: ['startingPrice', 'endingPrice', 'priceUnit', 'configurationTypes', 'areaRange'],
  amenities: [],
  media: ['projectImages', 'videoUrl'],
  description: ['shortDescription', 'detailedDescription'],
  additional: ['totalTowers', 'totalUnits', 'totalFloors', 'openSpace', 'approvalAuthority'],
  contact: ['contactPersonName', 'phoneNumber', 'email', 'customContactName', 'customContactPhone', 'customContactEmail', 'customWhatsappNumber'],
};

const PROJECT_TYPES = Object.keys(PROJECT_TYPE_PROFILES);
const PROJECT_STATUS = ['Upcoming', 'Under Construction', 'Ready to Move'];
const PRICE_UNITS = ['Lakh', 'Crore'];
const TAGS = ['Luxury', 'Affordable', 'Premium'];
const MAX_PROJECT_IMAGES = 5;
const MAX_PROJECT_MEDIA_SIZE = 50 * 1024 * 1024; // 50 MB total
const PROJECT_DRAFT_KEY = 'purandar:project-form-draft';
const PROJECT_STEP_KEY = 'purandar:project-form-step';

const initialState = {
  projectName: '',
  slug: '',
  projectType: '',
  developerName: '',
  reraNumber: '',
  projectStatus: '',
  launchDate: '',
  possessionDate: '',
  address: '',
  city: '',
  area: '',
  pincode: '',
  mapLink: '',
  latitude: '',
  longitude: '',
  startingPrice: '',
  endingPrice: '',
  priceUnit: 'Lakh',
  configurationTypes: [],
  extraConfigurations: [''],
  areaRange: '',
  pricePerSqFt: '',
  plotUnit: 'sq.ft',
  minPlotSize: '',
  maxPlotSize: '',
  totalPlots: '',
  amenities: [],
  projectImages: [],
  brochure: null,
  videoFile: null,
  videoUrl: '',
  shortDescription: '',
  detailedDescription: '',
  totalTowers: '',
  totalUnits: '',
  totalFloors: '',
  openSpace: '',
  approvalAuthority: '',
  contactPersonName: '',
  phoneNumber: '',
  email: '',
  tags: [],
  contactDisplayMode: 'original',
  useCustomContactDetails: false,
  customContactName: '',
  customContactPhone: '',
  customContactEmail: '',
  whatsappNumber: '',
  showWhatsappButton: false,
  responseTime: '',
  whatsappDisplayMode: 'original',
  useCustomWhatsappDetails: false,
  customWhatsappNumber: '',
  visible: true,
  featuredOnHome: false,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isCoordinates(value) {
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(value.trim());
}

function validateForm(data) {
  const errors = {};

  if (!data.projectName.trim()) errors.projectName = 'Project name is required';
  if (!data.projectType) errors.projectType = 'Please select a project type';
  if (!data.developerName.trim()) errors.developerName = 'Developer name is required';
  if (!data.projectStatus) errors.projectStatus = 'Please select project status';
  if (!data.launchDate) errors.launchDate = 'Launch date is required';
  if (!data.possessionDate) errors.possessionDate = 'Possession date is required';
  if (data.launchDate && data.possessionDate && data.possessionDate < data.launchDate) {
    errors.possessionDate = 'Possession date cannot be before launch date';
  }

  if (!data.address.trim()) errors.address = 'Address is required';
  if (!data.city.trim()) errors.city = 'City is required';
  if (!data.area.trim()) errors.area = 'Area / locality is required';
  if (!String(data.pincode).trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(String(data.pincode).trim())) {
    errors.pincode = 'Enter a valid 6 digit pincode';
  }
  if (!String(data.latitude ?? '').trim() || !String(data.longitude ?? '').trim()) {
    errors.latitude = 'Please mark the project on the map';
  }

  if (data.mapLink.trim()) {
    const isUrl = /^https?:\/\/.+/i.test(data.mapLink.trim());
    if (!isUrl && !isCoordinates(data.mapLink)) {
      errors.mapLink = 'Enter a valid Google Maps URL or coordinates';
    }
  }

  if (!String(data.startingPrice).trim()) errors.startingPrice = 'Starting price is required';
  if (!String(data.endingPrice).trim()) errors.endingPrice = 'Ending price is required';
  if (Number(data.startingPrice) > Number(data.endingPrice)) {
    errors.endingPrice = 'Ending price should be greater than starting price';
  }
  if (!data.priceUnit) errors.priceUnit = 'Price unit is required';
  if (data.configurationTypes.length === 0 && !data.extraConfigurations.some((item) => item.trim())) {
    errors.configurationTypes = 'Select or add at least one configuration';
  }
  if (!data.areaRange.trim()) errors.areaRange = 'Area range is required';

  if (data.projectImages.length === 0) errors.projectImages = 'Upload at least one project image';
  if (data.videoUrl.trim() && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(data.videoUrl.trim())) {
    errors.videoUrl = 'Enter a valid YouTube URL';
  }

  if (!data.shortDescription.trim()) errors.shortDescription = 'Short description is required';
  if (!data.detailedDescription.trim()) errors.detailedDescription = 'Detailed description is required';

  ['totalTowers', 'totalUnits', 'totalFloors', 'openSpace'].forEach((field) => {
    const labelMap = {
      totalTowers: 'Total towers',
      totalUnits: 'Total units',
      totalFloors: 'Total floors',
      openSpace: 'Open space',
    };
    if (!String(data[field]).trim()) {
      errors[field] = `${labelMap[field]} is required`;
    } else if (Number(data[field]) < 0) {
      errors[field] = `${labelMap[field]} cannot be negative`;
    }
  });

  if (!data.approvalAuthority.trim()) errors.approvalAuthority = 'Approval authority is required';
  if (!data.contactPersonName.trim()) errors.contactPersonName = 'Contact person name is required';
  if (!String(data.phoneNumber).trim()) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!/^\d{10}$/.test(String(data.phoneNumber).trim())) {
    errors.phoneNumber = 'Enter a valid 10 digit phone number';
  }
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (data.contactDisplayMode === 'custom') {
    if (!data.customContactName.trim()) errors.customContactName = 'Custom contact name is required';
    if (!/^\d{10}$/.test(String(data.customContactPhone).trim())) errors.customContactPhone = 'Enter a valid 10 digit phone number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customContactEmail.trim())) errors.customContactEmail = 'Enter a valid email address';
  }

  if (data.projectType === 'Plots') {
    if (!String(data.pricePerSqFt).trim()) errors.pricePerSqFt = 'Price per sq.ft is required';
    if (!data.plotUnit) errors.plotUnit = 'Plot unit is required';
    if (!String(data.minPlotSize).trim()) errors.minPlotSize = 'Minimum plot size is required';
    if (!String(data.maxPlotSize).trim()) errors.maxPlotSize = 'Maximum plot size is required';
    if (Number(data.minPlotSize) > Number(data.maxPlotSize)) {
      errors.maxPlotSize = 'Maximum plot size should be greater than minimum';
    }
  }

  if (data.showWhatsappButton && data.whatsappDisplayMode === 'custom') {
    if (!/^\d{10,15}$/.test(String(data.customWhatsappNumber || '').trim())) {
      errors.customWhatsappNumber = 'Enter a valid WhatsApp number';
    }
  }

  return errors;
}

function getStepErrors(stepIndex, data) {
  const stepId = SECTION_ITEMS[stepIndex - 1]?.id;
  const stepFields = new Set(STEP_FIELDS[stepId] || []);
  if (stepFields.size === 0) return {};
  const allErrors = validateForm(data);
  return Object.fromEntries(Object.entries(allErrors).filter(([field]) => stepFields.has(field)));
}

function SectionCard({ id, title, description, children }) {
  return (
    <section id={id} className="apf-section-card">
      <div className="apf-section-head">
        <h3 className="apf-section-title">{title}</h3>
        <p className="apf-section-description">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, error, children, hint, icon: Icon }) {
  return (
    <div className="ppf-field">
      <label className="ppf-field-label">
        {Icon ? <span className="apf-label-icon"><Icon size={14} /></span> : null}
        {label}
        {required ? <span className="required">*</span> : null}
      </label>
      {children}
      {hint ? <p className="apf-field-hint">{hint}</p> : null}
      {error ? <p className="ppf-input-error">{error}</p> : null}
    </div>
  );
}

function TextInput({ value, onChange, error, ...props }) {
  return <input className={`ppf-input ${error ? 'error' : ''}`} value={value} onChange={onChange} {...props} />;
}

function SelectInput({ value, onChange, error, children, ...props }) {
  return (
    <select className={`ppf-select ${error ? 'error' : ''}`} value={value} onChange={onChange} {...props}>
      {children}
    </select>
  );
}

function TextAreaInput({ value, onChange, error, ...props }) {
  return <textarea className={`ppf-textarea ${error ? 'error' : ''}`} value={value} onChange={onChange} {...props} />;
}

function ToggleChip({ label, selected, onClick, showIcon = false }) {
  const { icon: Icon, colorClass } = getAmenityMeta(label);
  return (
    <button type="button" className={`ppf-amenity-chip ${selected ? 'selected' : ''}`} onClick={onClick}>
      {showIcon ? (
        <span className={`ppf-amenity-icon ppf-amenity-icon--${colorClass}`}>
          <Icon size={14} strokeWidth={1.9} />
        </span>
      ) : null}
      <span className="chip-check">
        {selected ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </span>
      {label}
    </button>
  );
}

function DynamicConfigInput({ value, onChange, onRemove, disabledRemove }) {
  return (
    <div className="apf-dynamic-config">
      <input
        className="ppf-input"
        type="text"
        placeholder="Add custom configuration"
        value={value}
        onChange={onChange}
      />
      <button type="button" className="ppf-btn-back apf-mini-btn" onClick={onRemove} disabled={disabledRemove}>
        Remove
      </button>
    </div>
  );
}

export default function AddProjectForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [mapOpen, setMapOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const editId = searchParams.get('edit');
  const isAdminPath = location.pathname.startsWith('/admin');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const typeProfile = useMemo(() => getProjectTypeProfile(formData.projectType), [formData.projectType]);
  const allowedConfigurations = typeProfile.configurationOptions;
  const allowedAmenities = typeProfile.amenities;

  useEffect(() => {
    setFormData((current) => {
      const nextSlug = slugify(current.projectName);
      return current.slug === nextSlug ? current : { ...current, slug: nextSlug };
    });
  }, [formData.projectName]);

  useEffect(() => {
    const loadProject = async () => {
      if (!editId) return;
      setLoading(true);
      try {
        const response = await projectService.getById(editId);
        const project = response.data.data;

        const contactDisplayMode = project.contactDisplayMode || (project.useCustomContactDetails ? 'custom' : 'original');
        const whatsappDisplayMode = project.whatsappDisplayMode || (project.useCustomWhatsappDetails ? 'custom' : 'original');
        setFormData({
          ...initialState,
          ...project,
          contactDisplayMode,
          useCustomContactDetails: contactDisplayMode === 'custom',
          whatsappDisplayMode,
          useCustomWhatsappDetails: whatsappDisplayMode === 'custom',
          projectImages: (project.projectImages || []).map((image, index) => ({
            id: `${project._id || 'project'}-${index}`,
            name: `Project image ${index + 1}`,
            preview: image,
            existing: true,
            isLocal: false,
          })),
        });
      } catch (error) {
        setStatusMessage(error.message || 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [editId]);

  useEffect(() => {
    if (editId) return;
    try {
      const rawDraft = window.localStorage.getItem(PROJECT_DRAFT_KEY);
      if (!rawDraft) return;
      const parsed = JSON.parse(rawDraft);
      setFormData((current) => ({
        ...current,
        ...parsed,
        projectImages: (parsed.projectImages || []).map((image, index) => ({
          id: `draft-${index}`,
          name: `Draft image ${index + 1}`,
          preview: image.preview || image,
          existing: true,
          isLocal: false,
        })),
        brochure: null,
        videoFile: null,
      }));
    } catch {
      window.localStorage.removeItem(PROJECT_DRAFT_KEY);
    }

    const savedStep = Number(window.localStorage.getItem(PROJECT_STEP_KEY) || 1);
    if (savedStep >= 1 && savedStep <= SECTION_ITEMS.length) {
      setCurrentStep(savedStep);
    }
  }, [editId]);

  useEffect(() => {
    const target = document.querySelector('.apf-form-card');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (editId) return;
    const { brochure, videoFile, ...serializableDraft } = formData;
    window.localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify({
      ...serializableDraft,
      projectImages: (formData.projectImages || []).filter((image) => !image?.isLocal).map((image) => image.preview || image),
    }));
  }, [editId, formData]);

  useEffect(() => {
    if (editId) return;
    window.localStorage.setItem(PROJECT_STEP_KEY, String(currentStep));
  }, [editId, currentStep]);

  const completionScore = useMemo(() => {
    const trackedFields = [
      'projectName', 'projectType', 'developerName', 'projectStatus', 'launchDate', 'possessionDate',
      'address', 'city', 'area', 'pincode', 'startingPrice', 'endingPrice', 'areaRange',
      'shortDescription', 'detailedDescription', 'contactPersonName', 'phoneNumber', 'email',
    ];
    const filled = trackedFields.filter((field) => String(formData[field] ?? '').trim()).length;
    const withImages = formData.projectImages.length > 0 ? 1 : 0;
    return Math.round(((filled + withImages) / (trackedFields.length + 1)) * 100);
  }, [formData]);

  const totalSteps = SECTION_ITEMS.length;

  const goNext = () => {
    const stepErrors = getStepErrors(currentStep, formData);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      const firstErrorField = Object.keys(stepErrors)[0];
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
      fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fieldElement?.focus?.();
      return;
    }
    setErrors({});
    setCurrentStep((current) => Math.min(totalSteps, current + 1));
  };

  const goBack = () => setCurrentStep((current) => Math.max(1, current - 1));

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const setContactDisplayMode = (mode) => {
    updateField('contactDisplayMode', mode);
    updateField('useCustomContactDetails', mode === 'custom');
  };

  const setWhatsappDisplayMode = (mode) => {
    updateField('whatsappDisplayMode', mode);
    updateField('useCustomWhatsappDetails', mode === 'custom');
  };

  const handleProjectTypeChange = (value) => {
    const nextProfile = getProjectTypeProfile(value);
    setFormData((current) => ({
      ...current,
      projectType: value,
      configurationTypes: current.configurationTypes.filter((item) => nextProfile.configurationOptions.includes(item)),
      amenities: current.amenities.filter((item) => nextProfile.amenities.includes(item)),
      pricePerSqFt: value === 'Plots' ? current.pricePerSqFt : '',
      plotUnit: value === 'Plots' ? current.plotUnit : 'sq.ft',
      minPlotSize: value === 'Plots' ? current.minPlotSize : '',
      maxPlotSize: value === 'Plots' ? current.maxPlotSize : '',
      totalPlots: value === 'Plots' ? current.totalPlots : '',
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.projectType;
      delete next.configurationTypes;
      delete next.amenities;
      delete next.pricePerSqFt;
      delete next.plotUnit;
      delete next.minPlotSize;
      delete next.maxPlotSize;
      return next;
    });
  };

  const toggleArrayValue = (field, value) => {
    const current = Array.isArray(formData[field]) ? formData[field] : [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateField(field, next);
  };

  const addCustomTag = () => {
    const next = customTagInput.trim();
    if (!next) return;
    if (formData.tags.includes(next)) {
      setCustomTagInput('');
      return;
    }
    updateField('tags', [...formData.tags, next]);
    setCustomTagInput('');
  };

  const removeTag = (tag) => {
    updateField('tags', formData.tags.filter((item) => item !== tag));
  };

  const handleImageUpload = (event) => {
    setMediaError('');
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    const rejectedCount = files.length - validFiles.length;
    const remainingSlots = MAX_PROJECT_IMAGES - formData.projectImages.length;
    const allowedByCount = validFiles.slice(0, remainingSlots);
    const currentSize = formData.projectImages.reduce((sum, image) => sum + (image?.file?.size || 0), 0);

    let runningSize = currentSize;
    const toAdd = [];
    let skippedForSize = 0;
    for (const file of allowedByCount) {
      if (runningSize + file.size > MAX_PROJECT_MEDIA_SIZE) {
        skippedForSize += 1;
        continue;
      }
      toAdd.push(file);
      runningSize += file.size;
    }

    const mappedFiles = toAdd.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      isLocal: true,
    }));

    if (rejectedCount > 0) {
      setMediaError('Some files were skipped. Only image files are allowed.');
    } else if (validFiles.length > remainingSlots) {
      setMediaError(`You can upload up to ${MAX_PROJECT_IMAGES} images. Remove some to add more.`);
    } else if (skippedForSize > 0) {
      setMediaError('Total upload size can be up to 50 MB. Remove a few images to continue.');
    }

    updateField('projectImages', [...formData.projectImages, ...mappedFiles]);
  };

  const removeImage = (id) => {
    const image = formData.projectImages.find((item) => item.id === id);
    if (image?.preview && !image.existing) URL.revokeObjectURL(image.preview);
    updateField('projectImages', formData.projectImages.filter((item) => item.id !== id));
  };

  const handleBrochureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (formData.brochure?.preview) URL.revokeObjectURL(formData.brochure.preview);
    updateField('brochure', { file, name: file.name, preview: URL.createObjectURL(file) });
  };

  const addConfigurationRow = () => updateField('extraConfigurations', [...formData.extraConfigurations, '']);

  const updateConfigurationRow = (index, value) => {
    const next = [...formData.extraConfigurations];
    next[index] = value;
    updateField('extraConfigurations', next);
  };

  const removeConfigurationRow = (index) => {
    if (formData.extraConfigurations.length === 1) {
      updateField('extraConfigurations', ['']);
      return;
    }
    updateField('extraConfigurations', formData.extraConfigurations.filter((_, itemIndex) => itemIndex !== index));
  };

  const applyProjectCitySelection = ({ source, feature, village }) => {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const firstErrorField = Object.keys(nextErrors)[0];
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
      fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fieldElement?.focus?.();
      return;
    }

    setSubmitting(true);
    setStatusMessage('');
    try {
      const { videoFile, ...rest } = formData;
      const payload = {
        ...rest,
        projectImages: formData.projectImages
          .filter((image) => image?.existing)
          .map((image) => image.preview),
      };

      let projectId = editId;
      if (editId) {
        const response = await projectService.update(editId, payload);
        projectId = response?.data?.data?._id || editId;
        setStatusMessage('Project updated successfully.');
      } else {
        const response = await projectService.create(payload);
        projectId = response?.data?.data?._id;
        setStatusMessage('');
      }

      const newImages = formData.projectImages.filter((image) => image?.isLocal && image?.file);
      if (projectId) {
        const mediaPayload = {};
        if (newImages.length) mediaPayload.images = newImages.map((image) => image.file);
        if (formData.videoFile) mediaPayload.videos = [formData.videoFile];
        if (Object.keys(mediaPayload).length) {
          await projectService.uploadMedia(projectId, mediaPayload);
        }
      }

      if (!editId) {
        window.localStorage.removeItem(PROJECT_DRAFT_KEY);
        window.localStorage.removeItem(PROJECT_STEP_KEY);
        setSuccessDialog({
          title: 'Project submitted',
          message: 'Thanks! Our team will verify and approve your project. Once approved, it will appear in the project listings.',
        });
      } else {
        window.setTimeout(() => navigate(isAdminPath ? '/admin/projects' : '/projects'), 700);
      }
    } catch (error) {
      setStatusMessage(error.message || 'Unable to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    const stepId = SECTION_ITEMS[currentStep - 1]?.id;
    switch (stepId) {
      case 'basic':
        return (
          <SectionCard id="basic" title="1. Project Basic Details" description="Core identity, status, launch timeline, and project tags.">
            <div className="ppf-form-row">
              <Field label="Project Name" required error={errors.projectName} icon={Building2}>
                <TextInput name="projectName" type="text" placeholder="Enter project name" value={formData.projectName} onChange={(event) => updateField('projectName', event.target.value)} error={errors.projectName} />
              </Field>
              <Field label="Project Type" required error={errors.projectType} hint={typeProfile.helper}>
                <SelectInput name="projectType" value={formData.projectType} onChange={(event) => handleProjectTypeChange(event.target.value)} error={errors.projectType}>
                  <option value="">Select type</option>
                  {PROJECT_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <div className="ppf-form-row">
              <Field label={typeProfile.labels.developer} required error={errors.developerName} icon={UserRound}>
                <TextInput name="developerName" type="text" placeholder="Enter developer or builder name" value={formData.developerName} onChange={(event) => updateField('developerName', event.target.value)} error={errors.developerName} />
              </Field>
              <Field label={typeProfile.labels.rera} error={errors.reraNumber} icon={ShieldCheck}>
                <TextInput name="reraNumber" type="text" placeholder={`Enter ${typeProfile.labels.rera.toLowerCase()}`} value={formData.reraNumber} onChange={(event) => updateField('reraNumber', event.target.value)} error={errors.reraNumber} />
              </Field>
            </div>

            <div className="ppf-form-row">
              <Field label="Project Status" required error={errors.projectStatus} icon={ShieldCheck}>
                <SelectInput name="projectStatus" value={formData.projectStatus} onChange={(event) => updateField('projectStatus', event.target.value)} error={errors.projectStatus}>
                  <option value="">Select status</option>
                  {PROJECT_STATUS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Launch Date" required error={errors.launchDate} icon={CalendarDays}>
                <TextInput name="launchDate" type="date" value={formData.launchDate} onChange={(event) => updateField('launchDate', event.target.value)} error={errors.launchDate} />
              </Field>
              <Field label={typeProfile.labels.possessionDate} required error={errors.possessionDate} icon={CalendarDays}>
                <TextInput name="possessionDate" type="date" value={formData.possessionDate} onChange={(event) => updateField('possessionDate', event.target.value)} error={errors.possessionDate} />
              </Field>
            </div>

            <Field label="Project Tags">
              <div className="ppf-amenity-grid">
                {TAGS.map((tag) => (
                  <ToggleChip key={tag} label={tag} selected={formData.tags.includes(tag)} onClick={() => toggleArrayValue('tags', tag)} />
                ))}
              </div>
              <div className="apf-tag-row">
                <TextInput
                  name="customTag"
                  type="text"
                  placeholder="Add custom tag (e.g., 15 km from Purandar International Airport)"
                  value={customTagInput}
                  onChange={(event) => setCustomTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addCustomTag();
                    }
                  }}
                />
                <button type="button" className="ppf-btn-back apf-mini-btn" onClick={addCustomTag}>
                  Add tag
                </button>
              </div>
              {formData.tags.length ? (
                <div className="apf-tag-list">
                  {formData.tags.map((tag) => (
                    <button key={tag} type="button" className="apf-tag-pill" onClick={() => removeTag(tag)}>
                      {tag}
                      <span className="apf-tag-remove">×</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </Field>
          </SectionCard>
        );
      case 'location':
        return (
          <SectionCard id="location" title="2. Location Details" description="Address, city, locality, pincode, and optional map coordinates.">
            <Field label="Address" required error={errors.address} icon={MapPin}>
              <MapboxSuggestInput
                name="address"
                value={formData.address}
                placeholder="Enter full project address"
                types="address,poi,locality,place"
                displayKey="place_name"
                valueKey="place_name"
                queryContext={formData.city}
                onChange={(val) => updateField('address', val)}
                error={errors.address}
              />
            </Field>

            <div className="ppf-form-row">
              <Field label="City" required error={errors.city} hint={!env.mapboxAccessToken ? 'Village suggestions still work. Mapbox fallback is disabled until the token is added.' : ''}>
                <VillageFirstCityInput
                  name="city"
                  value={formData.city}
                  placeholder="Search village or city"
                  onChange={(val) => {
                    updateField('city', val);
                    if (formData.area) updateField('area', '');
                    updateField('latitude', '');
                    updateField('longitude', '');
                  }}
                  onSelect={applyProjectCitySelection}
                  error={errors.city}
                />
              </Field>
              <Field label="Area / Locality" required error={errors.area}>
                <TextInput
                  name="area"
                  type="text"
                  placeholder="Enter area or locality"
                  value={formData.area}
                  onChange={(event) => updateField('area', event.target.value)}
                  error={errors.area}
                />
              </Field>
              <Field label="Pincode" required error={errors.pincode}>
                <TextInput name="pincode" type="number" placeholder="Enter pincode" value={formData.pincode} onChange={(event) => updateField('pincode', event.target.value)} error={errors.pincode} />
              </Field>
            </div>

            <Field label="Google Map Link / Coordinates" error={errors.mapLink} hint="Optional. Paste a Google Maps URL or coordinates like `18.4529, 73.9777`." icon={MapPin}>
              <TextInput name="mapLink" type="text" placeholder="https://maps.google.com/... or 18.4529, 73.9777" value={formData.mapLink} onChange={(event) => updateField('mapLink', event.target.value)} error={errors.mapLink} />
            </Field>

            <div className="ppf-field">
              <label className="ppf-field-label">
                Pin on Map<span className="required">*</span>
              </label>
              <button
                type="button"
                className={`ppf-pill ${errors.latitude ? 'error' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={() => setMapOpen(true)}
                disabled={!env.mapboxAccessToken}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Mark on map
              </button>
              {formData.latitude && formData.longitude ? (
                <p className="ppf-field-hint" style={{ marginTop: 8 }}>
                  Selected: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                </p>
              ) : null}
              {errors.latitude ? (
                <p className="ppf-input-error" style={{ marginTop: 8 }}>
                  {errors.latitude}
                </p>
              ) : null}
              {!env.mapboxAccessToken ? (
                <p className="ppf-input-error" style={{ marginTop: 8 }}>
                  Mapbox token missing. Add `VITE_MAPBOX_ACCESS_TOKEN` to enable map selection.
                </p>
              ) : null}
            </div>
          </SectionCard>
        );
      case 'pricing':
        return (
          <SectionCard id="pricing" title="3. Pricing & Configurations" description={typeProfile.labels.pricingDescription}>
            <div className="ppf-form-row">
              <Field label={formData.projectType === 'Plots' ? 'Starting Plot Price' : 'Starting Price'} required error={errors.startingPrice} icon={IndianRupee}>
                <TextInput name="startingPrice" type="number" placeholder="Enter starting price" value={formData.startingPrice} onChange={(event) => updateField('startingPrice', event.target.value)} error={errors.startingPrice} />
              </Field>
              <Field label={formData.projectType === 'Plots' ? 'Ending Plot Price' : 'Ending Price'} required error={errors.endingPrice} icon={IndianRupee}>
                <TextInput name="endingPrice" type="number" placeholder="Enter ending price" value={formData.endingPrice} onChange={(event) => updateField('endingPrice', event.target.value)} error={errors.endingPrice} />
              </Field>
              <Field label="Price Unit" required error={errors.priceUnit}>
                <SelectInput name="priceUnit" value={formData.priceUnit} onChange={(event) => updateField('priceUnit', event.target.value)} error={errors.priceUnit}>
                  {PRICE_UNITS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <Field label={typeProfile.labels.configuration} required error={errors.configurationTypes} hint={typeProfile.labels.configurationHint}>
              <div className="ppf-amenity-grid">
                {allowedConfigurations.map((configuration) => (
                  <ToggleChip key={configuration} label={configuration} selected={formData.configurationTypes.includes(configuration)} onClick={() => toggleArrayValue('configurationTypes', configuration)} />
                ))}
              </div>
            </Field>

            <div className="apf-dynamic-grid">
              {formData.extraConfigurations.map((value, index) => (
                <DynamicConfigInput key={`config-${index}`} value={value} onChange={(event) => updateConfigurationRow(index, event.target.value)} onRemove={() => removeConfigurationRow(index)} disabledRemove={formData.extraConfigurations.length === 1 && !value} />
              ))}
            </div>

            <button type="button" className="ppf-btn-continue apf-inline-btn" onClick={addConfigurationRow}>
              {typeProfile.labels.addConfiguration}
            </button>

            <div className="ppf-form-row">
              <Field label={typeProfile.labels.areaRange} required error={errors.areaRange}>
                <TextInput name="areaRange" type="text" placeholder={typeProfile.labels.areaRangePlaceholder} value={formData.areaRange} onChange={(event) => updateField('areaRange', event.target.value)} error={errors.areaRange} />
              </Field>
            </div>

            {formData.projectType === 'Plots' ? (
              <>
                <div className="ppf-form-row">
                  <Field label="Price Per Sq.ft" required error={errors.pricePerSqFt}>
                    <TextInput name="pricePerSqFt" type="number" placeholder="e.g. 2500" value={formData.pricePerSqFt} onChange={(event) => updateField('pricePerSqFt', event.target.value)} error={errors.pricePerSqFt} />
                  </Field>
                  <Field label="Plot Unit" required error={errors.plotUnit}>
                    <SelectInput name="plotUnit" value={formData.plotUnit} onChange={(event) => updateField('plotUnit', event.target.value)} error={errors.plotUnit}>
                      {['sq.ft', 'sq.m', 'sq.yard'].map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <div className="ppf-form-row">
                  <Field label="Minimum Plot Size" required error={errors.minPlotSize}>
                    <TextInput name="minPlotSize" type="number" placeholder="e.g. 1200" value={formData.minPlotSize} onChange={(event) => updateField('minPlotSize', event.target.value)} error={errors.minPlotSize} />
                  </Field>
                  <Field label="Maximum Plot Size" required error={errors.maxPlotSize}>
                    <TextInput name="maxPlotSize" type="number" placeholder="e.g. 3000" value={formData.maxPlotSize} onChange={(event) => updateField('maxPlotSize', event.target.value)} error={errors.maxPlotSize} />
                  </Field>
                  <Field label="Total Plots (optional)">
                    <TextInput name="totalPlots" type="number" placeholder="e.g. 120" value={formData.totalPlots} onChange={(event) => updateField('totalPlots', event.target.value)} />
                  </Field>
                </div>
              </>
            ) : null}
          </SectionCard>
        );
      case 'amenities':
        return (
          <SectionCard id="amenities" title="4. Project Amenities" description={typeProfile.labels.amenitiesDescription}>
            <Field label="Amenities">
              <div className="ppf-amenity-grid">
                {allowedAmenities.map((amenity) => (
                  <ToggleChip key={amenity} label={amenity} selected={formData.amenities.includes(amenity)} onClick={() => toggleArrayValue('amenities', amenity)} showIcon />
                ))}
              </div>
            </Field>
          </SectionCard>
        );
      case 'media':
        return (
          <SectionCard id="media" title="5. Project Media" description="Upload images with preview, add brochure PDF, and attach project video.">
            <Field label="Upload Project Images" required error={errors.projectImages}>
              <label className="ppf-upload-zone apf-upload-zone">
                <input name="projectImages" type="file" accept="image/*" multiple className="apf-hidden-input" onChange={handleImageUpload} />
                <svg className="ppf-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="ppf-upload-text">Drop project images here or <strong>browse</strong></p>
                <p className="ppf-upload-hint">Up to {MAX_PROJECT_IMAGES} images • Total 50 MB.</p>
              </label>
              {mediaError ? <p className="ppf-input-error" style={{ marginTop: 10 }}>{mediaError}</p> : null}
            </Field>

            {formData.projectImages.length > 0 ? (
              <div className="ppf-photo-grid">
                {formData.projectImages.map((image) => (
                  <div key={image.id} className="ppf-photo-thumb cover">
                    <img src={image.preview} alt={image.name} />
                    <div className="ppf-photo-overlay apf-always-visible">
                      <button type="button" className="ppf-photo-delete" onClick={() => removeImage(image.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="ppf-form-row">
              <Field label="Upload Brochure (PDF)" icon={FileBadge2}>
                <TextInput name="brochure" type="file" accept="application/pdf" onChange={handleBrochureUpload} />
                {formData.brochure ? <p className="apf-file-badge">{formData.brochure.name}</p> : null}
              </Field>
              <Field label="Upload Project Video (MP4/WebM)">
                <TextInput
                  name="videoFile"
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(event) => updateField('videoFile', event.target.files?.[0] || null)}
                />
              </Field>
              <Field label="Project Video URL" error={errors.videoUrl}>
                <TextInput name="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..." value={formData.videoUrl} onChange={(event) => updateField('videoUrl', event.target.value)} error={errors.videoUrl} />
              </Field>
            </div>
          </SectionCard>
        );
      case 'description':
        return (
          <SectionCard id="description" title="6. Project Description" description="Add crisp marketing copy plus a detailed project overview.">
            <Field label="Short Description" required error={errors.shortDescription}>
              <TextAreaInput name="shortDescription" rows="4" placeholder="Write a short summary of the project" value={formData.shortDescription} onChange={(event) => updateField('shortDescription', event.target.value)} error={errors.shortDescription} />
            </Field>
            <Field label="Detailed Description" required error={errors.detailedDescription}>
              <TextAreaInput name="detailedDescription" rows="8" placeholder="Write a detailed description covering highlights, access, amenities, and value proposition" value={formData.detailedDescription} onChange={(event) => updateField('detailedDescription', event.target.value)} error={errors.detailedDescription} />
            </Field>
          </SectionCard>
        );
      case 'additional':
        return (
          <SectionCard id="additional" title="7. Additional Details" description={typeProfile.labels.additionalDescription}>
            <div className="ppf-form-row">
              <Field label={typeProfile.labels.totalTowers} required error={errors.totalTowers}>
                <TextInput name="totalTowers" type="number" placeholder="0" value={formData.totalTowers} onChange={(event) => updateField('totalTowers', event.target.value)} error={errors.totalTowers} />
              </Field>
              <Field label={typeProfile.labels.totalUnits} required error={errors.totalUnits}>
                <TextInput name="totalUnits" type="number" placeholder="0" value={formData.totalUnits} onChange={(event) => updateField('totalUnits', event.target.value)} error={errors.totalUnits} />
              </Field>
              <Field label={typeProfile.labels.totalFloors} required error={errors.totalFloors}>
                <TextInput name="totalFloors" type="number" placeholder="0" value={formData.totalFloors} onChange={(event) => updateField('totalFloors', event.target.value)} error={errors.totalFloors} />
              </Field>
            </div>

            <div className="ppf-form-row">
              <Field label={typeProfile.labels.openSpace} required error={errors.openSpace}>
                <TextInput name="openSpace" type="number" placeholder={`Enter ${typeProfile.labels.openSpace.toLowerCase()}`} value={formData.openSpace} onChange={(event) => updateField('openSpace', event.target.value)} error={errors.openSpace} />
              </Field>
              <Field label={typeProfile.labels.approvalAuthority} required error={errors.approvalAuthority}>
                <TextInput name="approvalAuthority" type="text" placeholder={`Enter ${typeProfile.labels.approvalAuthority.toLowerCase()}`} value={formData.approvalAuthority} onChange={(event) => updateField('approvalAuthority', event.target.value)} error={errors.approvalAuthority} />
              </Field>
            </div>
          </SectionCard>
        );
      case 'contact':
        return (
          <SectionCard id="contact" title="8. Contact Details" description="Capture the person responsible for project-level enquiries.">
            <div className="ppf-form-row">
              <Field label="Contact Person Name" required error={errors.contactPersonName} icon={UserRound}>
                <TextInput name="contactPersonName" type="text" placeholder="Enter contact person name" value={formData.contactPersonName} onChange={(event) => updateField('contactPersonName', event.target.value)} error={errors.contactPersonName} />
              </Field>
              <Field label="Phone Number" required error={errors.phoneNumber} icon={Phone}>
                <TextInput name="phoneNumber" type="tel" placeholder="Enter phone number" value={formData.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} error={errors.phoneNumber} />
              </Field>
              <Field label="Email" required error={errors.email} icon={Mail}>
                <TextInput name="email" type="email" placeholder="Enter email address" value={formData.email} onChange={(event) => updateField('email', event.target.value)} error={errors.email} />
              </Field>
            </div>

            {isAdminPath ? (
            <div className="ppf-admin-contact-card">
              <div className="ppf-admin-contact-head">
                <div>
                  <h3 className="ppf-admin-contact-title">Contact Display on Website</h3>
                  <p className="ppf-admin-contact-subtitle">Decide whether the project detail page should show the original contact, company contact, or a custom contact.</p>
                </div>
              </div>
              <div className="ppf-toggle-wrapper">
                <button
                  type="button"
                  className={`ppf-toggle ${formData.contactDisplayMode === 'original' ? 'on' : ''}`}
                  onClick={() => setContactDisplayMode(formData.contactDisplayMode === 'original' ? (isAdminPath ? 'company' : 'custom') : 'original')}
                  aria-pressed={formData.contactDisplayMode === 'original'}
                />
                <span className="ppf-toggle-label">Show original project contact details</span>
              </div>
              {formData.contactDisplayMode !== 'original' ? (
                <div className="ppf-radio-group" style={{ marginTop: 12 }}>
                  {isAdminPath ? (
                    <label className="ppf-radio-label" htmlFor="apf-contact-company">
                      <input
                        type="radio"
                        id="apf-contact-company"
                        name="apf-contact-mode"
                        checked={formData.contactDisplayMode === 'company'}
                        onChange={() => setContactDisplayMode('company')}
                      />
                      Use company contact details
                    </label>
                  ) : null}
                  <label className="ppf-radio-label" htmlFor="apf-contact-custom">
                    <input
                      type="radio"
                      id="apf-contact-custom"
                      name="apf-contact-mode"
                      checked={formData.contactDisplayMode === 'custom'}
                      onChange={() => setContactDisplayMode('custom')}
                    />
                    Use custom contact details
                  </label>
                </div>
              ) : null}
              {formData.contactDisplayMode === 'custom' ? (
                <div className="ppf-form-row">
                  <Field label="Custom Contact Name" required error={errors.customContactName} icon={UserRound}>
                    <TextInput name="customContactName" type="text" placeholder="Enter custom contact name" value={formData.customContactName} onChange={(event) => updateField('customContactName', event.target.value)} error={errors.customContactName} />
                  </Field>
                  <Field label="Custom Phone" required error={errors.customContactPhone} icon={Phone}>
                    <TextInput name="customContactPhone" type="tel" placeholder="Enter custom phone number" value={formData.customContactPhone} onChange={(event) => updateField('customContactPhone', event.target.value)} error={errors.customContactPhone} />
                  </Field>
                  <Field label="Custom Email" required error={errors.customContactEmail} icon={Mail}>
                    <TextInput name="customContactEmail" type="email" placeholder="Enter custom email address" value={formData.customContactEmail} onChange={(event) => updateField('customContactEmail', event.target.value)} error={errors.customContactEmail} />
                  </Field>
                </div>
              ) : null}
            </div>
            ) : null}

            {isAdminPath ? (
            <div className="ppf-admin-contact-card" style={{ marginTop: 18 }}>
              <div className="ppf-admin-contact-head">
                <div>
                  <h3 className="ppf-admin-contact-title">WhatsApp Contact</h3>
                  <p className="ppf-admin-contact-subtitle">Show a WhatsApp button and control which number appears on the project detail page.</p>
                </div>
              </div>

              <div className="ppf-toggle-wrapper">
                <button
                  type="button"
                  className={`ppf-toggle ${formData.showWhatsappButton ? 'on' : ''}`}
                  onClick={() => updateField('showWhatsappButton', !formData.showWhatsappButton)}
                  aria-pressed={formData.showWhatsappButton}
                />
                <span className="ppf-toggle-label">Show WhatsApp button on project page</span>
              </div>

              {formData.showWhatsappButton ? (
                <>
                  <div className="ppf-form-row" style={{ marginTop: 12 }}>
                    <Field label="WhatsApp Number">
                      <TextInput name="whatsappNumber" type="text" placeholder="Enter WhatsApp number" value={formData.whatsappNumber} onChange={(event) => updateField('whatsappNumber', event.target.value)} />
                    </Field>
                    <Field label="Response Time">
                      <TextInput name="responseTime" type="text" placeholder="Usually responds within 10 mins" value={formData.responseTime} onChange={(event) => updateField('responseTime', event.target.value)} />
                    </Field>
                  </div>

                  <div className="ppf-radio-group" style={{ marginTop: 12 }}>
                    {isAdminPath ? (
                      <label className="ppf-radio-label" htmlFor="apf-whatsapp-company">
                        <input
                          type="radio"
                          id="apf-whatsapp-company"
                          name="apf-whatsapp-mode"
                          checked={formData.whatsappDisplayMode === 'company'}
                          onChange={() => setWhatsappDisplayMode('company')}
                        />
                        Use company WhatsApp number
                      </label>
                    ) : null}
                    <label className="ppf-radio-label" htmlFor="apf-whatsapp-original">
                      <input
                        type="radio"
                        id="apf-whatsapp-original"
                        name="apf-whatsapp-mode"
                        checked={formData.whatsappDisplayMode === 'original' || (!isAdminPath && formData.whatsappDisplayMode !== 'custom')}
                        onChange={() => setWhatsappDisplayMode('original')}
                      />
                      Use project contact WhatsApp number
                    </label>
                    <label className="ppf-radio-label" htmlFor="apf-whatsapp-custom">
                      <input
                        type="radio"
                        id="apf-whatsapp-custom"
                        name="apf-whatsapp-mode"
                        checked={formData.whatsappDisplayMode === 'custom'}
                        onChange={() => setWhatsappDisplayMode('custom')}
                      />
                      Use custom WhatsApp number
                    </label>
                  </div>

                  {formData.whatsappDisplayMode === 'custom' ? (
                    <div className="ppf-form-row" style={{ marginTop: 12 }}>
                      <Field label="Custom WhatsApp Number" required error={errors.customWhatsappNumber}>
                        <TextInput name="customWhatsappNumber" type="text" placeholder="Enter custom WhatsApp number" value={formData.customWhatsappNumber} onChange={(event) => updateField('customWhatsappNumber', event.target.value)} error={errors.customWhatsappNumber} />
                      </Field>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            ) : null}
          </SectionCard>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <section className="ppf-page apf-page"><div className="ppf-layout"><main className="ppf-main"><div className="ppf-form-card apf-form-card"><p className="apf-status-message">Loading project details...</p></div></main></div></section>;
  }

  return (
    <section className="ppf-page apf-page">
      <ConfirmModal
        open={!!successDialog}
        title={successDialog?.title}
        message={successDialog?.message}
        confirmText="Got it"
        showCancel={false}
        tone="success"
        onClose={() => {
          setSuccessDialog(null);
          navigate(isAdminPath ? '/admin/projects' : '/projects');
        }}
        onConfirm={() => {
          setSuccessDialog(null);
          navigate(isAdminPath ? '/admin/projects' : '/projects');
        }}
      />
      <div className="ppf-layout">
        <aside className="ppf-sidebar">
          <div className="ppf-stepper">
            <ul className="ppf-stepper-list">
              {SECTION_ITEMS.map((section, index) => (
                <li
                  key={section.id}
                  className={`ppf-step-item ${index + 1 === currentStep ? 'active' : index + 1 < currentStep ? 'completed' : 'upcoming'}`}
                >
                  <div className="ppf-step-circle">{index + 1}</div>
                  <div className="ppf-step-text">
                    <span className="ppf-step-label">{section.label}</span>
                    <span className="ppf-step-subtitle">{section.subtitle}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ppf-score-card">
            <div className="ppf-score-value">{completionScore}%</div>
            <h3 className="ppf-score-title">Project readiness</h3>
            <p className="ppf-score-subtitle">Complete the required details, media, and contact info for a polished project listing.</p>
          </div>
        </aside>

        <main className="ppf-main">
          <form className="ppf-form-card apf-form-card" onSubmit={handleSubmit}>
            <div className="apf-hero">
              <div>
                <h1 className="ppf-heading">
                  Add a new <span>project</span> for Purandar Properties
                </h1>
                <p className="apf-hero-copy">Built to match the same admin form language as your existing property flow with clean sections, soft cards, and focused interactions.</p>
              </div>
            </div>

            {renderStep()}

            {statusMessage ? <p className="apf-status-message">{statusMessage}</p> : null}

            <MapPickerModal
              open={mapOpen}
              title="Mark project on map"
              initialLocation={(formData.latitude && formData.longitude)
                ? { latitude: Number(formData.latitude), longitude: Number(formData.longitude) }
                : undefined}
              onClose={() => setMapOpen(false)}
              onSelect={({ latitude, longitude }) => {
                updateField('latitude', latitude);
                updateField('longitude', longitude);
                updateField('mapLink', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                setMapOpen(false);
              }}
            />

            <div className="ppf-nav-buttons">
              <div>
                {currentStep > 1 ? (
                  <button type="button" className="ppf-btn-back" onClick={goBack}>
                    Back
                  </button>
                ) : null}
              </div>
              <div>
                {currentStep < totalSteps ? (
                  <button type="button" className="ppf-btn-continue" onClick={goNext}>
                    Continue
                  </button>
                ) : (
                  <button type="submit" className="ppf-btn-submit" disabled={submitting}>
                    {submitting ? 'Saving Project...' : 'Submit Project'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </section>
  );
}

