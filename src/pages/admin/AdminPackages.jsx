import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { listPackages, createPackage, updatePackage, deletePackage } from '../../services/subscriptionService';
import './AdminPackages.css';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    propertyLimit: '',
    validity: '',
    isActive: true,
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const { data } = await listPackages();
      setPackages(data.data || []);
    } catch (error) {
      setMessage('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePackage(editingId, formData);
        setMessage('Package updated successfully');
      } else {
        await createPackage(formData);
        setMessage('Package created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', price: '', propertyLimit: '', validity: '', isActive: true });
      loadPackages();
    } catch (error) {
      setMessage('Failed to save package');
    }
  };

  const handleEdit = (pkg) => {
    setFormData(pkg);
    setEditingId(pkg._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deletePackage(id);
      setMessage('Package deleted');
      loadPackages();
    } catch (error) {
      setMessage('Failed to delete package');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', price: '', propertyLimit: '', validity: '', isActive: true });
  };

  return (
    <div className="admin-packages">
      <AdminHeader title="Packages" subtitle="Manage subscription packages" />

      {message && (
        <div className="admin-message">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="admin-content">
        {!showForm ? (
          <>
            <button onClick={() => setShowForm(true)} className="admin-primary-btn">
              <Plus className="w-4 h-4" /> Create Package
            </button>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="packages-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price (₹)</th>
                      <th>Listings</th>
                      <th>Validity (days)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr key={pkg._id}>
                        <td>{pkg.name}</td>
                        <td>₹{pkg.price}</td>
                        <td>{pkg.propertyLimit}</td>
                        <td>{pkg.validity}</td>
                        <td>{pkg.isActive ? 'Active' : 'Inactive'}</td>
                        <td>
                          <button onClick={() => handleEdit(pkg)} className="admin-icon-btn">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(pkg._id)} className="admin-icon-btn admin-icon-btn-danger">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="admin-form-card">
            <h3>{editingId ? 'Edit Package' : 'Create New Package'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Package Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Property Limit</label>
                <input type="number" name="propertyLimit" value={formData.propertyLimit} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Validity (days)</label>
                <input type="number" name="validity" value={formData.validity} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group form-group-checkbox">
                <label>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-primary-btn">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={handleCancel} className="admin-secondary-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
