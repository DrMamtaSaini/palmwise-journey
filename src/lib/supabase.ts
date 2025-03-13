
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

// Check for auth code in URL - simplified and more reliable approach
export async function checkForAuthInUrl() {
  try {
    // Check if we have a code parameter (most common for password reset)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      console.log("Code parameter found, attempting to exchange for session");
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error);
          return { success: false, error };
        }
        
        console.log("Successfully exchanged code for session:", data.session ? "Session created" : "No session");
        return { success: !!data.session, session: data.session };
      } catch (error) {
        console.error("Exception during code exchange:", error);
        return { success: false, error };
      }
    }
    
    console.log("No auth code found in URL");
    return { success: false, message: "No auth parameters found" };
  } catch (error) {
    console.error("Exception checking for auth in URL:", error);
    return { success: false, error };
  }
}
