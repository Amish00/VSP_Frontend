// src/auth/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import { Eye, EyeOff } from 'lucide-react';
import { useSnackbar } from 'notistack';

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

// ---------- Visual strength indicator ----------
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

// ---------- Strict password validation ----------
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

const SignUpPage = () => {
  const { signupAndLogin } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [f, setF] = useState({ name:'', email:'', password:'', confirm:'' });
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));

  const strength = getPasswordStrength(f.password);
  const bars = Math.min(4, Math.ceil(f.password.length / 3));

  // Combined validation including email format and password strength
  const validate = () => {
    if (!f.name.trim()) return 'Full name is required.';
    if (!f.email.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(f.email)) return 'Please enter a valid email address.';
    // Use the new password validator
    const pwError = validatePassword(f.password);
    if (pwError) return pwError;
    if (f.password !== f.confirm) return "Passwords don't match.";
    return null;
  };

  const submit = async () => {
    setConfirmTouched(true);
    const err = validate();
    if (err) {
      enqueueSnackbar(err, { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const user = await signupAndLogin(f.name, f.email, f.password);
      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      const role = user.role?.toLowerCase();
      if (role === 'admin') navigate('/admin');
      else if (role === 'creator') navigate('/creator');
      else navigate('/');
    } catch (err) {
      const msg = err.message || 'Signup failed. Email or username may already exist.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl mb-6">
        {[['signin','Log In'],['signup','Sign Up']].map(([r, l]) => (
          <Link key={r} to={`/${r}`}
            className={`flex-1 py-2.5 rounded-lg text-base font-semibold transition-colors text-center
                       ${r === 'signup' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            {l}
          </Link>
        ))}
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Username *</label>
        <input
          id='name'
          value={f.name}
          onChange={e => upd('name', e.target.value)}
          placeholder="Your display name"
          autoFocus
          className={inp}
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email *</label>
        <input
          id='email'
          type="email"
          value={f.email}
          onChange={e => upd('email', e.target.value)}
          placeholder="you@example.com"
          className={inp}
        />
      </div>

      {/* Password */}
      <div className="mb-3 relative">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Password *</label>
        <input
          id='password'
          type={showPw ? 'text' : 'password'}
          value={f.password}
          onChange={e => upd('password', e.target.value)}
          placeholder="8+ chars, with uppercase, number, special"
          className={`${inp} pr-12`}
        />
        <button type="button" onClick={() => setShowPw(p => !p)}
          aria-label={showPw ? 'Hide password' : 'Show password'}
          className="absolute right-4 bottom-3 text-text-muted hover:text-text-primary transition-colors text-sm">
          {showPw ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* Strength bar */}
      {f.password && (
        <div className="mb-4">
          <div className="flex gap-1 h-1.5 mb-1">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-1 rounded-full transition-all duration-300"
                   style={{ background: i < bars ? strength.color : '#1A2B42' }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
        </div>
      )}

      {/* Confirm password */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Confirm Password *</label>
        <div className="relative">
          <input
            id='confirmPassword'
            type={showConfirmPw ? 'text' : 'password'}
            value={f.confirm}
            onChange={e => upd('confirm', e.target.value)}
            onBlur={() => setConfirmTouched(true)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Repeat your password"
            className={`${inp} pr-12 ${f.confirm && f.confirm !== f.password ? 'border-danger focus:ring-danger/20' : ''}`}
          />
          <button type="button" onClick={() => setShowConfirmPw(p => !p)}
            aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
            className="absolute right-4 bottom-3 text-text-muted hover:text-text-primary transition-colors text-sm">
            {showConfirmPw ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button type="submit" onClick={submit} disabled={loading}
        className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 mb-2 hover:bg-[#1d4ed8] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]">
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-xs text-text-muted text-center mb-5">
        By signing up you agree to our{' '}
        <span className="text-primary-light cursor-pointer hover:opacity-80">Terms</span> and{' '}
        <span className="text-primary-light cursor-pointer hover:opacity-80">Privacy Policy</span>
      </p>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/signin" className="text-primary-light font-semibold hover:opacity-80">Sign In</Link>
      </p>
    </AuthCard>
  );
};

export default SignUpPage;