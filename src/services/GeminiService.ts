
import { supabase } from "../lib/supabase";

class GeminiService {
  private static instance: GeminiService;
  private apiKey: string | null = null;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async getApiKey(): Promise<string> {
    // Return cached key if available
    if (this.apiKey) {
      return this.apiKey;
    }

    try {
      console.log("Fetching Gemini API key from Supabase function...");
      
      const { data, error } = await supabase.functions.invoke('get-gemini-key', {
        method: 'GET',
        body: { secretName: 'latest_pal_reading_secrets' }  // Use the latest secrets
      });
      
      if (error) {
        console.error("Error fetching Gemini API key:", error);
        throw new Error("Failed to retrieve Gemini API key");
      }
      
      if (!data || !data.key) {
        throw new Error("No API key returned from server");
      }
      
      this.apiKey = data.key;
      console.log("Gemini API key retrieved successfully");
      
      return this.apiKey;
    } catch (error) {
      console.error("Error in getApiKey:", error);
      throw error;
    }
  }

  public async generateTextWithGemini(prompt: string): Promise<string> {
    try {
      const apiKey = await this.getApiKey();
      
      // Call the Gemini API using the correct endpoint format
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
                  text: prompt
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
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract text from Gemini response
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';
      return generatedText;
    } catch (error) {
      console.error("Error generating text with Gemini:", error);
      throw error;
    }
  }
}

export default GeminiService.getInstance();
