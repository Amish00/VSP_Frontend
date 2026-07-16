// src/auth/pages/ResetPasswordPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import AuthCard from '../components/AuthCard';
import { Eye, EyeOff, Check } from 'lucide-react';
import { PiKey } from 'react-icons/pi';
import { useSnackbar } from 'notistack';

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const getPasswordStrength = (pw) => {
  const map = [
    { min:0,  label:'Too short',   color:'#4A6080' },
    { min:1,  label:'Weak',        color:'#EF4444' },
    { min:4,  label:'Fair',        color:'#F59E0B' },
    { min:8,  label:'Strong',      color:'#10B981' },
    { min:12, label:'Very strong', color:'#0EA5E9' },
  ];
  for (let i = map.length - 1; i >= 0; i--) if (pw.length >= map[i].min) return map[i];
  return map[0];
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { email, otp } = location.state || { email: '', otp: '' };

  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const strength = getPasswordStrength(pw);
  const bars = Math.min(4, Math.ceil(pw.length / 3));

  useEffect(() => {
    if (!email || !otp) {
      enqueueSnackbar('Missing information. Please restart the password reset process.', { variant: 'error' });
      navigate('/forgot-password', { replace: true });
    }
  }, [email, otp, navigate, enqueueSnackbar]);

  const reset = async () => {
    // Validate password strength
    const pwError = validatePassword(pw);
    if (pwError) {
      enqueueSnackbar(pwError, { variant: 'error' });
      return;
    }
    if (pw !== confirm) {
      enqueueSnackbar("Passwords don't match.", { variant: 'error' });
      return;
    }
    if (!email || !otp) {
      enqueueSnackbar('Missing information. Please restart the password reset process.', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email, otp, pw);
      setDone(true);
      enqueueSnackbar('Password reset successfully!', { variant: 'success' });
    } catch (err) {
      const msg = err.message || 'Password reset failed. Please try again.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <AuthCard>
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success flex items-center justify-center">
            <Check className="w-8 h-8 text-success" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold mb-2 text-text-primary">Password Reset!</h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">Your password has been updated. You can now sign in.</p>
        <button onClick={() => navigate('/signin')}
          className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] transition-all">
          Go to Sign In
        </button>
      </div>
    </AuthCard>
  );

  return (
    <AuthCard>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <PiKey className="text-5xl text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-1.5 text-text-primary">Set New Password</h1>
        <p className="text-sm text-text-secondary">Choose a strong password for your account.</p>
      </div>

      <div className="mb-3 relative">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">New Password</label>
        <input
          type={showPw ? 'text' : 'password'}
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="At least 8 characters, with uppercase, number, special"
          className={`${inp} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPw(p => !p)}
          aria-label={showPw ? 'Hide password' : 'Show password'}
          className="absolute right-4 bottom-3 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          {showPw ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {pw && (
        <div className="mb-4">
          <div className="flex gap-1 h-1.5 mb-1">
            {[0,1,2,3].map(i => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all"
                style={{ background: i < bars ? strength.color : '#1A2B42' }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
        </div>
      )}

      <div className="mb-4 relative">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Confirm Password</label>
        <input
          type={showConfirmPw ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat password"
          className={`${inp} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPw(p => !p)}
          aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
          className="absolute right-4 bottom-3 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          {showConfirmPw ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <button
        onClick={reset}
        disabled={loading}
        className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]"
      >
        {loading ? 'Resetting…' : 'Reset Password'}
      </button>
    </AuthCard>
  );
};

export default ResetPasswordPage;