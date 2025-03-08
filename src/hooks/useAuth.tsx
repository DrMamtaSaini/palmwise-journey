
import { useState, useEffect, useCallback } from 'react';
import AuthService from '../services/AuthService';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthResult => {
  const [authState, setAuthState] = useState({
    user: AuthService.getAuthState().user,
    isLoading: AuthService.getAuthState().isLoading,
    isAuthenticated: AuthService.getAuthState().isAuthenticated,
  });

  useEffect(() => {
    console.log("Setting up auth subscription");
    // Subscribe to auth state changes
    const unsubscribe = AuthService.subscribe((state) => {
      console.log("Auth state changed:", state);
      setAuthState({
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
      });
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      return await AuthService.signIn(email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      return false;
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      return await AuthService.signUp(name, email, password);
    } catch (error) {
      console.error("Sign up error:", error);
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      return await AuthService.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};
