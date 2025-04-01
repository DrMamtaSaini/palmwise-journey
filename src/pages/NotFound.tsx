
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Try to provide a helpful message based on the URL pattern
  const getHelpfulMessage = () => {
    if (currentPath.includes("detailed-report")) {
      return "The report you're looking for might not exist, or you may not have permission to view it.";
    }
    if (currentPath.includes("reading-results")) {
      return "The reading results you're looking for might still be processing or may have been deleted.";
    }
    return "The page you're looking for doesn't exist or may have been moved.";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-soft">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-xl text-gray-600 mb-2">Oops! Page not found</p>
          <p className="text-gray-500 mb-6">{getHelpfulMessage()}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate("/")}
              className="bg-[#7953F5] hover:bg-[#7953F5]/90"
            >
              Return to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-gray-400">
            Path: {currentPath}
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
