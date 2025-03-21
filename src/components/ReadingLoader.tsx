
import React from "react";
import { Loader2 } from "lucide-react";

interface ReadingLoaderProps {
  message: string;
}

const ReadingLoader = ({ message }: ReadingLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-palm-purple mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {message || "Loading..."}
      </h3>
      <p className="text-gray-500">
        This may take a few moments, please wait
      </p>
    </div>
  );
};

export default ReadingLoader;
