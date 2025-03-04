
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadSection from "../components/UploadSection";
import { analyzePalmImage } from "../services/geminiService";

const UploadPalm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyze = async (imageUrl: string) => {
    setIsProcessing(true);
    
    try {
      // Call the Gemini API through our service
      const analysisResult = await analyzePalmImage(imageUrl);
      
      if (!analysisResult) {
        toast({
          title: "Analysis failed",
          description: "We couldn't analyze your palm. Please try again with a clearer image.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      // Store the result in sessionStorage for the results page to use
      sessionStorage.setItem('palmReadingResult', JSON.stringify(analysisResult.result));
      
      toast({
        title: "Analysis complete",
        description: "Your palm reading is ready to view.",
      });
      
      // Navigate to results page
      navigate("/reading-results");
    } catch (error) {
      console.error("Error during palm analysis:", error);
      toast({
        title: "Analysis error",
        description: "An error occurred during analysis. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
                  <p>For premium readings, upload images of both palms</p>
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
