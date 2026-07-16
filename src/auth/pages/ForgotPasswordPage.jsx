// src/auth/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { authApi } from '../api/authApi';
import AuthCard from '../components/AuthCard';
import { useSnackbar } from 'notistack';

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const send = async () => {
    if (!email) {
      enqueueSnackbar('Enter your email address.', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
      enqueueSnackbar('Reset code sent! Redirecting...', { variant: 'success' });
      setTimeout(() => navigate('/otp', { state: { email } }), 1500);
    } catch (err) {
      const msg = err.message || 'Failed to send reset code. Please try again.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-6">
        {/* Icon container – flex centers the icon horizontally */}
        <div className="flex justify-center mb-3">
          <FaEnvelope className="text-5xl text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-1.5 text-text-primary">Reset Your Password</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Enter your account email and we'll send a 6-digit reset code.
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="you@example.com"
          autoFocus
          className={inp}
        />
      </div>

      <button
        onClick={send}
        disabled={loading || success}
        className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 mb-5 hover:bg-[#1d4ed8] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]"
      >
        {loading ? 'Sending…' : 'Send Reset Code'}
      </button>

      <p className="text-center text-sm text-text-muted">
        Remember it?{' '}
        <Link to="/signin" className="text-primary-light font-semibold hover:opacity-80">
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPasswordPage;