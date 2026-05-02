import React, { useState } from 'react';
import PlanCard from '../components/plans/PlanCard';
import BillingToggle from '../components/plans/BillingToggle';
import Modal from '../components/ui/Modal';

// Plans data – prices in Rupees (Rs.)
export const PLANS = {
  monthly: [
    {
      id: 'free', name: 'Free', price: 0, period: 'forever',
      features: ['Watch FREE videos', '720p max quality', 'Ads shown', 'Basic history', 'Browse channels'],
    },
    {
      id: 'view', name: 'View Only', price: 799, period: '/mo',
      features: ['Watch ALL content', 'Full HD 1080p', 'Ad-free', 'Offline downloads', 'Watch history', '5 devices'],
    },
    {
      id: 'creator', name: 'View+Create', price: 1499, period: '/mo', popular: true,
      features: ['All View Only perks', 'Creator Studio', 'Upload FREE & PAID', '60% revenue share', 'Analytics dashboard', '4K export', 'Priority support'],
    },
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

// Input class reused
const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

// Merged content categories (Preferences + Interests)
const CONTENT_CATEGORIES = [
  'Technology', 'Design', 'Music', 'Gaming', 'Lifestyle', 'Business',
  'Education', 'Sports', 'Finance', 'Comedy', 'Travel', 'Food',
  'Learning', 'Entertainment', 'News', 'Tutorials', 'Vlogs',
  'Reviews', 'Live Streams', 'Shorts', 'Podcasts'
];

const PAYMENT_METHODS = ['eSewa', 'Khalti', 'Connect IPS', 'Credit Card', 'Debit Card'];

const PlansPage = () => {
  const [billing, setBilling] = useState('monthly');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('eSewa');

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const plans = PLANS[billing] || [];

  const handleSelect = (plan) => {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setStep(0);
    setSuccess(false);
    setModalOpen(true);
  };

  const handlePurchase = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      setSuccess(true);
      // Here you would call your backend API to create subscription
    }, 1200);
  };

  // Helper: format price in Rupees
  const formatPrice = (price) => `Rs.${price.toLocaleString('en-IN')}`;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10 pb-16 text-center">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-2 text-text-primary">Choose Your Plan</h1>
      <p className="text-text-secondary text-base mb-8 max-w-md mx-auto leading-relaxed">
        Unlock premium content or start creating and earning with ViriShare.
      </p>

      <div className="flex justify-center mb-10">
        <BillingToggle value={billing} onChange={setBilling} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[900px] mx-auto text-left mb-10">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} onSelect={handleSelect} currencySymbol="Rs." />
        ))}
      </div>

      <div className="flex flex-wrap gap-5 justify-center text-sm text-text-muted">
        {['✓ Cancel anytime', '✓ No credit card for Free', '✓ eSewa & Khalti accepted', '✓ Instant activation'].map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>

      {/* ── Purchase modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={success ? '🎉 Welcome to ' + selectedPlan?.name : `Subscribe to ${selectedPlan?.name}`}
        maxW={560}
      >
        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h3 className="font-display font-bold text-xl text-text-primary mb-2">Subscription Active!</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Your <strong className="text-primary-light">{selectedPlan?.name}</strong> plan is now active.
              Enjoy unlimited access to premium content.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] transition-all"
            >
              Start Watching
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex gap-1 mb-6">
              {['Content Preferences', 'Payment & Bill'].map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`h-1 w-full rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-bg-el'}`} />
                  <span className={`text-xs font-medium ${i <= step ? 'text-primary-light' : 'text-text-muted'}`}>{s}</span>
                </div>
              ))}
            </div>

            {/* Step 0: Content preferences (merged) */}
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
                      onClick={() => toggleCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full border text-sm transition-all
                        ${selectedCategories.includes(cat)
                          ? 'border-primary bg-primary/12 text-primary-light font-semibold'
                          : 'border-border bg-bg-el text-text-secondary hover:border-border-light'}`}
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

            {/* Step 1: Payment & Bill */}
            {step === 1 && (
              <>
                {/* Invoice / Bill summary */}
                <div className="bg-bg-el border border-border rounded-xl p-4 mb-5">
                  <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                    <span className="text-text-secondary text-sm">Plan</span>
                    <span className="font-semibold text-text-primary">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                    <span className="text-text-secondary text-sm">Billing cycle</span>
                    <span className="font-semibold text-text-primary">
                      {billing === 'monthly' ? 'Monthly' : billing === 'half' ? 'Every 6 months' : 'Yearly'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                    <span className="text-text-secondary text-sm">Subtotal</span>
                    <span className="font-semibold text-text-primary">{formatPrice(selectedPlan?.price)}</span>
                  </div>
                  <div className="flex justify-between items-start pb-2">
                    <span className="text-text-secondary text-sm">Tax (13% VAT)</span>
                    <span className="font-semibold text-text-primary">{formatPrice(Math.round(selectedPlan?.price * 0.13))}</span>
                  </div>
                  <div className="flex justify-between items-start pt-2 border-t border-border mt-2">
                    <span className="font-bold text-text-primary">Total amount</span>
                    <span className="font-black text-lg text-primary-light">{formatPrice(Math.round(selectedPlan?.price * 1.13))}</span>
                  </div>
                </div>

                {/* Payment method */}
                <p className="text-sm font-semibold text-text-secondary mb-2">Payment Method</p>
                <div className="flex gap-2 flex-wrap mb-5">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all
                        ${paymentMethod === m
                          ? 'border-primary bg-primary/12 text-primary-light'
                          : 'border-border bg-bg-el text-text-secondary hover:border-border-light'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Phone number field removed entirely */}

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
                    className="flex-[2] bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]"
                  >
                    {purchasing ? 'Processing…' : `Pay ${formatPrice(Math.round(selectedPlan?.price * 1.13))}`}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default PlansPage;