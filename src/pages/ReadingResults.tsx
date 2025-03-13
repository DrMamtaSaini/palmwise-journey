
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import PaymentButton from "../components/PaymentButton";
import PalmAnalysisService, { PalmReading } from "../services/PalmAnalysisService";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const ReadingResults = () => {
  const navigate = useNavigate();
  const params = useParams();
  const readingId = params.id;
  const [activeTab, setActiveTab] = useState("lifeLine");
  const [isPremium, setIsPremium] = useState(false);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setReading(result);
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

  const handlePayment = () => {
    // In a real app, this would integrate with PayPal
    setIsPremium(true);
  };

  // Map reading data to tabs content
  const getReadingContent = () => {
    if (!reading || !reading.results) return null;

    const content = {
      lifeLine: {
        title: "Life Line",
        content: [
          reading.results.lifeLine.prediction,
          `Strength: ${reading.results.lifeLine.strength}%`
        ]
      },
      heartLine: {
        title: "Heart Line",
        content: [
          reading.results.heartLine.prediction,
          `Strength: ${reading.results.heartLine.strength}%`
        ]
      },
      headLine: {
        title: "Head Line",
        content: [
          reading.results.headLine.prediction,
          `Strength: ${reading.results.headLine.strength}%`
        ]
      },
      past: {
        title: "Past",
        content: [
          reading.results.past?.prediction || "No past reading available.",
          reading.results.past ? `Significance: ${reading.results.past.significance}%` : ""
        ].filter(Boolean)
      },
      present: {
        title: "Present",
        content: [
          reading.results.present?.prediction || "No present reading available.",
          reading.results.present ? `Significance: ${reading.results.present.significance}%` : ""
        ].filter(Boolean)
      },
      future: {
        title: "Future",
        content: [
          reading.results.future?.prediction || "No future reading available.",
          reading.results.future ? `Significance: ${reading.results.future.significance}%` : ""
        ].filter(Boolean)
      }
    };

    // Add fate line if present
    if (reading.results.fateLinePresent && reading.results.fate) {
      content["fateLine"] = {
        title: "Fate Line",
        content: [
          reading.results.fate.prediction,
          `Strength: ${reading.results.fate.strength}%`
        ]
      };
    }

    // Add overall summary
    content["summary"] = {
      title: "Overall Summary",
      content: [
        reading.results.overallSummary,
        `Personality traits: ${reading.results.personalityTraits.join(', ')}`
      ]
    };

    return content;
  };

  const readingContent = getReadingContent();

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
              <div className="bg-white rounded-2xl shadow-soft p-8 flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-palm-purple border-t-transparent animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your palm reading...</p>
                </div>
              </div>
            ) : !reading ? (
              <div className="bg-white rounded-2xl shadow-soft p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Reading Not Found</h2>
                  <p className="text-gray-600 mb-6">We couldn't find the requested palm reading.</p>
                  <button
                    onClick={() => navigate("/upload-palm")}
                    className="bg-palm-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create New Reading
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold mb-4 md:mb-0">Your Palm Reading</h1>
                    
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-500 hover:text-palm-purple transition-colors">
                        <Download size={20} />
                      </button>
                      <button className="text-gray-500 hover:text-palm-purple transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  {isPremium && (
                    <div className="mb-8">
                      <AudioPlayer text={reading.results.overallSummary} />
                    </div>
                  )}

                  <Tabs defaultValue="lifeLine" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="flex flex-wrap mb-8 border-b border-gray-100 bg-transparent p-0 w-full justify-start">
                      {readingContent && Object.keys(readingContent).map((key) => (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className={`px-4 py-3 font-medium transition-colors rounded-none ${
                            activeTab === key
                              ? "text-palm-purple border-b-2 border-palm-purple"
                              : "text-gray-500 hover:text-palm-purple"
                          }`}
                        >
                          {readingContent[key].title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {readingContent && Object.keys(readingContent).map((key) => (
                      <TabsContent key={key} value={key} className="animate-fade-in mt-4">
                        <h2 className="text-2xl font-semibold mb-4">
                          {readingContent[key].title}
                        </h2>
                        
                        <div className="space-y-6">
                          {readingContent[key].content.map((paragraph, index) => (
                            <p key={index} className="text-gray-700 leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                {!isPremium && (
                  <div className="bg-palm-light p-8 border-t border-gray-100">
                    <div className="max-w-2xl mx-auto text-center">
                      <h3 className="text-xl font-semibold mb-3">Unlock Premium Features</h3>
                      <p className="text-gray-600 mb-6">
                        Get access to audio readings, detailed future insights, and personalized guidance.
                      </p>
                      
                      <PaymentButton
                        price="$29.99"
                        description="Premium Reading"
                        isPrimary
                        onClick={handlePayment}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReadingResults;
