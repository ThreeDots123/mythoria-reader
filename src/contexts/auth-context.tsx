"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User, getUser, setUser, clearAuth } from "@/utils/auth";
import apiClientManager from "@/api/interface";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current user from server (token is in cookie)
    const fetchCurrentUser = async () => {
      try {
        const result = await apiClientManager.getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
          setUserState(result.data);
        } else {
          // No user authenticated, clear any stale data
          clearAuth();
          setUserState(null);
        }
      } catch (error) {
        // Not authenticated or error
        clearAuth();
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // These are handed to consumers as effect dependencies, so they have to keep
  // a stable identity — a new function each render re-runs their effects.
  const login = useCallback((userData: User) => {
    setUser(userData);
    setUserState(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClientManager.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      setUserState(null);
    }
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    setUserState(userData);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const result = await apiClientManager.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
        setUserState(result.data);
      } else {
        clearAuth();
        setUserState(null);
      }
    } catch (error) {
      clearAuth();
      setUserState(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, isLoading, login, logout, updateUser, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
