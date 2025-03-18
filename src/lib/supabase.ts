
import supabaseClient from './supabaseClient';

// Export the Supabase client
export const supabase = supabaseClient;

// Log the current environment details for debugging
console.log("Supabase client exported from lib/supabase.ts");
console.log("Current browser location:", window.location.href);
console.log("Current origin:", window.location.origin);

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event in supabase.ts: ${event}`, session ? "Session exists" : "No session");
  
  if (event === 'SIGNED_IN') {
    console.log("User signed in successfully in supabase.ts!");
    if (session?.user?.app_metadata?.provider) {
      console.log("Signed in via provider:", session.user.app_metadata.provider);
    }
  }
});

// Handle URL with tokens on page load
export async function handleAuthTokensOnLoad() {
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
      code: code ? `${code.substring(0, 5)}...` : "missing", 
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
    
    if (code) {
      console.log("Code parameter found, attempting to exchange for session");
      
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
        
        console.log("Successfully exchanged code for session!");
        console.log("Provider used:", data.session.user.app_metadata?.provider || "email");
        
        // Clean up the URL by removing the code parameter
        if (window.history && window.history.replaceState) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('code');
          cleanUrl.searchParams.delete('type');
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
    
    // Hash parameters are no longer used in newer Supabase auth
    return { success: false, message: "No auth tokens found in URL" };
  } catch (error) {
    console.error("Exception handling auth tokens:", error);
    return { success: false, error, message: "Error processing authentication tokens" };
  }
}
