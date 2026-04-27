import React, { useEffect, useState } from 'react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import propertyService from '../../services/propertyService';
import projectService from '../../services/projectService';
import { formatCompactPrice } from '../../utils/formatPrice';
import { getPropertyImageUrls } from '../../utils/propertyImages';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import './MyProperties.css';

export default function MyProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const navigate = useNavigate();
  const fallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

  const closeConfirm = () => setConfirmDialog(null);
  const openConfirm = (payload) => setConfirmDialog({ ...payload, busy: false });
  const handleConfirm = async () => {
    const action = confirmDialog?.onConfirm;
    if (!action) return;
    setConfirmDialog((current) => (current ? { ...current, busy: true } : current));
    try {
      await action();
    } finally {
      setConfirmDialog(null);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await userService.getMyProperties();
      const data = response.data.data || [];
      const properties = Array.isArray(data) ? data : (data.properties || []);
      const projects = Array.isArray(data) ? [] : (data.projects || []);
      const combined = [
        ...properties.map((property) => ({ type: 'property', ...property })),
        ...projects.map((project) => ({ type: 'project', ...project })),
      ].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      setItems(combined);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const archiveProperty = (propertyId, title) => {
    openConfirm({
      title: 'Archive property?',
      message: `${title ? `"${title}"` : 'This property'} will be hidden from your listings until it is re-approved.`,
      confirmText: 'Archive',
      tone: 'danger',
      onConfirm: async () => {
        await propertyService.remove(propertyId);
        await load();
      },
    });
  };

  const archiveProject = (projectId, projectName) => {
    openConfirm({
      title: 'Delete project?',
      message: `${projectName ? `"${projectName}"` : 'This project'} will be removed from your listings.`,
      confirmText: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        await projectService.remove(projectId);
        await load();
      },
    });
  };

  if (loading) return <Loader label="Loading your properties..." />;

  return (
    <div className="profile-page">
      <ConfirmModal
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmText={confirmDialog?.confirmText}
        cancelText={confirmDialog?.cancelText}
        onConfirm={handleConfirm}
        onClose={closeConfirm}
        tone={confirmDialog?.tone || 'danger'}
        showCancel={confirmDialog?.showCancel !== false}
        busy={confirmDialog?.busy}
      />
      <div className="page-header">
        <div>
          <h1 className="page-title">My Properties</h1>
          <p className="page-subtitle">Create, edit, and archive your listings.</p>
        </div>
        <Link to="/post-property" className="my-properties-cta">Post New Property</Link>
      </div>

      {message ? <p>{message}</p> : null}

      {items.length ? (
        <div className="my-properties-list">
          {items.map((item) => {
            const isProject = item.type === 'project';
            const title = isProject ? item.projectName : item.title;
            const price = isProject
              ? `${formatCompactPrice((item.startingPrice || 0) * (item.priceUnit === 'Crore' ? 10000000 : 100000))} - ${formatCompactPrice((item.endingPrice || 0) * (item.priceUnit === 'Crore' ? 10000000 : 100000))}`
              : formatCompactPrice(item.price);
            const image = isProject
              ? (item.projectImages?.[0] || fallbackImage)
              : (getPropertyImageUrls(item)[0] || fallbackImage);
            const status = isProject ? (item.status || 'pending') : item.status;
            const location = isProject ? [item.area, item.city].filter(Boolean).join(', ') : [item.locality, item.city].filter(Boolean).join(', ');
            return (
              <div key={`${item.type}-${item._id}`} className="my-property-card">
                <div className="property-image-col">
                  <img src={image} alt={title} />
                  <span className={`status-badge ${status === 'approved' ? 'active' : 'pending'}`}>{status}</span>
                  {isProject ? <span className="status-badge type-badge">Project</span> : null}
                </div>
                <div className="property-info-col">
                  <div className="property-header">
                    <h3 className="property-title">{title}</h3>
                    <span className="property-price">{price}</span>
                  </div>
                  <div className="property-location"><MapPin className="w-4 h-4" /><span>{location}</span></div>
                  {item.moderationMessage ? (
                    <p className="property-location" style={{ color: 'var(--orange)' }}>
                      Review note: {item.moderationMessage}
                    </p>
                  ) : null}
                  <div className="property-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => navigate(isProject ? `/post-project/form?edit=${item._id}` : `/post-property/form?edit=${item._id}`)}
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => (isProject ? archiveProject(item._id, title) : archiveProperty(item._id, title))}
                    >
                      <Trash2 className="w-4 h-4" /> {isProject ? 'Delete' : 'Archive'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="You haven't listed any properties yet." description="Add your first property to start receiving buyer interest." />
      )}
    </div>
  );
}


