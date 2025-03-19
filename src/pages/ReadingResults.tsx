
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import PalmAnalysisService from "../services/PalmAnalysisService";
import { toast } from "sonner";
import { getLanguageInfo } from "../components/LanguageSelector";
import PersonalizedQuestionForm from "../components/PersonalizedQuestionForm";
import ReadingHeader from "../components/ReadingHeader";
import ReadingTabs from "../components/ReadingTabs";
import ReadingLoader from "../components/ReadingLoader";
import ReadingNotFound from "../components/ReadingNotFound";
import PremiumFeatures from "../components/PremiumFeatures";
import TranslationNote from "../components/TranslationNote";
import { getReadingContent, generateFullReadingText } from "../utils/readingContentUtils";
import { ExtendedPalmReading } from "../types/PalmReading";

const ReadingResults = () => {
  const navigate = useNavigate();
  const params = useParams();
  const readingId = params.id;
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumTest, setIsPremiumTest] = useState(false); // For testing premium features
  const [reading, setReading] = useState<ExtendedPalmReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [fullReadingText, setFullReadingText] = useState<string>("");
  const [readingContent, setReadingContent] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const testMode = urlParams.get('premiumTest');
    if (testMode === 'true') {
      setIsPremiumTest(true);
      setIsPremium(true);
      toast.info("Premium test mode activated", {
        description: "You can now access all premium features for testing"
      });
    }
  }, []);

  useEffect(() => {
    const fetchReading = async () => {
      if (!readingId) {
        toast.error("Invalid reading ID");
        navigate("/upload-palm");
        return;
      }

      try {
        setIsLoading(true);
        setError(false); // Reset error state
        console.log("Fetching reading with ID:", readingId);
        const result = await PalmAnalysisService.getPalmReading(readingId);
        
        if (result) {
          console.log("Successfully fetched reading data:", result);
          setReading(result as ExtendedPalmReading);
        } else {
          console.error("No reading found with ID:", readingId);
          setError(true); // Set error state
          toast.error("Reading not found", {
            description: "We couldn't find this palm reading"
          });
        }
      } catch (error) {
        console.error("Error fetching reading:", error);
        setError(true);
        toast.error("Error loading reading", {
          description: "Please try again later"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReading();
  }, [readingId, navigate]);

  useEffect(() => {
    if (reading) {
      const content = getReadingContent(reading);
      setReadingContent(content);
    }
  }, [reading]);

  useEffect(() => {
    if (readingContent) {
      const fullText = generateFullReadingText(readingContent, isPremium || isPremiumTest);
      setFullReadingText(fullText);
    }
  }, [readingContent, isPremium, isPremiumTest]);

  const handlePayment = () => {
    setIsPremium(true);
    toast.success("Premium features unlocked!", {
      description: "You now have access to all premium content"
    });
  };

  const getLanguageDisplay = () => {
    if (!reading || !reading.language) return "";
    
    const languageInfo = getLanguageInfo(reading.language);
    if (!languageInfo) return reading.language;
    
    if (languageInfo.code === "english") {
      return languageInfo.name;
    }
    
    return `${languageInfo.name} (${languageInfo.nativeName})`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 bg-palm-light">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-palm-purple transition-colors mb-8"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span>Back</span>
            </button>

            {isLoading ? (
              <ReadingLoader />
            ) : error || !reading ? (
              <ReadingNotFound />
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                  <div className="p-8">
                    <ReadingHeader 
                      title="Your Palm Reading"
                      language={reading.language}
                      languageDisplay={getLanguageDisplay()}
                      isPremiumTest={isPremiumTest}
                      setIsPremiumTest={setIsPremiumTest}
                      setIsPremium={setIsPremium}
                      readingContent={readingContent}
                      isPremium={isPremium}
                    />

                    {reading.language !== 'english' && reading.translationNote && (
                      <TranslationNote note={reading.translationNote} />
                    )}

                    {(isPremium || isPremiumTest) && reading.results && (
                      <div className="mb-8">
                        <AudioPlayer text={fullReadingText} />
                      </div>
                    )}

                    {readingContent && (
                      <ReadingTabs 
                        readingContent={readingContent} 
                        isPremium={isPremium} 
                        isPremiumTest={isPremiumTest} 
                      />
                    )}
                  </div>
                </div>

                {!isPremium && !isPremiumTest && (
                  <PremiumFeatures onSuccess={handlePayment} />
                )}

                {(isPremium || isPremiumTest) && reading && readingId && (
                  <PersonalizedQuestionForm 
                    palmImageUrl={reading.imageUrl || ""}
                    readingId={readingId}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReadingResults;
