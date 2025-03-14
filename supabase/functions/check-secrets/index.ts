
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
    // Check for required secrets
    const secrets = [
      'PAYPAL_CLIENT_ID',
      'GEMINI_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    const results = {};
    
    for (const secret of secrets) {
      const value = Deno.env.get(secret);
      results[secret] = {
        exists: !!value,
        // For security, don't return the actual value, just a hint about its length
        hint: value ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}` : null,
        length: value ? value.length : 0
      };
    }
    
    return new Response(
      JSON.stringify({
        message: 'Secret check completed',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking secrets:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
