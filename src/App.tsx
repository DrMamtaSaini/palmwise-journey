
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
    const handleAuthRedirect = async () => {
      // Check for auth tokens in the URL and handle them
      const result = await handleAuthTokensOnLoad();
      console.log("Auth token handler result:", result);
      
      if (result.success) {
        console.log("Successfully processed auth tokens");
        
        // If this is a password reset and we're not on the reset page, redirect
        if (localStorage.getItem('passwordResetRequested') === 'true' && 
            !location.pathname.includes('reset-password')) {
          console.log('Detected password reset scenario, redirecting to reset page');
          navigate('/reset-password', { replace: true });
        }
      } else {
        // Check if this is a potential password reset attempt from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code && localStorage.getItem('passwordResetRequested') === 'true' &&
            !location.pathname.includes('reset-password')) {
          console.log('Detected password reset code, redirecting to reset page');
          navigate(`/reset-password?code=${code}`, { replace: true });
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
