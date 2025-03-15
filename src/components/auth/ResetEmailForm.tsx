
import { useState } from "react";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { 
  generateAndStoreCodeVerifier, 
  generateCodeChallenge, 
  storePasswordResetInfo, 
  markPasswordResetRequested 
} from "@/utils/authUtils";

interface ResetEmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  setIsSubmitted: (isSubmitted: boolean) => void;
}

const ResetEmailForm = ({
  email,
  setEmail,
  setIsSubmitted
}: ResetEmailFormProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address.",
      });
      setLoading(false);
      return;
    }

    try {
      // Generate a fresh code verifier for this specific reset request
      const codeVerifier = generateAndStoreCodeVerifier();
      
      if (!codeVerifier) {
        toast.error("Error setting up password reset", { 
          description: "Please try again or contact support." 
        });
        setLoading(false);
        return;
      }
      
      console.log("Fresh code verifier for password reset request:", codeVerifier.substring(0, 10) + "...");
      
      // Get the absolute URL for the reset-password page
      const origin = window.location.origin;
      const redirectUrl = `${origin}/reset-password`;
      
      console.log('Using redirect URL for password reset:', redirectUrl);
      
      // Store password reset info for debugging and recovery
      storePasswordResetInfo(email, codeVerifier, redirectUrl, "");
      
      console.log("Calling Supabase resetPasswordForEmail with:", {
        email,
        redirectUrl,
        codeVerifierExists: !!codeVerifier,
        codeVerifierLength: codeVerifier.length,
        codeVerifierStart: codeVerifier.substring(0, 10) + "..."
      });
      
      // Use Supabase auth for password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        console.error("Supabase password reset error:", error);
        toast.error("Password reset failed", {
          description: error.message || "Please try again later.",
        });
        setLoading(false);
        return;
      }
      
      // Mark password reset as requested for later verification
      markPasswordResetRequested();
      
      setIsSubmitted(true);
      toast.success("Reset link sent", {
        description: "Please check your email for the password reset link.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Request failed", {
        description: "We couldn't send a reset link. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
          placeholder="Enter your email"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-palm-purple hover:bg-palm-purple/90"
      >
        {loading ? (
          <span className="flex items-center">
            <RefreshCw size={18} className="mr-2 animate-spin" />
            Sending...
          </span>
        ) : (
          <>
            <Send size={18} className="mr-2" />
            <span>Send Reset Link</span>
          </>
        )}
      </Button>

      <div className="text-center mt-4">
        <Link to="/login" className="text-palm-purple hover:underline inline-flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ResetEmailForm;
