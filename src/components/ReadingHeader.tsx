
import { useState, useEffect } from "react";
import { Info, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { generateFullReadingText } from "../utils/readingContentUtils";

interface ReadingHeaderProps {
  imageUrl?: string;
  date?: string;
  title?: string;
  language?: string;
  languageDisplay?: string;
  isPremiumTest?: boolean;
  setIsPremiumTest?: (value: boolean) => void;
  setIsPremium?: (value: boolean) => void;
  readingContent?: Record<string, any> | null;
  isPremium?: boolean;
}

const ReadingHeader = ({ 
  imageUrl,
  date,
  title = "Your Palm Reading Results", 
  language, 
  languageDisplay = language === "hindi" ? "हिन्दी" : "English", 
  isPremiumTest = false, 
  setIsPremiumTest = () => {}, 
  setIsPremium = () => {},
  readingContent = null,
  isPremium = false
}: ReadingHeaderProps) => {
  
  const handleDownload = () => {
    if (!readingContent) {
      toast.error("No reading content available to download");
      return;
    }
    
    const fullText = generateFullReadingText(readingContent, isPremium || isPremiumTest);
    const fileName = `palm-reading-report-${new Date().toISOString().split('T')[0]}.txt`;
    
    // Create a blob from the text content
    const blob = new Blob([fullText], { type: 'text/plain' });
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
    
    toast.success("Download started", {
      description: `Your palm reading report "${fileName}" is being downloaded`
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Palm Reading',
        text: 'Check out my palm reading results!',
        url: window.location.href,
      })
      .then(() => toast.success("Shared successfully"))
      .catch((error) => {
        console.error('Error sharing:', error);
        toast.error("Couldn't share the reading");
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success("Link copied to clipboard"))
        .catch(() => toast.error("Couldn't copy the link"));
    }
  };
  
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
        <button 
          className="text-gray-500 hover:text-palm-purple transition-colors flex items-center"
          onClick={handleDownload}
        >
          <Download size={20} />
          <span className="ml-1 text-sm hidden sm:inline">Download</span>
        </button>
        <button 
          className="text-gray-500 hover:text-palm-purple transition-colors flex items-center"
          onClick={handleShare}
        >
          <Share2 size={20} />
          <span className="ml-1 text-sm hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingHeader;
