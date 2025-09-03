import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedUserType = localStorage.getItem('userType');
    if (savedUsername && savedUserType) {
      setUser({ name: savedUsername });
      setUserType(savedUserType);
    }
  }, []);

  const login = (name, type) => {
    localStorage.setItem('username', name);
    localStorage.setItem('userType', type);
    setUser({ name });
    setUserType(type);
  };

  const register = (newUser, type) => {
    // Salva o nome e o tipo para a sessão atual
    localStorage.setItem('username', newUser.name);
    localStorage.setItem('userType', type);
    // Salva as credenciais específicas do tipo para verificação no login
    localStorage.setItem(`${type}Credentials`, JSON.stringify({ email: newUser.email, password: newUser.password }));
    setUser({ name: newUser.name });
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    // Idealmente, removeria apenas as credenciais relevantes, mas para este protótipo, podemos limpar ambas
    localStorage.removeItem('freelancerCredentials');
    localStorage.removeItem('employerCredentials');
    setUser(null);
    setUserType(null);
  };

  const value = { user, userType, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}