
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables for production.');
}

// Determine if we're in a development environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Create and export the Supabase client with appropriate configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // This needs to be true for code exchanges to work properly
    debug: isDevelopment
  }
});

// Log the current environment details for debugging
console.log("Supabase client initialized with URL:", supabaseUrl);
console.log("Current browser location:", window.location.href);
console.log("Current origin:", window.location.origin);

// Get the origin that should be used for auth redirects
export const getRedirectOrigin = () => {
  return window.location.origin;
};

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event: ${event}`, session ? "Session exists" : "No session");
  
  if (event === 'PASSWORD_RECOVERY') {
    console.log("Password recovery event detected!");
    localStorage.setItem('passwordResetRequested', 'true');
    
    // Redirect to reset password page if we're not already there
    if (!window.location.pathname.includes('reset-password')) {
      window.location.href = `${window.location.origin}/reset-password`;
    }
  }
  
  if (event === 'SIGNED_IN') {
    console.log("User signed in successfully!");
    localStorage.removeItem('passwordResetRequested');
  }
});

// Define response type for better type safety
export type AuthTokenHandlerResult = 
  | { success: boolean; session: any; error?: undefined; message?: string } 
  | { success: boolean; error: any; session?: undefined; message?: string }
  | { success: boolean; message: string; session?: undefined; error?: undefined };

// Handle URL with tokens on page load
export async function handleAuthTokensOnLoad(): Promise<AuthTokenHandlerResult> {
  try {
    console.log("============ CHECKING FOR AUTH TOKENS ===========");
    console.log("Current URL:", window.location.href);
    
    // First check for a code parameter in the URL (preferred method)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // If error params exist, return early with error
    if (error && errorDescription) {
      console.error(`Error in URL: ${error} - ${errorDescription}`);
      return { 
        success: false, 
        message: errorDescription
      };
    }
    
    if (code) {
      console.log("Code parameter found:", code.substring(0, 10) + "...");
      
      // Store code verifier from localStorage if available
      const codeVerifier = localStorage.getItem('supabase.auth.code_verifier');
      console.log("Code verifier found in localStorage:", !!codeVerifier);
      
      try {
        // Try to exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error);
          return { 
            success: false, 
            error,
            message: `Error exchanging code: ${error.message}`
          };
        }
        
        if (!data.session) {
          console.warn("Code exchange succeeded but no session was returned");
          return {
            success: false,
            message: "Authentication succeeded but no session was created"
          };
        }
        
        console.log("Successfully exchanged code for session");
        
        // Clean up the URL by removing the code parameter
        if (window.history && window.history.replaceState) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('code');
          window.history.replaceState(null, document.title, cleanUrl.toString());
        }
        
        return { 
          success: true, 
          session: data.session,
          message: "Session created successfully" 
        };
      } catch (error) {
        console.error("Exception during code exchange:", error);
        return { 
          success: false, 
          error, 
          message: "Error exchanging code for session" 
        };
      }
    }
    
    return { success: false, message: "No auth tokens found in URL" };
  } catch (error) {
    console.error("Exception handling auth tokens:", error);
    return { success: false, error, message: "Error processing authentication tokens" };
  }
}
