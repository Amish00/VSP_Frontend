// RevenuePage.jsx
import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import RevenueChart from '../components/RevenueChart';
import PayoutTable from '../components/PayoutTable';
import { adminRevenueApi } from '../../creator/api/creatorApi';
import { DollarSign, CreditCard, TrendingUp, Users, Wallet } from 'lucide-react';
import RevenueRecordsTable from '../components/RevenueRecordsTable';

const RANGES = ['30 days', '90 days', '1 year', 'All time'];

const RevenuePage = () => {
    const [range, setRange] = useState('30 days');
    const [monthlyData, setMonthlyData] = useState([]);
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [totalStats, setTotalStats] = useState({ totalRevenue: 0, platformFee: 0, creatorPool: 0 });

    useEffect(() => {
        fetchData();
    }, [range]);

    const fetchData = async () => {
        try {
            const monthlyRes = await adminRevenueApi.getMonthlyRevenue(12);
            setMonthlyData(monthlyRes.data);

            const pendingRes = await adminRevenueApi.getPendingPayouts();
            setPendingPayouts(pendingRes.data);

            // For total stats, calculate over selected range (simplified - use last 30 days from now)
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - (range === '30 days' ? 30 : range === '90 days' ? 90 : 365));
            // Call total endpoint if needed or derive from monthly data
            const totalRevenue = monthlyRes.data.reduce((sum, m) => sum + m.total, 0);
            const platformFee = monthlyRes.data.reduce((sum, m) => sum + m.platformFee, 0);
            const creatorPool = monthlyRes.data.reduce((sum, m) => sum + m.creatorPool, 0);
            setTotalStats({ totalRevenue, platformFee, creatorPool });
        } catch (err) {
            console.error(err);
        }
    };

    const handleProcess = async (payoutId) => {
        if (window.confirm('Mark this payout as processed?')) {
            await adminRevenueApi.processPayout(payoutId);
            fetchData();
        }
    };

    const handleReject = async (payoutId) => {
        const reason = prompt('Rejection reason:');
        if (reason) {
            await adminRevenueApi.rejectPayout(payoutId, reason);
            fetchData();
        }
    };

    const stats = [
        { icon: <DollarSign size={24} />, label: 'Total Revenue', value: `Rs.${(totalStats.totalRevenue).toFixed(0)}`, change: '+22%', color: '#10B981' },
        { icon: <CreditCard size={24} />, label: 'Subscriptions', value: `Rs.${(totalStats.totalRevenue).toFixed(0)}`, change: '+18%', color: '#60A5FA' },
        { icon: <TrendingUp size={24} />, label: 'Platform Fee (30%)', value: `Rs.${(totalStats.platformFee).toFixed(0)}`, change: '+12%', color: '#F59E0B' },
        { icon: <Wallet size={24} />, label: 'Creator Pool', value: `Rs.${(totalStats.creatorPool).toFixed(0)}`, change: '+8%', color: '#0EA5E9' },
    ];

    return (
        <div className="pb-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            <div className="mb-6">
                <RevenueChart data={monthlyData} />
            </div>

            <h2 className="font-display font-bold text-lg mb-3 text-text-primary">Pending Payouts</h2>
            <PayoutTable rows={pendingPayouts} onProcess={handleProcess} onReject={handleReject} isAdmin={true} />

            <div className="mt-8">
              <h2 className="font-display font-bold text-lg mb-3 text-text-primary">All Payment Records</h2>
              <RevenueRecordsTable />
            </div>
        </div>
    );
};

export default RevenuePage;