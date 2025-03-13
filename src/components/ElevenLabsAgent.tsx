
import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageCircle } from 'lucide-react';
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
    <div className="rounded-xl border border-palm-light bg-gradient-to-b from-white to-palm-light/30 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-palm-purple/10 to-palm-purple/5 p-4 flex justify-between items-center border-b border-palm-light">
        <h3 className="text-lg font-medium flex items-center">
          <span className={`mr-2 w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-gray-300'} flex-shrink-0`}></span>
          <span className="font-serif">Palm Reading Voice Assistant</span>
          {status === 'connected' && isSpeaking && (
            <span className="ml-2 flex items-center">
              <span className="inline-block h-1 w-1 bg-palm-purple rounded-full animate-pulse mr-0.5"></span>
              <span className="inline-block h-2 w-1 bg-palm-purple rounded-full animate-pulse mr-0.5"></span>
              <span className="inline-block h-3 w-1 bg-palm-purple rounded-full animate-pulse mr-0.5"></span>
              <span className="inline-block h-2 w-1 bg-palm-purple rounded-full animate-pulse mr-0.5"></span>
              <span className="inline-block h-1 w-1 bg-palm-purple rounded-full animate-pulse"></span>
            </span>
          )}
        </h3>
        
        {status === 'connected' && (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className={`flex items-center ${isMuted ? 'text-red-500' : 'text-gray-600'}`}
            >
              {isMuted ? <VolumeX size={16} className="mr-1" /> : <Volume2 size={16} className="mr-1" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEndConversation}
              className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>

      <div className="p-5">
        {status === 'connected' ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isSpeaking ? 'bg-gradient-to-r from-palm-light to-palm-light/50 border border-palm-light animate-pulse' : 'bg-gray-50 border border-gray-100'} transition-all duration-300`}>
              <div className="flex items-start">
                <div className="bg-palm-purple/10 rounded-full p-2 mr-3 flex-shrink-0">
                  <MessageCircle size={20} className="text-palm-purple" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">{isSpeaking ? "AI is speaking..." : "Ask about your palm reading"}</p>
                  <p className="text-xs text-gray-600">
                    {isSpeaking 
                      ? "Listen as the AI explains aspects of your palm reading." 
                      : "Ask questions about your palm reading results and get personalized insights."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-palm-light/30 rounded-lg p-4 border border-palm-light/50">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Sparkles size={16} className="text-palm-purple mr-2" />
                Suggested Questions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="text-xs bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-palm-purple/30 hover:bg-palm-light/20 transition-colors cursor-pointer">
                  "What does my life line suggest about my health?"
                </div>
                <div className="text-xs bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-palm-purple/30 hover:bg-palm-light/20 transition-colors cursor-pointer">
                  "Can you explain more about my career prospects?"
                </div>
                <div className="text-xs bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-palm-purple/30 hover:bg-palm-light/20 transition-colors cursor-pointer">
                  "What are my key personality traits?"
                </div>
                <div className="text-xs bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-palm-purple/30 hover:bg-palm-light/20 transition-colors cursor-pointer">
                  "What do the elemental influences mean?"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <div className="h-6 w-6 rounded-full bg-palm-purple/20 flex items-center justify-center mr-2">
                <Mic size={14} className="text-palm-purple" />
              </div>
              <h4 className="text-sm font-medium">Interactive Voice Assistant</h4>
            </div>
            
            <Textarea 
              placeholder="Context for the AI assistant (optional)" 
              value={conversationContext}
              onChange={(e) => setConversationContext(e.target.value)}
              className="h-24 text-sm border-palm-light/50 focus:border-palm-purple/50 bg-white"
            />
            
            <Button
              onClick={handleStartConversation}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-palm-purple to-palm-purple/90 hover:from-palm-purple/90 hover:to-palm-purple"
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
            
            <p className="text-xs text-gray-500 text-center">
              Start a conversation with the AI to ask questions about your palm reading results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElevenLabsAgent;
