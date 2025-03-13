
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadSection from "../components/UploadSection";
import PalmAnalysisService from "../services/PalmAnalysisService";
import { useAuth } from "../hooks/useAuth";
import LanguageSelector from "../components/LanguageSelector";

const UploadPalm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const handleAnalyze = async (imageUrl: string) => {
    setIsProcessing(true);
    
    try {
      if (!isAuthenticated || !user) {
        toast.error("Authentication required", {
          description: "Please log in to analyze your palm."
        });
        navigate("/login");
        return;
      }
      
      const reading = await PalmAnalysisService.analyzePalm(imageUrl, user.id, selectedLanguage);
      console.log("Palm reading created:", reading);
      
      // Ensure we have a valid reading ID before redirecting
      if (reading && reading.id) {
        toast.success("Reading ready", {
          description: "Redirecting you to your palm reading results...",
          duration: 3000
        });
        
        // Add a small delay to make sure the toast is seen
        setTimeout(() => {
          navigate(`/reading-results/${reading.id}`);
        }, 1000);
      } else {
        toast.error("Could not generate reading ID", {
          description: "Please try again later."
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", {
        description: "There was a problem analyzing your palm. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    toast.info(`Reading language set to ${language.charAt(0).toUpperCase() + language.slice(1)}`, {
      description: "Your palm reading will be provided in this language."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 bg-palm-light">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl font-bold mb-4">Begin Your Palm Reading</h1>
              <p className="text-lg text-gray-600">
                Upload a clear image of your palm to receive detailed insights about your past, present, and future.
              </p>
            </div>

            <div className="mb-8 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Select Your Reading Language</h3>
              <LanguageSelector 
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
              <p className="mt-2 text-sm text-gray-500">
                Choose the language in which you would like to receive your palm reading.
              </p>
            </div>

            <div className="animate-slide-up">
              <UploadSection onAnalyze={handleAnalyze} />
            </div>

            <div className="mt-12 bg-white p-6 rounded-2xl shadow-soft animate-fade-in">
              <h3 className="text-xl font-semibold mb-4">Tips for the Best Reading</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-palm-purple text-white flex items-center justify-center mr-3 mt-0.5">1</span>
                  <p>Use good lighting - natural daylight works best</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-palm-purple text-white flex items-center justify-center mr-3 mt-0.5">2</span>
                  <p>Spread your fingers slightly and keep your palm flat</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-palm-purple text-white flex items-center justify-center mr-3 mt-0.5">3</span>
                  <p>Position your palm to show all major lines clearly</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-palm-purple text-white flex items-center justify-center mr-3 mt-0.5">4</span>
                  <p>Make sure the image is sharply focused and not blurry</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPalm;
