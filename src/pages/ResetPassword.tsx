
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      console.log("Reset password page loaded with URL params:", location.search);
      console.log("Hash parts:", window.location.hash);
      
      // Check URL parameters for recovery token
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const typeParam = searchParams.get('type');
      
      // Check hash for recovery token (Supabase sometimes uses hash instead)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const hashType = hashParams.get('type');
      
      console.log("URL code parameter:", code);
      console.log("URL type parameter:", typeParam);
      console.log("Hash type parameter:", hashType);
      
      // Check for recovery flow in either query params or hash
      const isRecoveryFlow = 
        (typeParam === 'recovery') || 
        (hashType === 'recovery') || 
        window.location.hash.includes('type=recovery');
      
      if (code || isRecoveryFlow) {
        console.log("Valid reset flow detected");
        setValidResetFlow(true);
        
        // If we have a code but Supabase hasn't processed it yet, confirm the token
        if (code) {
          try {
            // Check the session - this should process the code parameter
            const { data, error } = await supabase.auth.getSession();
            console.log("Current session after loading with code:", data, error);
          } catch (error) {
            console.error("Error checking session:", error);
          }
        }
      } else {
        console.log("Invalid reset flow - redirecting to login");
        toast.error("Invalid reset link", {
          description: "This page can only be accessed from a password reset email.",
        });
        navigate('/login');
      }
    };
    
    checkResetFlow();
  }, [navigate, location]);

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
