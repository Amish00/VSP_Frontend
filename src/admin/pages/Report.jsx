import React, { useState, useEffect } from 'react';
import { adminRevenueApi } from '../../creator/api/creatorApi';
import { earningsApi } from '../../creator/api/creatorApi';
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  Building,
} from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

// ----- Helper: method display name & meta (icons + colors) -----
const getMethodDisplayName = (method) => {
  const m = method?.toLowerCase();
  if (m === 'esewa') return 'eSewa';
  if (m === 'khalti') return 'Khalti';
  if (m === 'bank' || m === 'bank transfer') return 'Bank Transfer';
  if (m === 'stripe') return 'Stripe';
  if (m === 'paypal') return 'PayPal';
  return method;
};

const getMethodMeta = (method) => {
  const m = method?.toLowerCase();
  if (m === 'esewa') {
    return { icon: Wallet, color: 'text-green-500' };
  }
  if (m === 'khalti') {
    return { icon: Wallet, color: 'text-purple-500' };
  }
  if (m === 'bank' || m === 'bank transfer') {
    return { icon: Landmark, color: 'text-blue-500' };
  }
  if (m === 'stripe') {
    return { icon: CreditCard, color: 'text-indigo-400' };
  }
  if (m === 'paypal') {
    return { icon: Banknote, color: 'text-sky-500' };
  }
  return { icon: Building, color: 'text-gray-400' };
};

// ----- Helper: format date for API -----
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return dateStr; // already YYYY-MM-DD from input
};

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

  // Fetch data whenever tab or date range changes
  useEffect(() => {
    if (activeTab === 'revenue') fetchRevenueReport();
    if (activeTab === 'earnings') fetchEarningsReport();
    if (activeTab === 'payouts') fetchPayoutsReport();
  }, [activeTab, startDate, endDate]);

  // ----- Revenue Report (monthly, no date filter) -----
  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      const res = await adminRevenueApi.getMonthlyRevenue(12);
      setRevenueData(res.data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  };

  // ----- Earnings Report (with date filter) -----
  const fetchEarningsReport = async () => {
    setLoading(true);
    try {
      // Assuming API accepts startDate and endDate as query params
      const res = await adminRevenueApi.getAllCreatorEarnings?.(startDate, endDate);
      setEarningsData(res?.data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load earnings report');
    } finally {
      setLoading(false);
    }
  };

  // ----- Payouts Report (with date filter) -----
  const fetchPayoutsReport = async () => {
    setLoading(true);
    try {
      // Assuming API accepts startDate and endDate
      const res = await adminRevenueApi.getPendingPayouts(startDate, endDate);
      setPayoutsData(res.data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to load payouts report');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV using the current data (already filtered)
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

  // ----- Render functions -----
  const renderRevenueReport = () => {
    const filteredData = revenueData.filter(item => item.total > 0);
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold text-lg text-text-primary">Monthly Revenue Breakdown</h3>
          <button
            onClick={() => exportToCSV(filteredData, 'revenue_report')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
          >
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

  const renderEarningsReport = () => {
    // Filter earnings data based on date range (client-side fallback if API doesn't filter)
    const filtered = earningsData.filter(item => {
      if (!startDate || !endDate) return true;
      const itemDate = item.monthYear || item.date; // adjust field name
      if (!itemDate) return true;
      return itemDate >= startDate && itemDate <= endDate;
    });

    return (
      <div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            Note: This report aggregates all creators' monthly earnings. You can view individual creator earnings in the Creator Management page.
          </p>
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => exportToCSV(filtered, 'creator_earnings_report')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
          >
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-text-secondary">
                    No earnings data available for the selected period.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
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
  };

  const renderPayoutsReport = () => {
    const payoutRows = normalizeList(payoutsData);
    // Client-side date filtering (if API doesn't support)
    const filteredPayouts = payoutRows.filter(p => {
      if (!startDate || !endDate) return true;
      const date = new Date(p.requestedAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return date >= start && date <= end;
    });

    const pendingRows = filteredPayouts.filter(p => p.status === 'PENDING');

    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <Users size={16} /> Pending Requests
            </div>
            <div className="text-2xl font-bold text-text-primary">{pendingRows.length}</div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-1">
              <DollarSign size={16} /> Total Pending Amount
            </div>
            <div className="text-2xl font-bold text-text-primary">
              Rs. {pendingRows.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => exportToCSV(filteredPayouts, 'payout_requests_report')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
          >
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
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                    No payout requests found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map(payout => {
                  const methodDisplay = getMethodDisplayName(payout.withdrawalMethod);
                  const { icon: MethodIcon, color: methodColor } = getMethodMeta(payout.withdrawalMethod);

                  return (
                    <tr key={payout.id} className="border-b border-border/50">
                      <td className="px-4 py-3 text-text-primary">{payout.creator?.username || 'Unknown'}</td>
                      <td className="px-4 py-3 text-text-primary">Rs. {payout.amount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon size={16} className={methodColor} />
                          <span className={`text-xs font-medium ${methodColor}`}>{methodDisplay}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            payout.status === 'PROCESSED'
                              ? 'bg-green-500/20 text-green-400'
                              : payout.status === 'REJECTED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Reports</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-text-secondary">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-bg-el border border-border rounded-lg text-text-primary text-sm"
          />
          <label className="text-sm text-text-secondary">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-bg-el border border-border rounded-lg text-text-primary text-sm"
          />
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl w-fit mb-6">
        {[
          { id: 'revenue', label: 'Revenue Report', icon: <TrendingUp size={16} /> },
          { id: 'earnings', label: 'Creator Earnings', icon: <DollarSign size={16} /> },
          { id: 'payouts', label: 'Payout Requests', icon: <FileText size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
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