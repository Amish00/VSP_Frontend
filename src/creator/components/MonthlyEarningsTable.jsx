import React, { useState, useMemo } from 'react';
import Pagination from '../../admin/components/Pagination';

const PAGE_SIZE = 5;

const MonthlyEarningsTable = ({ monthlyEarnings = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // Sort by month-year descending (most recent first)
    const sortedEarnings = useMemo(() => {
        return [...monthlyEarnings].sort((a, b) => {
            if (a.monthYear && b.monthYear) {
                return b.monthYear.localeCompare(a.monthYear);
            }
            return 0;
        });
    }, [monthlyEarnings]);

    const totalPages = Math.ceil(sortedEarnings.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentRows = sortedEarnings.slice(startIndex, startIndex + PAGE_SIZE);

    // Calculate total earned
    const totalEarned = sortedEarnings.reduce((sum, item) => {
        const amount = item.earningsAmount ?? item.amount ?? 0;
        return sum + amount;
    }, 0);

    // Helper to format month nicely (if needed)
    const formatMonth = (monthStr) => {
        if (!monthStr) return '—';
        // If monthYear is like "2025-06", convert to "June 2025"
        if (monthStr.match(/^\d{4}-\d{2}$/)) {
            const [year, month] = monthStr.split('-');
            const date = new Date(year, parseInt(month) - 1, 1);
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        return monthStr;
    };

    if (sortedEarnings.length === 0) {
        return (
            <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-secondary">
                No monthly earnings data available.
            </div>
        );
    }

    return (
        <div>
            <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bg-el border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                                Month
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                                Amount Earned
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((item, idx) => (
                            <tr key={idx} className="border-b border-border/50 last:border-0">
                                <td className="px-4 py-3 text-text-primary font-medium">
                                    {formatMonth(item.monthYear || item.month)}
                                </td>
                                <td className="px-4 py-3 font-semibold text-text-primary">
                                    Rs. {(item.earningsAmount ?? item.amount ?? 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-primary/10 border-t-2 border-primary/30">
                        <tr>
                            <td className="px-4 py-3 font-bold text-text-primary text-base">
                                Total Earnings
                            </td>
                            <td className="px-4 py-3 font-extrabold text-text-primary text-base">
                                Rs. {totalEarned.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-end mt-4">
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

export default MonthlyEarningsTable;