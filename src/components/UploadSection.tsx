
import { useState, useRef } from "react";
import { Upload, Camera, SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadSectionProps {
  onAnalyze: (imageUrl: string) => void;
}

const UploadSection = ({ onAnalyze }: UploadSectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        // Close camera if it was active
        if (isCameraActive) {
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setPreviewUrl(null); // Clear any existing preview
      
      toast({
        title: "Camera activated",
        description: "Position your palm in the center of the frame and take a photo.",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(imageUrl);
        
        // Stop the camera
        stopCamera();
        
        toast({
          title: "Photo captured",
          description: "You can now analyze your palm or take another photo.",
        });
      }
    }
  };

  const handleAnalyze = () => {
    if (previewUrl) {
      setIsLoading(true);
      // In a real app, you would upload the image to your backend here
      setTimeout(() => {
        onAnalyze(previewUrl);
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-soft">
      <h2 className="text-3xl font-bold mb-6 text-center">Palm Reader</h2>

      <div className="mb-8 border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 min-h-[300px] relative">
        {isCameraActive ? (
          <div className="w-full">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-auto rounded-lg"
            />
            <button 
              onClick={capturePhoto}
              className="mt-4 bg-palm-purple text-white py-2 px-4 rounded-lg flex items-center justify-center w-full"
            >
              <Camera size={20} className="mr-2" />
              <span>Take Photo</span>
            </button>
          </div>
        ) : previewUrl ? (
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
        
        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 text-center cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center">
            <Upload size={20} className="mr-2" />
            <span>Upload Image</span>
          </div>
        </label>

        <button 
          className="flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 text-center hover:bg-gray-50 transition-colors flex items-center justify-center"
          onClick={isCameraActive ? stopCamera : startCamera}
        >
          <Camera size={20} className="mr-2" />
          <span>{isCameraActive ? "Stop Camera" : "Take Photo"}</span>
        </button>
      </div>

      <button
        className={`w-full bg-palm-purple text-white py-3 px-4 rounded-lg flex items-center justify-center ${
          (!previewUrl || isLoading) && "opacity-50 cursor-not-allowed"
        }`}
        disabled={!previewUrl || isLoading || isCameraActive}
        onClick={handleAnalyze}
      >
        {isLoading ? (
          <span className="animate-pulse">Analyzing...</span>
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
