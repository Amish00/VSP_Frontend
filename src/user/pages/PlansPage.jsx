// src/pages/PlansPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import PlanCard from '../components/plans/PlanCard';
import BillingToggle from '../components/plans/BillingToggle';
import Modal from '../components/ui/Modal';
import { initiatePayment } from '../api/PaymentService';
import { getCurrentUser, upgradeToFreePlan } from '../api/Api';
import { FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';

// Plan definitions (unchanged)
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

const normalizePlanId = (planId) => {
  const value = (planId || '').toString().trim().toLowerCase();

  if (['creator', 'create', 'view+create'].includes(value)) return 'creator';
  if (['view only', 'view-only', 'viewonly'].includes(value)) return 'view';
  if (value === 'free') return 'free';

  return value;
};

const getPlanDisplayName = (planId) => {
  switch (normalizePlanId(planId)) {
    case 'creator':
      return 'Create';
    case 'view':
      return 'View Only';
    case 'free':
      return 'Free';
    default:
      return 'Plan';
  }
};

const getPlanFeatures = (planId) => {
  const allPlans = PLANS.monthly;
  const plan = allPlans.find(p => p.id === normalizePlanId(planId));
  return plan ? plan.features : [];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const PlansPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('current');
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

  const currentPlanId = useMemo(() => {
    if (!user || !user.plan) return 'free';
    return normalizePlanId(user.plan);
  }, [user]);

  const isActivePaid = useMemo(() => {
    return user && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date() && user.plan !== 'FREE';
  }, [user]);

  const isExpired = useMemo(() => {
    return user && user.subscriptionExpiry && new Date(user.subscriptionExpiry) <= new Date() && user.plan === 'FREE';
  }, [user]);

  const daysLeft = useMemo(() => {
    if (!user || !user.subscriptionExpiry) return null;
    return getDaysLeft(user.subscriptionExpiry);
  }, [user]);

  const currentPlanFeatures = getPlanFeatures(currentPlanId);
  const currentPlanName = getPlanDisplayName(currentPlanId);
  const expiryDate = user?.subscriptionExpiry ? formatDate(user.subscriptionExpiry) : null;
  const billingCycle = user?.billingCycle || '';
  const previousPlanName = user?.previousPlan ? user.previousPlan.charAt(0).toUpperCase() + user.previousPlan.slice(1) : null;

  const getOrderedPlans = (planList) => {
    if (!user) return planList;
    const currentPlan = planList.find(p => p.id === currentPlanId);
    if (!currentPlan) return planList;
    const otherPlans = planList.filter(p => p.id !== currentPlanId);
    return [currentPlan, ...otherPlans];
  };

  const plans = useMemo(() => {
    const rawPlans = PLANS[billing] || [];
    return getOrderedPlans(rawPlans);
  }, [billing, user, currentPlanId]);

  const handleSelect = async (plan) => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      enqueueSnackbar('Please sign in to purchase a plan.', { variant: 'warning' });
      navigate('/signin', { state: { from: '/plans' } });
      return;
    }

    if (isActivePaid) {
      enqueueSnackbar(
        `You already have an active ${user.plan} plan until ${expiryDate}. Cannot subscribe to another plan.`,
        { variant: 'warning' }
      );
      return;
    }

    if (plan.id === 'free') {
      if (currentPlanId === 'free') {
        enqueueSnackbar('You are already on the Free plan.', { variant: 'info' });
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
      {/* Header: title left, tabs right */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">
          Manage Your Plans
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'current'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-bg-el text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            Your Current Plan
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'available'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-bg-el text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            Available Plans
          </button>
        </div>
      </div>

      {/* ========== TAB 1: CURRENT PLAN (Full width) ========== */}
      {activeTab === 'current' && (
        <div className="bg-bg-el border border-border rounded-3xl p-8 shadow-lg">
          {user ? (
            <div>
              {/* Plan name and status */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-text-primary">{currentPlanName} Plan</h2>
                  {isActivePaid && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                      <FaCheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                  {isExpired && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                      <FaExclamationCircle className="w-3 h-3" /> Expired
                    </span>
                  )}
                  {!isActivePaid && !isExpired && currentPlanId === 'free' && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                      Free
                    </span>
                  )}
                </div>
                {isActivePaid && daysLeft !== null && daysLeft > 0 && (
                  <span className="flex items-center gap-1 text-sm font-medium text-primary-light bg-primary/10 px-3 py-1 rounded-full">
                    <FaClock className="w-3 h-3" /> {daysLeft} day{daysLeft > 1 ? 's' : ''} left
                  </span>
                )}
              </div>

              {/* Two‑column: Features (left) – Details (right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT: Features */}
                <div>
                  <p className="font-medium text-text-primary mb-3">Features included:</p>
                  <ul className="space-y-2">
                    {currentPlanFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-success flex-shrink-0 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* RIGHT: Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-secondary">Duration / Billing Cycle</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {currentPlanId === 'free' ? 'NA' : billingCycle ? billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Expiry Date</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {expiryDate || 'Never expires'}
                    </p>
                  </div>
                  {isExpired && previousPlanName && (
                    <div>
                      <p className="text-sm text-text-secondary">Previous Plan</p>
                      <p className="text-lg font-semibold text-text-primary">{previousPlanName}</p>
                    </div>
                  )}
                  {isActivePaid && (
                    <div>
                      <p className="text-sm text-text-secondary">Renewal</p>
                      <p className="text-md text-text-secondary">Auto-renew at end of billing cycle</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expired message or action */}
              {isExpired && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                  Your plan has expired. You've been reverted to the Free plan.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">Please log in to see your current plan.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== TAB 2: AVAILABLE PLANS ========== */}
      {activeTab === 'available' && (
        <div>
          {!user && (
            <p className="text-center text-text-secondary text-sm sm:text-base mb-4">
              Please sign in to view subscription details and purchase a plan.
            </p>
          )}

          <div className="flex justify-center mb-4">
            <BillingToggle value={billing} onChange={setBilling} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-7 max-w-[900px] mx-auto text-left">
            {plans.map((plan) => {
              let badge = null;
              if (user) {
                if (plan.id === currentPlanId && isActivePaid) {
                  badge = 'Current Plan';
                } else if (plan.id === currentPlanId && isExpired) {
                  badge = 'Expired';
                } else if (plan.popular && !isActivePaid) {
                  badge = 'Popular';
                }
              } else if (plan.popular) {
                badge = 'Popular';
              }

              const isDisabled = isActivePaid || (plan.id === 'free' && currentPlanId === 'free');

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelect}
                  currencySymbol="Rs."
                  disabled={isDisabled}
                  badge={badge}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-5 justify-center text-sm text-text-muted mt-8">
            {['✓ Cancel anytime', '✓ No credit card for Free', '✓ eSewa & Khalti accepted', '✓ Instant activation'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal (unchanged) */}
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