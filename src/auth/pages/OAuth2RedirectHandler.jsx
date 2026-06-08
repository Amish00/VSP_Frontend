import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/authApi';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokensAndUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      // Store tokens immediately
      sessionStorage.setItem('access_token', accessToken);
      sessionStorage.setItem('refresh_token', refreshToken);

      // Fetch current user to get correct role/plan
      api.get('/api/users/me')
        .then(userData => {
          const user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            plan: userData.plan,
            profilePicture: userData.profilePicture
          };
          sessionStorage.setItem('user', JSON.stringify(user));
          sessionStorage.setItem('user_role', user.role);
          setTokensAndUser(accessToken, refreshToken, user);

          const role = user.role?.toLowerCase();
          if (role === 'admin') navigate('/admin');
          else if (role === 'creator') navigate('/creator');
          else navigate('/home');
        })
        .catch(() => {
          // Fallback: decode JWT
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const user = {
              username: payload.sub.split('@')[0],
              email: payload.sub,
              role: payload.role || 'VIEWER',
              plan: payload.plan || 'FREE'
            };
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('user_role', user.role);
            setTokensAndUser(accessToken, refreshToken, user);
            const role = user.role?.toLowerCase();
            if (role === 'admin') navigate('/admin');
            else if (role === 'creator') navigate('/creator');
            else navigate('/home');
          } catch (e) {
            navigate('/signin?error=oauth_failed');
          }
        });
    } else {
      navigate('/signin?error=oauth_failed');
    }
  }, [location, navigate, setTokensAndUser]);

  return <div className="flex items-center justify-center min-h-screen">Logging you in...</div>;
};

export default OAuth2RedirectHandler;