import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import env from '../../config/env';
import {
  createPaymentOrder,
  getSettings,
  getUserSubscription,
  listPackages,
  verifyPayment,
} from '../../services/subscriptionService';
import './SubscriptionPage.css';

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(window.Razorpay);
    return;
  }

  const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(window.Razorpay), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Unable to load payment gateway.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.dataset.razorpayCheckout = 'true';
  script.onload = () => resolve(window.Razorpay);
  script.onerror = () => reject(new Error('Unable to load payment gateway.'));
  document.body.appendChild(script);
});

export default function SubscriptionCheckoutPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPricingEnabled, setIsPricingEnabled] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [buyingPackageId, setBuyingPackageId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, refreshProfile } = useAuth();

  const loadPackagesAndSettings = useCallback(async () => {
    try {
      setLoading(true);
      setStatusMessage('');

      const requests = [listPackages(), getSettings()];
      if (isAuthenticated) {
        requests.push(getUserSubscription());
      }

      const [pkgRes, settingsRes, subscriptionRes] = await Promise.all(requests);
      setPackages((pkgRes?.data?.data || []).filter((pkg) => pkg?.isActive));
      setIsPricingEnabled(settingsRes?.data?.data?.isPricingActive || false);
      setSubscription(subscriptionRes?.data?.data || null);
    } catch (error) {
      console.error('Failed to load packages:', error);
      setStatusMessage(error.message || 'Failed to load plans.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPackagesAndSettings();
  }, [loadPackagesAndSettings]);

  const handleBuyNow = async (pkg) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!env.razorpayKeyId) {
      setStatusMessage('Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to the frontend environment.');
      return;
    }

    try {
      setBuyingPackageId(pkg._id);
      setStatusMessage('');

      await loadRazorpayScript();
      const { data } = await createPaymentOrder({ packageId: pkg._id });
      const order = data?.data;

      if (!order?.orderId) {
        throw new Error('Unable to create payment order.');
      }

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: env.razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Purandar Prime Propertys',
          description: `${order.packageName} plan`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              await verifyPayment({
                orderId: order.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageId: order.packageId,
              });
              await refreshProfile();
              await loadPackagesAndSettings();
              setStatusMessage('Payment successful. Your subscription is now active.');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#0f766e',
          },
          modal: {
            ondismiss: () => reject(new Error('Payment was cancelled.')),
          },
        });

        razorpay.open();
      });
    } catch (error) {
      setStatusMessage(error.message || 'Unable to complete payment.');
    } finally {
      setBuyingPackageId('');
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

          {statusMessage ? <p className="subscription-copy">{statusMessage}</p> : null}

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
        {statusMessage ? <p className="subscription-copy">{statusMessage}</p> : null}

        {subscription ? (
          <div className="subscription-card">
            <div className="subscription-header">
              <div>
                <p className="subscription-label">Current Plan</p>
                <h1 className="subscription-title">{subscription.packageId?.name || 'Active subscription'}</h1>
              </div>
              <span className="subscription-badge">Active</span>
            </div>

            <p className="subscription-copy">
              {subscription.remainingListings} listing{subscription.remainingListings === 1 ? '' : 's'} remaining until {new Date(subscription.expiryDate).toLocaleDateString()}.
            </p>
          </div>
        ) : null}

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
                  <h1 className="subscription-title">Rs. {pkg.price}</h1>
                </div>
                <span className="subscription-badge">Active</span>
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
                  <p className="price-value">Rs. {pkg.price}</p>
                  <button
                    type="button"
                    className="subscription-button"
                    onClick={() => handleBuyNow(pkg)}
                    disabled={buyingPackageId === pkg._id}
                  >
                    {buyingPackageId === pkg._id ? 'Processing...' : 'Buy now'}
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
