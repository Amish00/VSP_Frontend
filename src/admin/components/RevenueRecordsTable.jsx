import React, { useState, useEffect, useCallback } from 'react';
import Badge from '../components/ui/Badge';
import Pagination from '../components/Pagination'; // adjust path
import { adminRevenueApi } from '../../creator/api/creatorApi';

const PAGE_SIZE = 10;

const RevenueRecordsTable = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);    // 1‑based for UI
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            // Convert to 0‑based page for API
            const res = await adminRevenueApi.getPaymentRecords(currentPage - 1, PAGE_SIZE);
            setRecords(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error('Failed to fetch revenue records', err);
            setRecords([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

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

    if (loading && records.length === 0) {
        return <div className="text-center py-8 text-text-secondary">Loading...</div>;
    }

    return (
        <div className="space-y-4">
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
            </div>

            {/* Pagination with reusable component */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-sm text-text-muted">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalElements)} of {totalElements} records
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        siblingCount={1}
                    />
                </div>
            )}
        </div>
    );
};

export default RevenueRecordsTable;