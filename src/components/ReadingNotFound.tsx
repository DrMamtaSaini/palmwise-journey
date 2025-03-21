
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface ReadingNotFoundProps {
  message: string;
}

const ReadingNotFound = ({ message }: ReadingNotFoundProps) => {
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
      <div className="flex gap-4">
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
    </div>
  );
};

export default ReadingNotFound;
