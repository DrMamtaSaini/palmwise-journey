
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
import { getReadingContent } from "../utils/readingContentUtils";
import { ExtendedPalmReading } from "../types/PalmReading";

const ReadingResults = () => {
  const navigate = useNavigate();
  const params = useParams();
  const readingId = params.id;
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumTest, setIsPremiumTest] = useState(false); // For testing premium features
  const [reading, setReading] = useState<ExtendedPalmReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullReadingText, setFullReadingText] = useState<string>("");

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
        const result = await PalmAnalysisService.getPalmReading(readingId);
        
        if (result) {
          console.log("Fetched reading data:", result);
          setReading(result as ExtendedPalmReading);
        } else {
          toast.error("Reading not found", {
            description: "We couldn't find this palm reading"
          });
          navigate("/upload-palm");
        }
      } catch (error) {
        console.error("Error fetching reading:", error);
        toast.error("Error loading reading", {
          description: "Please try again later"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReading();
  }, [readingId, navigate]);

  // Generate full reading text for text-to-speech
  useEffect(() => {
    if (reading && reading.results) {
      const readingContent = getReadingContent(reading);
      if (!readingContent) return;

      let fullText = `Your Palm Reading: ${reading.results.overallSummary}\n\n`;
      
      // Add each section content
      Object.entries(readingContent).forEach(([key, section]) => {
        if (key !== 'summary') { // Skip overall summary as we've already added it
          const typedSection = section as { 
            title: string; 
            content: string[];
            insights?: string[];
          };
          
          fullText += `${typedSection.title}: ${typedSection.content.join(' ')}\n\n`;
          
          if (typedSection.insights && typedSection.insights.length > 0) {
            fullText += `Key insights for ${typedSection.title}:\n`;
            typedSection.insights.forEach((insight, index) => {
              fullText += `${index + 1}. ${insight}\n`;
            });
            fullText += '\n';
          }
        }
      });

      setFullReadingText(fullText);
    }
  }, [reading]);

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

  const readingContent = reading ? getReadingContent(reading) : null;

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
            ) : !reading ? (
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
