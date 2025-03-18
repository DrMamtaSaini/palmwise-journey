
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Key, LogIn, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, isAuthenticated, handleEmailVerificationError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
                disabled={isLoading}
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
