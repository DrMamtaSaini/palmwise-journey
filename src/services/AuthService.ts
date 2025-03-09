
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    // Check for existing session on init
    console.log("AuthService constructor - checking session");
    this.checkSession();
    
    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event, "Session:", session ? "exists" : "null");
      
      if (session && session.user) {
        this.fetchUserProfile(session.user.id).then(profile => {
          this.authState = {
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || 'User',
              createdAt: session.user.created_at || new Date().toISOString(),
            },
            isLoading: false,
            isAuthenticated: true,
          };
          console.log("Updated auth state with session:", this.authState);
          this.notifyListeners();
        });
      } else {
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
        console.log("Updated auth state - no session:", this.authState);
        this.notifyListeners();
      }
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async checkSession(): Promise<void> {
    try {
      console.log("Checking session...");
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        throw error;
      }
      
      console.log("Session check result:", data);
      
      if (data.session) {
        const { user } = data.session;
        const profile = await this.fetchUserProfile(user.id);
        
        this.authState = {
          user: {
            id: user.id,
            email: user.email || '',
            name: profile?.name || user.email?.split('@')[0] || 'User',
            createdAt: user.created_at || new Date().toISOString(),
          },
          isLoading: false,
          isAuthenticated: true,
        };
        console.log("Session exists, updated auth state:", this.authState);
      } else {
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
        console.log("No session found, updated auth state:", this.authState);
      }
    } catch (error) {
      console.error('Session check error:', error);
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    }
    this.notifyListeners();
  }

  private async fetchUserProfile(userId: string) {
    try {
      console.log("Fetching user profile for ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      console.log("User profile data:", data);
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener(this.authState);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  public async signIn(email: string, password: string): Promise<boolean> {
    try {
      console.log("Signing in with email:", email);
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        toast.error('Authentication failed', {
          description: error.message || 'Please check your credentials and try again.',
        });
        
        this.authState = {
          ...this.authState,
          isLoading: false,
        };
        this.notifyListeners();
        
        return false;
      }
      
      if (data.user) {
        console.log("Sign in successful:", data.user);
        toast.success('Welcome back!', {
          description: 'You have successfully signed in.',
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      toast.error('Authentication failed', {
        description: error.message || 'Please check your credentials and try again.',
      });
      
      this.authState = {
        ...this.authState,
        isLoading: false,
      };
      this.notifyListeners();
      
      return false;
    }
  }

  public async signUp(name: string, email: string, password: string): Promise<boolean> {
    try {
      console.log("Signing up with email:", email, "and name:", name);
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        toast.error('Account creation failed', {
          description: error.message || 'Please try again later.',
        });
        
        this.authState = {
          ...this.authState,
          isLoading: false,
        };
        this.notifyListeners();
        
        return false;
      }
      
      console.log("Sign up response:", data);
      
      if (data.user) {
        // Create a profile entry for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, name }
          ]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        toast.success('Account created', {
          description: 'Your account has been successfully created.',
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      toast.error('Account creation failed', {
        description: error.message || 'Please try again later.',
      });
      
      this.authState = {
        ...this.authState,
        isLoading: false,
      };
      this.notifyListeners();
      
      return false;
    }
  }

  public async signOut(): Promise<void> {
    try {
      console.log("Signing out");
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      toast.success('Signed out', {
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      toast.error('Sign out failed', {
        description: error.message || 'Please try again later.',
      });
      
      this.authState = {
        ...this.authState,
        isLoading: false,
      };
      this.notifyListeners();
    }
  }

  public getAuthState(): AuthState {
    return this.authState;
  }
}

export default AuthService.getInstance();
