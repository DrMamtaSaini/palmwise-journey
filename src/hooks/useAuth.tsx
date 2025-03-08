
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
    // Subscribe to auth state changes
    const unsubscribe = AuthService.subscribe((state) => {
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
    return AuthService.signIn(email, password);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    return AuthService.signUp(name, email, password);
  }, []);

  const signOut = useCallback(async () => {
    return AuthService.signOut();
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
