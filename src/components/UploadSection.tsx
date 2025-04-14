
import { useState } from "react";
import { Upload, Camera, SparklesIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PalmAnalysisService from "../services/PalmAnalysisService";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface UploadSectionProps {
  onAnalyze: (imageUrl: string) => void;
  isProcessing?: boolean;
}

const UploadSection = ({ onAnalyze, isProcessing = false }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user) {
      toast.error("Unable to proceed", { 
        description: !file ? "Please upload an image first" : "You need to be logged in"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // First upload the image to Supabase storage
      const imageUrl = await PalmAnalysisService.uploadPalmImage(file, user.id);
      
      if (imageUrl) {
        // Then pass the uploaded image URL to the parent component for analysis
        onAnalyze(imageUrl);
        
        // Reset the upload form immediately after successful upload
        setFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Upload failed", {
        description: "There was a problem uploading your image. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const takePicture = () => {
    try {
      // Create an input element for capturing photos
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // On mobile browsers, the "capture" attribute enables camera access
      // Note: We're setting it as property, not attribute
      input.setAttribute('capture', 'environment'); // Use the back camera if available
      
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const selectedFile = target.files?.[0];
        if (selectedFile) {
          setFile(selectedFile);
          const reader = new FileReader();
          reader.onload = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        }
      };
      
      // This triggers the file selection dialog
      input.click();
    } catch (error) {
      console.error("Error activating camera:", error);
      toast.error("Camera error", {
        description: "Could not access your camera. Please check permissions."
      });
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-soft">
      <h2 className="text-3xl font-bold mb-6 text-center">Palm Reader</h2>

      <div 
        className="mb-8 border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 min-h-[300px] relative"
        onClick={() => !isProcessing && !isUploading && !previewUrl && document.getElementById('file-upload')?.click()}
      >
        {previewUrl ? (
          <div className="mb-4 w-full max-w-sm relative">
            <img 
              src={previewUrl} 
              alt="Palm preview" 
              className="w-full h-auto rounded-lg object-contain"
            />
            {!isProcessing && !isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                aria-label="Remove image"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-gray-400 mb-4">
              <Upload size={48} />
            </div>
            <p className="text-center text-gray-500 mb-4">
              Click to upload an image of your palm
            </p>
            <p className="text-center text-gray-400 text-sm">
              For best results, upload a clear image of your palm with fingers spread and lines visible
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <label className={`flex-1 ${(isProcessing || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing || isUploading}
          />
          <div className={`bg-white border border-gray-200 rounded-lg py-3 px-4 text-center cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center ${(isProcessing || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload size={20} className="mr-2" />
            <span>Upload Image</span>
          </div>
        </label>

        <button 
          type="button"
          className={`flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 text-center hover:bg-gray-50 transition-colors flex items-center justify-center ${(isProcessing || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={takePicture}
          disabled={isProcessing || isUploading}
        >
          <Camera size={20} className="mr-2" />
          <span>Take Photo</span>
        </button>
      </div>

      {previewUrl && (
        <div className="flex justify-between gap-4 mb-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={resetUpload}
            disabled={isProcessing || isUploading}
          >
            <X size={16} className="mr-2" />
            Remove
          </Button>
          
          <Button
            type="button"
            className="flex-1 bg-palm-purple text-white hover:bg-purple-700"
            disabled={isProcessing || isUploading}
            onClick={handleAnalyze}
          >
            {isProcessing || isUploading ? (
              <span className="animate-pulse">{isProcessing ? "Analyzing..." : "Uploading..."}</span>
            ) : (
              <>
                <SparklesIcon size={20} className="mr-2" />
                <span>Read My Palm</span>
              </>
            )}
          </Button>
        </div>
      )}
      
      {!previewUrl && (
        <Button
          type="button"
          className="w-full bg-palm-purple text-white hover:bg-purple-700"
          disabled={true}
          onClick={handleAnalyze}
        >
          <>
            <SparklesIcon size={20} className="mr-2" />
            <span>Read My Palm</span>
          </>
        </Button>
      )}
    </div>
  );
};

export default UploadSection;
