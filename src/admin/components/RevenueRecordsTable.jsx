import React, { useState, useEffect, useCallback } from 'react';
import Badge from '../components/ui/Badge';
import Pagination from '../components/Pagination';
import { adminRevenueApi } from '../../creator/api/creatorApi';
import {
  CreditCard,
  Wallet,
  Zap,
  Star,
  Gift,
  Calendar,
  Clock,
} from 'lucide-react';

const PAGE_SIZE = 10;

// ----- Display name mappings for consistent camel/title case -----

const getDisplayPaymentMethod = (method) => {
  const m = method?.toLowerCase();
  if (m === 'esewa') return 'eSewa';
  if (m === 'khalti') return 'Khalti';
  if (m === 'stripe') return 'Stripe';
  return method; // fallback
};

const getDisplayPlan = (plan) => {
  const p = plan?.toLowerCase();
  if (p === 'free') return 'Free';
  if (p === 'view') return 'View';
  if (p === 'create') return 'Create';
  return plan;
};

const getDisplayBillingCycle = (cycle) => {
  const c = cycle?.toLowerCase();
  if (c === 'monthly') return 'Monthly';
  if (c === 'yearly') return 'Yearly';
  if (c === '6 months' || c === 'semiannual' || c === 'six_months') return '6 Months';
  return cycle;
};

// ----- Meta helpers for icons & colors -----

const getPaymentMethodMeta = (method) => {
  const m = method?.toLowerCase();
  if (m === 'esewa') {
    return { icon: Wallet, color: 'text-green-500' };
  }
  if (m === 'khalti') {
    return { icon: Wallet, color: 'text-purple-500' };
  }
  if (m === 'stripe') {
    return { icon: CreditCard, color: 'text-blue-500' };
  }
  return { icon: CreditCard, color: 'text-gray-400' };
};

const getPlanMeta = (planId) => {
  const p = planId?.toUpperCase();
  if (p === 'FREE') {
    return { icon: Gift, color: 'text-gray-400' };
  }
  if (p === 'VIEW') {
    return { icon: Star, color: 'text-indigo-400' };
  }
  if (p === 'CREATE') {
    return { icon: Zap, color: 'text-blue-500' };
  }
  return { icon: Star, color: 'text-gray-400' };
};

const getBillingCycleMeta = (cycle) => {
  const c = cycle?.toUpperCase();
  if (c === 'MONTHLY') {
    return { icon: Calendar, color: 'text-blue-400' };
  }
  if (c === 'YEARLY') {
    return { icon: Calendar, color: 'text-yellow-500' };
  }
  if (c === '6 MONTHS' || c === 'SEMIANNUAL' || c === 'SIX_MONTHS') {
    return { icon: Clock, color: 'text-orange-400' };
  }
  return { icon: Clock, color: 'text-gray-400' };
};

const getStatusBadgeType = (status) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'approved';
    case 'PENDING': return 'pending';
    case 'FAILED':  return 'rejected';
    default:        return 'draft';
  }
};

const RevenueRecordsTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
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
              {records.map(record => {
                const paymentMeta = getPaymentMethodMeta(record.paymentMethod);
                const planMeta = getPlanMeta(record.planId);
                const cycleMeta = getBillingCycleMeta(record.billingCycle);
                const PaymentIcon = paymentMeta.icon;
                const PlanIcon = planMeta.icon;
                const CycleIcon = cycleMeta.icon;

                // Get display‑ready values
                const displayPayment = getDisplayPaymentMethod(record.paymentMethod);
                const displayPlan = getDisplayPlan(record.planId);
                const displayCycle = getDisplayBillingCycle(record.billingCycle);

                return (
                  <tr key={record.id} className="border-b border-border/50 hover:bg-bg-hov transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{record.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <PaymentIcon size={16} className={paymentMeta.color} />
                        <span className={`text-xs font-medium ${paymentMeta.color}`}>
                          {displayPayment}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(record.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <PlanIcon size={16} className={planMeta.color} />
                        <span className={`text-xs font-medium ${planMeta.color}`}>
                          {displayPlan}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <CycleIcon size={16} className={cycleMeta.color} />
                        <span className={`text-xs font-medium ${cycleMeta.color}`}>
                          {displayCycle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={record.status} type={getStatusBadgeType(record.status)} small />
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary">Rs. {record.amount}</td>
                  </tr>
                );
              })}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-text-muted">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, totalElements)} of {totalElements} records
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