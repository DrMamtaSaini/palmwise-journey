
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

    // Check if OpenAI API key is set
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set')
      throw new Error('OpenAI API key is not configured')
    }

    console.log(`Generating speech with OpenAI TTS. Text length: ${text.length}, voice: ${voice}`)

    // Initialize OpenAI for TTS
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          response_format: 'mp3',
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('OpenAI API error:', errorBody)
        throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`)
      }

      // Convert audio buffer to base64
      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      )

      console.log(`Speech generated successfully. Base64 length: ${base64Audio.length}`)

      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
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
