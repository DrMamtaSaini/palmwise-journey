
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deployment

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variable (set in edge function secrets)
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Return the API key
    return new Response(
      JSON.stringify({ apiKey }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
