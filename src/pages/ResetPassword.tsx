
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TokenVerifier from "@/components/auth/TokenVerifier";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import InvalidResetLink from "@/components/auth/InvalidResetLink";

const ResetPassword = () => {
  const [validToken, setValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // When the component mounts, check if there's a code in the URL
  useEffect(() => {
    console.log("ResetPassword component mounted, current URL:", window.location.href);
    
    // Check for code parameter in URL
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      console.log("Error found in URL:", error);
      setIsVerifying(false);
      setValidToken(false);
      setTokenError("The password reset link is invalid. Please request a new one.");
      return;
    }
    
    if (!code) {
      console.log("No code parameter found in URL");
      
      // If we're on the reset password page without a code, check if there's a valid session
      // This would be handled by the TokenVerifier component
    }
  }, [searchParams]);

  const handleVerificationComplete = (isValid: boolean, error: string | null) => {
    console.log("Token verification complete:", isValid, error);
    setValidToken(isValid);
    setTokenError(error);
    setIsVerifying(false);
  };

  const handleRequestNewLink = () => {
    // Store a timestamp for debugging
    localStorage.setItem('resetPasswordRedirectTime', new Date().toISOString());
    
    const email = localStorage.getItem('passwordResetEmail');
    if (email) {
      console.log("Navigating to forgot-password with email:", email);
      navigate('/forgot-password', { state: { email, fromFailedReset: true } });
    } else {
      console.log("Navigating to forgot-password without email");
      navigate('/forgot-password', { state: { fromFailedReset: true } });
    }
  };

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

            {isVerifying ? (
              <TokenVerifier onVerificationComplete={handleVerificationComplete} />
            ) : validToken ? (
              <ResetPasswordForm />
            ) : (
              <InvalidResetLink 
                errorMessage={tokenError}
                onRequestNewLink={handleRequestNewLink}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
