
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-b from-palm-light to-white">
      <div className="absolute inset-0 bg-palm-pattern opacity-5"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto animate-fade-in">
            Unlock The Secrets Of Your <span className="text-palm-purple">Palm</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 animate-fade-in">
            Discover your past, present, and future through advanced palm analysis. 
            Get personalized insights that guide your journey.
          </p>
          
          <div className="animate-fade-in-slow">
            <Link
              to="/upload-palm"
              className="bg-palm-purple text-white px-8 py-4 rounded-md text-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center group"
            >
              Try Palm Reading
              <ChevronDown className="ml-2 group-hover:translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
        onClick={scrollToFeatures}
      >
        <ChevronDown size={32} className="text-palm-purple" />
      </div>
    </section>
  );
};

export default Hero;
