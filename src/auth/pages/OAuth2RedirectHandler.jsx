import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setAppLanguage } from '../../context/LanguageContext';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokensAndUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      setAppLanguage('en');
      // Store tokens
      sessionStorage.setItem('access_token', accessToken);
      sessionStorage.setItem('refresh_token', refreshToken);
      // Decode JWT to get user info (optional – you can also call a /me endpoint)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const user = {
        username: payload.sub.split('@')[0],
        email: payload.sub,
        role: payload.role || 'VIEWER',
        plan: payload.plan || 'FREE'
      };
      sessionStorage.setItem('user', JSON.stringify(user));
      setTokensAndUser(accessToken, refreshToken, user);
      
      // Redirect based on role
      const role = user.role?.toLowerCase();
      if (role === 'admin') navigate('/admin');
      else if (role === 'creator') navigate('/creator');
      else navigate('/home');
    } else {
      navigate('/signin?error=oauth_failed');
    }
  }, [location, navigate, setTokensAndUser]);

  return <div className="flex items-center justify-center min-h-screen">Logging you in...</div>;
};

export default OAuth2RedirectHandler;