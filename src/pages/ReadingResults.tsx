
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Volume2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AudioPlayer from "../components/AudioPlayer";
import PaymentButton from "../components/PaymentButton";

interface PalmReading {
  palmReading: {
    past: string[];
    present: string[];
    future: string[];
    guidance: string[];
  };
  summary: string;
}

const ReadingResults = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("past");
  const [isPremium, setIsPremium] = useState(false);
  const [readingData, setReadingData] = useState<PalmReading | null>(null);

  useEffect(() => {
    // Load reading data from session storage
    const storedReading = sessionStorage.getItem('palmReadingResult');
    if (storedReading) {
      try {
        const parsedReading = JSON.parse(storedReading);
        setReadingData(parsedReading);
      } catch (error) {
        console.error("Error parsing reading data:", error);
      }
    }
  }, []);

  const handlePayment = () => {
    // In a real app, this would integrate with PayPal
    setIsPremium(true);
  };

  // Default content to show if no reading data is available
  const defaultReadingContent = {
    past: {
      title: "Your Past",
      content: [
        "Your palm reveals a childhood filled with creativity and imagination. The heart line indicates that you've experienced deep emotional connections early in life that have shaped your approach to relationships.",
        "The breaks in your life line suggest you've overcome significant challenges around ages 12 and 18, which have contributed to your resilience and adaptability.",
        "Your fate line shows early uncertainty about your path, but a defining moment in your late teens or early twenties helped clarify your direction."
      ]
    },
    present: {
      title: "Your Present",
      content: [
        "Currently, you're in a period of transformation. The intersection of your head and life lines indicates you're reassessing your priorities and considering new directions.",
        "Your heart line reveals you may be feeling somewhat cautious in emotional matters, perhaps due to past experiences. There's an opportunity now to open yourself to deeper connections.",
        "The strong Apollo (sun) line visible in your palm suggests creative potential that is ready to be fully expressed. This is an excellent time to pursue artistic or innovative endeavors."
      ]
    },
    future: {
      title: "Your Future",
      content: [
        "Your future appears bright with potential, particularly in areas requiring creativity and communication. The clarity of your Mercury line indicates success in business or communication fields.",
        "Relationship prospects show improvement, with opportunities for meaningful connections in the next few years. The depth of your heart line suggests capacity for profound bonds.",
        "Your life line extends strongly, indicating vitality and health. However, the slight fork suggests a need for balance between work and personal life to maintain wellbeing."
      ]
    },
    guidance: {
      title: "Personal Guidance",
      content: [
        "To overcome current obstacles, focus on developing your natural creativity. Your palm shows untapped potential in artistic or innovative thinking.",
        "The sensitivity indicated in your heart line can be both a strength and challenge. Practice setting healthy boundaries while remaining open to genuine connections.",
        "Your fate line suggests you thrive when following your intuition rather than conventional paths. Trust your inner guidance, particularly when making career decisions."
      ]
    }
  };

  // Use either the API data or default content
  const readingContent = readingData?.palmReading 
    ? {
        past: { title: "Your Past", content: readingData.palmReading.past },
        present: { title: "Your Present", content: readingData.palmReading.present },
        future: { title: "Your Future", content: readingData.palmReading.future },
        guidance: { title: "Personal Guidance", content: readingData.palmReading.guidance }
      }
    : defaultReadingContent;

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

                {readingData?.summary && (
                  <div className="mb-8 p-4 bg-palm-light rounded-lg">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700">{readingData.summary}</p>
                  </div>
                )}

                {isPremium && (
                  <div className="mb-8">
                    <AudioPlayer text="Your palm reading audio transcript" />
                  </div>
                )}

                <div className="flex mb-8 border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab("past")}
                    className={`px-4 py-3 font-medium transition-colors ${
                      activeTab === "past"
                        ? "text-palm-purple border-b-2 border-palm-purple"
                        : "text-gray-500 hover:text-palm-purple"
                    }`}
                  >
                    Past
                  </button>
                  <button
                    onClick={() => setActiveTab("present")}
                    className={`px-4 py-3 font-medium transition-colors ${
                      activeTab === "present"
                        ? "text-palm-purple border-b-2 border-palm-purple"
                        : "text-gray-500 hover:text-palm-purple"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setActiveTab("future")}
                    className={`px-4 py-3 font-medium transition-colors ${
                      activeTab === "future"
                        ? "text-palm-purple border-b-2 border-palm-purple"
                        : "text-gray-500 hover:text-palm-purple"
                    }`}
                  >
                    Future
                  </button>
                  <button
                    onClick={() => setActiveTab("guidance")}
                    className={`px-4 py-3 font-medium transition-colors ${
                      activeTab === "guidance"
                        ? "text-palm-purple border-b-2 border-palm-purple"
                        : "text-gray-500 hover:text-palm-purple"
                    }`}
                  >
                    Guidance
                  </button>
                </div>

                <div className="animate-fade-in">
                  <h2 className="text-2xl font-semibold mb-4">{readingContent[activeTab as keyof typeof readingContent].title}</h2>
                  
                  <div className="space-y-6">
                    {readingContent[activeTab as keyof typeof readingContent].content.map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReadingResults;
