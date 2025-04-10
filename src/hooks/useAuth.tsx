
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
  forgotPassword: (email: string, redirectUrl?: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  handleEmailVerificationError: (errorCode: string, errorDescription: string) => void;
}

export const useAuth = (): UseAuthResult => {
  const [authState, setAuthState] = useState({
    user: AuthService.getAuthState().user,
    isLoading: true,
    isAuthenticated: AuthService.getAuthState().isAuthenticated,
  });

  const handleEmailVerificationError = useCallback((errorCode: string, errorDescription: string) => {
    if (errorCode === 'access_denied' || errorCode === 'otp_expired') {
      toast.error("Email verification failed", {
        description: "The verification link has expired or is invalid. Please request a new one.",
        duration: 8000,
      });
    } else {
      toast.error("Authentication error", {
        description: errorDescription || "An error occurred during authentication.",
        duration: 5000,
      });
    }
  }, []);

  useEffect(() => {
    console.log("Setting up auth subscription");
    
    const handleAuthErrors = () => {
      const url = new URL(window.location.href);
      const errorCode = url.searchParams.get('error_code');
      const errorDescription = url.searchParams.get('error_description');
      
      if (errorCode && errorDescription) {
        console.log(`Auth error detected: ${errorCode} - ${errorDescription}`);
        handleEmailVerificationError(errorCode, errorDescription);
        
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('error_code');
        cleanUrl.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, cleanUrl.toString());
      }
    };
    
    handleAuthErrors();
    
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
    
    const unsubscribe = AuthService.subscribe((state) => {
      console.log("Auth state changed:", state);
      setAuthState({
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
      });
    });

    return unsubscribe;
  }, [handleEmailVerificationError]);

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
      if (success) {
        toast.success("Sign up successful", {
          description: "Please check your email to verify your account.",
        });
      }
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

  const forgotPassword = useCallback(async (email: string, redirectUrl?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const success = await AuthService.forgotPassword(email, redirectUrl);
      return success;
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Password reset failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const success = await AuthService.updatePassword(newPassword);
      return success;
    } catch (error) {
      console.error("Update password error:", error);
      toast.error("Password update failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      return false;
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
    forgotPassword,
    updatePassword,
    handleEmailVerificationError,
  };
};
