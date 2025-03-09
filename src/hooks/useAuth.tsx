
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
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
    isLoading: true, // Start with loading true
    isAuthenticated: AuthService.getAuthState().isAuthenticated,
  });

  useEffect(() => {
    console.log("Setting up auth subscription");
    
    // Initial auth check
    const initialCheck = async () => {
      try {
        await AuthService.checkSession();
        setAuthState({
          user: AuthService.getAuthState().user,
          isLoading: false,
          isAuthenticated: AuthService.getAuthState().isAuthenticated,
        });
      } catch (error) {
        console.error("Error during initial auth check:", error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initialCheck();
    
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
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const success = await AuthService.signIn(email, password);
      return success;
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const success = await AuthService.signUp(name, email, password);
      return success;
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Signup failed", {
        description: error instanceof Error ? error.message : "Please try again with different credentials.",
      });
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await AuthService.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Sign out failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
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
