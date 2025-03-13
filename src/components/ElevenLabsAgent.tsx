
import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface ElevenLabsAgentProps {
  palmReading: any;
}

const ElevenLabsAgent: React.FC<ElevenLabsAgentProps> = ({ palmReading }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeyLoading, setIsKeyLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationContext, setConversationContext] = useState("");
  
  const {
    startSession,
    endSession,
    setVolume,
    status,
    isSpeaking
  } = useConversation({
    onConnect: () => {
      console.log("Connected to Eleven Labs agent");
      toast.success("Connected to voice assistant");
    },
    onDisconnect: () => {
      console.log("Disconnected from Eleven Labs agent");
      toast.info("Disconnected from voice assistant");
    },
    onError: (error) => {
      console.error("Eleven Labs agent error:", error);
      toast.error("Voice assistant error", {
        description: error.message || "Something went wrong"
      });
    }
  });

  // Fetch API key from Supabase function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsKeyLoading(true);
        const { data, error } = await supabase.functions.invoke('get-elevenlabs-key', {
          method: 'GET'
        });
        
        if (error) {
          console.error("Error fetching Eleven Labs API key:", error);
          toast.error("Failed to retrieve Eleven Labs API key");
          return;
        }
        
        if (!data || !data.key) {
          toast.error("No API key returned from server");
          return;
        }
        
        setApiKey(data.key);
        setAgentId(data.agentId || "your_agent_id_here"); // Replace with your default agent ID if not returned from backend
        
      } catch (error) {
        console.error("Error in fetchApiKey:", error);
        toast.error("Failed to retrieve Eleven Labs credentials");
      } finally {
        setIsKeyLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  // Generate conversation context from palm reading
  useEffect(() => {
    if (palmReading) {
      // Create a context string for the agent to understand the palm reading
      const context = `
This is a palm reading for a user. Main findings:
- Life Line: ${palmReading.results?.lifeLine?.prediction?.substring(0, 100)}...
- Heart Line: ${palmReading.results?.heartLine?.prediction?.substring(0, 100)}...
- Head Line: ${palmReading.results?.headLine?.prediction?.substring(0, 100)}...
- Overall Summary: ${palmReading.results?.overallSummary?.substring(0, 200)}...
- Key Personality Traits: ${palmReading.results?.personalityTraits?.join(', ')}
      `;
      
      setConversationContext(context);
    }
  }, [palmReading]);

  // Generate signed URL for connecting to the agent
  const generateSignedUrl = async () => {
    if (!apiKey || !agentId) {
      toast.error("Missing API key or agent ID");
      return;
    }

    try {
      setIsConnecting(true);
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-signed-url', {
        method: 'POST',
        body: { 
          apiKey, 
          agentId,
          context: conversationContext
        }
      });
      
      if (error) {
        console.error("Error generating signed URL:", error);
        toast.error("Failed to connect to voice assistant");
        return null;
      }
      
      console.log("Received signed URL", data);
      return data.signedUrl;
    } catch (error) {
      console.error("Error in generateSignedUrl:", error);
      toast.error("Failed to generate connection URL");
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartConversation = async () => {
    try {
      setIsConnecting(true);
      const url = await generateSignedUrl();
      
      if (!url) {
        toast.error("Failed to get connection URL");
        return;
      }
      
      await startSession({ url });
      toast.success("Connected to voice assistant");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation", {
        description: error.message || "Something went wrong"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndConversation = async () => {
    try {
      await endSession();
      toast.info("Disconnected from voice assistant");
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume({ volume: isMuted ? 1.0 : 0.0 });
    toast.info(isMuted ? "Voice assistant unmuted" : "Voice assistant muted");
  };

  if (isKeyLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!apiKey || !agentId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">Voice Assistant Setup Required</h3>
        <p className="text-gray-600 mb-4">Please set up the Eleven Labs API key in your backend to enable the voice assistant feature.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <span className={`mr-2 w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          Palm Reading Voice Assistant
        </h3>
        
        {status === 'connected' && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="flex items-center"
            >
              {isMuted ? <VolumeX size={16} className="mr-1" /> : <Volume2 size={16} className="mr-1" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndConversation}
              className="flex items-center text-red-500 hover:text-red-700"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>

      {status === 'connected' ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${isSpeaking ? 'bg-palm-light border border-palm-purple animate-pulse' : 'bg-gray-50'}`}>
            <p className="text-sm">
              {isSpeaking 
                ? "AI is speaking... Ask questions about your palm reading." 
                : "Ask questions about your palm reading. The AI assistant can help you understand the results."}
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Try asking:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>"What does my life line suggest about my health?"</li>
              <li>"Can you explain more about my career prospects?"</li>
              <li>"What are my key personality traits?"</li>
              <li>"What do the elemental influences mean?"</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea 
            placeholder="Context for the AI assistant (optional)" 
            value={conversationContext}
            onChange={(e) => setConversationContext(e.target.value)}
            className="h-24 text-sm"
          />
          
          <Button
            onClick={handleStartConversation}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⌛</span> Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <Mic size={16} className="mr-2" /> Start Voice Assistant
              </span>
            )}
          </Button>
          
          <p className="text-xs text-gray-500">
            Start a conversation with the AI to ask questions about your palm reading results.
          </p>
        </div>
      )}
    </div>
  );
};

export default ElevenLabsAgent;
