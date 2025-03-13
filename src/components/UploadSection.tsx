
import { useState, useRef } from "react";
import { Upload, Camera, SparklesIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PalmAnalysisService from "../services/PalmAnalysisService";
import { toast } from "sonner";

interface UploadSectionProps {
  onAnalyze: (imageUrl: string) => void;
  isProcessing?: boolean;
}

const UploadSection = ({ onAnalyze, isProcessing = false }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      // Instead of dynamically creating an input, use the reference to the existing one
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        toast.error("Camera access error", {
          description: "Could not access your camera. Please try uploading an image instead."
        });
      }
    } catch (error) {
      console.error("Error activating camera:", error);
      toast.error("Camera error", {
        description: "Could not access your camera. Please check permissions."
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-soft">
      <h2 className="text-3xl font-bold mb-6 text-center">Palm Reader</h2>

      <div 
        className="mb-8 border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 min-h-[300px] cursor-pointer"
        onClick={() => !isProcessing && !isUploading && fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="mb-4 w-full max-w-sm">
            <img 
              src={previewUrl} 
              alt="Palm preview" 
              className="w-full h-auto rounded-lg object-contain"
            />
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
            ref={fileInputRef}
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
        
        {/* Hidden camera input with capture attribute */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing || isUploading}
        />
      </div>

      <button
        type="button"
        className={`w-full bg-palm-purple text-white py-3 px-4 rounded-lg flex items-center justify-center ${
          !previewUrl || isProcessing || isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700 cursor-pointer"
        }`}
        disabled={!previewUrl || isProcessing || isUploading}
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
      </button>
    </div>
  );
};

export default UploadSection;
