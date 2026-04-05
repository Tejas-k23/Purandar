import React, { useEffect, useState } from 'react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import propertyService from '../../services/propertyService';
import { formatCompactPrice } from '../../utils/formatPrice';
import { getPropertyImageUrls } from '../../utils/propertyImages';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './MyProperties.css';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const fallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

  const load = async () => {
    setLoading(true);
    try {
      const response = await userService.getMyProperties();
      setProperties(response.data.data || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const archiveProperty = async (propertyId) => {
    await propertyService.remove(propertyId);
    await load();
  };

  if (loading) return <Loader label="Loading your properties..." />;

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Properties</h1>
          <p className="page-subtitle">Create, edit, and archive your listings.</p>
        </div>
        <Link to="/post-property" className="my-properties-cta">Post New Property</Link>
      </div>

      {message ? <p>{message}</p> : null}

      {properties.length ? (
        <div className="my-properties-list">
          {properties.map((property) => (
            <div key={property._id} className="my-property-card">
              <div className="property-image-col">
                <img src={getPropertyImageUrls(property)[0] || fallbackImage} alt={property.title} />
                <span className={`status-badge ${property.status === 'approved' ? 'active' : 'pending'}`}>{property.status}</span>
              </div>
              <div className="property-info-col">
                <div className="property-header">
                  <h3 className="property-title">{property.title}</h3>
                  <span className="property-price">{formatCompactPrice(property.price)}</span>
                </div>
                <div className="property-location"><MapPin className="w-4 h-4" /><span>{[property.locality, property.city].filter(Boolean).join(', ')}</span></div>
                <div className="property-actions">
                  <button className="action-btn edit-btn" onClick={() => navigate(`/post-property/form?edit=${property._id}`)}><Pencil className="w-4 h-4" /> Edit</button>
                  <button className="action-btn delete-btn" onClick={() => archiveProperty(property._id)}><Trash2 className="w-4 h-4" /> Archive</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="You haven't listed any properties yet." description="Add your first property to create a real MongoDB listing." />
      )}
    </div>
  );
}


