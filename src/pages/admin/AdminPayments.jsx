import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import './AdminPayments.css';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Placeholder: will fetch from API
      setPayments([]);
    } catch (error) {
      setMessage('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-payments">
      <AdminHeader title="Payment History" subtitle="View all payment transactions" />

      {message && (
        <div className="admin-message">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <p>Loading...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <p>No payments yet</p>
          </div>
        ) : (
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.orderId}</td>
                    <td>{payment.userId?.email || 'N/A'}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.status}</td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
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
