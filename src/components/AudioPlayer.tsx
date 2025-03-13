import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import TextToSpeechService from "../services/TextToSpeechService";
import { toast } from "sonner";

interface AudioPlayerProps {
  audioUrl?: string;
  text: string;
}

const AudioPlayer = ({ audioUrl, text }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.removeEventListener("ended", () => {
          setIsPlaying(false);
          setProgress(0);
        });
        audioRef.current.pause();
      }
    };
  }, []);

  const updateProgress = () => {
    if (audioRef.current) {
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value);
    }
  };

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      // If we already have an audio URL, just play it
      if (audioRef.current.src && audioRef.current.src !== window.location.href) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      // Otherwise, generate audio from text
      try {
        setIsLoading(true);
        // Limit text length for the API call
        const limitedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
        const audioBase64 = await TextToSpeechService.generateSpeech(limitedText);
        
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
        audioRef.current.src = audioSrc;
        
        // Play audio
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
        toast.error("Failed to play audio", {
          description: "Please try again later"
        });
      } finally {
        setIsLoading(false);
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
          "Click play to listen to your palm reading"}
      </p>
    </div>
  );
};

export default AudioPlayer;
