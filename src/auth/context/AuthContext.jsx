// src/auth/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      localStorage.setItem('user_role', parsedUser?.role || 'VIEWER');
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.signIn(email, password);
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    const userObj = {
      username: data.username,
      email,
      role: data.role,
      plan: data.plan,
    };
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('user_role', userObj.role || 'VIEWER');
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  const setTokensAndUser = async (accessToken, refreshToken, userObj = null) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const user = userObj || {
      username: payload.sub.split('@')[0],
      email: payload.sub,
      role: payload.role || 'VIEWER',
      plan: payload.plan || 'FREE'
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('user_role', user.role || 'VIEWER');
    setUser(user);
  };

  // NEW: update user data in state and localStorage
  const updateUser = (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newUser = { ...currentUser, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    if (updatedData.role) localStorage.setItem('user_role', updatedData.role);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signupAndLogin, logout, setTokensAndUser, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);