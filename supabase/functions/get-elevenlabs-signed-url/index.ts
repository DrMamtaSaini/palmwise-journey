
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, agentId, context } = await req.json();
    
    if (!apiKey || !agentId) {
      throw new Error("API key and agent ID are required");
    }

    console.log("Generating signed URL for agent:", agentId);
    
    // Call the Eleven Labs API to get a signed URL
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Eleven Labs API error:", errorText);
      throw new Error(`Eleven Labs API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        signedUrl: data.signed_url
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error generating signed URL:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate signed URL", 
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});
