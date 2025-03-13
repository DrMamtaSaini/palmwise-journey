
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle } from "lucide-react";
import TextToSpeechService from "../services/TextToSpeechService";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";

interface AudioPlayerProps {
  audioUrl?: string;
  text: string;
}

const AudioPlayer = ({ audioUrl, text }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContentRef = useRef<string | null>(null);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Add event listeners
      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("ended", handleAudioEnded);
      audioRef.current.addEventListener("error", handleAudioError);
      audioRef.current.addEventListener("canplaythrough", handleCanPlayThrough);
    }

    // Clean up on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.removeEventListener("ended", handleAudioEnded);
        audioRef.current.removeEventListener("error", handleAudioError);
        audioRef.current.removeEventListener("canplaythrough", handleCanPlayThrough);
      }
    };
  }, []);

  // Reset error state if text changes
  useEffect(() => {
    if (text && audioError) {
      setAudioError(null);
    }
  }, [text]);

  const updateProgress = () => {
    if (audioRef.current) {
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleAudioError = (e: Event) => {
    console.error("Audio error:", e);
    
    // Get more detailed error information if available
    let errorMsg = "Unknown audio error";
    if (audioRef.current) {
      const mediaError = audioRef.current.error;
      if (mediaError) {
        errorMsg = `Audio error: ${mediaError.code} - ${mediaError.message}`;
      }
    }
    
    setAudioError(errorMsg);
    setIsLoading(false);
    setIsPlaying(false);
    
    toast.error("Failed to play audio", {
      description: errorMsg
    });
  };

  const handleCanPlayThrough = () => {
    console.log("Audio can play through");
    if (isLoading && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Error playing audio after load:", error);
          setIsLoading(false);
          setAudioError("Failed to play audio after loading");
          toast.error("Failed to play audio", {
            description: "Browser prevented autoplay. Please try clicking play again."
          });
        });
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
    }
    
    setAudioError(null);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const retryGenerateSpeech = async () => {
    resetAudio();
    setRetryCount(prev => prev + 1);
    await togglePlay();
  };

  const togglePlay = async () => {
    // If we have an error, reset it when trying to play again
    if (audioError) {
      resetAudio();
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      // If we already have audio content loaded, just play it
      if (audioRef.current.src && audioRef.current.src !== window.location.href) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing existing audio:", error);
          toast.error("Failed to play audio", {
            description: "Please try again"
          });
        }
        return;
      }

      // If we have cached audio content but haven't set it as src yet
      if (audioContentRef.current) {
        try {
          const audioSrc = `data:audio/mp3;base64,${audioContentRef.current}`;
          audioRef.current.src = audioSrc;
          
          setIsLoading(true);
          // playback will be initiated by the canplaythrough event
        } catch (error) {
          console.error("Error setting cached audio content:", error);
          setIsLoading(false);
          toast.error("Failed to set audio source", {
            description: "Please try again"
          });
        }
        return;
      }

      // Otherwise, generate new audio from text
      try {
        setIsLoading(true);
        setAudioError(null);
        
        // Limit text length for the API call
        const limitedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
        const audioBase64 = await TextToSpeechService.generateSpeech(limitedText);
        
        // Store the audio content for future use
        audioContentRef.current = audioBase64;
        
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
        audioRef.current.src = audioSrc;
        
        // We'll wait for the canplaythrough event before playing
      } catch (error) {
        console.error("Error generating speech:", error);
        setIsLoading(false);
        setAudioError(error instanceof Error ? error.message : "Unknown error");
        
        toast.error("Failed to generate speech", {
          description: error instanceof Error ? error.message : "Please try again later"
        });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-soft">
      {audioError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {audioError}
            <button 
              onClick={retryGenerateSpeech}
              className="ml-2 text-sm underline hover:text-palm-purple"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-palm-purple text-white flex items-center justify-center hover:bg-palm-purple/90 transition-colors disabled:bg-palm-purple/50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
        
        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-palm-purple h-full rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <button
          onClick={toggleMute}
          disabled={!isPlaying && !audioRef.current?.src}
          className="text-gray-500 hover:text-palm-purple transition-colors disabled:text-gray-300"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      
      <p className="text-sm text-gray-500">
        {isLoading ? "Generating audio..." : 
          isPlaying ? "Playing audio reading..." : 
          audioError ? "Error playing audio. Try again." :
          "Click play to listen to your palm reading"}
      </p>
    </div>
  );
};

export default AudioPlayer;
