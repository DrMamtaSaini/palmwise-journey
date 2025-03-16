
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TokenVerifierProps {
  onVerificationComplete: (isValid: boolean, error: string | null) => void;
}

const TokenVerifier = ({ onVerificationComplete }: TokenVerifierProps) => {
  const [searchParams] = useSearchParams();
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  useEffect(() => {
    // We only want to attempt verification once
    if (verificationAttempted) return;
    
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
        
        // First check if there's an error in the URL (from Supabase redirect)
        if (error && errorDescription) {
          console.error(`Error in URL: ${error} - ${errorDescription}`);
          setErrorDetails(errorDescription);
          onVerificationComplete(false, errorDescription);
          setVerificationAttempted(true);
          return;
        }

        // If we have a code, we'll try to exchange it for a session
        if (code) {
          console.log("Processing code from URL");
          
          try {
            // Two approaches:
            // 1. First try with the existing session - simple approach
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              console.log("User already has a valid session");
              onVerificationComplete(true, null);
              setVerificationAttempted(true);
              return;
            }
            
            // 2. Attempt to exchange the code directly
            console.log("No existing session, attempting to exchange code...");
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Error exchanging code for session:", error);
              
              // Store diagnostic info for debugging
              setErrorDetails(error.message);
              localStorage.setItem('resetPasswordError', JSON.stringify({
                error: error.message,
                code: code.substring(0, 5) + "...",
                timestamp: new Date().toISOString()
              }));
              
              onVerificationComplete(false, error.message);
              setVerificationAttempted(true);
              return;
            }
            
            if (!data.session) {
              console.warn("Code exchange succeeded but no session was returned");
              setErrorDetails("Authentication succeeded but no session was created");
              onVerificationComplete(false, "Authentication succeeded but no session was created");
              setVerificationAttempted(true);
              return;
            }
            
            console.log("Successfully exchanged code for session!");
            
            // Clean up the URL by removing the code parameter
            if (window.history && window.history.replaceState) {
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete('code');
              cleanUrl.searchParams.delete('type');
              window.history.replaceState(null, document.title, cleanUrl.toString());
            }
            
            onVerificationComplete(true, null);
            setVerificationAttempted(true);
          } catch (exchangeError) {
            console.error("Exception during code exchange:", exchangeError);
            setErrorDetails("Error processing reset code. Please try requesting a new reset link.");
            onVerificationComplete(false, "Error processing reset code");
            setVerificationAttempted(true);
          }
        } else {
          // No code in URL, check if there's a session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log("User has a valid session, allowing password reset");
            onVerificationComplete(true, null);
            setVerificationAttempted(true);
          } else {
            console.log("No valid session or code found");
            setErrorDetails("No reset code found in URL. Please request a new password reset link.");
            onVerificationComplete(false, "No reset code found in URL. Please request a new password reset link.");
            setVerificationAttempted(true);
          }
        }
      } catch (error) {
        console.error("Error in token verification:", error);
        setErrorDetails("Error verifying reset link");
        onVerificationComplete(false, "Error verifying reset link");
        setVerificationAttempted(true);
      }
    }
    
    verifyResetToken();
  }, [searchParams, onVerificationComplete, verificationAttempted]);
  
  if (errorDetails) {
    return (
      <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-800">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-red-800 font-medium">
          Verification Error
        </AlertTitle>
        <AlertDescription className="text-red-700">{errorDetails}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="text-center">
      <p className="text-xl mb-2">Verifying reset link...</p>
      <div className="mt-4 w-8 h-8 border-4 border-palm-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );
};

export default TokenVerifier;
