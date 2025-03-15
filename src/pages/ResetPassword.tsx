
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TokenVerifier from "@/components/auth/TokenVerifier";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import InvalidResetLink from "@/components/auth/InvalidResetLink";
import { storeNewCodeVerifier } from "@/lib/supabase";

const ResetPassword = () => {
  const [validToken, setValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVerificationComplete = (isValid: boolean, error: string | null) => {
    setValidToken(isValid);
    setTokenError(error);
    setIsVerifying(false);
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
