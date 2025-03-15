
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CODE_VERIFIER_KEY, generateAndStoreCodeVerifier } from "@/utils/authUtils";

interface InvalidResetLinkProps {
  errorMessage: string | null;
  onRequestNewLink: () => void;
}

const InvalidResetLink = ({ errorMessage, onRequestNewLink }: InvalidResetLinkProps) => {
  const handleRequestNewLink = () => {
    // Generate a fresh code verifier before requesting a new link
    generateAndStoreCodeVerifier();
    
    // Clear any old error data
    localStorage.removeItem('resetPasswordError');
    
    onRequestNewLink();
  };

  // Get any stored error details for debugging
  const getErrorDetails = () => {
    try {
      const errorDetails = localStorage.getItem('resetPasswordError');
      if (errorDetails) {
        return JSON.parse(errorDetails);
      }
    } catch (e) {
      console.error("Error parsing resetPasswordError:", e);
    }
    return null;
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-red-800 font-medium">
          Invalid or expired reset link
        </AlertTitle>
        <AlertDescription className="text-red-700 mt-1">
          {errorMessage || "Please request a new password reset link from the login page."}
          
          {errorDetails?.error && errorDetails.error.includes("code verifier") && (
            <p className="mt-2 text-sm">
              Your authentication session has expired or was lost. 
              Please request a new reset link to continue.
            </p>
          )}
        </AlertDescription>
        
        {window.location.hostname === 'localhost' && (
          <p className="text-sm mt-2 font-medium">
            Note: Password reset links often have issues in local development environments.
          </p>
        )}
      </Alert>
      
      <Button 
        onClick={handleRequestNewLink}
        className="w-full bg-palm-purple hover:bg-palm-purple/90"
      >
        <RefreshCcw size={18} className="mr-2" />
        Request New Reset Link
      </Button>
    </div>
  );
};

export default InvalidResetLink;
