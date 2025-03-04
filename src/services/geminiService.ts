
import { supabase } from '@/lib/supabase';

// Define types for Gemini API responses
interface GeminiResponse {
  result: {
    palmReading: {
      past: string[];
      present: string[];
      future: string[];
      guidance: string[];
    };
    summary: string;
  };
}

// Function to analyze palm image using Gemini API
export async function analyzePalmImage(imageBase64: string): Promise<GeminiResponse | null> {
  try {
    // Get the Gemini API key from Supabase
    const { data, error } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('key_name', 'gemini_api_key')
      .single();

    if (error || !data) {
      console.error('Failed to retrieve Gemini API key:', error);
      return null;
    }

    const geminiApiKey = data.key_value;
    
    // Remove the data URL prefix if present
    const base64Image = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    // Prepare the request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this palm image and provide a detailed palm reading. Include insights about the past, present, future, and personal guidance. Format the response as JSON with sections for past, present, future, and guidance, each containing an array of paragraphs. Also provide a brief summary."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process the Gemini response
    // This is a simplified example - actual parsing depends on Gemini's response format
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response text
    // Gemini might wrap JSON in markdown code blocks or add other text
    let jsonData;
    try {
      // Look for JSON structure in the response
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseText.match(/{[\s\S]*}/);
                        
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      jsonData = JSON.parse(jsonString);
    } catch (err) {
      console.error('Failed to parse Gemini response as JSON:', err);
      
      // Fallback: Create structured data manually with default format
      jsonData = {
        result: {
          palmReading: {
            past: [
              "The analysis of your palm's past section reveals significant life events that have shaped your journey.",
              "Your palm shows evidence of creativity and emotional depth from an early age."
            ],
            present: [
              "Currently, you are in a period of transformation and growth.",
              "The lines in your palm suggest you're facing decisions that will impact your future direction."
            ],
            future: [
              "Your palm indicates promising opportunities ahead, particularly in areas requiring creativity.",
              "The trajectory of your fate line suggests success through perseverance."
            ],
            guidance: [
              "Focus on developing your natural talents and strengths.",
              "Your palm suggests benefits from balancing analytical thinking with intuition."
            ]
          },
          summary: "Your palm reveals a creative past, a transformative present, and a promising future with opportunities for growth through balanced decision-making."
        }
      };
    }

    return jsonData as GeminiResponse;
  } catch (error) {
    console.error('Error analyzing palm image:', error);
    return null;
  }
}
