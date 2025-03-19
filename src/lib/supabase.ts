
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined
  }
});

// Log initialization for debugging
console.log("Supabase client initialized with:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  currentUrl: typeof window !== 'undefined' ? window.location.href : 'not in browser'
});

// For auth debugging
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Auth state change event: ${event}`, session ? 'Session exists' : 'No session');
  });
}

/**
 * Handle authentication token exchange after redirect
 * Returns a result object with success status and message
 */
export const handleAuthTokensOnLoad = async () => {
  try {
    // Check if we have a hash in the URL (for auth redirects)
    const hasHashParams = window.location.hash && window.location.hash.length > 1;
    const hasQueryParams = window.location.search && window.location.search.length > 1;
    
    if (!hasHashParams && !hasQueryParams) {
      console.warn("No hash or query parameters found in URL");
      return { 
        success: false, 
        message: "No authentication parameters found" 
      };
    }
    
    // Let Supabase handle the token exchange
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error processing authentication redirect:", error);
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    // Check if we have a session
    if (!data.session) {
      console.warn("No session found after redirect");
      return { 
        success: false, 
        message: "Authentication failed - no session found" 
      };
    }
    
    // Log auth provider for debugging
    const provider = data.session.user?.app_metadata?.provider || 'unknown';
    console.info("Signed in via provider:", provider);
    
    return { 
      success: true, 
      message: "Authentication successful",
      user: data.session.user
    };
  } catch (err) {
    console.error("Unexpected error during auth processing:", err);
    return { 
      success: false, 
      message: err instanceof Error ? err.message : "Unknown error occurred" 
    };
  }
};

export default supabase;
