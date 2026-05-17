import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
import { Eye, EyeOff } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { PiMicrosoftOutlookLogo } from "react-icons/pi";


const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const SOCIAL = [
  { label: 'Google', Icon: FaGoogle },
  { label: 'GitHub', Icon: FaGithub },
  { label: 'Outlook', Icon: PiMicrosoftOutlookLogo },    
];

const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const getLoginErrorMessage = (err) => {
    const status = err?.status || err?.response?.status;
    const rawMessage =
      (typeof err === 'string' && err) ||
      err?.message ||
      err?.error ||
      err?.details;

    if (status === 401 || (typeof rawMessage === 'string' && rawMessage.includes('401'))) {
      return 'Incorrect email or password';
    }
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return rawMessage;
    }
    return 'Sign in failed. Please try again.';
  };

  const handleLogin = async () => {
    if (!email || !pw) {
      enqueueSnackbar('Please fill all fields.', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, pw);
      const role = user.role?.toLowerCase();
      enqueueSnackbar('Login successful!', { variant: 'success' });
      if (role === 'admin') navigate('/admin');
      else if (role === 'creator') navigate('/creator');
      else navigate('/home');
    } catch (err) {
      const message = getLoginErrorMessage(err);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/${provider.toLowerCase()}`;
  };

  return (
    <AuthCard>
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl mb-6">
        {[['signin', 'Log In'], ['signup', 'Sign Up']].map(([r, l]) => (
          <Link
            key={r}
            to={`/${r}`}
            className={`flex-1 py-2.5 rounded-lg text-base font-semibold transition-colors text-center
              ${r === 'signin' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="you@example.com"
          autoFocus
          className={inp}
        />
      </div>

      {/* Password */}
      <div className="mb-2 relative">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Password</label>
        <input
          type={show ? 'text' : 'password'}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="••••••••"
          className={`${inp} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          aria-label={show ? 'Hide' : 'Show'}
          className="absolute right-4 bottom-3 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex justify-end mb-5">
        <Link
          to="/forgot-password"
          className="text-sm text-primary-light font-medium hover:opacity-80 transition-opacity"
        >
          Forgot password?
        </Link>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 mb-5 hover:bg-[#1d4ed8] active:bg-[#1e40af] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-text-muted">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {SOCIAL.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => handleOAuth(label)}
            className="flex flex-col items-center gap-2 py-3.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-colors"
          >
            <Icon size={20} />
            <span className="text-xs font-medium text-text-secondary">{label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-text-muted">
        No account?{' '}
        <Link to="/signup" className="text-primary-light font-semibold hover:opacity-80">
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
};

export default SignInPage;