
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
    let secretName = 'GEMINI_API_KEY';
    
    // Check if a specific secret name was requested in the body
    try {
      const body = await req.json();
      if (body && body.secretName) {
        secretName = body.secretName;
        console.log(`Using requested secret name: ${secretName}`);
      }
    } catch (parseError) {
      // If there's no valid JSON body or no secretName specified, use the default
      console.log(`Using default secret name: ${secretName}`);
    }
    
    // Retrieve the Gemini API key from Deno environment
    const apiKey = Deno.env.get(secretName);
    
    if (!apiKey) {
      console.error(`No ${secretName} found in environment variables`);
      return new Response(
        JSON.stringify({ 
          error: `API key not configured. Please add ${secretName} to the Edge Function secrets.` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Return the key (only in production - this would be handled more securely)
    return new Response(
      JSON.stringify({ key: apiKey }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error retrieving Gemini API key:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
