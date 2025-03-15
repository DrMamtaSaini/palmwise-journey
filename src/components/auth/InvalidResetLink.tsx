
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storeNewCodeVerifier } from "@/lib/supabase";

interface InvalidResetLinkProps {
  errorMessage: string | null;
  onRequestNewLink: () => void;
}

const InvalidResetLink = ({ errorMessage, onRequestNewLink }: InvalidResetLinkProps) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <p className="font-medium flex items-center">
          <AlertCircle size={18} className="mr-2" />
          Invalid or expired reset link
        </p>
        <p className="text-sm mt-1">
          {errorMessage || "Please request a new password reset link from the login page."}
        </p>
        {window.location.hostname === 'localhost' && (
          <p className="text-sm mt-2 font-medium">
            Note: Password reset links often have issues in local development environments.
          </p>
        )}
      </div>
      
      <Button 
        onClick={onRequestNewLink}
        className="w-full bg-palm-purple hover:bg-palm-purple/90"
      >
        <RefreshCcw size={18} className="mr-2" />
        Request New Reset Link
      </Button>
    </div>
  );
};

export default InvalidResetLink;
