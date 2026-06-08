import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api, { unwrap } from '../services/ApiService';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error(`Storage error reading ${key}:`, e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.error(`Storage error writing ${key}:`, e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`Storage error removing ${key}:`, e);
    }
  }
};

interface User {
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  toastMessage: string | null;
  clearToast: () => void;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const clearToast = useMemo(() => () => setToastMessage(null), []);

  const logoutLocal = useMemo(
    () => async () => {
      await Promise.all([
        storage.removeItem('@auth_token'),
        storage.removeItem('@auth_token_expires_at'),
        storage.removeItem('@user_info'),
      ]);
      setUser(null);
    },
    []
  );


  // Load session on startup
  useEffect(() => {
    async function loadSession() {
      try {
        const token = await storage.getItem('@auth_token');
        const expiresAtRaw = await storage.getItem('@auth_token_expires_at');

        if (!token) {
          return;
        }

        if (expiresAtRaw) {
          const expiresAt = Number(expiresAtRaw);
          if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) {
            await logoutLocal();
            return;
          }
        }

        const meRes = await api.get('/api/auth/me');
        const me = unwrap(meRes);
        await storage.setItem('@user_info', JSON.stringify(me));
        setUser(me);
      } catch (e) {
        await logoutLocal();
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [logoutLocal]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await api.post('/api/auth/login', { email, password, remember_me: rememberMe });
      const result = unwrap(response);

      const token = result?.token;
      const userInfo = result?.user;
      if (!token || !userInfo) throw new Error('Données manquantes');

      const ttlDays = rememberMe ? 30 : 1;
      const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

      await storage.setItem('@auth_token', token);
      await storage.setItem('@auth_token_expires_at', String(expiresAt));
      await storage.setItem('@user_info', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (e) {
      throw e;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const result = unwrap(response);

      const token = result?.token;
      const userInfo = result?.user;
      if (!token || !userInfo) throw new Error('Données manquantes');

      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      await storage.setItem('@auth_token', token);
      await storage.setItem('@auth_token_expires_at', String(expiresAt));
      await storage.setItem('@user_info', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (e) {
      throw e;
    }
  };

  const logout = async () => {
    try {
      try {
        await api.post('/api/auth/logout');
      } catch {
        // ignore
      }
      await logoutLocal();
    } catch (e) {
      await logoutLocal();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, toastMessage, clearToast, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
