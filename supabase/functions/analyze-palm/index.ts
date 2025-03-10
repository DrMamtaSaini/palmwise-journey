
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image URL provided" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log("Analyzing palm image:", imageUrl);
    const analysis = await analyzePalmWithGemini(imageUrl);
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error analyzing palm:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze palm image", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function analyzePalmWithGemini(imageUrl: string) {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not set");
  }

  // Fetch the image as binary data
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }
  
  // Convert the image to base64
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  
  const prompt = `
You are an expert palm reader. Analyze the palm image carefully and provide insights on:

1. Life Line: Analyze the length, curve, and depth. Provide strength (percentage) and prediction.
2. Heart Line: Analyze its quality and characteristics. Provide strength (percentage) and prediction.
3. Head Line: Analyze pattern and depth. Provide strength (percentage) and prediction.
4. Fate Line: First determine if it's present. If yes, analyze and provide strength (percentage) and prediction.
5. Give an overall summary of what the palm reveals about the person's life, personality, and future.
6. List 5 personality traits revealed by the palm lines.

Respond in a formal, mystic palm reader voice.
`;

  // Call Gemini API with image
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
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
        maxOutputTokens: 1024
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  if (!aiResponse) {
    throw new Error("Gemini API did not return any text content");
  }
  
  // Parse AI response and structure it
  return parseAIResponse(aiResponse);
}

function parseAIResponse(aiResponse: string) {
  // Default structure for the analysis result
  const analysis = {
    lifeLine: {
      strength: Math.floor(Math.random() * 30) + 70, // Default high strength
      prediction: "Could not extract prediction from AI analysis."
    },
    heartLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Could not extract prediction from AI analysis."
    },
    headLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Could not extract prediction from AI analysis."
    },
    fateLinePresent: false,
    overallSummary: "The AI could not generate a complete analysis.",
    personalityTraits: ["Adaptable", "Intuitive", "Thoughtful", "Creative", "Resilient"]
  };

  try {
    // Extract Life Line information
    const lifeLineMatch = aiResponse.match(/Life Line:[\s\S]*?(?=Heart Line:|$)/i);
    if (lifeLineMatch) {
      const lifeLineText = lifeLineMatch[0];
      // Try to extract strength percentage
      const strengthMatch = lifeLineText.match(/(\d+)%/);
      if (strengthMatch) {
        analysis.lifeLine.strength = parseInt(strengthMatch[1]);
      }
      // Extract prediction (take everything after any percentage or the first sentence)
      const predMatch = lifeLineText.match(/(\d+)%([\s\S]*?)(?=\n\n|\n|$)/);
      if (predMatch && predMatch[2]) {
        analysis.lifeLine.prediction = predMatch[2].trim();
      } else {
        // If no percentage, take everything after "Life Line:"
        const altPredMatch = lifeLineText.match(/Life Line:([\s\S]*?)(?=\n\n|\n|$)/i);
        if (altPredMatch && altPredMatch[1]) {
          analysis.lifeLine.prediction = altPredMatch[1].trim();
        }
      }
    }

    // Extract Heart Line information
    const heartLineMatch = aiResponse.match(/Heart Line:[\s\S]*?(?=Head Line:|$)/i);
    if (heartLineMatch) {
      const heartLineText = heartLineMatch[0];
      const strengthMatch = heartLineText.match(/(\d+)%/);
      if (strengthMatch) {
        analysis.heartLine.strength = parseInt(strengthMatch[1]);
      }
      const predMatch = heartLineText.match(/(\d+)%([\s\S]*?)(?=\n\n|\n|$)/);
      if (predMatch && predMatch[2]) {
        analysis.heartLine.prediction = predMatch[2].trim();
      } else {
        const altPredMatch = heartLineText.match(/Heart Line:([\s\S]*?)(?=\n\n|\n|$)/i);
        if (altPredMatch && altPredMatch[1]) {
          analysis.heartLine.prediction = altPredMatch[1].trim();
        }
      }
    }

    // Extract Head Line information
    const headLineMatch = aiResponse.match(/Head Line:[\s\S]*?(?=Fate Line:|$)/i);
    if (headLineMatch) {
      const headLineText = headLineMatch[0];
      const strengthMatch = headLineText.match(/(\d+)%/);
      if (strengthMatch) {
        analysis.headLine.strength = parseInt(strengthMatch[1]);
      }
      const predMatch = headLineText.match(/(\d+)%([\s\S]*?)(?=\n\n|\n|$)/);
      if (predMatch && predMatch[2]) {
        analysis.headLine.prediction = predMatch[2].trim();
      } else {
        const altPredMatch = headLineText.match(/Head Line:([\s\S]*?)(?=\n\n|\n|$)/i);
        if (altPredMatch && altPredMatch[1]) {
          analysis.headLine.prediction = altPredMatch[1].trim();
        }
      }
    }

    // Determine if Fate Line is present and extract information
    const fateLinePresent = aiResponse.includes("Fate Line:");
    analysis.fateLinePresent = fateLinePresent;
    
    if (fateLinePresent) {
      const fateLineMatch = aiResponse.match(/Fate Line:[\s\S]*?(?=Overall Summary:|$)/i);
      if (fateLineMatch) {
        const fateLineText = fateLineMatch[0];
        const strengthMatch = fateLineText.match(/(\d+)%/);
        const strength = strengthMatch ? parseInt(strengthMatch[1]) : Math.floor(Math.random() * 30) + 70;
        
        const predMatch = fateLineText.match(/(\d+)%([\s\S]*?)(?=\n\n|\n|$)/);
        let prediction = "Your fate line indicates important career changes and opportunities for growth.";
        if (predMatch && predMatch[2]) {
          prediction = predMatch[2].trim();
        } else {
          const altPredMatch = fateLineText.match(/Fate Line:([\s\S]*?)(?=\n\n|\n|$)/i);
          if (altPredMatch && altPredMatch[1]) {
            prediction = altPredMatch[1].trim();
          }
        }
        
        analysis.fate = {
          strength,
          prediction
        };
      }
    }

    // Extract Overall Summary
    const summaryMatch = aiResponse.match(/Overall Summary:[\s\S]*?(?=Personality Traits:|$)/i);
    if (summaryMatch) {
      const summaryText = summaryMatch[0].replace(/Overall Summary:/i, "").trim();
      if (summaryText) {
        analysis.overallSummary = summaryText;
      }
    }

    // Extract Personality Traits
    const traitsMatch = aiResponse.match(/Personality Traits:[\s\S]*?$/i);
    if (traitsMatch) {
      const traitsText = traitsMatch[0].replace(/Personality Traits:/i, "").trim();
      if (traitsText) {
        // Split by numbers or bullet points and filter empty entries
        const traits = traitsText.split(/\n\d+\.|\n-|\n\*/).map(t => t.trim()).filter(t => t.length > 0);
        if (traits.length > 0) {
          analysis.personalityTraits = traits.slice(0, 5);
        }
      }
    }

    return analysis;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return analysis; // Return default structure if parsing fails
  }
}
