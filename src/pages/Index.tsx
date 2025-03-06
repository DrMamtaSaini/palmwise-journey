
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Sparkles, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import TestimonialCard from "../components/TestimonialCard";
import UploadSection from "../components/UploadSection";
import PaymentButton from "../components/PaymentButton";
import Footer from "../components/Footer";

const Index = () => {
  console.log("Index component rendering START");
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    console.log("Index component mounted");
    document.title = "PalmInsight - Unlock the Secrets of Your Palm";
    
    // Force a re-render after a delay to ensure everything loads properly
    const timer = setTimeout(() => {
      console.log("Index forcing re-render");
      setIsRendered(true);
      
      // Show toast to verify the component is actually rendering
      toast({
        title: "Welcome to PalmInsight",
        description: "Discover your past, present, and future through palm analysis.",
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [toast]);

  const handleAnalyze = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    console.log("Navigating to reading results with image:", imageUrl.substring(0, 50) + "...");
    navigate("/reading-results");
  };

  const handlePayment = () => {
    console.log("Payment button clicked");
    toast({
      title: "Payment Initiated",
      description: "This would connect to PayPal in production.",
    });
  };

  // Fixed: Return null, not void
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
    return null; // Explicitly return null instead of implicit void
  };

  console.log("Index rendering completed, isRendered:", isRendered);
  
  return (
    <div className="min-h-screen flex flex-col">
      {console.log("Index return rendering")}
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">What Palm Analysis Reveals</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your palm contains a map of your life journey. Our analysis provides insights into multiple aspects of your existence.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Star}
                title="Life Journey"
                description="Insights about your past challenges, present situation, and future possibilities."
              />
              
              <FeatureCard
                icon={Heart}
                title="Relationships"
                description="Discover patterns in your love life, compatibility insights, and emotional tendencies."
              />
              
              <FeatureCard
                icon={Sparkles}
                title="Personal Growth"
                description="Tailored guidance to help you overcome obstacles and reach your full potential."
              />
            </div>
          </div>
        </section>
        
        {/* Upload Section */}
        <section className="py-20 bg-palm-light">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Begin Your Palm Reading</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload a clear image of your palm to receive detailed insights about your past, present, and future.
              </p>
            </div>
            
            <div className="max-w-xl mx-auto">
              <UploadSection onAnalyze={handleAnalyze} />
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">What Others Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands who have gained clarity through our palm analysis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TestimonialCard
                quote="The insights about my career path were astonishingly accurate. I followed the advice and received a promotion within months!"
                name="Sarah J."
                index={0}
              />
              
              <TestimonialCard
                quote="My palm reading revealed relationship patterns I had never noticed before. The guidance helped me improve my approach to dating."
                name="Michael T."
                index={1}
              />
              
              <TestimonialCard
                quote="The personal growth guidance was exactly what I needed to overcome obstacles in my life. So accurate that I'm now taking the future predictions seriously."
                name="Elena R."
                index={2}
              />
              
              <TestimonialCard
                quote="I was skeptical at first, but the reading was uncannily accurate. It helped me understand my strengths and weaknesses in a new light."
                name="David K."
                index={3}
              />
            </div>
          </div>
        </section>
        
        {/* Pricing */}
        <section id="pricing" className="py-20 bg-palm-light">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Premium Palm Reading</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get deeper insights with our premium palm reading services.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-soft">
                <h3 className="text-2xl font-bold mb-4">Basic Reading</h3>
                <p className="text-4xl font-bold mb-6">$9.99</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Past, present, and future insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Text reading results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>One palm analysis</span>
                  </li>
                  <li className="flex items-start opacity-50">
                    <span className="bg-gray-100 p-1 rounded-full mr-2">✗</span>
                    <span>Audio reading</span>
                  </li>
                  <li className="flex items-start opacity-50">
                    <span className="bg-gray-100 p-1 rounded-full mr-2">✗</span>
                    <span>Personalized solutions</span>
                  </li>
                </ul>
                
                <PaymentButton
                  price="$9.99"
                  description="Basic Reading"
                  onClick={handlePayment}
                />
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-palm-purple relative">
                <div className="absolute top-0 right-0 bg-palm-purple text-white px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  Popular
                </div>
                
                <h3 className="text-2xl font-bold mb-4">Premium Reading</h3>
                <p className="text-4xl font-bold mb-6">$29.99</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Comprehensive past, present, future analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Detailed text reading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Both palms analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Audio narration of your reading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-1 rounded-full mr-2 text-green-600">✓</span>
                    <span>Personalized solutions for obstacles</span>
                  </li>
                </ul>
                
                <PaymentButton
                  price="$29.99"
                  description="Premium Reading"
                  isPrimary
                  onClick={handlePayment}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Discover Your Path?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Your future is in your hands—literally. Unlock the secrets of your palm today.
            </p>
            <button
              onClick={() => {
                const uploadSection = document.getElementById("features");
                uploadSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-palm-purple text-white px-8 py-4 rounded-md text-lg font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center"
            >
              <Sparkles size={20} className="mr-2" />
              Start Your Reading
            </button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
