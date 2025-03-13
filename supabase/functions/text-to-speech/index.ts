
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

    // Generate text for audio narration using Gemini
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate an audio narration of the following text. The voice should be clear, natural, and engaging. Make sure to maintain a conversational tone throughout:

${text}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('Gemini API error:', errorBody)
        throw new Error(`Gemini API error: ${response.status} - ${errorBody}`)
      }

      const data = await response.json()
      const narratedText = data.candidates[0]?.content?.parts[0]?.text || text

      // Since Gemini doesn't have a direct text-to-speech API, we're returning the narrated text
      // The frontend will use the browser's SpeechSynthesis API to convert this to speech
      console.log(`Speech text generated successfully. Length: ${narratedText.length}`)

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
      console.error('Error calling Gemini API:', error)
      throw error
    }
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
