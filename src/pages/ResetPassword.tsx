
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Save, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, storeNewCodeVerifier } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("ResetPassword component mounted");
    console.log("Current URL params:", Object.fromEntries(searchParams.entries()));
    console.log("Password reset requested flag:", localStorage.getItem('passwordResetRequested'));
    console.log("Password reset timestamp:", localStorage.getItem('passwordResetTimestamp'));
    
    // Display full URL for debugging (but mask sensitive parts)
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      url.searchParams.set('code', code.substring(0, 5) + '...');
    }
    console.log("Full URL (sanitized):", url.toString());
    
    // Check the code verifier immediately
    const codeVerifier = localStorage.getItem('supabase.auth.code_verifier');
    console.log("Code verifier in localStorage:", codeVerifier ? 
      `Yes (${codeVerifier.substring(0, 10)}... length: ${codeVerifier.length})` : 
      "No - THIS WILL CAUSE AUTHENTICATION FAILURE");

    // If no code verifier but we have a code in URL, this is likely to fail
    if (!codeVerifier && code) {
      console.warn("⚠️ WARNING: Code parameter found but no verifier - auth will likely fail");
      // Store a code verifier anyway as a last resort attempt
      storeNewCodeVerifier();
    }

    // Clean up the URL by removing any error parameters
    if (window.history && window.history.replaceState) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('error') || params.has('error_description')) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('error');
        cleanUrl.searchParams.delete('error_description');
        window.history.replaceState(null, document.title, cleanUrl.toString());
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function verifyResetToken() {
      try {
        console.log("=========== VERIFYING PASSWORD RESET TOKEN ===========");
        console.log("Current URL:", window.location.href);
        setIsVerifying(true);
        
        // Check for code parameter in URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log("Code from URL:", code ? "present (starts with " + code.substring(0, 5) + "...)" : "missing");
        console.log("Error from URL:", error || "none");
        console.log("Error description:", errorDescription || "none");
        
        // Get the code verifier from localStorage
        const codeVerifier = localStorage.getItem('supabase.auth.code_verifier');
        console.log("Code verifier from localStorage:", codeVerifier ? "exists" : "missing");
        if (codeVerifier) {
          console.log("Verifier length:", codeVerifier.length);
          console.log("First 10 chars:", codeVerifier.substring(0, 10) + "...");
        } else {
          console.log("No code verifier found, generating one as a last resort");
          const newVerifier = storeNewCodeVerifier();
          console.log("New verifier (may not work with existing code):", newVerifier.substring(0, 10) + "...");
        }
        
        // If there's an error in the URL, show it
        if (error && errorDescription) {
          console.error(`Error in URL: ${error} - ${errorDescription}`);
          setTokenError(errorDescription);
          setValidToken(false);
          setIsVerifying(false);
          return;
        }
        
        // Check if the password reset was requested recently (within last 15 minutes)
        const resetTimestamp = localStorage.getItem('passwordResetTimestamp');
        let validResetRequest = false;
        
        if (resetTimestamp) {
          const requestTime = new Date(resetTimestamp).getTime();
          const now = new Date().getTime();
          const fifteenMinutes = 15 * 60 * 1000;
          validResetRequest = (now - requestTime) < fifteenMinutes;
          console.log("Password reset was requested:", resetTimestamp);
          console.log("Is recent request (< 15min):", validResetRequest);
        } else {
          console.log("No password reset timestamp found");
        }
        
        if (code) {
          console.log("Processing code from URL");
          
          try {
            // Try to exchange the code for a session
            console.log("Attempting to exchange code for session...");
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Error exchanging code for session:", error);
              
              // Special handling for common errors
              if (error.message.includes("auth code and code verifier")) {
                setTokenError("Authentication error: The code verifier doesn't match the code. Please request a new reset link.");
              } else {
                setTokenError(`Error: ${error.message || "Invalid reset code"}`);
              }
              
              setValidToken(false);
              setIsVerifying(false);
              
              // Store diagnostic info for debugging
              localStorage.setItem('resetPasswordError', JSON.stringify({
                error: error.message,
                code: code.substring(0, 5) + "...",
                hasVerifier: !!codeVerifier,
                verifierLength: codeVerifier ? codeVerifier.length : 0,
                timestamp: new Date().toISOString()
              }));
              return;
            }
            
            if (!data.session) {
              console.warn("Code exchange succeeded but no session was returned");
              setTokenError("Authentication succeeded but no session was created");
              setValidToken(false);
              setIsVerifying(false);
              return;
            }
            
            console.log("Successfully exchanged code for session");
            setValidToken(true);
            
            // Clean up the URL by removing the code parameter
            if (window.history && window.history.replaceState) {
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete('code');
              window.history.replaceState(null, document.title, cleanUrl.toString());
            }
          } catch (exchangeError) {
            console.error("Exception during code exchange:", exchangeError);
            setTokenError("Error processing reset code. The code may be invalid or expired.");
            setValidToken(false);
          }
        } else if (validResetRequest) {
          console.log("No reset code found, but a recent reset was requested");
          
          // Check if there's already a valid session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log("User has a valid session, allowing password reset");
            setValidToken(true);
          } else {
            console.log("No valid session found");
            setTokenError("No reset code found in URL. Please check your email and click the reset link.");
            setValidToken(false);
          }
        } else {
          console.log("No valid token or recent reset request found");
          setTokenError("No password reset has been requested recently or the link is invalid.");
          setValidToken(false);
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
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (password.length < 8) {
        toast.error("Password too short", {
          description: "Your password must be at least 8 characters long."
        });
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords don't match", {
          description: "Please make sure both passwords match."
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Attempting to update password");
      
      // Direct update through supabase
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Password update error from Supabase:", error);
        toast.error("Failed to update password", {
          description: error.message || "Please try again or request a new reset link."
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Password updated successfully:", data ? "User data updated" : "No data returned");
      
      // Success!
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password."
      });
      
      // Clean up
      localStorage.removeItem('passwordResetRequested');
      localStorage.removeItem('passwordResetEmail');
      localStorage.removeItem('passwordResetTimestamp');
      localStorage.removeItem('resetPasswordError');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Password update failed", {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    // Generate a new code verifier before navigating
    storeNewCodeVerifier();
    
    const email = localStorage.getItem('passwordResetEmail');
    if (email) {
      navigate('/forgot-password', { state: { email } });
    } else {
      navigate('/forgot-password');
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
                    <span className="flex items-center">
                      <RefreshCcw size={18} className="mr-2 animate-spin" />
                      Updating...
                    </span>
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
                  <p className="font-medium flex items-center">
                    <AlertCircle size={18} className="mr-2" />
                    Invalid or expired reset link
                  </p>
                  <p className="text-sm mt-1">
                    {tokenError || "Please request a new password reset link from the login page."}
                  </p>
                  {window.location.hostname === 'localhost' && (
                    <p className="text-sm mt-2 font-medium">
                      Note: Password reset links often have issues in local development environments.
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleRequestNewLink}
                  className="w-full bg-palm-purple hover:bg-palm-purple/90"
                >
                  <RefreshCcw size={18} className="mr-2" />
                  Request New Reset Link
                </Button>
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
