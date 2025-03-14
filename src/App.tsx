
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Define the App component
function App() {
  console.log("App rendering");
  
  // Check for auth code in URL during app initialization
  useEffect(() => {
    const checkForAuthRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (code && !window.location.pathname.includes('reset-password')) {
        // Check if this might be a password reset link
        const referrer = document.referrer || '';
        const isFromEmail = referrer.includes('mail') || 
                            localStorage.getItem('passwordResetRequested') === 'true';
        
        if (isFromEmail) {
          console.log('Detected password reset code, redirecting to reset page');
          window.location.href = `/reset-password?code=${code}`;
        }
      }
    };
    
    checkForAuthRedirect();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {/* Add toast notifications */}
          <Toaster />
          <Sonner />
          
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
