// src/pages/PlansPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import PlanCard from '../components/plans/PlanCard';
import BillingToggle from '../components/plans/BillingToggle';
import Modal from '../components/ui/Modal';
import { initiatePayment } from '../api/PaymentService';
import { getCurrentUser, upgradeToFreePlan } from '../api/Api';

export const PLANS = {
  monthly: [
    { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['Watch FREE videos', '720p max quality', 'Ads shown', 'Basic history', 'Browse channels'] },
    { id: 'view', name: 'View Only', price: 799, period: '/mo', features: ['Watch ALL content', 'Full HD 1080p', 'Ad-free', 'Offline downloads', 'Watch history', '5 devices'] },
    { id: 'creator', name: 'View+Create', price: 1499, period: '/mo', popular: true, features: ['All View Only perks', 'Creator Studio', 'Upload FREE & PAID', '60% revenue share', 'Analytics dashboard', '4K export', 'Priority support'] },
  ],
  half: [
    { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['Watch FREE videos', '720p max quality', 'Ads shown', 'Basic history', 'Browse channels'] },
    { id: 'view', name: 'View Only', price: 699, period: '/mo', features: ['Watch ALL content', 'Full HD 1080p', 'Ad-free', 'Offline downloads', 'Watch history', '5 devices'] },
    { id: 'creator', name: 'View+Create', price: 1299, period: '/mo', popular: true, features: ['All View Only perks', 'Creator Studio', 'Upload FREE & PAID', '60% revenue share', 'Analytics dashboard', '4K export', 'Priority support'] },
  ],
  yearly: [
    { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['Watch FREE videos', '720p max quality', 'Ads shown', 'Basic history', 'Browse channels'] },
    { id: 'view', name: 'View Only', price: 599, period: '/mo', features: ['Watch ALL content', 'Full HD 1080p', 'Ad-free', 'Offline downloads', 'Watch history', '5 devices'] },
    { id: 'creator', name: 'View+Create', price: 1099, period: '/mo', popular: true, features: ['All View Only perks', 'Creator Studio', 'Upload FREE & PAID', '60% revenue share', 'Analytics dashboard', '4K export', 'Priority support'] },
  ],
};

const PAYMENT_METHODS = ['eSewa', 'Khalti', 'Stripe', 'Connect IPS', 'Credit Card', 'Debit Card'];

const PlansPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [billing, setBilling] = useState('monthly');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user', err);
        enqueueSnackbar('Failed to load user data. Please refresh the page.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [enqueueSnackbar]);

  // Determine current plan id (default to 'free' if none)
  const currentPlanId = useMemo(() => {
    if (!user || !user.plan) return 'free';
    return user.plan.toLowerCase(); // 'free', 'view', or 'creator'
  }, [user]);

  // Reorder plans: current plan first, then the rest in original order
  const getOrderedPlans = (planList) => {
    if (!user) return planList; // not logged in – keep original order

    const currentPlan = planList.find(p => p.id === currentPlanId);
    if (!currentPlan) return planList;

    const otherPlans = planList.filter(p => p.id !== currentPlanId);
    return [currentPlan, ...otherPlans];
  };

  const plans = useMemo(() => {
    const rawPlans = PLANS[billing] || [];
    return getOrderedPlans(rawPlans);
  }, [billing, user, currentPlanId]);

  const hasActivePaidPlan = user && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date() && user.plan !== 'FREE';
  // Hide "Popular" badge if user is logged in (we'll show "Current Plan" instead)
  const hidePopularBadge = !!user;

  const handleSelect = async (plan) => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      enqueueSnackbar('Please sign in to subscribe to a plan.', { variant: 'warning' });
      navigate('/signin', { state: { from: '/plans' } });
      return;
    }
    if (plan.id === 'free') {
      if (hasActivePaidPlan) {
        enqueueSnackbar(
          `You have an active ${user.plan} plan until ${new Date(user.subscriptionExpiry).toLocaleDateString()}. You cannot switch to Free until it expires.`,
          { variant: 'warning' }
        );
        return;
      }
      try {
        await upgradeToFreePlan();
        enqueueSnackbar('Successfully switched to Free plan!', { variant: 'success' });
        const updatedUser = await getCurrentUser();
        setUser(updatedUser);
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Failed to upgrade to Free plan. Please try again.', { variant: 'error' });
      }
      return;
    }
    if (hasActivePaidPlan) {
      enqueueSnackbar(
        `You already have an active ${user.plan} plan until ${new Date(user.subscriptionExpiry).toLocaleDateString()}. Cannot subscribe to another plan.`,
        { variant: 'warning' }
      );
      return;
    }
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    setPurchasing(true);
    try {
      const data = await initiatePayment(paymentMethod.toLowerCase(), selectedPlan.price, selectedPlan.id, billing);
      if (data.gateway === 'esewa') {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;
        Object.entries(data.params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else if (data.gateway === 'khalti') {
        window.location.href = data.payment_url;
      } else if (data.gateway === 'stripe') {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Payment initiation failed. Please try again.';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setPurchasing(false);
    }
  };

  const formatPrice = (price) => {
    const safePrice = typeof price === 'number' ? price : 0;
    return `Rs.${safePrice.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <div className="text-center py-20 text-text-muted">Loading your account...</div>;
  }

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <div className="max-w-[1100px] mx-auto text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-text-primary">
          Choose Your Plan
        </h1>
        <p className="text-text-secondary text-base mb-8 max-w-md mx-auto leading-relaxed">
          Unlock premium content or start creating and earning with ViriShare.
        </p>

        <div className="flex justify-center mb-10">
          <BillingToggle value={billing} onChange={setBilling} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[900px] mx-auto text-left mb-10">
          {plans.map((plan) => {
            const isCurrentPlan = user && plan.id === currentPlanId;
            const isCurrentPlanActive = isCurrentPlan && (!user.subscriptionExpiry || new Date(user.subscriptionExpiry) > new Date());
            const disabled = (plan.id !== 'free' && hasActivePaidPlan) || (isCurrentPlan && isCurrentPlanActive);
            // Show "Current Plan" badge instead of "Popular" for the user's plan
            const planWithProps = {
              ...plan,
              popular: plan.popular && !hidePopularBadge && !isCurrentPlan, // hide popular if logged in or if it's the current plan
              isCurrentPlan: isCurrentPlan && isCurrentPlanActive,
            };
            return (
              <PlanCard
                key={plan.id}
                plan={planWithProps}
                onSelect={handleSelect}
                currencySymbol="Rs."
                disabled={disabled}
                isCurrentPlan={isCurrentPlan && isCurrentPlanActive}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap gap-5 justify-center text-sm text-text-muted">
          {['✓ Cancel anytime', '✓ No credit card for Free', '✓ eSewa & Khalti accepted', '✓ Instant activation'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Subscribe to ${selectedPlan?.name || ''}`} maxW={560}>
        <div className="bg-bg-el border border-border rounded-xl p-4 mb-5">
          <div className="flex justify-between border-b border-border pb-3 mb-3">
            <span className="text-text-secondary text-sm">Plan</span>
            <span className="font-semibold text-text-primary">{selectedPlan?.name || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3 mb-3">
            <span className="text-text-secondary text-sm">Billing cycle</span>
            <span className="font-semibold text-text-primary">
              {billing === 'monthly' ? 'Monthly' : billing === 'half' ? 'Every 6 months' : 'Yearly'}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-bold text-text-primary">Total amount</span>
            <span className="font-black text-lg text-primary-light">{formatPrice(selectedPlan?.price)}</span>
          </div>
        </div>

        <p className="text-sm font-semibold text-text-secondary mb-2">Payment Method</p>
        <div className="flex gap-2 flex-wrap mb-5">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
                paymentMethod === m
                  ? 'border-primary bg-primary/12 text-primary-light'
                  : 'border-border bg-bg-el text-text-secondary hover:border-border-light'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(false)}
            className="flex-1 bg-bg-el text-text-secondary border border-border font-semibold text-base rounded-xl py-3 hover:bg-bg-hov transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="flex-[2] bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all"
          >
            {purchasing ? 'Processing…' : `Pay ${formatPrice(selectedPlan?.price)}`}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PlansPage;