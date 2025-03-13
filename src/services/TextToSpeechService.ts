
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
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        method: 'POST',
        body: { text, voice }
      });
      
      if (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech");
      }
      
      if (!data || !data.audioContent) {
        throw new Error("No audio data returned from server");
      }
      
      console.log("Speech generated successfully");
      return data.audioContent; // Base64 encoded audio
    } catch (error) {
      console.error("Error in generateSpeech:", error);
      throw error;
    }
  }
}

export default TextToSpeechService.getInstance();
