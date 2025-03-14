
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
    const handleAuthRedirect = async () => {
      // Always generate a fresh code verifier if we're on the reset password page
      // This ensures we have a valid verifier available when handling tokens
      if (location.pathname === '/reset-password') {
        console.log('On reset password page, ensuring we have a fresh code verifier');
        storeNewCodeVerifier();
      }
      
      // Check for auth tokens in the URL and handle them
      const result = await handleAuthTokensOnLoad();
      console.log("Auth token handler result:", result);
      
      // If URL contains a code parameter and we're not on the reset password page
      // redirect to reset-password page with the code
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const type = params.get('type');
      
      if (code && type === 'recovery' && !location.pathname.includes('reset-password')) {
        console.log('Detected password reset code, redirecting to reset page');
        navigate(`/reset-password?code=${code}`, { replace: true });
        return;
      }
      
      if (result.success) {
        console.log("Successfully processed auth tokens");
        
        // If this is a password reset and we're not on the reset page, redirect
        if (localStorage.getItem('passwordResetRequested') === 'true' && 
            !location.pathname.includes('reset-password')) {
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
