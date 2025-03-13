
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address.",
      });
      return;
    }
    
    try {
      console.log("Initiating password reset for:", email);
      
      // Create exact redirect URL with explicit protocol and origin
      const redirectUrl = `${window.location.protocol}//${window.location.host}/reset-password`;
      
      console.log("Using redirect URL for password reset:", redirectUrl);
      
      const success = await forgotPassword(email, redirectUrl);
      
      if (success) {
        console.log("Password reset email sent successfully");
        setSubmitted(true);
        toast.success("Password reset email sent", {
          description: "Check your inbox for instructions to reset your password."
        });
      } else {
        console.error("Password reset failed in UI layer");
        toast.error("Failed to send reset email", {
          description: "Please try again later or contact support."
        });
      }
    } catch (error) {
      console.error("Password reset error in UI layer:", error);
      toast.error("Password reset failed", {
        description: "Please try again later.",
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
                {!submitted ? 
                  "Enter your email to receive password reset instructions" : 
                  "Check your email for reset instructions"}
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
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
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <p className="font-medium">Reset link sent!</p>
                  <p className="text-sm mt-1">
                    If an account exists for {email}, you'll receive an email with instructions to reset your password.
                  </p>
                </div>
                
                <div className="text-center">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full"
                    >
                      <ArrowLeft size={16} className="mr-1" />
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
