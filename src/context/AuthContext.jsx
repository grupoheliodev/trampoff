import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister, resetPassword as apiResetPassword, socialLogin as apiSocialLogin, updateUserProfile as apiUpdateUserProfile } from '../services/api';

// Provide a safe default shape to avoid destructuring errors if used outside provider
const AuthContext = createContext({
  user: null,
  userType: null,
  token: null,
  login: () => { throw new Error('AuthContext not initialized'); },
  register: () => { throw new Error('AuthContext not initialized'); },
  logout: () => { throw new Error('AuthContext not initialized'); },
  updateUser: () => { throw new Error('AuthContext not initialized'); },
  resetPassword: () => { throw new Error('AuthContext not initialized'); },
  socialLogin: () => { throw new Error('AuthContext not initialized'); }
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setUserType(parsedUser.userType);
    }
    // restore last visited route
    try {
      const lastRoute = localStorage.getItem('app.lastRoute');
      if (lastRoute && typeof lastRoute === 'string' && lastRoute !== window.location.pathname + window.location.search) {
        navigate(lastRoute, { replace: true });
      }
    } catch (_) {}
  }, []);

  // persist last route on navigation changes
  useEffect(() => {
    try {
      localStorage.setItem('app.lastRoute', location.pathname + window.location.search);
    } catch (_) {}
  }, [location.pathname, location.search]);

  const handleAuth = (authData) => {
    const { token, user } = authData;
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (_) {}
    setToken(token);
    setUser(user);
    setUserType(user.userType);
  };

  const updateUser = async (updatedUser) => {
    if (!updatedUser) return;
    // Se tiver id e API configurada, persiste no backend
    try {
      if (updatedUser.id) {
        const saved = await apiUpdateUserProfile(updatedUser.id, updatedUser);
        try { localStorage.setItem('user', JSON.stringify(saved)); } catch (_) {}
        setUser(saved);
        if (saved.userType) setUserType(saved.userType);
      } else {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        if (updatedUser.userType) setUserType(updatedUser.userType);
      }
    } catch (e) {
      // fallback local
      try { localStorage.setItem('user', JSON.stringify(updatedUser)); } catch (_) {}
      setUser(updatedUser);
      if (updatedUser.userType) setUserType(updatedUser.userType);
    }
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

  const register = async (userData, type) => {
    const data = await apiRegister(userData, type);
    handleAuth(data);
    // Marcar verificado imediatamente (sem etapa de código)
    setUser(prev => prev ? { ...prev, emailVerified: true } : prev);
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.emailVerified = true;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (_) {}
  };

  const socialLogin = async (provider, type) => {
    const data = await apiSocialLogin(provider, type);
    handleAuth(data);
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('app.lastRoute');
    } catch (_) {}
    setToken(null);
    setUser(null);
    setUserType(null);
  };

  const value = { user, userType, token, login, register, logout, updateUser, resetPassword, socialLogin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}