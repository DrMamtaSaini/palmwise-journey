
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface InvalidResetLinkProps {
  errorMessage: string | null;
  onRequestNewLink: () => void;
}

const InvalidResetLink = ({ errorMessage, onRequestNewLink }: InvalidResetLinkProps) => {
  const handleRequestNewLink = () => {
    // Clear any old error data
    localStorage.removeItem('resetPasswordError');
    
    onRequestNewLink();
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-red-800 font-medium">
          Invalid or expired reset link
        </AlertTitle>
        <AlertDescription className="text-red-700 mt-1">
          {errorMessage || "The password reset link has expired or is invalid. Please request a new reset link."}
          
          <p className="mt-2 text-sm">
            Your authentication session has expired or was lost. 
            Please request a new reset link to continue.
          </p>
        </AlertDescription>
        
        <p className="text-sm mt-2 italic font-medium">
          For security reasons, reset links expire in 5 minutes. 
          Please use the link immediately after receiving it.
        </p>
      </Alert>
      
      <Button 
        onClick={handleRequestNewLink}
        className="w-full bg-palm-purple hover:bg-palm-purple/90"
      >
        <RefreshCcw size={18} className="mr-2" />
        Request New Reset Link
      </Button>

      <div className="text-center mt-4 text-sm text-gray-600">
        <p>If you continue to experience issues:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Try using a different browser</li>
          <li>Clear your browser cookies and cache</li>
          <li>Make sure you're clicking the link directly from your email</li>
        </ul>
      </div>
    </div>
  );
};

export default InvalidResetLink;
