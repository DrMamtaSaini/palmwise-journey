
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface TokenVerifierProps {
  onVerificationComplete: (isValid: boolean, error: string | null) => void;
}

const TokenVerifier = ({ onVerificationComplete }: TokenVerifierProps) => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    async function verifyResetToken() {
      try {
        console.log("=========== VERIFYING PASSWORD RESET TOKEN ===========");
        console.log("Current URL:", window.location.href);
        
        // Check for code parameter in URL
        const code = searchParams.get('code');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log("Code from URL:", code ? "present (starts with " + code.substring(0, 5) + "...)" : "missing");
        console.log("Type from URL:", type || "none");
        console.log("Error from URL:", error || "none");
        console.log("Error description:", errorDescription || "none");
        
        // If there's an error in the URL, show it
        if (error && errorDescription) {
          console.error(`Error in URL: ${error} - ${errorDescription}`);
          onVerificationComplete(false, errorDescription);
          return;
        }
        
        // Try to recover verifier from passwordResetInfo if available
        let recoveredVerifier = null;
        try {
          const passwordResetInfo = localStorage.getItem('passwordResetInfo');
          if (passwordResetInfo) {
            const parsedInfo = JSON.parse(passwordResetInfo);
            if (parsedInfo.fullVerifier) {
              console.log("Recovered verifier from passwordResetInfo");
              recoveredVerifier = parsedInfo.fullVerifier;
              
              // Immediately store it in all locations to maximize chances of success
              localStorage.setItem('palm_reader.auth.code_verifier', recoveredVerifier);
              localStorage.setItem('supabase.auth.code_verifier', recoveredVerifier);
              localStorage.setItem('palm_reader.auth.last_used_verifier', recoveredVerifier);
              
              console.log("Stored recovered verifier in all storage locations:", 
                recoveredVerifier.substring(0, 10) + "...");
            }
          }
        } catch (e) {
          console.error("Error recovering verifier from passwordResetInfo:", e);
        }
        
        if (code) {
          console.log("Processing code from URL");
          
          try {
            // Try to exchange the code for a session
            console.log("Attempting to exchange code for session...");
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Error exchanging code for session:", error);
              
              // Special handling for common errors
              if (error.message.includes("auth code and code verifier")) {
                onVerificationComplete(false, "Authentication error: The code verifier doesn't match the code. Please request a new reset link.");
              } else {
                onVerificationComplete(false, `Error: ${error.message || "Invalid reset code"}`);
              }
              
              // Store diagnostic info for debugging
              localStorage.setItem('resetPasswordError', JSON.stringify({
                error: error.message,
                code: code.substring(0, 5) + "...",
                hasVerifier: !!recoveredVerifier,
                verifierLength: recoveredVerifier ? recoveredVerifier.length : 0,
                timestamp: new Date().toISOString()
              }));
              return;
            }
            
            if (!data.session) {
              console.warn("Code exchange succeeded but no session was returned");
              onVerificationComplete(false, "Authentication succeeded but no session was created");
              return;
            }
            
            console.log("Successfully exchanged code for session");
            onVerificationComplete(true, null);
            
            // Clean up the URL by removing the code parameter
            if (window.history && window.history.replaceState) {
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete('code');
              cleanUrl.searchParams.delete('type');
              window.history.replaceState(null, document.title, cleanUrl.toString());
            }
          } catch (exchangeError) {
            console.error("Exception during code exchange:", exchangeError);
            onVerificationComplete(false, "Error processing reset code. The code may be invalid or expired.");
          }
        } else {
          // Check if there's already a valid session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log("User has a valid session, allowing password reset");
            onVerificationComplete(true, null);
          } else {
            console.log("No valid session found");
            onVerificationComplete(false, "No reset code found in URL. Please check your email and click the reset link.");
          }
        }
      } catch (error) {
        console.error("Error in token verification:", error);
        onVerificationComplete(false, "Error verifying reset link");
      }
    }
    
    verifyResetToken();
  }, [searchParams, onVerificationComplete]);
  
  return (
    <div className="text-center">
      <p className="text-xl">Verifying reset link...</p>
      <div className="mt-4 w-8 h-8 border-4 border-palm-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );
};

export default TokenVerifier;
