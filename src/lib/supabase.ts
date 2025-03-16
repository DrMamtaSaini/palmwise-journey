
import supabaseClient from './supabaseClient';

// Export the Supabase client
export const supabase = supabaseClient;

// Log the current environment details for debugging
console.log("Supabase client exported from lib/supabase.ts");
console.log("Current browser location:", window.location.href);
console.log("Current origin:", window.location.origin);

// Handle auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth state change event: ${event}`, session ? "Session exists" : "No session");
  
  if (event === 'SIGNED_IN') {
    console.log("User signed in successfully!");
    if (session?.user?.app_metadata?.provider) {
      console.log("Signed in via provider:", session.user.app_metadata.provider);
    }
    localStorage.removeItem('passwordResetRequestedAt');
    localStorage.removeItem('passwordResetEmail');
  }
  
  if (event === 'PASSWORD_RECOVERY') {
    console.log("Password recovery event detected!");
    localStorage.setItem('passwordResetRequestedAt', new Date().toISOString());
    
    // Redirect to reset password page if we're not already there
    if (!window.location.pathname.includes('reset-password')) {
      window.location.href = `${window.location.origin}/reset-password`;
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
      localStorage.setItem('passwordResetRequestedAt', new Date().toISOString());
    }
    
    if (code) {
      console.log("Code parameter found:", code.substring(0, 5) + "...");
      
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
        console.log("Provider used:", data.session.user.app_metadata?.provider || "email");
        
        // Clean up the URL by removing the code parameter
        if (window.history && window.history.replaceState) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('code');
          cleanUrl.searchParams.delete('type');
          window.history.replaceState(null, document.title, cleanUrl.toString());
        }
        
        // Check if this was a password reset request
        if (type === 'recovery' || localStorage.getItem('passwordResetRequestedAt')) {
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
    
    // Check if we're on the reset-password page
    if (window.location.pathname.includes('reset-password')) {
      if (localStorage.getItem('passwordResetRequestedAt')) {
        // Check if the reset was requested recently (within 10 minutes)
        const resetTime = new Date(localStorage.getItem('passwordResetRequestedAt') || "");
        const nowTime = new Date();
        const minutesSinceReset = (nowTime.getTime() - resetTime.getTime()) / (1000 * 60);
        
        if (minutesSinceReset > 10) {
          console.log("Reset link expired (requested more than 10 minutes ago)");
          return { 
            success: false,
            message: "Your reset link has expired. Please request a new one."
          };
        }
      } else if (!code) {
        console.log("On reset password page but no code parameter or reset request found.");
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
