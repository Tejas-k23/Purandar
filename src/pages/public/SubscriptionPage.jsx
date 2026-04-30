import React, { useEffect, useState } from 'react';
import { listPackages, getSettings } from '../../services/subscriptionService';
import './SubscriptionPage.css';

export default function SubscriptionPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPricingEnabled, setIsPricingEnabled] = useState(false);

  useEffect(() => {
    loadPackagesAndSettings();
  }, []);

  const loadPackagesAndSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch packages
      const { data: pkgData } = await listPackages();
      setPackages(pkgData.data || []);
      
      // Fetch settings to check if pricing is enabled
      const { data: settingsData } = await getSettings();
      setIsPricingEnabled(settingsData.data?.isPricingActive || false);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="subscription-shell">
        <p style={{ textAlign: 'center', paddingTop: '40px' }}>Loading packages...</p>
      </div>
    );
  }

  if (!isPricingEnabled) {
    return (
      <div className="subscription-shell">
        <div className="subscription-card">
          <div className="subscription-header">
            <div>
              <p className="subscription-label">Launching Soon</p>
              <h1 className="subscription-title">Free Trial</h1>
            </div>
            <span className="subscription-badge">Launching Soon</span>
          </div>

          <p className="subscription-copy">
            Enjoy a short free trial package before paid plans become available. This is a limited launch offer so you can start listing your first property.
          </p>

          <div className="subscription-footer">
            Paid packages will appear here soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-shell">
      <div className="subscription-container">
        {packages.length === 0 ? (
          <div className="subscription-card">
            <div className="subscription-header">
              <div>
                <p className="subscription-label">No packages available</p>
                <h1 className="subscription-title">Coming Soon</h1>
              </div>
            </div>
            <p className="subscription-copy">
              Our subscription packages are being prepared. Check back soon!
            </p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg._id} className="subscription-card">
              <div className="subscription-header">
                <div>
                  <p className="subscription-label">{pkg.name}</p>
                  <h1 className="subscription-title">₹{pkg.price}</h1>
                </div>
                {pkg.isActive && <span className="subscription-badge">Active</span>}
              </div>

              <p className="subscription-copy">
                Get {pkg.propertyLimit} property listing{pkg.propertyLimit > 1 ? 's' : ''} valid for {pkg.validity} days.
              </p>

              <div className="subscription-summary">
                <div>
                  <p className="summary-label">Properties</p>
                  <p className="summary-value">{pkg.propertyLimit} Property Listing{pkg.propertyLimit > 1 ? 's' : ''}</p>
                  <p className="summary-label">Validity</p>
                  <p className="summary-value summary-value--small">{pkg.validity} Days</p>
                </div>
                <div className="subscription-sidecard">
                  <span className="summary-label">Total Price</span>
                  <p className="price-value">₹{pkg.price}</p>
                  <button type="button" className="subscription-button">
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
