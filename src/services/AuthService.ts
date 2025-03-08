
import { toast } from "sonner";

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

// This would be replaced with actual Supabase or other auth provider code
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
    this.checkSession();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async checkSession(): Promise<void> {
    // In a real implementation, this would check with your backend
    // For now, we'll check localStorage for a demo user
    try {
      const userStr = localStorage.getItem('palm_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.authState = {
          user,
          isLoading: false,
          isAuthenticated: true,
        };
      } else {
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
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
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      // In a real implementation, this would call your backend
      // For now, we'll simulate a successful login for demo@example.com
      if (email === 'demo@example.com' && password === 'password') {
        const user = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem('palm_user', JSON.stringify(user));
        
        this.authState = {
          user,
          isLoading: false,
          isAuthenticated: true,
        };
        this.notifyListeners();
        
        toast.success('Welcome back!', {
          description: 'You have successfully signed in.',
        });
        
        return true;
      }
      
      toast.error('Invalid credentials', {
        description: 'Please check your email and password.',
      });
      
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      this.notifyListeners();
      
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      
      toast.error('Authentication failed', {
        description: 'Please try again later.',
      });
      
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      this.notifyListeners();
      
      return false;
    }
  }

  public async signUp(name: string, email: string, password: string): Promise<boolean> {
    try {
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      // In a real implementation, this would call your backend
      // For now, we'll simulate successful signup
      const user = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('palm_user', JSON.stringify(user));
      
      this.authState = {
        user,
        isLoading: false,
        isAuthenticated: true,
      };
      this.notifyListeners();
      
      toast.success('Account created', {
        description: 'Your account has been successfully created.',
      });
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      
      toast.error('Account creation failed', {
        description: 'Please try again later.',
      });
      
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      this.notifyListeners();
      
      return false;
    }
  }

  public async signOut(): Promise<void> {
    try {
      this.authState = { ...this.authState, isLoading: true };
      this.notifyListeners();
      
      // In a real implementation, this would call your backend
      localStorage.removeItem('palm_user');
      
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      this.notifyListeners();
      
      toast.success('Signed out', {
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      
      toast.error('Sign out failed', {
        description: 'Please try again later.',
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
