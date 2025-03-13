
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'alloy' } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Check if Gemini API key is set
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      throw new Error('Gemini API key is not configured')
    }

    console.log(`Generating speech with Gemini API. Text length: ${text.length}, voice: ${voice}`)
    
    // We want to return exactly the text passed in so it reads the actual palm reading sections
    // We're just skipping the actual Gemini API call that rewrites the text
    const narratedText = text;
    console.log(`Speech text ready. Length: ${narratedText.length}`)

    return new Response(
      JSON.stringify({ 
        narratedText: narratedText,
        // Indicate that we're using the browser's speech synthesis
        useBrowserSynthesis: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    
    // Return a more detailed error message
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || 'No stack trace available'
      }),
      {
        status: 500, // Use 500 instead of 400 for server errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
