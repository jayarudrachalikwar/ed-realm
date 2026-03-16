import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, users } from './data';

const STORAGE_KEY = 'codify_user';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: 'admin' | 'faculty' | 'trainer' | 'student') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const persistUser = (user: User | null) => {
    setCurrentUser(user);

    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (!savedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(savedUser) as User;
      const matchingUser = users.find((user) => user.id === parsed.id) || parsed;
      setCurrentUser(matchingUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Determine role from email
    let role: 'admin' | 'faculty' | 'trainer' | 'student' | null = null;
    
    if (email.includes('admin')) {
      role = 'admin';
    } else if (email.includes('trainer')) {
      role = 'trainer';
    } else if (email.includes('faculty')) {
      role = 'faculty';
    } else if (email.includes('student')) {
      role = 'student';
    }
    
    // Find user by email first (exact match)
    let user = users.find(u => u.email === email);
    
    // If no user found by email, try to find by role (for demo purposes)
    if (!user && role) {
      user = users.find(u => u.role === role);
    }
    if (user) {
      persistUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    persistUser(null);
  };

  const setRole = (role: 'admin' | 'faculty' | 'trainer' | 'student') => {
    const user = users.find(u => u.role === role);
    if (user) {
      persistUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, setRole }}>
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
