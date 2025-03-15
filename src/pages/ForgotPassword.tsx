
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ConfigTipAlert from "@/components/auth/ConfigTipAlert";
import ResetEmailForm from "@/components/auth/ResetEmailForm";
import ResetEmailSent from "@/components/auth/ResetEmailSent";
import { generateAndStoreCodeVerifier, storePasswordResetInfo } from "@/utils/authUtils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isFromFailedReset, setIsFromFailedReset] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("Initializing ForgotPassword component");
    
    // Always generate a fresh code verifier when this page loads
    const newVerifier = generateAndStoreCodeVerifier();
    console.log("Generated fresh code verifier:", newVerifier?.substring(0, 10) + "...");
    
    // Check if we're on localhost for special messaging
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');

    // Check if we came from a failed reset
    if (location.state?.fromFailedReset) {
      setIsFromFailedReset(true);
      toast.info("Previous reset link was invalid", {
        description: "Please request a new password reset link to continue",
        duration: 5000,
      });
    }
    
    // Pre-fill email if passed in location state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleRetry = () => {
    // Start over with same email
    console.log("Retrying with same email:", email);
    setIsSubmitted(false);
    
    // Generate a fresh code verifier when retrying
    generateAndStoreCodeVerifier();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-gray-600">
                Enter your email to receive a password reset link
              </p>
              {isFromFailedReset && (
                <p className="mt-2 text-palm-purple font-medium text-sm">
                  Your previous reset link has expired or is invalid. 
                  Please request a new one.
                </p>
              )}
            </div>

            <ConfigTipAlert />

            {isSubmitted ? (
              <ResetEmailSent 
                email={email}
                isLocalhost={isLocalhost}
                onRetry={handleRetry}
                onTryAnotherEmail={() => setIsSubmitted(false)}
              />
            ) : (
              <ResetEmailForm 
                email={email}
                setEmail={setEmail}
                setIsSubmitted={setIsSubmitted}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
