import React, { useState, useEffect } from 'react';
import Badge from '../components/ui/Badge';
import { adminRevenueApi } from '../../creator/api/creatorApi';

const RevenueRecordsTable = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchRecords();
    }, [page]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await adminRevenueApi.getPaymentRecords(page, 15);
            setRecords(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getPaymentMethodBadgeType = (method) => {
        const m = method?.toLowerCase();
        if (m === 'esewa') return 'esewa';
        if (m === 'khalti') return 'khalti';
        return 'info';
    };

    const getPlanBadgeType = (planId) => {
        switch (planId?.toUpperCase()) {
            case 'CREATE': return 'create_plan';
            case 'VIEW':   return 'view_plan';
            case 'FREE':   return 'free_plan';
            default:       return 'draft';
        }
    };

    const getBillingCycleBadgeType = (cycle) => {
        const c = cycle?.toUpperCase();
        if (c === 'MONTHLY') return 'monthly';
        if (c === 'YEARLY') return 'yearly';
        if (c === '6 MONTHS' || c === 'SEMIANNUAL' || c === 'SIX_MONTHS') return 'semiannual';
        return 'info';
    };

    const getStatusBadgeType = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS': return 'approved';
            case 'PENDING': return 'pending';
            case 'FAILED':  return 'rejected';
            default:        return 'draft';
        }
    };

    if (loading) return <div className="text-center py-8 text-text-secondary">Loading...</div>;

    return (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bg-el border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">User</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Payment Method</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Transaction Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Billing Cycle</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record.id} className="border-b border-border/50 hover:bg-bg-hov transition-colors">
                                <td className="px-4 py-3 font-medium text-text-primary">{record.username}</td>
                                <td className="px-4 py-3">
                                    <Badge text={record.paymentMethod} type={getPaymentMethodBadgeType(record.paymentMethod)} small />
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {new Date(record.transactionDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge text={record.planId} type={getPlanBadgeType(record.planId)} small />
                                </td>
                                <td className="px-4 py-3">
                                    <Badge text={record.billingCycle} type={getBillingCycleBadgeType(record.billingCycle)} small />
                                </td>
                                <td className="px-4 py-3">
                                    <Badge text={record.status} type={getStatusBadgeType(record.status)} small />
                                </td>
                                <td className="px-4 py-3 font-semibold text-text-primary">Rs. {record.amount}</td>
                            </tr>
                        ))}
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                                    No payment records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-4 border-t border-border">
                    <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                        className="px-3 py-1 rounded bg-bg-el text-text-secondary disabled:opacity-50">Previous</button>
                    <span className="text-text-secondary">Page {page+1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
                        className="px-3 py-1 rounded bg-bg-el text-text-secondary disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default RevenueRecordsTable;