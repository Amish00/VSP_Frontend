import React, { useState, useEffect } from 'react';
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
                                <td className="px-4 py-3 text-text-secondary capitalize">{record.paymentMethod}</td>
                                <td className="px-4 py-3 text-text-muted">{new Date(record.transactionDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-text-secondary capitalize">{record.planId}</td>
                                <td className="px-4 py-3 text-text-secondary capitalize">{record.billingCycle}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        record.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
                                        record.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-text-primary">Rs. {record.amount}</td>
                            </tr>
                        ))}
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