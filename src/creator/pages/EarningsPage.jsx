import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import EarningsChart from '../components/EarningsChart';
import PayoutTable from '../components/PayoutTable';
import MonthlyEarningsTable from '../components/MonthlyEarningsTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { earningsApi } from '../api/creatorApi';
import { DollarSign, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

const formatMoney = (value, decimals = 1) => {
  if (value === undefined || value === null || isNaN(value)) return '0.00';

  const abs = Math.abs(value);
  let suffix = '';
  let divisor = 1;

  if (abs >= 1e9) {
    suffix = 'B';
    divisor = 1e9;
  } else if (abs >= 1e6) {
    suffix = 'M';
    divisor = 1e6;
  } else if (abs >= 1e3) {
    suffix = 'K';
    divisor = 1e3;
  } else {
    // for values < 1000, show two decimal places
    return value.toFixed(2);
  }

  const formatted = (value / divisor).toFixed(decimals);
  return formatted + suffix;
};
// -------------------------------------------------------------

const RANGES = ['30 days', '90 days', '1 year', 'All time'];

const EarningsPage = () => {
  const { showSuccess, showError } = useNotification();
  const [range, setRange] = useState('30 days');
  const [summary, setSummary] = useState({ totalEarned: 0, paidOut: 0, pending: 0 });
  const [payouts, setPayouts] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('eSewa');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, payoutsRes, historyRes] = await Promise.all([
        earningsApi.getSummary(),
        earningsApi.getPayouts(),
        earningsApi.getHistory(),
      ]);
      setSummary(summaryRes.data);
      setPayouts(payoutsRes.data);
      setMonthlyEarnings(historyRes.data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load earnings data');
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!payoutAmount || isNaN(amount) || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    if (amount > summary.pending) {
      showError('Amount exceeds pending balance');
      return;
    }
    if (amount < 10) {
      showError('Minimum payout amount is Rs. 10');
      return;
    }
    setLoading(true);
    try {
      await earningsApi.requestPayout(payoutAmount, payoutMethod, accountDetails);
      showSuccess('Payout request submitted successfully!');
      setShowPayoutModal(false);
      setPayoutAmount('');
      setAccountDetails('');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Request failed';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // stats with formatted money
  const stats = [
    {
      icon: <DollarSign size={24} color="#10B981" />,
      label: 'Total Earned',
      value: `Rs. ${formatMoney(summary.totalEarned)}`,
      color: '#10B981',
    },
    {
      icon: <Clock size={24} color="#F59E0B" />,
      label: 'Pending',
      value: `Rs. ${formatMoney(summary.pending)}`,
      color: '#F59E0B',
    },
    {
      icon: <CheckCircle size={24} color="#60A5FA" />,
      label: 'Paid Out',
      value: `Rs. ${formatMoney(summary.paidOut)}`,
      color: '#60A5FA',
    },
    {
      icon: <TrendingUp size={24} color="#0EA5E9" />,
      label: 'Rev Share',
      value: '70%',
      color: '#0EA5E9',
    },
  ];

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          Earnings
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mb-6">
        <EarningsChart range={range} />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-primary" />
          <h2 className="font-display font-bold text-lg text-text-primary">
            Monthly Earnings Breakdown
          </h2>
        </div>
        <MonthlyEarningsTable monthlyEarnings={monthlyEarnings} />
      </div>

      <div className="mt-8">
        <PayoutTable
          rows={payouts}
          extraActions={
            <Button size="sm" onClick={() => setShowPayoutModal(true)}>
              Request Payout
            </Button>
          }
        />
      </div>

      <Modal
        open={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Request Payout"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Amount (Rs.)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={payoutAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('-')) setPayoutAmount('');
                else setPayoutAmount(val);
              }}
              className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-text-muted mt-1">
              Available: Rs.{summary.pending.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Withdrawal Method
            </label>
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary"
            >
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Stripe">Stripe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Account Details
            </label>
            <input
              type="text"
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder={
                payoutMethod === 'Stripe'
                  ? 'Stripe Account ID or Email'
                  : payoutMethod === 'eSewa'
                  ? 'eSewa ID'
                  : 'Khalti ID'
              }
              className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary"
            />
          </div>
          <div className="flex gap-3 pt-2 justify-end">
            <Button variant="ghost" onClick={() => setShowPayoutModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestPayout} disabled={loading}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EarningsPage;