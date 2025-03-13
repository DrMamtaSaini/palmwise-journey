
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, checkForAuthInUrl } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validResetFlow, setValidResetFlow] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { updatePassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyResetFlow = async () => {
      console.log("Reset password page loaded, URL:", window.location.href);
      
      // First check for hash-based auth (more common)
      if (window.location.hash) {
        console.log("Hash detected in URL:", window.location.hash);
        
        try {
          // First check if we can extract a session from the URL hash
          const { success, error } = await checkForAuthInUrl();
          
          if (success) {
            console.log("Successfully got session from URL hash");
            setValidResetFlow(true);
            setAuthChecked(true);
            return;
          } else if (error) {
            console.error("Error extracting session from hash:", error);
          }
          
          // If that failed, try another approach with getSession
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error getting auth session:", sessionError);
          } else if (data.session) {
            console.log("Found existing session");
            setValidResetFlow(true);
            setAuthChecked(true);
            return;
          }
        } catch (err) {
          console.error("Error in hash-based auth flow:", err);
        }
      }
      
      // Then check for code-based flow (via URL parameter)
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      if (code) {
        console.log("Code parameter found:", code);
        
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Error exchanging code for session:", error);
            toast.error("Invalid or expired reset link", {
              description: "Please request a new password reset link.",
            });
            navigate('/forgot-password');
          } else if (data.session) {
            console.log("Successfully exchanged code for session");
            setValidResetFlow(true);
          } else {
            console.warn("No session returned after code exchange");
            toast.error("Unable to verify reset link", {
              description: "Please request a new password reset link.",
            });
            navigate('/forgot-password');
          }
        } catch (err) {
          console.error("Error in code-based auth flow:", err);
          toast.error("Error processing reset link", {
            description: "Please try again or request a new reset link.",
          });
          navigate('/forgot-password');
        }
      } else if (!window.location.hash) {
        // No code or hash found
        console.log("No valid reset parameters found");
        toast.error("Invalid reset link", {
          description: "This page can only be accessed from a password reset email.",
        });
        navigate('/login');
      }
      
      setAuthChecked(true);
    };
    
    verifyResetFlow();
  }, [navigate, location.search]);

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

  if (!authChecked) {
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

            {validResetFlow ? (
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
                    Please request a new password reset link from the login page.
                  </p>
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
