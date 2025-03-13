
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
    storageKey: 'supabase.auth.token', // Consistent storage key
    flowType: 'pkce' // Using PKCE flow for better security
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
    console.log("Checking for auth in URL hash");
    const { data, error } = await supabase.auth.getSessionFromUrl();
    
    if (error) {
      console.error("Error getting session from URL:", error);
      return { success: false, error };
    }
    
    if (data?.session) {
      console.log("Successfully retrieved session from URL");
      return { success: true, session: data.session };
    } else {
      console.log("No session found in URL");
      return { success: false };
    }
  } catch (error) {
    console.error("Exception checking for auth in URL:", error);
    return { success: false, error };
  }
}
