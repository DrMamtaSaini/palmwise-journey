
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables for production.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add useful debugging
console.log("Supabase client initialized with URL:", supabaseUrl);

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event: ${event}`, session ? "Session exists" : "No session");
});

// Define response type for better type safety
export type AuthTokenHandlerResult = 
  | { success: boolean; session: any; error?: undefined; message?: string } 
  | { success: boolean; error: any; session?: undefined; message?: string }
  | { success: boolean; message: string; session?: undefined; error?: undefined };

// Handle URL with tokens on page load
export async function handleAuthTokensOnLoad(): Promise<AuthTokenHandlerResult> {
  try {
    // First check for a hash in the URL (most likely when coming from an email link)
    if (window.location.hash && window.location.hash.length > 1) {
      console.log("Found hash in URL, attempting to process");
      
      // Process the hash - works for both recovery and verification
      // This handles the case where tokens are passed in the URL hash
      const result = await handleHashTokens();
      if (result.success) {
        return result;
      }
    }
    
    // Then check for a code parameter in the URL (newer Supabase style)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      console.log("Code parameter found, attempting to exchange for session");
      const result = await handleCodeBasedToken(code);
      if (result.success) {
        return result;
      }
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

// Handle code parameter in URL (Supabase new style)
async function handleCodeBasedToken(code: string): Promise<AuthTokenHandlerResult> {
  try {
    console.log("Exchanging code for session");
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      return { 
        success: false, 
        error,
        message: `Error exchanging code: ${error.message}`
      };
    }
    
    console.log("Successfully exchanged code for session:", data.session ? "Session created" : "No session");
    
    // Clean up the URL by removing the code parameter and update browser history
    if (window.history && window.history.replaceState) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('code');
      window.history.replaceState(null, document.title, cleanUrl.toString());
    }
    
    return { 
      success: !!data.session, 
      session: data.session,
      message: data.session ? "Session created successfully" : "No session created"
    };
  } catch (error) {
    console.error("Exception during code exchange:", error);
    return { success: false, error, message: "Error exchanging code for session" };
  }
}

// For backward compatibility - will be deprecated
export const handleHashRecoveryToken = handleHashTokens;
export const checkForAuthInUrl = handleAuthTokensOnLoad;
