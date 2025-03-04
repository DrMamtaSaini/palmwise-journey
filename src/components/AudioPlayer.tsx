
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
  text: string;
}

const AudioPlayer = ({ audioUrl, text }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Use separate ref for interval to avoid TypeScript errors
  const intervalRef = useRef<number | null>(null);

  // In a real app, we would use a real audio URL
  // For now, we'll simulate with a dummy audio element
  useEffect(() => {
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
      }
      // Clear interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const updateProgress = () => {
    if (audioRef.current) {
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        // Clear simulation interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Simulate audio playback for demo
        // In a real app, we would set audioRef.current.src = audioUrl
        const duration = 30; // 30 seconds simulation
        let currentTime = 0;
        // Can't set duration directly, so we'll simulate it
        
        // Clear any existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Create a new interval for simulation
        intervalRef.current = window.setInterval(() => {
          currentTime += 0.1;
          if (audioRef.current) {
            audioRef.current.currentTime = currentTime;
            
            if (currentTime >= duration) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              setIsPlaying(false);
              setProgress(0);
            }
          }
        }, 100);
        
        // Simulate play
        audioRef.current.play().catch(() => {
          // Handle autoplay restrictions
          console.log("Playback simulation active");
        });
      }
      setIsPlaying(!isPlaying);
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
          className="w-10 h-10 rounded-full bg-palm-purple text-white flex items-center justify-center hover:bg-palm-purple/90 transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-palm-purple h-full rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <button
          onClick={toggleMute}
          className="text-gray-500 hover:text-palm-purple transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      
      <p className="text-sm text-gray-500">
        {isPlaying ? "Playing audio reading..." : "Click play to listen to your palm reading"}
      </p>
    </div>
  );
};

export default AudioPlayer;
