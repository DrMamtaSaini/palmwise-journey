
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TokenVerifier from './components/auth/TokenVerifier';
import { Toaster } from "@/components/ui/sonner"
import AuthCallback from './pages/AuthCallback';
import UploadPalm from './pages/UploadPalm';
import ReadingResults from './pages/ReadingResults';
import PaymentDebug from './pages/PaymentDebug';

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/verify" element={<TokenVerifier onVerificationComplete={() => {}} />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/upload-palm" element={<UploadPalm />} />
        <Route path="/reading-results/:id" element={<ReadingResults />} />
        <Route path="/payment-debug" element={<PaymentDebug />} />
      </Routes>
    </Router>
  );
}

export default App;
