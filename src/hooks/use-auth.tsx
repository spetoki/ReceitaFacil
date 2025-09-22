'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'gramstracker_auth';
const ACCESS_CODES = ['349812', '765234', '981245', '123789', '567890', '234567', '890123', '456789', '678901', '012345']; // Lista de códigos de acesso

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (code: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authCookie = Cookies.get(AUTH_COOKIE_NAME);
    setIsAuthenticated(authCookie === 'true');
    setLoading(false);
  }, []);

  const login = useCallback((code: string): boolean => {
    if (ACCESS_CODES.includes(code)) {
      Cookies.set(AUTH_COOKIE_NAME, 'true', { expires: 7 }); // Expires in 7 days
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(AUTH_COOKIE_NAME);
    setIsAuthenticated(false);
  }, []);
  
  const value = { isAuthenticated, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
