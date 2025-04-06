
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import UploadPalm from './pages/UploadPalm';
import ReadingResults from './pages/ReadingResults';
import SampleReport from './pages/SampleReport';
import DetailedReport from './pages/DetailedReport';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-palm" element={<UploadPalm />} />
        <Route path="/reading-results/:readingId" element={<ReadingResults />} />
        <Route path="/sample-report" element={<SampleReport />} />
        <Route path="/detailed-report/:reportId" element={<DetailedReport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
