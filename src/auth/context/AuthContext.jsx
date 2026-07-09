// src/auth/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { authApi } from '../api/authApi';
import { setAppLanguage } from '../../context/LanguageContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

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

  const logout = async () => {
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
    enqueueSnackbar('Signed out successfully', {
      variant: 'success',
      autoHideDuration: 3000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
    });
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