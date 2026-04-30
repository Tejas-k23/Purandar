import React, { useEffect, useState } from 'react';
import { Edit2, AlertCircle } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { listSubscriptions, modifySubscription, listPackages } from '../../services/subscriptionService';
import './AdminSubscriptions.css';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ extendDays: '', addListings: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, pkgRes] = await Promise.all([
        listSubscriptions(),
        listPackages(),
      ]);
      setSubscriptions(subsRes.data.data || []);
      setPackages(pkgRes.data.data || []);
    } catch (error) {
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await modifySubscription(editingId, formData);
      setMessage('Subscription updated');
      setEditingId(null);
      setFormData({ extendDays: '', addListings: '' });
      loadData();
    } catch (error) {
      setMessage('Failed to update subscription');
    }
  };

  const getPackageName = (packageId) => {
    const pkg = packages.find((p) => p._id === packageId);
    return pkg?.name || 'Unknown';
  };

  return (
    <div className="admin-subscriptions">
      <AdminHeader title="Subscriptions" subtitle="Manage user subscriptions" />

      {message && (
        <div className="admin-message">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <p>Loading...</p>
        ) : editingId ? (
          <div className="admin-form-card">
            <h3>Modify Subscription</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Extend by Days</label>
                <input type="number" name="extendDays" value={formData.extendDays} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label>Add Listings</label>
                <input type="number" name="addListings" value={formData.addListings} onChange={handleChange} min="0" />
              </div>
              <div className="form-actions">
                <button type="submit" className="admin-primary-btn">
                  Update
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="admin-secondary-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="subscriptions-table">
            <table>
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Package</th>
                  <th>Remaining Listings</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub._id}>
                    <td>{sub.userId?.email || 'N/A'}</td>
                    <td>{getPackageName(sub.packageId)}</td>
                    <td>{sub.remainingListings}</td>
                    <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                    <td>{new Date(sub.expiryDate).toLocaleDateString()}</td>
                    <td>{sub.status}</td>
                    <td>
                      <button onClick={() => setEditingId(sub._id)} className="admin-icon-btn">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
