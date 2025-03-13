
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export interface PalmReading {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: string;
  results: {
    lifeLine: {
      strength: number;
      prediction: string;
    };
    heartLine: {
      strength: number;
      prediction: string;
    };
    headLine: {
      strength: number;
      prediction: string;
    };
    fateLinePresent: boolean;
    fate?: {
      strength: number;
      prediction: string;
    };
    past?: {
      prediction: string;
      significance: number;
    };
    present?: {
      prediction: string;
      significance: number;
    };
    future?: {
      prediction: string;
      significance: number;
    };
    overallSummary: string;
    personalityTraits: string[];
  };
}

class PalmAnalysisService {
  private static instance: PalmAnalysisService;

  private constructor() {}

  public static getInstance(): PalmAnalysisService {
    if (!PalmAnalysisService.instance) {
      PalmAnalysisService.instance = new PalmAnalysisService();
    }
    return PalmAnalysisService.instance;
  }

  public async uploadPalmImage(file: File, userId: string): Promise<string | null> {
    try {
      // Generate unique file path for palm image
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/palm-images/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('palm-images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded image
      const { data } = supabase.storage
        .from('palm-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Upload failed', {
        description: 'There was a problem uploading your image. Please try again.',
      });
      return null;
    }
  }

  public async analyzePalm(imageUrl: string, userId: string): Promise<PalmReading> {
    try {
      toast.info('Analyzing your palm...', {
        description: 'This may take a moment as our AI works its magic.',
        duration: 5000
      });
      
      // Generate a proper UUID for the reading
      const readingId = uuidv4();
      
      // Call the edge function to analyze the palm image
      const { data, error } = await supabase.functions
        .invoke('analyze-palm', {
          body: { imageUrl }
        });

      // If there's an error but fallbackData is provided, use that
      if (error && data?.fallbackData) {
        console.log('Using fallback data due to error:', error);
        data.results = data.fallbackData;
      } else if (error) {
        console.error('Edge function error:', error);
        throw new Error('AI analysis failed: ' + error.message);
      }
      
      // Create the palm reading with real AI analysis or fallback data
      const results = data || generateFallbackResults();
      
      // Make sure fate data is consistent with fateLinePresent flag
      if (results.fateLinePresent && !results.fate) {
        results.fate = {
          strength: Math.random() * 100,
          prediction: "Your fate line suggests a strong career trajectory with potential for leadership."
        };
      }
      
      const reading: PalmReading = {
        id: readingId,
        userId,
        imageUrl,
        createdAt: new Date().toISOString(),
        results
      };
      
      // Save to Supabase database
      const { error: dbError } = await supabase
        .from('palm_readings')
        .insert([
          {
            id: reading.id,
            user_id: reading.userId,
            image_url: reading.imageUrl,
            created_at: reading.createdAt,
            results: reading.results
          }
        ]);
        
      if (dbError) {
        console.error('Error saving reading to database:', dbError);
        // Continue even if there's a DB error, so user can still see the reading
      } else {
        console.log('Successfully saved palm reading to database:', reading.id);
      }
      
      toast.success('Palm analysis complete', {
        description: 'Your detailed palm reading is ready to view.',
      });
      
      return reading;
    } catch (error) {
      console.error('Palm analysis error:', error);
      
      toast.error('Analysis failed', {
        description: 'Using a default reading instead. You can try again later.',
        duration: 5000
      });
      
      // Even if there's an error, return a fallback reading so the user sees something
      const fallbackReading = this.createFallbackReading(imageUrl, userId);
      return fallbackReading;
    }
  }

  private createFallbackReading(imageUrl: string, userId: string): PalmReading {
    const readingId = uuidv4();
    const results = generateFallbackResults();
    
    return {
      id: readingId,
      userId,
      imageUrl,
      createdAt: new Date().toISOString(),
      results
    };
  }

  public async getPalmReadings(userId: string): Promise<PalmReading[]> {
    try {
      const { data, error } = await supabase
        .from('palm_readings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Transform from database schema to application schema
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        imageUrl: item.image_url,
        createdAt: item.created_at,
        results: item.results
      }));
    } catch (error) {
      console.error('Get palm readings error:', error);
      // Return empty array if there was an error
      return [];
    }
  }

  public async getPalmReading(id: string): Promise<PalmReading | null> {
    try {
      const { data, error } = await supabase
        .from('palm_readings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        imageUrl: data.image_url,
        createdAt: data.created_at,
        results: data.results
      };
    } catch (error) {
      console.error('Get palm reading error:', error);
      return null;
    }
  }
}

// Fallback result generator for consistent readings even when AI fails
function generateFallbackResults() {
  return {
    lifeLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your life line indicates a long and healthy life, with challenges that you will overcome."
    },
    heartLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your heart line shows a capacity for deep emotional connections and passion."
    },
    headLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your head line reveals strong analytical thinking and creative problem-solving abilities."
    },
    fateLinePresent: Math.random() > 0.3,
    past: {
      prediction: "Your past shows a journey of growth through challenges. The experiences you've had have shaped your resilience and determination.",
      significance: Math.floor(Math.random() * 30) + 70
    },
    present: {
      prediction: "In the present, you're navigating a period of transformation. Your adaptability is your greatest strength during this time.",
      significance: Math.floor(Math.random() * 30) + 70
    },
    future: {
      prediction: "Your future path indicates opportunities for success in creative endeavors. Trust your intuition to guide your decisions.",
      significance: Math.floor(Math.random() * 30) + 70
    },
    overallSummary: "Your palm reveals balance between emotion and intellect, with potential for growth in creative endeavors.",
    personalityTraits: [
      "Empathetic",
      "Analytical",
      "Creative",
      "Resilient",
      "Adaptable"
    ]
  };
}

export default PalmAnalysisService.getInstance();
