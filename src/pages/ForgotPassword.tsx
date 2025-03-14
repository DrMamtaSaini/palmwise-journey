
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase, storeNewCodeVerifier } from "@/lib/supabase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Generate code verifier and challenge for PKCE flow
  useEffect(() => {
    console.log("Generating new code verifier in ForgotPassword");
    
    // Store a new code verifier for this page
    const codeVerifier = storeNewCodeVerifier();
    console.log("New code verifier generated:", codeVerifier ? "success" : "failed");
    
    // Check if we're on localhost for special messaging
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');

    // Pre-fill email if passed in location state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

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
      // Always generate a fresh code verifier before requesting a password reset
      console.log("Regenerating code verifier before password reset request");
      const codeVerifier = storeNewCodeVerifier();
      console.log("Fresh code verifier generated:", codeVerifier ? "success" : "failed");
      
      // Get the absolute URL for the reset-password page
      const origin = window.location.origin;
      const redirectUrl = `${origin}/reset-password`;
      
      console.log('Using redirect URL:', redirectUrl);
      
      // Set a flag to help identify password reset requests
      localStorage.setItem('passwordResetRequested', 'true');
      localStorage.setItem('passwordResetEmail', email);
      
      const success = await forgotPassword(email, redirectUrl);
      
      if (success) {
        setIsSubmitted(true);
        toast.success("Reset link sent", {
          description: "Please check your email for the password reset link.",
        });
      } else {
        toast.error("Request failed", {
          description: "We couldn't send a reset link. Please try again.",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Request failed", {
        description: "We couldn't send a reset link. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Clear existing state and generate a new code verifier
    console.log("Retrying with same email");
    storeNewCodeVerifier();
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-gray-600">
                Enter your email to receive a password reset link
              </p>
            </div>

            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <p className="font-medium">Authentication configuration tip:</p>
                <p className="text-sm mt-1">Make sure your Supabase project's Site URL is set to "{window.location.origin}" in the Authentication settings.</p>
              </AlertDescription>
            </Alert>

            {isSubmitted ? (
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
                    onClick={handleRetry}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    Try again with same email
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
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
            ) : (
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
                  disabled={isLoading || loading}
                  className="w-full bg-palm-purple hover:bg-palm-purple/90"
                >
                  {isLoading || loading ? (
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
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
