// EarningsPage.jsx
import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import EarningsChart from '../components/EarningsChart';
import PayoutTable from '../components/PayoutTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { earningsApi } from '../api/creatorApi';
import { DollarSign, Clock, CheckCircle, TrendingUp, Wallet } from 'lucide-react';

const RANGES = ['30 days', '90 days', '1 year', 'All time'];

const EarningsPage = () => {
    const [range, setRange] = useState('30 days');
    const [summary, setSummary] = useState({ totalEarned: 0, paidOut: 0, pending: 0 });
    const [payouts, setPayouts] = useState([]);
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
            const [summaryRes, payoutsRes] = await Promise.all([
                earningsApi.getSummary(),
                earningsApi.getPayouts()
            ]);
            setSummary(summaryRes.data);
            setPayouts(payoutsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRequestPayout = async () => {
        if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (parseFloat(payoutAmount) > summary.pending) {
            alert('Amount exceeds pending balance');
            return;
        }
        setLoading(true);
        try {
            await earningsApi.requestPayout(payoutAmount, payoutMethod, accountDetails);
            alert('Payout request submitted!');
            setShowPayoutModal(false);
            setPayoutAmount('');
            setAccountDetails('');
            fetchData(); // refresh
        } catch (err) {
            alert(err.response?.data?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { icon: <DollarSign size={24} />, label: 'Total Earned', value: `Rs.${summary.totalEarned.toFixed(2)}`, change: '+12%', color: '#10B981' },
        { icon: <Clock size={24} />, label: 'Pending', value: `Rs.${summary.pending.toFixed(2)}`, color: '#F59E0B' },
        { icon: <CheckCircle size={24} />, label: 'Paid Out', value: `Rs.${summary.paidOut.toFixed(2)}`, color: '#60A5FA' },
        { icon: <TrendingUp size={24} />, label: 'Rev Share', value: '70%', color: '#0EA5E9' }, // 70% of pool goes to creator
    ];

    return (
        <div className="pb-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Earnings</h1>
                <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
                    {RANGES.map(r => (
                        <button key={r} onClick={() => setRange(r)} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${range === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            <div className="mb-6"><EarningsChart range={range} /></div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-text-primary">Payout History</h2>
                <Button size="sm" onClick={() => setShowPayoutModal(true)}>Request Payout</Button>
            </div>
            <PayoutTable rows={payouts} />

            {/* Payout Request Modal */}
            <Modal open={showPayoutModal} onClose={() => setShowPayoutModal(false)} title="Request Payout">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Amount (Rs.)</label>
                        <input type="number" step="0.01" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
                        <p className="text-xs text-text-muted mt-1">Available: ${summary.pending.toFixed(2)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Withdrawal Method</label>
                        <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary">
                            <option value="eSewa">eSewa</option>
                            <option value="Khalti">Khalti</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Account Details</label>
                        <input type="text" value={accountDetails} onChange={e => setAccountDetails(e.target.value)}
                            placeholder="eSewa ID / Khalti ID" className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowPayoutModal(false)}>Cancel</Button>
                        <Button onClick={handleRequestPayout} disabled={loading}>Submit Request</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EarningsPage;