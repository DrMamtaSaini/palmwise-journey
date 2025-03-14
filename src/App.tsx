
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
import { handleAuthTokensOnLoad } from "./lib/supabase";

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
      
      // If URL contains a recovery code, always redirect to reset-password page
      if (code && type === 'recovery' && !isResetPasswordPage) {
        console.log('Password reset code detected, redirecting to reset password page');
        navigate(`/reset-password?code=${code}&type=${type}`, { replace: true });
        return;
      }
      
      // Check for auth tokens in the URL and handle them
      const result = await handleAuthTokensOnLoad();
      console.log("Auth token handler result:", result);
      
      if (result.success) {
        console.log("Successfully processed auth tokens");
        
        // If this is a password reset and we're not on the reset page, redirect
        if (localStorage.getItem('passwordResetRequested') === 'true' && !isResetPasswordPage) {
          console.log('Detected password reset scenario, redirecting to reset page');
          navigate('/reset-password', { replace: true });
          return;
        }
        
        // Default successful auth redirect to dashboard
        if (code && !isResetPasswordPage && !isForgotPasswordPage) {
          console.log('Auth successful, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
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
