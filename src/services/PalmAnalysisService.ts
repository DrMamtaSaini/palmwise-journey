
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
      insights?: string[];
    };
    heartLine: {
      strength: number;
      prediction: string;
      insights?: string[];
    };
    headLine: {
      strength: number;
      prediction: string;
      insights?: string[];
    };
    fateLinePresent: boolean;
    fate?: {
      strength: number;
      prediction: string;
      insights?: string[];
    };
    past?: {
      prediction: string;
      significance: number;
      insights?: string[];
    };
    present?: {
      prediction: string;
      significance: number;
      insights?: string[];
    };
    future?: {
      prediction: string;
      significance: number;
      insights?: string[];
    };
    relationships?: {
      prediction: string;
      significance: number;
      insights?: string[];
    };
    career?: {
      prediction: string;
      significance: number;
      insights?: string[];
    };
    health?: {
      prediction: string;
      significance: number;
      insights?: string[];
    };
    elementalInfluences?: {
      earth: number;
      water: number;
      fire: number;
      air: number;
      description: string;
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
      prediction: "Your life line indicates a long and healthy life, with challenges that you will overcome.",
      insights: [
        "You have strong recuperative abilities",
        "Your energy levels tend to remain consistent",
        "You approach challenges with practical solutions",
        "You value preventative health measures"
      ]
    },
    heartLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your heart line shows a capacity for deep emotional connections and passion.",
      insights: [
        "You value authenticity in relationships",
        "You process emotions thoughtfully before reacting",
        "You have a strong capacity for empathy",
        "You maintain healthy boundaries in relationships"
      ]
    },
    headLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your head line reveals strong analytical thinking and creative problem-solving abilities.",
      insights: [
        "You consider multiple angles before making decisions",
        "You learn best through practical application",
        "You communicate complex ideas effectively",
        "You balance logic with intuition"
      ]
    },
    fateLinePresent: Math.random() > 0.3,
    fate: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your fate line indicates a strong sense of purpose and direction in your life path.",
      insights: [
        "You find meaning in your work beyond material rewards",
        "You naturally gravitate toward roles that utilize your strengths",
        "You make decisions that align with your long-term vision",
        "You adapt to changing circumstances while maintaining your core direction"
      ]
    },
    past: {
      prediction: "Your past shows a journey of growth through challenges. The experiences you've had have shaped your resilience and determination.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "A challenging early experience developed your problem-solving abilities",
        "You've transformed setbacks into valuable learning",
        "Relationships from your past continue to influence your approach today",
        "Your adaptability was developed through necessity"
      ]
    },
    present: {
      prediction: "In the present, you're navigating a period of transformation. Your adaptability is your greatest strength during this time.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "You're currently in a phase of gathering information for future decisions",
        "Your relationship dynamics are shifting in positive ways",
        "You're developing a new perspective that will benefit your future",
        "Current challenges are developing valuable new skills"
      ]
    },
    future: {
      prediction: "Your future path indicates opportunities for success in creative endeavors. Trust your intuition to guide your decisions.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "An upcoming opportunity will match your unique combination of skills",
        "Your ability to connect disparate ideas will lead to innovation",
        "A period of focused effort will yield significant results",
        "Maintaining flexibility while pursuing goals will be key"
      ]
    },
    relationships: {
      prediction: "Your relationship patterns show a movement toward deeper, more authentic connections. You value quality over quantity in your social circle.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "You communicate most effectively through thoughtful conversation",
        "You naturally cultivate relationships that encourage growth",
        "Your relationship expectations have evolved through experience",
        "You balance independence with deep connection"
      ]
    },
    career: {
      prediction: "Your career trajectory suggests leadership potential and the ability to innovate within your field. You're drawn to work that aligns with your values.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "You excel in roles requiring both analytical and interpersonal skills",
        "Your capacity for seeing the big picture is a professional asset",
        "You find fulfillment in mentoring others",
        "Your career path may take unexpected but rewarding turns"
      ]
    },
    health: {
      prediction: "Your health patterns indicate good fundamental vitality with potential for improvement through mindful practices. Balance is key to your wellbeing.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "Your body responds particularly well to consistent routines",
        "Mental and emotional balance significantly impacts your physical health",
        "You benefit from alternating between different types of activities",
        "Preventative health measures yield strong results for you"
      ]
    },
    elementalInfluences: {
      earth: Math.floor(Math.random() * 30) + 70,
      water: Math.floor(Math.random() * 30) + 70,
      fire: Math.floor(Math.random() * 30) + 70,
      air: Math.floor(Math.random() * 30) + 70,
      description: "Your palm shows a balanced elemental composition with slightly stronger water (emotional) and air (intellectual) influences. This creates a harmonious blend of intuition and analysis in your approach to life."
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
