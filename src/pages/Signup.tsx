
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Temporarily disable Google authentication
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, isLoading, isAuthenticated, handleEmailVerificationError } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode && errorDescription) {
      console.log(`Auth error detected: ${errorCode} - ${errorDescription}`);
      handleEmailVerificationError(errorCode, errorDescription);
      
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error_code');
      cleanUrl.searchParams.delete('error_description');
      window.history.replaceState({}, document.title, cleanUrl.toString());
    }
  }, [location.search, handleEmailVerificationError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("Please accept the terms", {
        description: "You must accept the Terms of Service and Privacy Policy to continue."
      });
      return;
    }

    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Your password must be at least 8 characters long."
      });
      return;
    }
    
    try {
      const success = await signUp(name, email, password);
      if (success) {
        toast.success("Account created successfully", {
          description: "Please check your email to verify your account before logging in."
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Signup failed", {
        description: "Please try again with different credentials.",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
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
              <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
              <p className="text-gray-600">
                Join PalmInsight to discover the secrets in your palm
              </p>
            </div>

            <div className="mb-6 p-4 border border-amber-200 bg-amber-50 text-amber-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Google authentication temporarily disabled</p>
                  <p className="text-xs mt-1">
                    We're currently experiencing issues with Google authentication. 
                    Please use email/password signup for now. We'll restore Google login 
                    once the issue is resolved.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyPress}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                  placeholder="Enter your full name"
                />
              </div>

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
                    minLength={8}
                    className="w-full pr-10"
                    placeholder="Create a password"
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

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-palm-purple focus:ring-palm-purple border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{" "}
                  <Link to="/terms-of-service" className="text-palm-purple hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-palm-purple hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-palm-purple text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-palm-purple/90 transition-colors"
              >
                {isLoading ? (
                  <span className="animate-pulse">Creating account...</span>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    <span>Sign Up</span>
                  </>
                )}
              </Button>

              <p className="text-center text-gray-600 text-sm mt-8">
                Already have an account?{" "}
                <Link to="/login" className="text-palm-purple hover:underline">
                  Login
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

export default Signup;
