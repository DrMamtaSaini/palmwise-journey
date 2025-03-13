
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
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
});

// Add useful debugging
console.log("Supabase client initialized with URL:", supabaseUrl);

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state changed: ${event}`, session ? "Session exists" : "No session");
});

// Export a function to explicitly check URL hash for auth flows
export async function checkForAuthInUrl() {
  try {
    console.log("Checking for auth in URL hash/params");
    
    // Use the correct method for checking for auth in URL
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Process the hash part manually
      console.log("Hash contains access_token, attempting to extract session");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session from hash:", error);
        return { success: false, error };
      }
      
      if (data?.session) {
        console.log("Successfully retrieved session from hash");
        return { success: true, session: data.session };
      }
    } else if (window.location.search && window.location.search.includes('code=')) {
      // Process the code parameter
      console.log("URL contains code parameter");
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code) {
        console.log("Attempting to exchange code for session");
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Error exchanging code for session:", error);
            return { success: false, error };
          }
          
          if (data?.session) {
            console.log("Successfully exchanged code for session");
            return { success: true, session: data.session };
          }
        } catch (exchangeError) {
          console.error("Exception during code exchange:", exchangeError);
          return { success: false, error: exchangeError };
        }
      }
    }
    
    console.log("No auth parameters found in URL");
    return { success: false };
  } catch (error) {
    console.error("Exception checking for auth in URL:", error);
    return { success: false, error };
  }
}
