import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import RevenueChart from '../components/RevenueChart';
import PayoutTable from '../components/PayoutTable';
import { adminRevenueApi } from '../../creator/api/creatorApi';
import { DollarSign, CreditCard, TrendingUp, Users, Wallet, BanknoteIcon } from 'lucide-react';
import RevenueRecordsTable from '../components/RevenueRecordsTable';
import { useNotification } from '../../hooks/useNotification';
import { FaMoneyBillWave } from "react-icons/fa6";
import Modal from '../components/ui/Modal';  // your existing Modal component

// helper: compact number formatting
const formatNumber = (num) => {
  if (num == null) return '0';
  const n = Number(num);
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
};

const RANGES = ['30 days', '90 days', '1 year'];
const getMonthsFromRange = (range) => {
  switch (range) {
    case '30 days': return 1;
    case '90 days': return 3;
    case '1 year': return 12;
    default: return 12;
  }
};

const RevenuePage = () => {
    const { showSuccess, showError } = useNotification();
    const [range, setRange] = useState('1 year');
    const [monthlyData, setMonthlyData] = useState([]);
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [totalStats, setTotalStats] = useState({ totalRevenue: 0, platformFee: 0, creatorPool: 0 });

    // ---- modal states ----
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        payoutId: null,
        action: null, // 'process' or 'reject'
        reason: '',
    });

    const [rejectModal, setRejectModal] = useState({
        open: false,
        payoutId: null,
        reason: '',
    });

    useEffect(() => {
        fetchData();
    }, [range]);

    const fetchData = async () => {
        try {
            const months = getMonthsFromRange(range);
            const monthlyRes = await adminRevenueApi.getMonthlyRevenue(months);
            setMonthlyData(monthlyRes.data);

            const pendingRes = await adminRevenueApi.getPendingPayouts();
            setPendingPayouts(pendingRes.data);

            const totalRevenue = monthlyRes.data.reduce((sum, m) => sum + m.total, 0);
            const platformFee = monthlyRes.data.reduce((sum, m) => sum + m.platformFee, 0);
            const creatorPool = monthlyRes.data.reduce((sum, m) => sum + m.creatorPool, 0);
            setTotalStats({ totalRevenue, platformFee, creatorPool });
        } catch (err) {
            console.error(err);
            showError('Failed to load revenue data');
        }
    };

    // ---- handle process (opens confirm modal) ----
    const handleProcessClick = (payoutId) => {
        setConfirmModal({
            open: true,
            payoutId,
            action: 'process',
            reason: '',
        });
    };

    // ---- handle reject (opens reject modal with input) ----
    const handleRejectClick = (payoutId) => {
        setRejectModal({
            open: true,
            payoutId,
            reason: '',
        });
    };

    // ---- confirm process ----
    const confirmProcess = async () => {
        const { payoutId } = confirmModal;
        try {
            await adminRevenueApi.processPayout(payoutId);
            showSuccess('Payout processed successfully');
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to process payout';
            showError(msg);
        } finally {
            setConfirmModal({ open: false, payoutId: null, action: null, reason: '' });
        }
    };

    // ---- confirm reject ----
    const confirmReject = async () => {
        const { payoutId, reason } = rejectModal;
        if (!reason.trim()) {
            showError('Please provide a rejection reason');
            return;
        }
        try {
            await adminRevenueApi.rejectPayout(payoutId, reason);
            showSuccess('Payout rejected successfully');
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reject payout';
            showError(msg);
        } finally {
            setRejectModal({ open: false, payoutId: null, reason: '' });
        }
    };

    // ---- stats with formatted numbers ----
    const stats = [
        { 
            icon: <FaMoneyBillWave size={24} color="#10B981" />, 
            label: 'Total Revenue', 
            value: `Rs. ${formatNumber(totalStats.totalRevenue)}`, 
            color: '#10B981' 
        },
        { 
            icon: <CreditCard size={24} color="#60A5FA" />, 
            label: 'Subscriptions', 
            value: `Rs. ${formatNumber(totalStats.totalRevenue)}`, 
            color: '#60A5FA' 
        },
        { 
            icon: <TrendingUp size={24} color="#F59E0B" />, 
            label: 'Platform Fee (30%)', 
            value: `Rs. ${formatNumber(totalStats.platformFee)}`, 
            color: '#F59E0B' 
        },
        { 
            icon: <Wallet size={24} color="#0EA5E9" />, 
            label: 'Creator Pool', 
            value: `Rs. ${formatNumber(totalStats.creatorPool)}`, 
            color: '#0EA5E9' 
        },
    ];

    // ---- pending payouts summary (formatted) ----
    const pendingRows = pendingPayouts.filter(p => p.status === 'PENDING');
    const pendingCount = pendingRows.length;
    const pendingAmount = pendingRows.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Revenue</h1>
                <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
                    {RANGES.map(r => (
                        <button key={r} onClick={() => setRange(r)} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${range === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            <div>
                <RevenueChart data={monthlyData} />
            </div>

            <h2 className="font-display font-bold text-lg mb-3 text-text-primary">Pending Payouts</h2>
            

            <PayoutTable 
                rows={pendingPayouts} 
                onProcess={handleProcessClick}  
                onReject={handleRejectClick}    
                isAdmin={true} 
            />

            <div className="mt-8">
                <h2 className="font-display font-bold text-lg mb-3 text-text-primary">All Payment Records</h2>
                <RevenueRecordsTable />
            </div>

            {/* ---- Confirm Modal (for processing) ---- */}
            <Modal
                open={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, payoutId: null, action: null, reason: '' })}
                title="Confirm Process"
                maxW={480}
            >
                <div className="space-y-6">
                    <p className="text-text-secondary">
                        Are you sure you want to process this payout? This action will mark it as <strong>processed</strong> and cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setConfirmModal({ open: false, payoutId: null, action: null, reason: '' })}
                            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmProcess}
                            className="px-4 py-2 rounded-lg bg-success text-white font-semibold hover:bg-success/90 transition-colors"
                        >
                            Yes, Process
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ---- Reject Modal (with reason input) ---- */}
            <Modal
                open={rejectModal.open}
                onClose={() => setRejectModal({ open: false, payoutId: null, reason: '' })}
                title="Reject Payout"
                maxW={480}
            >
                <div className="space-y-6">
                    <p className="text-text-secondary">
                        Please provide a reason for rejecting this payout. The creator will see this explanation.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Rejection Reason</label>
                        <input
                            type="text"
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                            placeholder="e.g. Insufficient balance, invalid account details, etc."
                            className="w-full px-3 py-2 bg-bg-el border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setRejectModal({ open: false, payoutId: null, reason: '' })}
                            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReject}
                            className="px-4 py-2 rounded-lg bg-danger text-white font-semibold hover:bg-danger/90 transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RevenuePage;