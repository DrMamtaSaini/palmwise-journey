
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, handleAuthTokensOnLoad } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyResetToken() {
      try {
        console.log("Verifying password reset token...");
        console.log("Current URL:", window.location.href);
        setIsVerifying(true);
        
        // Check for code parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log("Found code parameter in URL:", code.substring(0, 10) + "...");
          
          try {
            // Try to exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Error exchanging code:", error);
              setTokenError(`Error: ${error.message}`);
              setValidToken(false);
            } else if (data?.session) {
              console.log("Successfully exchanged code for session");
              setValidToken(true);
            } else {
              console.log("No session returned after code exchange");
              setTokenError("No valid session created from reset link");
              setValidToken(false);
            }
          } catch (exchangeError) {
            console.error("Exception during code exchange:", exchangeError);
            setTokenError("Error processing reset code");
            setValidToken(false);
          }
        } else {
          // Try to handle any auth tokens in the URL if no code parameter
          console.log("No code parameter, checking for hash tokens");
          const tokenResult = await handleAuthTokensOnLoad();
          console.log("Token handling result:", tokenResult);
          
          if (tokenResult.success) {
            console.log("Valid auth token confirmed");
            setValidToken(true);
          } else {
            // Check if there's already a valid session
            const { data } = await supabase.auth.getSession();
            
            if (data?.session) {
              console.log("User already has a valid session");
              setValidToken(true);
            } else {
              console.log("No valid token or session found");
              setTokenError("Invalid or expired reset link");
              setValidToken(false);
            }
          }
        }
      } catch (error) {
        console.error("Error in token verification:", error);
        setTokenError("Error verifying reset link");
        setValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyResetToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Your password must be at least 8 characters long."
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords match."
      });
      return;
    }
    
    try {
      console.log("Attempting to update password");
      const success = await updatePassword(password);
      
      if (success) {
        toast.success("Password updated successfully", {
          description: "You can now log in with your new password."
        });
        
        // Redirect to login after success
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error("Failed to update password", {
          description: "Please try again or request a new reset link."
        });
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Password update failed", {
        description: "Please try again later."
      });
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
          <div className="text-center">
            <p className="text-xl">Verifying reset link...</p>
            <div className="mt-4 w-8 h-8 border-4 border-palm-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
              <p className="text-gray-600">
                Choose a new password for your account
              </p>
            </div>

            {validToken ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-palm-purple hover:bg-palm-purple/90"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Updating...</span>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      <span>Update Password</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <p className="font-medium">Invalid or expired reset link</p>
                  <p className="text-sm mt-1">
                    {tokenError || "Please request a new password reset link from the login page."}
                  </p>
                  {window.location.hostname === 'localhost' && (
                    <p className="text-sm mt-2 font-medium">
                      Note: Password reset links often have issues in local development environments.
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <Link to="/forgot-password">
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full"
                    >
                      Request New Reset Link
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

export default ResetPassword;
