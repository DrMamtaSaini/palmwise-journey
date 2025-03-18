
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

// Initialize the client variable outside the try block
let supabaseClient;

// Create the Supabase client with appropriate configuration
try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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

  // For auth debugging
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(`Auth state change event: ${event}`, session ? 'Session exists' : 'No session');
  });
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Create a fallback client that will log errors instead of crashing
  supabaseClient = {
    auth: {
      onAuthStateChange: () => ({ data: null, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error("Supabase client failed to initialize") }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({ data: null, error: new Error("Supabase client failed to initialize") }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: null, error: new Error("Supabase client failed to initialize") }),
      exchangeCodeForSession: async () => ({ data: { session: null }, error: null })
    },
    from: () => ({
      select: () => ({ data: null, error: new Error("Supabase client failed to initialize") }),
      insert: () => ({ data: null, error: new Error("Supabase client failed to initialize") }),
      update: () => ({ data: null, error: new Error("Supabase client failed to initialize") }),
      delete: () => ({ data: null, error: new Error("Supabase client failed to initialize") })
    }),
    functions: {
      invoke: async () => ({ data: null, error: new Error("Supabase client failed to initialize") })
    }
  } as unknown as ReturnType<typeof createClient>;
}

// Export the client outside of the try-catch block
export default supabaseClient;
