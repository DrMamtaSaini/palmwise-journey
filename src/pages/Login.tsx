
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, isLoading, isAuthenticated, handleEmailVerificationError } = useAuth();

  useEffect(() => {
    // Check for auth errors in URL
    const searchParams = new URLSearchParams(location.search);
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode && errorDescription) {
      console.log(`Auth error detected: ${errorCode} - ${errorDescription}`);
      
      if (errorCode === 'validation_failed' && errorDescription.includes('provider is not enabled')) {
        setGoogleAuthError(true);
        toast.error("Google authentication failed", {
          description: "Email/password login is available. Google auth may not be configured in Supabase.",
          duration: 8000,
        });
      } else {
        handleEmailVerificationError(errorCode, errorDescription);
      }
      
      // Clean the URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error_code');
      cleanUrl.searchParams.delete('error_description');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, [location.search, handleEmailVerificationError]);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Missing information", {
        description: "Please enter both email and password.",
      });
      return;
    }
    
    try {
      const success = await signIn(email, password);
      if (success) {
        toast.success("Login successful", {
          description: "Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "Please check your credentials and try again.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleAuthError) {
      toast.error("Google authentication is not available", {
        description: "Please use email/password login instead.",
        duration: 5000,
      });
      return;
    }
    
    try {
      await signInWithGoogle();
      // No need to navigate here as the redirect will happen automatically
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Google login failed", {
        description: "Please try using email/password login instead.",
      });
    }
  };

  // Function to handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      // Submit the form when enter key is pressed
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-600">
                Login to access your palm readings and insights
              </p>
            </div>

            {googleAuthError && (
              <div className="mb-6 p-4 border border-orange-200 bg-orange-50 text-orange-800 rounded-lg">
                <p className="text-sm font-medium">Google authentication is not available</p>
                <p className="text-xs mt-1">Please use email/password login instead.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyPress}>
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-sm text-palm-purple hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-palm-purple hover:bg-palm-purple/90 text-white flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="animate-pulse">Logging in...</span>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    <span>Login</span>
                  </>
                )}
              </Button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 flex-grow"></div>
                <span className="mx-4 text-sm text-gray-500">or</span>
                <div className="border-t border-gray-200 flex-grow"></div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || googleAuthError}
                variant="outline"
                className={`w-full flex items-center justify-center ${googleAuthError ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5 mr-2"
                />
                <span>{isLoading ? "Processing..." : "Continue with Google"}</span>
              </Button>

              <p className="text-center text-gray-600 text-sm mt-8">
                Don't have an account?{" "}
                <Link to="/signup" className="text-palm-purple hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
