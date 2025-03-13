
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables for production.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true
  }
});

// Add useful debugging
console.log("Supabase client initialized with URL:", supabaseUrl);
console.log("Current browser location:", window.location.href);

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event: ${event}`, session ? "Session exists" : "No session");
  
  // Additional logging for specific events
  if (event === 'PASSWORD_RECOVERY') {
    console.log("Password recovery event detected!");
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log("Token refreshed event detected!");
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
    
    if (code) {
      console.log("Code parameter found:", code.substring(0, 10) + "...");
      try {
        // For localhost, provide special handling
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
          console.log("⚠️ Localhost detected - this environment often has issues with password reset");
          console.log("Attempting to exchange code for session anyway...");
        }
        
        // Try the standard flow first
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
        
        // For localhost, add special instructions
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
          return {
            success: false,
            error,
            message: "Error on localhost - open the reset link in production or configure Supabase Site URL for localhost"
          };
        }
        
        return { 
          success: false, 
          error, 
          message: "Error exchanging code for session" 
        };
      }
    }
    
    // Then check for a hash in the URL (older style, backup method)
    if (window.location.hash && window.location.hash.length > 1) {
      console.log("Found hash in URL:", window.location.hash);
      
      // Process the hash - works for both recovery and verification
      // This handles the case where tokens are passed in the URL hash
      const result = await handleHashTokens();
      return result;
    }
    
    return { success: false, message: "No auth tokens found in URL" };
  } catch (error) {
    console.error("Exception handling auth tokens:", error);
    return { success: false, error, message: "Error processing authentication tokens" };
  }
}

// Handle tokens in URL hash (like #access_token=...)
async function handleHashTokens(): Promise<AuthTokenHandlerResult> {
  try {
    if (!window.location.hash) {
      return { success: false, message: "No hash in URL" };
    }
    
    // Remove the # character and parse the parameters
    const hash = window.location.hash.substring(1);
    
    // Log the raw hash for debugging
    console.log("Processing hash:", hash);
    
    // Handle multiple formats - some implementations use URLSearchParams format, others use direct hash
    let accessToken = '';
    let refreshToken = '';
    
    if (hash.includes('=')) {
      // Standard format with key=value pairs
      const params = new URLSearchParams(hash);
      accessToken = params.get('access_token') || '';
      refreshToken = params.get('refresh_token') || '';
      
      // Also check for type=recovery which indicates a password reset flow
      const type = params.get('type');
      if (type === 'recovery') {
        console.log("Recovery flow detected in hash");
      }
    } else if (hash.startsWith('eyJ')) {
      // Raw JWT token
      accessToken = hash;
    }
    
    if (accessToken) {
      console.log("Found access token in hash, setting session");
      
      // Set the session using the tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (error) {
        console.error("Error processing token from hash:", error);
        return { 
          success: false, 
          error, 
          message: `Error setting session: ${error.message}` 
        };
      }
      
      console.log("Successfully processed token from hash:", data.session ? "Session created" : "No session");
      
      // Clean up the URL by removing the hash and update browser history
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
      
      return { 
        success: !!data.session, 
        session: data.session,
        message: data.session ? "Session created successfully" : "No session created" 
      };
    }
    
    return { success: false, message: "No access token found in hash" };
  } catch (error) {
    console.error("Exception handling hash tokens:", error);
    return { success: false, error, message: "Error processing hash tokens" };
  }
}

// For backward compatibility - will be deprecated
export const handleHashRecoveryToken = handleHashTokens;
export const checkForAuthInUrl = handleAuthTokensOnLoad;
