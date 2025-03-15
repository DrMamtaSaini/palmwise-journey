import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vvaextxqyrvcpjwndgby.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables for production.');
}

// Determine if we're in a development environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// IMPORTANT: Using separate storage keys for code verifier to avoid conflicts
const CODE_VERIFIER_KEY = 'palm_reader.auth.code_verifier';
const SUPABASE_CODE_VERIFIER_KEY = 'supabase.auth.code_verifier';
const LAST_USED_VERIFIER_KEY = 'palm_reader.auth.last_used_verifier';

// Create and export the Supabase client with appropriate configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // IMPORTANT: Set to false to manually handle redirects
    storage: window.localStorage
  }
});

// Log the current environment details for debugging
console.log("Supabase client initialized with URL:", supabaseUrl);
console.log("Current browser location:", window.location.href);
console.log("Current origin:", window.location.origin);

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event: ${event}`, session ? "Session exists" : "No session");
  
  if (event === 'PASSWORD_RECOVERY') {
    console.log("Password recovery event detected!");
    localStorage.setItem('passwordResetRequested', 'true');
    localStorage.setItem('passwordResetTimestamp', new Date().toISOString());
    
    // Redirect to reset password page if we're not already there
    if (!window.location.pathname.includes('reset-password')) {
      window.location.href = `${window.location.origin}/reset-password`;
    }
  }
  
  if (event === 'SIGNED_IN') {
    console.log("User signed in successfully!");
    localStorage.removeItem('passwordResetRequested');
    localStorage.removeItem('passwordResetTimestamp');
    localStorage.removeItem('passwordResetEmail');
  }
});

// Helper function to generate a secure random string for PKCE
function generateSecureString(length: number): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => 
    ('0' + (byte & 0xFF).toString(16)).slice(-2)
  ).join('');
}

// Helper function to generate a code verifier for PKCE flow
export function generateCodeVerifier(): string {
  // Generate a string that is between 43-128 characters long
  // Using 64 bytes (128 hex chars) for better security
  const secureString = generateSecureString(64);
  return secureString;
}

// Store a new code verifier in local storage - using ALL storage keys for maximum compatibility
export function storeNewCodeVerifier(): string {
  const codeVerifier = generateCodeVerifier();
  
  // Store in our custom key
  localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
  
  // Also store in the default Supabase key for compatibility
  localStorage.setItem(SUPABASE_CODE_VERIFIER_KEY, codeVerifier);
  
  // Store as the last used verifier for reset links
  localStorage.setItem(LAST_USED_VERIFIER_KEY, codeVerifier);
  
  console.log("Generated and stored new code verifier:", codeVerifier.substring(0, 10) + "...");
  
  // Store in passwordResetInfo for recovery
  try {
    const existingInfoStr = localStorage.getItem('passwordResetInfo');
    if (existingInfoStr) {
      const existingInfo = JSON.parse(existingInfoStr);
      existingInfo.fullVerifier = codeVerifier;
      existingInfo.verifier = codeVerifier.substring(0, 10) + "...";
      existingInfo.verifierLength = codeVerifier.length;
      existingInfo.timestamp = new Date().toISOString();
      localStorage.setItem('passwordResetInfo', JSON.stringify(existingInfo));
    }
  } catch (e) {
    console.error("Error updating passwordResetInfo with new verifier:", e);
  }
  
  return codeVerifier;
}

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
    const type = params.get('type');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log("URL parameters:", { 
      code: code ? code.substring(0, 5) + "..." : "missing", 
      type, 
      error, 
      errorDescription 
    });
    
    // If error params exist, return early with error
    if (error && errorDescription) {
      console.error(`Error in URL: ${error} - ${errorDescription}`);
      return { 
        success: false, 
        message: errorDescription
      };
    }
    
    // If this is a recovery type, store that information
    if (type === 'recovery') {
      console.log("This appears to be a password reset link");
      localStorage.setItem('passwordResetRequested', 'true');
      localStorage.setItem('passwordResetTimestamp', new Date().toISOString());
    }
    
    if (code) {
      console.log("Code parameter found:", code.substring(0, 5) + "...");
      
      // Try to use the same code verifier that was used to generate this link
      const lastUsedVerifier = localStorage.getItem(LAST_USED_VERIFIER_KEY);
      
      // Try to find a code verifier in any of the storage locations
      const palmReaderVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
      const supabaseVerifier = localStorage.getItem(SUPABASE_CODE_VERIFIER_KEY);
      // Get the password reset info if available
      let passwordResetInfo = null;
      try {
        const infoStr = localStorage.getItem('passwordResetInfo');
        if (infoStr) {
          passwordResetInfo = JSON.parse(infoStr);
        }
      } catch (e) {
        console.error("Error parsing passwordResetInfo:", e);
      }
      
      // Prioritize in this order: 
      // 1. Last used verifier
      // 2. Full verifier from passwordResetInfo
      // 3. Palm reader verifier
      // 4. Supabase verifier
      const codeVerifier = lastUsedVerifier || 
                         (passwordResetInfo?.fullVerifier) || 
                         palmReaderVerifier || 
                         supabaseVerifier;
      
      console.log("Code verifier search results:");
      console.log("- Last used verifier:", lastUsedVerifier ? lastUsedVerifier.substring(0, 10) + "..." : "Not found");
      console.log("- Password reset info verifier:", passwordResetInfo?.fullVerifier ? 
                  passwordResetInfo.fullVerifier.substring(0, 10) + "..." : "Not found");
      console.log("- PalmReader verifier:", palmReaderVerifier ? palmReaderVerifier.substring(0, 10) + "..." : "Not found");
      console.log("- Supabase verifier:", supabaseVerifier ? supabaseVerifier.substring(0, 10) + "..." : "Not found");
      console.log("- Selected verifier:", codeVerifier ? codeVerifier.substring(0, 10) + "..." : "None found");
      
      if (codeVerifier) {
        console.log("Verifier length:", codeVerifier.length);
        console.log("Verifier (first 10 chars):", codeVerifier.substring(0, 10) + "...");
        
        // Ensure the verifier is stored in ALL locations to maximize success chance
        localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
        localStorage.setItem(SUPABASE_CODE_VERIFIER_KEY, codeVerifier);
        localStorage.setItem(LAST_USED_VERIFIER_KEY, codeVerifier);
      } else {
        console.warn("No code verifier found in localStorage");
        return {
          success: false,
          message: "Authentication error: No code verifier found. Please request a new password reset link."
        };
      }
      
      try {
        // Try to exchange the code for a session
        console.log("Attempting to exchange code for session...");
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
          cleanUrl.searchParams.delete('type');
          window.history.replaceState(null, document.title, cleanUrl.toString());
        }
        
        // Check if this was a password reset request
        if (type === 'recovery' || localStorage.getItem('passwordResetRequested') === 'true') {
          console.log("This appears to be a password reset request");
          
          return { 
            success: true, 
            session: data.session,
            message: "Session created successfully for password reset" 
          };
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
    
    // If we have a passwordResetRequested flag but no code, we might need to inform the user
    if (localStorage.getItem('passwordResetRequested') === 'true' && !code) {
      // Check if we're on the reset-password page
      if (window.location.pathname.includes('reset-password')) {
        console.log("On reset password page but no code parameter found.");
        return { 
          success: false,
          message: "No reset code found in URL. Please request a new password reset link."
        };
      }
    }
    
    return { success: false, message: "No auth tokens found in URL" };
  } catch (error) {
    console.error("Exception handling auth tokens:", error);
    return { success: false, error, message: "Error processing authentication tokens" };
  }
}
