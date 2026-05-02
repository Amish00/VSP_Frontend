import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthCard from '../components/AuthCard'
import { Eye, EyeOff } from 'lucide-react'

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)
const OutlookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#1565C0" d="M28 10H42a2 2 0 012 2v22a2 2 0 01-2 2H28V10z"/>
    <path fill="#1E88E5" d="M6 14l22-4v28L6 34V14z"/>
    <path fill="#fff" d="M15 19c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
    <path fill="#fff" d="M28 17h12v2H28zM28 21h12v2H28zM28 25h12v2H28zM28 29h8v2H28z"/>
  </svg>
)

const SOCIAL = [
  { label: 'Google',  Icon: GoogleIcon  },
  { label: 'GitHub',  Icon: GithubIcon  },
  { label: 'Outlook', Icon: OutlookIcon },
]

const SignInPage = () => {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const getLoginErrorMessage = (err) => {
    const status = err?.status || err?.response?.status
    const rawMessage =
      (typeof err === 'string' && err) ||
      err?.message ||
      err?.error ||
      err?.details

    if (status === 401 || (typeof rawMessage === 'string' && rawMessage.includes('401'))) {
      return 'Incorrect email or password'
    }

    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return rawMessage
    }

    return 'Sign in failed. Please try again.'
  }

  const handleLogin = async () => {
    if (!email || !pw) {
      setError('Please fill all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email, pw);
      const role = user.role?.toLowerCase();
      if (role === 'admin') navigate('/admin');
      else if (role === 'creator') navigate('/creator');
      else navigate('/home'); // viewer → home
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
  // Redirect to backend OAuth2 authorization endpoint
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  window.location.href = `${backendUrl}/oauth2/authorization/${provider.toLowerCase()}`;
};

  return (
    <AuthCard>
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl mb-6">
        {[['signin','Log In'],['signup','Sign Up']].map(([r, l]) => (
          <Link key={r} to={`/${r}`}
            className={`flex-1 py-2.5 rounded-lg text-base font-semibold transition-colors text-center
              ${r === 'signin' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            {l}
          </Link>
        ))}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="you@example.com" autoFocus className={inp} />
      </div>

      {/* Password */}
      <div className="mb-2 relative">
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Password</label>
        <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="••••••••" className={`${inp} pr-12`} />
        <button type="button" onClick={() => setShow(p => !p)} aria-label={show ? 'Hide' : 'Show'}
          className="absolute right-4 bottom-3 text-text-muted hover:text-text-primary transition-colors text-sm">
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <div className="flex justify-end mb-5">
        <Link to="/forgot-password" className="text-sm text-primary-light font-medium hover:opacity-80 transition-opacity">
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-sm text-danger mb-3" role="alert">⚠ {error}</p>}

      <button onClick={handleLogin} disabled={loading}
        className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 mb-5 hover:bg-[#1d4ed8] active:bg-[#1e40af] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]">
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-text-muted">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {SOCIAL.map(({ label, Icon }) => (
          <button key={label}
            onClick={() => { handleOAuth(label) }}
            className="flex flex-col items-center gap-2 py-3.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-colors">
            <Icon />
            <span className="text-xs font-medium text-text-secondary">{label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-text-muted">
        No account?{' '}
        <Link to="/signup" className="text-primary-light font-semibold hover:opacity-80">Sign Up</Link>
      </p>
    </AuthCard>
  )
}

export default SignInPage
