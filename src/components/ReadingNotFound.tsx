
import React from "react";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface ReadingNotFoundProps {
  message: string;
  retryAction?: () => void;
  showDebugInfo?: boolean;
}

const ReadingNotFound = ({ message, retryAction, showDebugInfo = false }: ReadingNotFoundProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {message || "Reading Not Found"}
      </h3>
      <p className="text-gray-500 mb-6">
        We couldn't find the reading you're looking for. It may have been deleted, still processing, or you may not have permission to view it.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        {retryAction && (
          <Button 
            onClick={retryAction}
            className="bg-palm-purple hover:bg-palm-purple/90"
          >
            Try Again
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate("/upload-palm")}
        >
          Upload New Palm
        </Button>
      </div>
      
      {showDebugInfo && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 w-full">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">Need Help?</p>
          </div>
          <p className="mb-3">If you're seeing this error repeatedly, please try the following:</p>
          <ul className="list-disc list-inside mt-1 space-y-2 text-left">
            <li>Check your internet connection</li>
            <li>Try logging out and logging back in</li>
            <li>Clear your browser cache</li>
            <li>Make sure your palm image is clearly visible</li>
            <li>If the problem persists, please contact support</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReadingNotFound;
