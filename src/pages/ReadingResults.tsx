
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Share2, Info } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import PaymentButton from "../components/PaymentButton";
import PalmAnalysisService, { PalmReading } from "../services/PalmAnalysisService";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { getLanguageInfo, IndianLanguage } from "../components/LanguageSelector";
import PersonalizedQuestionForm from "../components/PersonalizedQuestionForm";

// Extend the PalmReading type to include the translationNote property
interface ExtendedPalmReading extends PalmReading {
  translationNote?: string;
  language?: string;
}

const ReadingResults = () => {
  const navigate = useNavigate();
  const params = useParams();
  const readingId = params.id;
  const [activeTab, setActiveTab] = useState("lifeLine");
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumTest, setIsPremiumTest] = useState(false); // For testing premium features
  const [reading, setReading] = useState<ExtendedPalmReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const getReadingContent = () => {
    if (!reading || !reading.results) return null;

    const content: any = {
      lifeLine: {
        title: "Life Line",
        content: [
          reading.results.lifeLine.prediction,
          `Strength: ${reading.results.lifeLine.strength}%`
        ],
        insights: reading.results.lifeLine.insights,
        premium: false
      },
      heartLine: {
        title: "Heart Line",
        content: [
          reading.results.heartLine.prediction,
          `Strength: ${reading.results.heartLine.strength}%`
        ],
        insights: reading.results.heartLine.insights,
        premium: false
      },
      headLine: {
        title: "Head Line",
        content: [
          reading.results.headLine.prediction,
          `Strength: ${reading.results.headLine.strength}%`
        ],
        insights: reading.results.headLine.insights,
        premium: false
      },
      past: {
        title: "Past",
        content: [
          reading.results.past?.prediction || "No past reading available.",
          reading.results.past ? `Significance: ${reading.results.past.significance}%` : ""
        ].filter(Boolean),
        insights: reading.results.past?.insights,
        premium: false
      },
      present: {
        title: "Present",
        content: [
          reading.results.present?.prediction || "No present reading available.",
          reading.results.present ? `Significance: ${reading.results.present.significance}%` : ""
        ].filter(Boolean),
        insights: reading.results.present?.insights,
        premium: false
      },
      future: {
        title: "Future",
        content: [
          reading.results.future?.prediction || "No future reading available.",
          reading.results.future ? `Significance: ${reading.results.future.significance}%` : ""
        ].filter(Boolean),
        insights: reading.results.future?.insights,
        premium: false
      }
    };

    if (reading.results.fateLinePresent && reading.results.fate) {
      content["fateLine"] = {
        title: "Fate Line",
        content: [
          reading.results.fate.prediction,
          `Strength: ${reading.results.fate.strength}%`
        ],
        insights: reading.results.fate.insights,
        premium: false
      };
    }

    if (reading.results.relationships) {
      content["relationships"] = {
        title: "Relationships",
        content: [
          reading.results.relationships.prediction,
          `Significance: ${reading.results.relationships.significance}%`
        ],
        insights: reading.results.relationships.insights,
        premium: true
      };
    }

    if (reading.results.career) {
      content["career"] = {
        title: "Career",
        content: [
          reading.results.career.prediction,
          `Significance: ${reading.results.career.significance}%`
        ],
        insights: reading.results.career.insights,
        premium: true
      };
    }

    if (reading.results.health) {
      content["health"] = {
        title: "Health",
        content: [
          reading.results.health.prediction,
          `Significance: ${reading.results.health.significance}%`
        ],
        insights: reading.results.health.insights,
        premium: true
      };
    }

    if (reading.results.elementalInfluences) {
      content["elements"] = {
        title: "Elemental Influences",
        content: [
          reading.results.elementalInfluences.description,
          `Earth: ${reading.results.elementalInfluences.earth}%`,
          `Water: ${reading.results.elementalInfluences.water}%`,
          `Fire: ${reading.results.elementalInfluences.fire}%`,
          `Air: ${reading.results.elementalInfluences.air}%`
        ],
        premium: true
      };
    }

    content["summary"] = {
      title: "Overall Summary",
      content: [
        reading.results.overallSummary,
        `Personality traits: ${reading.results.personalityTraits.join(', ')}`
      ],
      premium: false
    };

    return content;
  };

  const readingContent = getReadingContent();

  const getFilteredTabs = () => {
    if (!readingContent) return [];
    
    return Object.keys(readingContent).filter(key => 
      !readingContent[key].premium || isPremium || isPremiumTest
    );
  };

  const filteredTabs = getFilteredTabs();

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
              <>
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">Your Palm Reading</h1>
                        {reading.language && (
                          <div className="text-palm-purple font-medium flex items-center">
                            <span className="mr-2">Language:</span>
                            <span className="bg-palm-light px-2 py-1 rounded">
                              {getLanguageDisplay()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <button 
                          className="text-gray-500 hover:text-palm-purple transition-colors flex items-center"
                          onClick={() => {
                            if (!isPremiumTest) {
                              const newUrl = `${window.location.pathname}?premiumTest=true`;
                              window.history.pushState({}, "", newUrl);
                              setIsPremiumTest(true);
                              setIsPremium(true);
                              toast.info("Premium test mode activated", {
                                description: "You can now access all premium features for testing"
                              });
                            } else {
                              const newUrl = window.location.pathname;
                              window.history.pushState({}, "", newUrl);
                              setIsPremiumTest(false);
                              setIsPremium(false);
                              toast.info("Premium test mode deactivated", {
                                description: "Premium features are now hidden"
                              });
                            }
                          }}
                        >
                          <Info size={20} />
                          <span className="ml-1 text-sm">
                            {isPremiumTest ? "Disable" : "Enable"} Test Mode
                          </span>
                        </button>
                        <button className="text-gray-500 hover:text-palm-purple transition-colors">
                          <Download size={20} />
                        </button>
                        <button className="text-gray-500 hover:text-palm-purple transition-colors">
                          <Share2 size={20} />
                        </button>
                      </div>
                    </div>

                    {reading.language !== 'english' && reading.translationNote && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">{reading.translationNote}</p>
                        <p className="text-yellow-800 text-sm mt-2">
                          We're using a dictionary-based translation method for common terms. This provides useful translations 
                          while keeping the app lightweight without external API dependencies.
                        </p>
                      </div>
                    )}

                    {(isPremium || isPremiumTest) && (
                      <div className="mb-8">
                        <AudioPlayer text={reading.results.overallSummary} />
                      </div>
                    )}

                    <Tabs defaultValue="lifeLine" className="w-full" onValueChange={setActiveTab}>
                      <TabsList className="flex flex-wrap mb-8 border-b border-gray-100 bg-transparent p-0 w-full justify-start overflow-x-auto">
                        {filteredTabs.map((key) => (
                          <TabsTrigger
                            key={key}
                            value={key}
                            className={`px-4 py-3 font-medium transition-colors rounded-none flex items-center whitespace-nowrap ${
                              activeTab === key
                                ? "text-palm-purple border-b-2 border-palm-purple"
                                : "text-gray-500 hover:text-palm-purple"
                            }`}
                          >
                            {readingContent[key].premium && (
                              <span className="w-2 h-2 bg-palm-purple rounded-full mr-2"></span>
                            )}
                            {readingContent[key].title}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {filteredTabs.map((key) => (
                        <TabsContent key={key} value={key} className="animate-fade-in mt-4">
                          <h2 className="text-2xl font-semibold mb-4 flex items-center">
                            {readingContent[key].title}
                            {readingContent[key].premium && (
                              <span className="ml-2 text-xs bg-palm-purple text-white px-2 py-1 rounded-full">
                                Premium
                              </span>
                            )}
                          </h2>
                          
                          <div className="space-y-6">
                            {readingContent[key].content.map((paragraph: string, index: number) => (
                              <p key={index} className="text-gray-700 leading-relaxed">
                                {paragraph}
                              </p>
                            ))}

                            {readingContent[key].insights && (
                              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="font-semibold text-lg mb-3">Key Insights:</h3>
                                <ul className="list-disc list-inside space-y-2">
                                  {readingContent[key].insights.map((insight: string, idx: number) => (
                                    <li key={idx} className="text-gray-700">{insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </div>

                {!isPremium && !isPremiumTest && (
                  <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Unlock Premium Features</h2>
                    <p className="text-gray-600 mb-6">
                      Get access to detailed readings on your relationships, career, health and more with our premium plan.
                    </p>
                    <PaymentButton onSuccess={handlePayment} />
                  </div>
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
