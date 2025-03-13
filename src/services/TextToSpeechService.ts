
import { supabase } from "../lib/supabase";

class TextToSpeechService {
  private static instance: TextToSpeechService;

  private constructor() {}

  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  public async generateSpeech(text: string, voice: string = 'alloy'): Promise<string> {
    try {
      console.log("Generating speech for text:", text.substring(0, 50) + "...");
      console.log("Using voice:", voice);
      
      // Ensure text is not too long for the API
      const truncatedText = this.truncateText(text);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        method: 'POST',
        body: { text: truncatedText, voice }
      });
      
      if (error) {
        console.error("Error generating speech:", error);
        throw new Error(`Failed to generate speech: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        console.error("No data returned from server");
        throw new Error("No data returned from speech service");
      }
      
      if (data.error) {
        console.error("Error from text-to-speech function:", data.error);
        throw new Error(`Error from speech service: ${data.error}`);
      }
      
      if (!data.audioContent) {
        console.error("No audio content returned from server");
        throw new Error("No audio content returned from server");
      }
      
      console.log("Speech generated successfully, audio content length:", data.audioContent.length);
      return data.audioContent; // Base64 encoded audio
    } catch (error) {
      console.error("Error in generateSpeech:", error);
      
      // Rethrow with a more user-friendly message
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Edge Function returned a non-2xx status code')) {
          throw new Error("Speech service unavailable. Please try again later.");
        }
        throw error;
      }
      
      throw new Error("Failed to generate speech. Please try again later.");
    }
  }

  // OpenAI TTS has a limit on the input length, so we need to truncate the text
  private truncateText(text: string): string {
    const MAX_CHARS = 4000; // OpenAI TTS limit
    if (text.length <= MAX_CHARS) {
      return text;
    }
    
    // Truncate at sentence boundary if possible
    const truncated = text.substring(0, MAX_CHARS);
    const lastPeriodIndex = truncated.lastIndexOf('.');
    
    if (lastPeriodIndex > MAX_CHARS * 0.8) { // If we can find a good breakpoint
      return truncated.substring(0, lastPeriodIndex + 1) + " (text truncated)";
    }
    
    return truncated + "... (text truncated)";
  }
}

export default TextToSpeechService.getInstance();
