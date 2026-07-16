// src/auth/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { authApi } from '../api/authApi';
import { setAppLanguage } from '../../context/LanguageContext';

const AuthContext = createContext(null);

const DEFAULT_IDLE_TIMEOUT_MINUTES = 5;

const getIdleTimeoutMs = () => {
  const configuredMinutes = Number(import.meta.env.VITE_SESSION_IDLE_TIMEOUT_MINUTES);
  const timeoutMinutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes
    : DEFAULT_IDLE_TIMEOUT_MINUTES;

  return timeoutMinutes * 60 * 1000;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const idleTimerRef = useRef(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(async ({ reason = 'manual', redirectTo = null } = {}) => {
    clearIdleTimer();

    try {
      await authApi.logout();
    } catch (e) {
      // ignore errors
    }

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_role');
    setUser(null);

    if (reason === 'idle') {
      enqueueSnackbar('Session expired due to inactivity', {
        variant: 'warning',
        autoHideDuration: 3500,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    } else {
      enqueueSnackbar('Signed out successfully', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }

    if (redirectTo) {
      window.location.replace(redirectTo);
    }
  }, [clearIdleTimer, enqueueSnackbar]);

  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');

    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('access_token');
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      sessionStorage.setItem('user_role', parsedUser?.role || 'VIEWER');
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      clearIdleTimer();
      return undefined;
    }

    const idleTimeoutMs = getIdleTimeoutMs();
    const scheduleIdleLogout = () => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        logout({ reason: 'idle', redirectTo: '/signin?reason=idle' });
      }, idleTimeoutMs);
    };

    const handleActivity = () => {
      scheduleIdleLogout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleIdleLogout();
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointerdown', 'scroll', 'focus'];

    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    scheduleIdleLogout();

    return () => {
      clearIdleTimer();
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, clearIdleTimer, logout]);

  const login = async (email, password) => {
    const data = await authApi.signIn(email, password);
    setAppLanguage('en');
    sessionStorage.setItem('access_token', data.accessToken);
    sessionStorage.setItem('refresh_token', data.refreshToken);
    const userObj = {
      username: data.username,
      email,
      role: data.role,
      plan: data.plan,
    };
    sessionStorage.setItem('user', JSON.stringify(userObj));
    sessionStorage.setItem('user_role', userObj.role || 'VIEWER');
    setUser(userObj);
    return userObj;
  };

  const signupAndLogin = async (username, email, password) => {
    await authApi.signUp(username, email, password);
    return login(email, password);
  };

  const setTokensAndUser = async (accessToken, refreshToken, userObj = null) => {
    setAppLanguage('en');
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
    
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const user = userObj || {
      username: payload.sub.split('@')[0],
      email: payload.sub,
      role: payload.role || 'VIEWER',
      plan: payload.plan || 'FREE'
    };
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('user_role', user.role || 'VIEWER');
    setUser(user);
  };

  // NEW: update user data in state and localStorage
  const updateUser = (updatedData) => {
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const newUser = { ...currentUser, ...updatedData };
    sessionStorage.setItem('user', JSON.stringify(newUser));
    if (updatedData.role) sessionStorage.setItem('user_role', updatedData.role);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signupAndLogin, logout, setTokensAndUser, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);