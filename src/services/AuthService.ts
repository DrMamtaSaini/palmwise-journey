
import supabaseClient from "@/lib/supabaseClient";
import { User } from "@/hooks/useAuth";

// Define the shape of the auth state
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Define a type for the auth state change callback
type AuthStateChangeCallback = (state: AuthState) => void;

// List of subscribers to auth state changes
const subscribers: AuthStateChangeCallback[] = [];

// Initialize our auth state
let authState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false
};

// Helper function to convert Supabase User to our app's User type
const formatUser = (user: any): User | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    createdAt: user.created_at
  };
};

// Update auth state and notify subscribers
const updateAuthState = (newState: Partial<AuthState>) => {
  authState = { ...authState, ...newState };
  
  // Notify all subscribers
  subscribers.forEach(callback => callback(authState));
};

// Initialize auth state from session
const initializeFromSession = (session: any | null) => {
  if (session) {
    updateAuthState({
      user: formatUser(session.user),
      isAuthenticated: true,
      isLoading: false
    });
  } else {
    updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
};

// Subscribe to authentication state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state changed in AuthService: ${event}`, session ? 'User session exists' : 'No session');
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    initializeFromSession(session);
  } else if (event === 'SIGNED_OUT') {
    updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  } else if (event === 'USER_UPDATED') {
    updateAuthState({
      user: formatUser(session?.user || null),
      isAuthenticated: !!session,
      isLoading: false
    });
  }
});

const AuthService = {
  // Check the current session
  checkSession: async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      initializeFromSession(session);
      return !!session;
    } catch (error) {
      console.error('Error checking session:', error);
      updateAuthState({ isLoading: false });
      return false;
    }
  },
  
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      updateAuthState({ isLoading: true });
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      updateAuthState({ isLoading: false });
      throw error;
    }
  },
  
  // Sign up with email and password
  signUp: async (name: string, email: string, password: string) => {
    try {
      updateAuthState({ isLoading: true });
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) throw error;
      
      // If email confirmation is required
      if (!data.session) {
        updateAuthState({ isLoading: false });
        return true; // Success but needs verification
      }
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      updateAuthState({ isLoading: false });
      throw error;
    }
  },
  
  // Sign out
  signOut: async () => {
    try {
      updateAuthState({ isLoading: true });
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      updateAuthState({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },
  
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      updateAuthState({ isLoading: true });
      console.log("AuthService: Initiating Google sign-in");
      
      // Get the current URL for redirection
      const origin = window.location.origin;
      const currentPath = window.location.pathname;
      
      // Use the correct auth callback route for all environments
      const redirectUrl = `${origin}/auth/callback`;
      
      console.log("Using redirect URL:", redirectUrl);
      
      // Store this URL in localStorage to restore after auth
      localStorage.setItem('authRedirectOrigin', origin);
      localStorage.setItem('authRedirectPath', currentPath);
      
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account', // Force Google account selector
            access_type: 'offline'    // Request refresh token
          }
        }
      });
      
      if (error) {
        console.error("Google OAuth error:", error);
        throw error;
      }
      
      // Log the URL that will be used for the redirect
      if (data?.url) {
        console.log("Google auth URL generated:", data.url);
        // Redirect the user to the Google authorization URL
        window.location.href = data.url;
      } else {
        console.warn("No Google auth URL was generated");
        throw new Error("Failed to generate Google authentication URL");
      }
      
      console.log("Google sign-in initiated successfully");
      return true;
    } catch (error) {
      console.error('Google sign in error:', error);
      updateAuthState({ isLoading: false });
      throw error;
    }
  },
  
  // Forgot password
  forgotPassword: async (email: string, redirectUrl?: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl || `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  // Update password
  updatePassword: async (newPassword: string) => {
    try {
      updateAuthState({ isLoading: true });
      
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    } finally {
      updateAuthState({ isLoading: false });
    }
  },
  
  // Subscribe to auth state changes
  subscribe: (callback: AuthStateChangeCallback) => {
    subscribers.push(callback);
    
    // Immediately call with current state
    callback(authState);
    
    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  },
  
  // Get current auth state
  getAuthState: () => {
    return authState;
  }
};

export default AuthService;
