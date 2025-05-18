
'use client';

import type { ReactNode} from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const VALID_CREDENTIALS = [
  { email: 'info@vemontech.com', pass: 'Martes13' },
  { email: 'info@gpsscan.net', pass: 'LaCasaDePapeL' },
];

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem('loggedInUserEmail');
      if (storedEmail) {
        setIsAuthenticated(true);
        setUserEmail(storedEmail);
      }
    } catch (error) {
      console.error("Error accessing localStorage to check session:", error);
      // Potentially logout or set error state if localStorage is critical and inaccessible
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const foundUser = VALID_CREDENTIALS.find(
      (cred) => cred.email === email && cred.pass === pass
    );
    if (foundUser) {
      setIsAuthenticated(true);
      setUserEmail(foundUser.email);
      try {
        localStorage.setItem('loggedInUserEmail', foundUser.email);
      } catch (error) {
        console.error("Error saving session to localStorage:", error);
        // Inform user or handle appropriately if session can't be saved
      }
      return true;
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    try {
      localStorage.removeItem('loggedInUserEmail');
    } catch (error) {
      console.error("Error removing session from localStorage:", error);
    }
    // AuthGuard will handle redirect to /login
  };

  return (
    <SessionContext.Provider value={{ isAuthenticated, userEmail, isLoading, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
