// src/pages/PaymentFailure.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

const PaymentFailure = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-bg-deep to-bg-card">
      <div className="text-center max-w-2xl w-full">
        {/* Animated failure graphic */}
        <div className="mb-8 relative">
          <div className="text-[120px] sm:text-[160px] font-black leading-none font-display text-red-500/10 select-none">
            <AlertTriangle className="mx-auto h-[120px] w-[120px] sm:h-[160px] sm:w-[160px]" strokeWidth={1.25} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-red-500/15 flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="w-14 h-14 sm:w-20 sm:h-20 text-red-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-3">
          Payment Failed
        </h1>
        <p className="text-text-secondary text-base sm:text-lg mb-4">
          We couldn't process your payment. This might be due to:
        </p>

        {/* Reasons card */}
        <div className="bg-bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-5 mb-8 max-w-sm mx-auto text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-text-primary">Common Issues</h3>
          </div>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Insufficient funds or card limit exceeded</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Incorrect card details or expired card</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Bank declined the transaction for security reasons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Temporary network or server error</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/plans"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-85 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-bg-card text-text-primary font-semibold hover:border-primary/50 hover:text-primary-light transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        <p className="text-text-muted text-xs mt-8">
          Your card has not been charged. Please verify your payment details and try again.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;