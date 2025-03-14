import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import UploadPalm from "./pages/UploadPalm";
import ReadingResults from "./pages/ReadingResults";
import NotFound from "./pages/NotFound";
import DebugSetup from "./pages/DebugSetup";
import { handleAuthTokensOnLoad, storeNewCodeVerifier } from "./lib/supabase";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Auth redirect handler component
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("============ AUTH REDIRECT HANDLER ===========");
    console.log("Current path:", location.pathname);
    console.log("Current search:", location.search);
    
    const handleAuthRedirect = async () => {
      // Check if we're at the reset password page or have a code parameter
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const type = params.get('type');
      
      // Check if the current page is a password reset page
      const isResetPasswordPage = location.pathname === '/reset-password';
      const isForgotPasswordPage = location.pathname === '/forgot-password';
      
      // IMPORTANT: Always ensure we have a code verifier available if there's a code in the URL
      if (code) {
        console.log("Code detected in URL:", code.substring(0, 5) + "...");
        
        const codeVerifier = localStorage.getItem('palm_reader.auth.code_verifier') || 
                             localStorage.getItem('supabase.auth.code_verifier');
                             
        if (!codeVerifier) {
          console.log("Code detected in URL but no verifier found - generating new one");
          const newVerifier = storeNewCodeVerifier();
          console.log("Generated new verifier:", newVerifier.substring(0, 10) + "... (length: " + newVerifier.length + ")");
          console.log("WARNING: Authentication may fail as server expects the original verifier");
        } else {
          console.log("Code and verifier both present, good!");
          console.log("Verifier begins with:", codeVerifier.substring(0, 10) + "... (length: " + codeVerifier.length + ")");
        }
        
        // If URL contains a recovery code, always redirect to reset-password page
        if (type === 'recovery' && !isResetPasswordPage) {
          console.log('Password reset code detected, redirecting to reset password page');
          navigate(`/reset-password?code=${code}&type=${type}`, { replace: true });
          return;
        }
      }
      
      // Always generate a fresh code verifier if we're on the reset or forgot password pages
      // This ensures we have a valid verifier available for the next request
      if (isResetPasswordPage || isForgotPasswordPage) {
        if (!code) {
          console.log(`On ${location.pathname} page, ensuring we have a fresh code verifier`);
          const newVerifier = storeNewCodeVerifier();
          console.log("Fresh verifier generated:", newVerifier.substring(0, 10) + "... (length: " + newVerifier.length + ")");
        }
      }
      
      // Check for auth tokens in the URL and handle them
      const result = await handleAuthTokensOnLoad();
      console.log("Auth token handler result:", result);
      
      // If URL contains a recovery code and we're not on the reset password page
      // redirect to reset-password page with the code
      if (code && type === 'recovery' && !isResetPasswordPage) {
        console.log('Detected password reset code, redirecting to reset page');
        navigate(`/reset-password?code=${code}&type=${type}`, { replace: true });
        return;
      }
      
      if (result.success) {
        console.log("Successfully processed auth tokens");
        
        // If this is a password reset and we're not on the reset page, redirect
        if (localStorage.getItem('passwordResetRequested') === 'true' && !isResetPasswordPage) {
          console.log('Detected password reset scenario, redirecting to reset page');
          navigate('/reset-password', { replace: true });
        }
      }
    };
    
    handleAuthRedirect();
  }, [navigate, location]);
  
  return null;
};

// Define the App component
function App() {
  console.log("App rendering");
  
  // Ensure we always have a code verifier in localStorage
  useEffect(() => {
    const codeVerifier = localStorage.getItem('palm_reader.auth.code_verifier') || 
                         localStorage.getItem('supabase.auth.code_verifier');
                         
    if (!codeVerifier) {
      console.log("No code verifier found on app startup, generating one");
      const newVerifier = storeNewCodeVerifier();
      console.log("Generated initial code verifier:", newVerifier.substring(0, 10) + "...");
    } else {
      console.log("Existing code verifier found on app startup:", codeVerifier.substring(0, 10) + "...");
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {/* Add toast notifications */}
          <Toaster />
          <Sonner />
          
          {/* Auth redirect handler */}
          <AuthRedirectHandler />
          
          {/* Define application routes */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-palm" element={<UploadPalm />} />
            <Route path="/reading-results" element={<ReadingResults />} />
            <Route path="/reading-results/:id" element={<ReadingResults />} />
            <Route path="/debug-setup" element={<DebugSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
