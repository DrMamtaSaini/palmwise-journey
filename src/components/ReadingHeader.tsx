
import { Info, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ReadingHeaderProps {
  title: string;
  language?: string;
  languageDisplay: string;
  isPremiumTest: boolean;
  setIsPremiumTest: (value: boolean) => void;
  setIsPremium: (value: boolean) => void;
}

const ReadingHeader = ({ 
  title, 
  language, 
  languageDisplay, 
  isPremiumTest, 
  setIsPremiumTest, 
  setIsPremium 
}: ReadingHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {language && (
          <div className="text-palm-purple font-medium flex items-center">
            <span className="mr-2">Language:</span>
            <span className="bg-palm-light px-2 py-1 rounded">
              {languageDisplay}
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
  );
};

export default ReadingHeader;
