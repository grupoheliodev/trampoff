import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, resetPassword as apiResetPassword, getEmailConfirmationCode as apiGetEmailConfirmationCode, confirmEmail as apiConfirmEmail, socialLogin as apiSocialLogin } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setUserType(parsedUser.userType);
    }
  }, []);

  const handleAuth = (authData) => {
    const { token, user } = authData;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    setUserType(user.userType);
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    if (updatedUser.userType) setUserType(updatedUser.userType);
    // também sincronizar com lista local de usuários, se existir (modo local)
    try {
      const raw = localStorage.getItem('trampoff_users');
      if (raw) {
        const users = JSON.parse(raw);
        const idx = users.findIndex(u => u.id === updatedUser.id || (u.email && updatedUser.email && u.email.toLowerCase() === updatedUser.email.toLowerCase()));
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updatedUser };
          localStorage.setItem('trampoff_users', JSON.stringify(users));
        }
      }
    } catch (e) {
      // noop
    }
    // Dispatch an event so other parts of the app (e.g. lists) can refresh
    try {
      window.dispatchEvent(new CustomEvent('trampoff:users-updated', { detail: { user: updatedUser } }));
    } catch (e) {
      // ignore in non-browser envs
    }

  };

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    handleAuth(data);
  };

  const resetPassword = async (email, newPassword) => {
    return apiResetPassword(email, newPassword);
  };

  const getEmailConfirmationCode = async (email) => {
    return apiGetEmailConfirmationCode(email);
  };

  const confirmEmail = async (email, code) => {
    return apiConfirmEmail(email, code);
  };

  const register = async (userData, type) => {
    const data = await apiRegister(userData, type);
    handleAuth(data);
  };

  const socialLogin = async (provider, type) => {
    const data = await apiSocialLogin(provider, type);
    handleAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setUserType(null);
  };

  const value = { user, userType, token, login, register, logout, updateUser, resetPassword, getEmailConfirmationCode, confirmEmail, socialLogin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}