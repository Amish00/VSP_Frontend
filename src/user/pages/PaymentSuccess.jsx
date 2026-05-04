// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndUpdateUser = async () => {
      try {
        const userData = await getCurrentUser();
        // userData contains: id, username, email, role, plan, subscriptionExpiry, etc.
        updateUser({
          plan: userData.plan,
          role: userData.role,
          subscriptionExpiry: userData.subscriptionExpiry,
        });
      } catch (err) {
        console.error('Failed to refresh user after payment', err);
      } finally {
        setLoading(false);
        // Redirect to plans page after 2 seconds
        setTimeout(() => navigate('/plans'), 2000);
      }
    };
    fetchAndUpdateUser();
  }, [navigate, updateUser]);

  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold text-text-primary">Payment Successful!</h1>
      <p className="text-text-secondary mt-2">Your plan has been upgraded.</p>
      {loading && <p className="text-text-muted text-sm mt-6">Updating your account...</p>}
      <p className="text-text-muted text-sm mt-6">Redirecting to plans page...</p>
    </div>
  );
};

export default PaymentSuccess;