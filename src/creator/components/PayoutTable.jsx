import React, { useMemo, useState } from 'react';
import Badge from '../components/ui/Badge';
import Pagination from '../../admin/components/Pagination';
import {
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  Building,
} from 'lucide-react';

const PAGE_SIZE = 5;
const STATUS_ORDER = { PENDING: 0, PROCESSED: 1, REJECTED: 2 };

// ----- Helper: method display name & meta (icons + colors) -----
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
  return { icon: Building, color: 'text-gray-400' };
};

const PayoutTable = ({ rows, onProcess, onReject, isAdmin = false, extraActions }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const rawRows = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : rows?.content ?? rows?.data ?? [];
    return arr;
  }, [rows]);

  const filteredAndSortedRows = useMemo(() => {
    let filtered = rawRows;
    if (statusFilter !== 'ALL') {
      filtered = rawRows.filter(row => row.status === statusFilter);
    }
    return [...filtered].sort((a, b) => {
      const orderA = STATUS_ORDER[a.status] ?? 999;
      const orderB = STATUS_ORDER[b.status] ?? 999;
      return orderA - orderB;
    });
  }, [rawRows, statusFilter]);

  const totalPages = Math.ceil(filteredAndSortedRows.length / PAGE_SIZE);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, rows]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentRows = filteredAndSortedRows.slice(startIndex, startIndex + PAGE_SIZE);

  if (filteredAndSortedRows.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-secondary">
        No payout records
      </div>
    );
  }

  const columns = isAdmin
    ? ['Creator', 'Amount', 'Method', 'Account', 'Date', 'Status', 'Action']
    : ['Date', 'Amount', 'Method', 'Status', 'Reference'];

  const filterOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSED', label: 'Processed' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  return (
    <>
      {/* Header: title on left, filter + button on right */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display font-bold text-lg text-text-primary">Payout History</h2>
        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === opt.value
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Extra actions (e.g., Request Payout button) placed after filter */}
          {extraActions && <div>{extraActions}</div>}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: isAdmin ? 800 : 480 }}>
          <thead>
            <tr className="border-b border-border bg-bg-el">
              {columns.map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map(row => {
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
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(row.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          text={row.status}
                          type={
                            row.status === 'PROCESSED'
                              ? 'approved'
                              : row.status === 'REJECTED'
                              ? 'rejected'
                              : 'pending'
                          }
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
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(row.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-primary">Rs.{row.amount}</td>
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
                          type={row.status === 'PROCESSED' ? 'approved' : 'pending'}
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
    </>
  );
};

export default PayoutTable;