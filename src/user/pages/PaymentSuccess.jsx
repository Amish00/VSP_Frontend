// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getCurrentUser } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import api from '../api/Api'; // import your axios instance

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);

  const fetchAndUpdateUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setPlanName(userData.plan || 'Premium');
      if (userData.subscriptionExpiry) {
        const expiry = new Date(userData.subscriptionExpiry);
        setExpiryDate(expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      }
      updateUser({
        plan: userData.plan,
        role: userData.role,
        subscriptionExpiry: userData.subscriptionExpiry,
      });
    } catch (err) {
      console.error('Failed to refresh user after payment', err);
      setPlanName('Premium Plan');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    const verifyAndFetch = async () => {
      const sessionId = searchParams.get('session_id');

      // If a session_id is present, it's a Stripe payment – verify it first
      if (sessionId) {
        try {
          // Call the new verification endpoint
          await api.get(`/payment/stripe/verify?session_id=${sessionId}`);
          // Verification succeeded – now fetch the updated user
          await fetchAndUpdateUser();
        } catch (err) {
          console.error('Stripe verification failed:', err);
          // Redirect to failure page
          navigate('/payment/failure');
          return;
        }
      } else {
        // eSewa or Khalti – they already triggered the backend verification,
        // and the backend redirected here. Just fetch the updated user.
        await fetchAndUpdateUser();
      }
    };

    verifyAndFetch();
  }, [searchParams, fetchAndUpdateUser, navigate]);

  // (The rest of your component remains identical)
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-bg-deep to-bg-card">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Finalizing Your Upgrade</h2>
          <p className="text-text-secondary">Updating your account with the new plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-bg-deep to-bg-card">
      <div className="text-center max-w-2xl w-full">
        {/* Animated success graphic */}
        <div className="mb-8 relative">
          <div className="text-[120px] sm:text-[160px] font-black leading-none font-display text-primary/10 select-none">
            <CheckCircle2 className="mx-auto h-[120px] w-[120px] sm:h-[160px] sm:w-[160px]" strokeWidth={1.25} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-primary/15 flex items-center justify-center mb-4 animate-pulse">
              <CheckCircle2 className="w-14 h-14 sm:w-20 sm:h-20 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-3">
          Payment Successful!
        </h1>
        <p className="text-text-secondary text-base sm:text-lg mb-4">
          Your account has been upgraded to{' '}
          <span className="font-semibold text-primary-light">{planName}</span>.
        </p>

        {/* Plan details card */}
        <div className="bg-bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-5 mb-8 max-w-sm mx-auto text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">What's Next?</h3>
          </div>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✦</span>
              <span>Full access to all {planName} features unlocked</span>
            </li>
            {expiryDate && (
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✦</span>
                <span>Subscription valid until <span className="text-text-primary font-medium">{expiryDate}</span></span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✦</span>
              <span>Unlimited streaming & premium downloads</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/plans')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-85 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Plans Now
          </button>
          <button
            onClick={() => window.location.href = '/home'}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-bg-card text-text-primary font-semibold hover:border-primary/50 hover:text-primary-light transition-all"
          >
            Go Home
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-text-muted text-sm mt-6">
          You can review your updated plan here or continue to your dashboard.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;