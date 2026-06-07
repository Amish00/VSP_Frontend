import React, { useState, useEffect } from 'react';
import { adminRevenueApi } from '../../creator/api/creatorApi';
import { earningsApi } from '../../creator/api/creatorApi';
import { Download, FileText, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

const Report = () => {
    const { showSuccess, showError } = useNotification();
    const [activeTab, setActiveTab] = useState('revenue');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [revenueData, setRevenueData] = useState([]);
    const [earningsData, setEarningsData] = useState([]);
    const [payoutsData, setPayoutsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const normalizeList = (payload) => {
        if (Array.isArray(payload)) return payload;
        return payload?.content ?? payload?.data ?? payload?.items ?? [];
    };

    useEffect(() => {
        if (activeTab === 'revenue') fetchRevenueReport();
        if (activeTab === 'earnings') fetchEarningsReport();
        if (activeTab === 'payouts') fetchPayoutsReport();
    }, [activeTab, startDate, endDate]);

    const fetchRevenueReport = async () => {
        setLoading(true);
        try {
            const res = await adminRevenueApi.getMonthlyRevenue(12);
            setRevenueData(res.data);
        } catch (err) {
            console.error(err);
            showError('Failed to load revenue report');
        } finally {
            setLoading(false);
        }
    };

    const fetchEarningsReport = async () => {
        setLoading(true);
        try {
            const res = await adminRevenueApi.getAllCreatorEarnings?.();
            setEarningsData(res?.data || []);
        } catch (err) {
            console.error(err);
            showError('Failed to load earnings report');
        } finally {
            setLoading(false);
        }
    };

    const fetchPayoutsReport = async () => {
        setLoading(true);
        try {
            const pending = await adminRevenueApi.getPendingPayouts();
            setPayoutsData(pending.data);
        } catch (err) {
            console.error(err);
            showError('Failed to load payouts report');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        try {
            if (!data || data.length === 0) {
                showError('No data available to export');
                return;
            }
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
            ];
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showSuccess(`${filename}.csv exported successfully`);
        } catch (err) {
            console.error(err);
            showError('Failed to export CSV');
        }
    };

    const renderRevenueReport = () => {
        const filteredData = revenueData.filter(item => item.total > 0);
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display font-bold text-lg text-text-primary">Monthly Revenue Breakdown</h3>
                    <button onClick={() => exportToCSV(filteredData, 'revenue_report')} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">No revenue data available</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-bg-el border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Month</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Total Revenue</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Platform Fee (30%)</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Creator Pool</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border/50">
                                        <td className="px-4 py-3 text-text-primary">{item.month}</td>
                                        <td className="px-4 py-3 text-text-primary">Rs. {item.total?.toFixed(2) || 0}</td>
                                        <td className="px-4 py-3 text-text-primary">Rs. {item.platformFee?.toFixed(2) || 0}</td>
                                        <td className="px-4 py-3 text-text-primary">Rs. {item.creatorPool?.toFixed(2) || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderEarningsReport = () => (
        <div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">Note: This report aggregates all creators' monthly earnings. You can view individual creator earnings in the Creator Management page.</p>
            </div>
            <div className="flex justify-end mb-4">
                <button onClick={() => exportToCSV(earningsData, 'creator_earnings_report')} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                    <Download size={16} /> Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bg-el border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Creator</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Month</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Earnings</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {earningsData.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-8 text-center text-text-secondary">No earnings data available. Run monthly earnings calculation first.</td></tr>
                        ) : (
                            earningsData.map((item, idx) => (
                                <tr key={idx} className="border-b border-border/50">
                                    <td className="px-4 py-3 text-text-primary">{item.creatorName || 'Creator'}</td>
                                    <td className="px-4 py-3 text-text-primary">{item.monthYear}</td>
                                    <td className="px-4 py-3 text-text-primary">Rs. {item.earningsAmount?.toFixed(2) || 0}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Paid</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPayoutsReport = () => {
        const payoutRows = normalizeList(payoutsData);
        const pendingRows = payoutRows.filter(p => p.status === 'PENDING');
        return (
            <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 text-text-secondary mb-1"><Users size={16}/> Pending Requests</div>
                        <div className="text-2xl font-bold text-text-primary">{pendingRows.length}</div>
                    </div>
                    <div className="bg-bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 text-text-secondary mb-1"><DollarSign size={16}/> Total Pending Amount</div>
                        <div className="text-2xl font-bold text-text-primary">
                            Rs. {pendingRows.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mb-4">
                    <button onClick={() => exportToCSV(payoutRows, 'payout_requests_report')} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-bg-el border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Creator</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Method</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Requested At</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-text-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutRows.length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-text-secondary">No payout requests found.</td></tr>
                            ) : (
                                payoutRows.map(payout => (
                                    <tr key={payout.id} className="border-b border-border/50">
                                        <td className="px-4 py-3 text-text-primary">{payout.creator?.username || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-text-primary">Rs. {payout.amount}</td>
                                        <td className="px-4 py-3 text-text-secondary">{payout.withdrawalMethod}</td>
                                        <td className="px-4 py-3 text-text-muted">{new Date(payout.requestedAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                payout.status === 'PROCESSED' ? 'bg-green-500/20 text-green-400' : 
                                                payout.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Reports</h1>
                <div className="flex gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
                        className="px-3 py-1.5 bg-bg-el border border-border rounded-lg text-text-primary text-sm" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
                        className="px-3 py-1.5 bg-bg-el border border-border rounded-lg text-text-primary text-sm" />
                </div>
            </div>

            <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl w-fit mb-6">
                {[
                    { id: 'revenue', label: 'Revenue Report', icon: <TrendingUp size={16} /> },
                    { id: 'earnings', label: 'Creator Earnings', icon: <DollarSign size={16} /> },
                    { id: 'payouts', label: 'Payout Requests', icon: <FileText size={16} /> }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            activeTab === tab.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                        }`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-bg-card border border-border rounded-2xl p-6">
                {loading ? (
                    <div className="text-center py-12 text-text-secondary">Loading report data...</div>
                ) : (
                    <>
                        {activeTab === 'revenue' && renderRevenueReport()}
                        {activeTab === 'earnings' && renderEarningsReport()}
                        {activeTab === 'payouts' && renderPayoutsReport()}
                    </>
                )}
            </div>
        </div>
    );
};

export default Report;