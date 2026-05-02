// src/auth/pages/OtpPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import AuthCard from '../components/AuthCard';

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // passed from ForgotPasswordPage

  const [digits, setDigits] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
  if (!email) {
    navigate('/forgot-password', { replace: true });
  }
}, [email, navigate]);


  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const d = [...digits]; d[i] = ''; setDigits(d); setError(false);
      if (i > 0) refs.current[i - 1]?.focus(); return;
    }
    if (e.key === 'ArrowLeft'  && i > 0) { refs.current[i - 1]?.focus(); return; }
    if (e.key === 'ArrowRight' && i < 5) { refs.current[i + 1]?.focus(); return; }
    if (/^\d$/.test(e.key)) {
      const d = [...digits]; d[i] = e.key; setDigits(d); setError(false);
      if (i < 5) refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = e => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { setDigits(text.split('')); setError(false); refs.current[5]?.focus(); }
    e.preventDefault();
  };

  const verify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) { setError(true); return; }
    setLoading(true);
    try {
      await authApi.verifyOtp(email, otp);
      // OTP is valid – go to reset password page, passing email + OTP
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      setError(true);
      setDigits(Array(6).fill(''));
      if (refs.current[0]) refs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setTimer(60);
      setDigits(Array(6).fill(''));
      setError(false);
      if (refs.current[0]) refs.current[0].focus();
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3" aria-hidden>✉️</div>
        <h1 className="font-display text-xl font-bold mb-1.5 text-text-primary">Check Your Email</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          We sent a 6-digit code to <strong className="text-text-primary">{email || 'your email'}</strong>.
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input key={i} ref={el => refs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onKeyDown={e => handleKey(i, e)} readOnly
            aria-label={`Digit ${i + 1} of 6`}
            className={`w-11 h-14 text-center text-2xl font-bold font-display rounded-xl border-2 bg-bg-el text-text-primary transition-all
                       ${error ? 'border-danger ring-2 ring-danger/20' : d ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`} />
        ))}
      </div>

      {error && <p className="text-center text-sm text-danger mb-3" role="alert">⚠ Invalid code — try again.</p>}

      <button onClick={verify} disabled={loading || digits.join('').length < 6}
        className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 mb-4 hover:bg-[#1d4ed8] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]">
        {loading ? 'Verifying…' : 'Verify Code'}
      </button>

      <p className="text-center text-sm text-text-muted">
        Didn't receive it?{' '}
        {timer > 0
          ? <span>Resend in <strong className="tabular-nums">{timer}s</strong></span>
          : <button onClick={resendCode} disabled={loading}
              className="text-primary-light font-semibold hover:opacity-80 disabled:opacity-40">
              Resend
            </button>
        }
      </p>
    </AuthCard>
  );
};

export default OtpPage;