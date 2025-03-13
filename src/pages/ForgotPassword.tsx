
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address.",
      });
      return;
    }

    try {
      // Get the current origin
      const origin = window.location.origin;
      // Set the redirect URL to the reset-password page at the current origin
      const redirectUrl = `${origin}/reset-password`;
      
      console.log('Using redirect URL:', redirectUrl);
      
      const success = await forgotPassword(email, redirectUrl);
      
      if (success) {
        setIsSubmitted(true);
        toast.success("Reset link sent", {
          description: "Please check your email for the password reset link.",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Request failed", {
        description: "We couldn't send a reset link. Please try again later.",
      });
    }
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
                </div>

                <div className="flex flex-col space-y-3">
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
                  disabled={isLoading}
                  className="w-full bg-palm-purple hover:bg-palm-purple/90"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Sending...</span>
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
