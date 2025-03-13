
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Key, LogIn, User, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingInWithGoogle, setIsLoggingInWithGoogle] = useState(false);
  const [portMismatch, setPortMismatch] = useState(false);
  const { signIn, signInWithGoogle, isLoading, isAuthenticated, handleEmailVerificationError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a port mismatch with Supabase config
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && window.location.port !== '8080') {
      console.log("Detected port mismatch with Supabase config");
      setPortMismatch(true);
    }
  }, []);

  // Handle authentication redirects and errors
  useEffect(() => {
    // Check URL for error parameters that might indicate auth issues
    const searchParams = new URLSearchParams(location.search);
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode && errorDescription) {
      console.log(`Auth error detected: ${errorCode} - ${errorDescription}`);
      handleEmailVerificationError(errorCode, errorDescription);
      
      // Clean the URL of error params
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error_code');
      cleanUrl.searchParams.delete('error_description');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, [location.search, handleEmailVerificationError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Missing credentials", {
        description: "Please enter your email and password.",
      });
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      toast.error("Login failed", {
        description: "Invalid email or password.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingInWithGoogle(true);
      await signInWithGoogle();
    } catch (error) {
      toast.error("Google login failed", {
        description: "Could not sign in with Google. Please try again.",
      });
      setIsLoggingInWithGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-gray-600">Sign in to continue to your account</p>
            </div>

            {portMismatch && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <p className="font-medium">Your app is running on port {window.location.port}, but Supabase expects port 8080.</p>
                  <p className="text-sm mt-1">This may cause issues with authentication. Consider updating your Supabase redirect URLs or running your app on port 8080.</p>
                </AlertDescription>
              </Alert>
            )}

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

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </Label>
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
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-palm-purple hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isLoggingInWithGoogle}
                className="w-full bg-palm-purple hover:bg-palm-purple/90"
              >
                {isLoading ? (
                  <span className="animate-pulse">Signing In...</span>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isLoggingInWithGoogle}
                  className="w-full flex items-center justify-center"
                >
                  {isLoggingInWithGoogle ? (
                    <span className="animate-pulse">Connecting to Google...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link to="/signup" className="text-palm-purple hover:underline inline-flex items-center">
                <User size={16} className="mr-1" />
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
