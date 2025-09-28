"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authApi, User } from "../../lib/api";

// Types
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: "CLIENT" | "BUSINESS";
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await authApi.getCurrentUser();
        const user = response.user || response;
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        // Handle authentication errors gracefully
        if (error instanceof Error) {
          // Check if it's an authentication error (401/403) or network error
          const isAuthError =
            error.message.includes("Not authenticated") ||
            error.message.includes("Email ose fjalëkalimi janë gabim") ||
            error.message.includes("Nuk keni të drejta");

          if (!isAuthError) {
            // Only log non-authentication errors
            console.error("Failed to initialize auth:", error);
          }
        }
        dispatch({ type: "SET_USER", payload: null });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, userType: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authApi.login({ email, password, userType });
      const user = response.user || response;
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch (error) {
      dispatch({ type: "CLEAR_ERROR" });
      throw error;
    }
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: "CLIENT" | "BUSINESS";
  }) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authApi.register(userData);
      const user = response.user || response;
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch (error) {
      dispatch({ type: "CLEAR_ERROR" });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      const user = response.user || response;
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      console.error("Failed to refresh user:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-gray-500 mt-2">Duke ngarkuar...</div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will be handled by middleware or redirect
    }

    return <Component {...props} />;
  };
}
