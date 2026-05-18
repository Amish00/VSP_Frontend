import React, { useState, useMemo } from 'react';
import Badge from '../components/ui/Badge';
import Pagination from './Pagination'; 

const PAGE_SIZE = 5;

const PayoutTable = ({ rows, onProcess, onReject, isAdmin = false }) => {
  const payoutRows = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : rows?.content ?? rows?.data ?? [];
    return arr;
  }, [rows]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(payoutRows.length / PAGE_SIZE);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentRows = payoutRows.slice(startIndex, startIndex + PAGE_SIZE);

  if (payoutRows.length === 0) {
    return <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-secondary">No payout records</div>;
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
              {columns.map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map(row => (
              <tr key={row.id} className="border-b border-border/50 last:border-0">
                {isAdmin ? (
                  <>
                    <td className="px-4 py-3 font-medium text-text-primary">{row.creator?.username || row.creatorId}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">${row.amount}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.withdrawalMethod}</td>
                    <td className="px-4 py-3 text-text-secondary truncate max-w-[150px]">{row.accountDetails}</td>
                    <td className="px-4 py-3 text-text-muted">{new Date(row.requestedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge 
                        text={row.status} 
                        type={row.status === 'PROCESSED' ? 'approved' : row.status === 'REJECTED' ? 'rejected' : 'pending'} 
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
                    <td className="px-4 py-3 text-text-secondary">{row.withdrawalMethod}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-text-muted">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, payoutRows.length)} of {payoutRows.length} payouts
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

export default PayoutTable;