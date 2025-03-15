
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ResetEmailSentProps {
  email: string;
  isLocalhost: boolean;
  onRetry: () => void;
  onTryAnotherEmail: () => void;
}

const ResetEmailSent = ({
  email,
  isLocalhost,
  onRetry,
  onTryAnotherEmail
}: ResetEmailSentProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
        <p className="font-medium flex items-center">
          <AlertCircle size={20} className="mr-2" />
          Check your email
        </p>
        <p className="text-sm mt-1">
          We've sent a password reset link to <span className="font-medium">{email}</span>.
          Please check your inbox and spam folder.
        </p>
        
        {isLocalhost && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <p className="font-medium">Local Development Note:</p>
            <p>Password reset links may have issues in local environments. If you don't see the email or the link doesn't work, try in production or contact support.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          className="w-full"
        >
          <RefreshCw size={18} className="mr-2" />
          Try again with same email
        </Button>

        <Button
          type="button"
          onClick={onTryAnotherEmail}
          variant="outline"
          className="w-full"
        >
          Try another email
        </Button>

        <Button 
          type="button" 
          onClick={() => navigate('/login')}
          className="w-full bg-palm-purple hover:bg-palm-purple/90"
        >
          Return to login
        </Button>
      </div>
    </div>
  );
};

export default ResetEmailSent;
