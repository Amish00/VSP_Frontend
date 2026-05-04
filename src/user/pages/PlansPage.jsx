import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PAYMENT_METHODS = ['eSewa', 'Khalti', 'Connect IPS', 'Credit Card', 'Debit Card'];
const CONTENT_CATEGORIES = [
  'Technology', 'Design', 'Music', 'Gaming', 'Lifestyle', 'Business',
  'Education', 'Sports', 'Finance', 'Comedy', 'Travel', 'Food',
  'Learning', 'Entertainment', 'News', 'Tutorials', 'Vlogs',
  'Reviews', 'Live Streams', 'Shorts', 'Podcasts'
];

const PlansPage = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const plans = PLANS[billing] || [];

  // Does the user have an active paid subscription?
  const hasActivePaidPlan = user &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date() &&
    user.plan !== 'FREE';

  // Hide "Most Popular" badge for ANY logged‑in user (not just those with paid plans)
  const hidePopularBadge = !!user;

  const handleSelect = async (plan) => {
    // 1. Authentication check
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/signin', { state: { from: '/plans' } });
      return;
    }

    // 2. Free plan upgrade
    if (plan.id === 'free') {
      // Prevent downgrade if user has an active paid subscription
      if (hasActivePaidPlan) {
        alert(`You have an active ${user.plan} plan until ${new Date(user.subscriptionExpiry).toLocaleDateString()}. You cannot switch to Free until it expires.`);
        return;
      }
      try {
        await upgradeToFreePlan();
        alert('Successfully switched to Free plan!');
        const updatedUser = await getCurrentUser();
        setUser(updatedUser);
      } catch (err) {
        console.error(err);
        alert('Failed to upgrade to Free plan.');
      }
      return;
    }

    // 3. Paid plan: check active subscription
    if (hasActivePaidPlan) {
      alert(`You already have an active ${user.plan} plan until ${new Date(user.subscriptionExpiry).toLocaleDateString()}. Cannot subscribe to another plan.`);
      return;
    }

    // 4. Proceed to payment modal
    setSelectedPlan(plan);
    setStep(0);
    setSelectedCategories([]);
    setModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    setPurchasing(true);
    try {
      const data = await initiatePayment(
        paymentMethod.toLowerCase(),
        selectedPlan.price,
        selectedPlan.id,
        billing
      );

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
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setPurchasing(false);
    }
  };

  const formatPrice = (price) => `Rs.${price.toLocaleString('en-IN')}`;

  if (loading) {
    return <div className="text-center py-20">Loading your account...</div>;
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10 pb-16 text-center">
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
        {plans.map(plan => {
          const isCurrentPlan = user && user.plan === plan.id.toUpperCase();
          const disabled = (plan.id !== 'free' && hasActivePaidPlan) || isCurrentPlan;
          // Hide the "popular" badge for any logged‑in user
          const planWithPopular = { ...plan, popular: plan.popular && !hidePopularBadge };

          return (
            <PlanCard
              key={plan.id}
              plan={planWithPopular}
              onSelect={handleSelect}
              currencySymbol="Rs."
              disabled={disabled}
              isCurrentPlan={isCurrentPlan}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-5 justify-center text-sm text-text-muted">
        {['✓ Cancel anytime', '✓ No credit card for Free', '✓ eSewa & Khalti accepted', '✓ Instant activation'].map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>

      {/* Payment Modal (unchanged) */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Subscribe to ${selectedPlan?.name}`} maxW={560}>
        <div className="flex gap-1 mb-6">
          {['Content Preferences', 'Payment & Bill'].map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-bg-el'}`} />
              <span className={`text-xs font-medium ${i <= step ? 'text-primary-light' : 'text-text-muted'}`}>{s}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <p className="text-sm font-semibold text-text-secondary mb-3">
              What type of content do you enjoy? (Select all that apply)
            </p>
            <div className="flex flex-wrap gap-2 mb-5 max-h-48 overflow-y-auto">
              {CONTENT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategories(prev =>
                    prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                  )}
                  className={`px-3.5 py-1.5 rounded-full border text-sm transition-all ${
                    selectedCategories.includes(cat)
                      ? 'border-primary bg-primary/12 text-primary-light font-semibold'
                      : 'border-border bg-bg-el text-text-secondary hover:border-border-light'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] transition-all"
            >
              Continue →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="bg-bg-el border border-border rounded-xl p-4 mb-5">
              <div className="flex justify-between border-b border-border pb-3 mb-3">
                <span className="text-text-secondary text-sm">Plan</span>
                <span className="font-semibold text-text-primary">{selectedPlan?.name}</span>
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
                onClick={() => setStep(0)}
                className="flex-1 bg-bg-el text-text-secondary border border-border font-semibold text-base rounded-xl py-3 hover:bg-bg-hov transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-[2] bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all"
              >
                {purchasing ? 'Processing…' : `Pay ${formatPrice(selectedPlan?.price)}`}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PlansPage;