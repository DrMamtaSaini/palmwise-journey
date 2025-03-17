
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

// Create and export the Supabase client with appropriate configuration
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Log initialization for debugging
console.log("Supabase client initialized with:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  currentUrl: window.location.href,
  localStorage: typeof localStorage !== 'undefined' ? 'available' : 'unavailable'
});

// For OAuth debugging
supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event: ${event}`, session ? 'Session exists' : 'No session');
  
  if (event === 'SIGNED_IN' && session) {
    console.log("User signed in successfully, provider:", session.user?.app_metadata?.provider);
    console.log("User email:", session.user?.email);
  }
});

export default supabaseClient;
