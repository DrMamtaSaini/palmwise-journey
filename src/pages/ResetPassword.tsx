
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validResetFlow, setValidResetFlow] = useState(false);
  const { updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkResetFlow = async () => {
      // Get code from URL parameters or from the hash
      const currentUrl = new URL(window.location.href);
      let code = currentUrl.searchParams.get('code');
      
      console.log("Reset password page loaded, checking for code parameter");
      console.log("Current path:", currentUrl.pathname);
      console.log("Code parameter:", code);
      console.log("Hash:", window.location.hash);
      
      // If we're on root path with a code, redirect to the reset-password path
      if (currentUrl.pathname === '/' && code) {
        console.log("Detected code on root path instead of reset-password path");
        // Redirect to the correct path with the code
        const newUrl = `${window.location.origin}/reset-password?code=${code}`;
        console.log("Redirecting to the correct path:", newUrl);
        window.location.href = newUrl;
        return;
      }

      if (code) {
        console.log("Code parameter found in URL, validating with Supabase");
        setValidResetFlow(true);

        try {
          // Verify the token/code with Supabase
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Error exchanging code for session:", error);
            toast.error("Invalid or expired reset link", {
              description: "Please request a new password reset link.",
            });
            navigate('/forgot-password');
            return;
          }

          console.log("Successfully validated code, session established:", data);
          // Valid code, we can continue with password reset
        } catch (error) {
          console.error("Error during code validation:", error);
          toast.error("Error validating reset link", {
            description: "Please try again or request a new reset link.",
          });
          navigate('/forgot-password');
        }
      } else {
        // Check for hash-based recovery flow (#access_token=...)
        const hash = window.location.hash;
        if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
          console.log("Hash-based recovery flow detected:", hash);
          setValidResetFlow(true);
        } else {
          console.log("No valid reset parameters found, redirecting to login");
          toast.error("Invalid reset link", {
            description: "This page can only be accessed from a password reset email.",
          });
          navigate('/login');
        }
      }
    };
    
    checkResetFlow();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Your password must be at least 8 characters long.",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords match.",
      });
      return;
    }
    
    try {
      console.log("Attempting to update password");
      const success = await updatePassword(password);
      if (success) {
        toast.success("Password updated", {
          description: "Your password has been successfully updated. You can now log in with your new password.",
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Password update failed", {
        description: "Please try again later.",
      });
    }
  };

  if (!validResetFlow && isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
          <div className="text-center">
            <p className="text-xl">Validating reset link...</p>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
