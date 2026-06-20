import React, { useState, useMemo, useEffect } from 'react';
import Badge from '../components/ui/Badge';
import Pagination from './Pagination';
import {
  Wallet,
  Landmark,
  Building,
  CreditCard,
  Banknote,
} from 'lucide-react';

const PAGE_SIZE = 5;

// ----- Display name & meta for withdrawal methods -----
const getMethodDisplayName = (method) => {
  const m = method?.toLowerCase();
  if (m === 'esewa') return 'eSewa';
  if (m === 'khalti') return 'Khalti';
  if (m === 'bank' || m === 'bank transfer') return 'Bank Transfer';
  if (m === 'stripe') return 'Stripe';
  if (m === 'paypal') return 'PayPal';
  return method; // fallback
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
  // fallback
  return { icon: Building, color: 'text-gray-400' };
};

// ----- Status badge helper (unchanged) -----
const getStatusBadgeType = (status) => {
  switch (status?.toUpperCase()) {
    case 'PROCESSED': return 'approved';
    case 'REJECTED':  return 'rejected';
    case 'PENDING':   return 'pending';
    default:          return 'draft';
  }
};

const PayoutTable = ({ rows, onProcess, onReject, isAdmin = false, onPageChange }) => {
  const { data, totalPages: apiTotalPages } = useMemo(() => {
    if (Array.isArray(rows)) {
      return { data: rows, totalPages: null };
    }
    const content = rows?.content ?? rows?.data ?? [];
    const total = rows?.totalPages ?? rows?.total ?? null;
    return { data: content, totalPages: total };
  }, [rows]);

  const [currentPage, setCurrentPage] = useState(1);

  const isServerPagination = apiTotalPages !== null && typeof onPageChange === 'function';

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const currentRows = useMemo(() => {
    if (isServerPagination) {
      return data;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage, isServerPagination]);

  const totalPages = isServerPagination
    ? apiTotalPages
    : Math.ceil(data.length / PAGE_SIZE);

  const handlePageChange = (page) => {
    if (isServerPagination) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const showingFrom = isServerPagination ? '?' : startIndex + 1;
  const showingTo = isServerPagination ? '?' : Math.min(startIndex + PAGE_SIZE, data.length);

  if (data.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-secondary">
        No payout records
      </div>
    );
  }

  const columns = isAdmin
    ? ['Creator', 'Amount', 'Method', 'Account', 'Date', 'Status', 'Action']
    : ['Date', 'Amount', 'Method', 'Status', 'Reference'];

  return (
    <div className="space-y-4">
      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: isAdmin ? 800 : 480 }}>
          <thead>
            <tr className="border-b border-border bg-bg-el">
              {columns.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => {
              const methodDisplay = getMethodDisplayName(row.withdrawalMethod);
              const { icon: MethodIcon, color: methodColor } = getMethodMeta(row.withdrawalMethod);

              return (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  {isAdmin ? (
                    <>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {row.creator?.username || row.creatorId}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-primary">${row.amount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon size={16} className={methodColor} />
                          <span className={`text-xs font-medium ${methodColor}`}>
                            {methodDisplay}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary truncate max-w-[150px]">{row.accountDetails}</td>
                      <td className="px-4 py-3 text-text-muted">{new Date(row.requestedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Badge
                          text={row.status}
                          type={getStatusBadgeType(row.status)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {row.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onProcess?.(row.id)}
                              className="px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => onReject?.(row.id)}
                              className="px-2.5 py-1 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {row.status !== 'PENDING' && <span className="text-xs text-text-muted">—</span>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-text-secondary">{new Date(row.requestedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-text-primary">${row.amount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon size={16} className={methodColor} />
                          <span className={`text-xs font-medium ${methodColor}`}>
                            {methodDisplay}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          text={row.status}
                          type={getStatusBadgeType(row.status)}
                        />
                      </td>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs">PAY-{row.id}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {!isServerPagination && (
            <div className="text-sm text-text-muted">
              Showing {showingFrom} to {showingTo} of {data.length} payouts
            </div>
          )}
          <Pagination
            currentPage={isServerPagination ? rows?.pageNumber ?? currentPage : currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
};

export default PayoutTable;