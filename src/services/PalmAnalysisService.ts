
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

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
      // In a real implementation, this would call your AI service API
      // For now, we'll simulate an analysis with mock data
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock palm reading result
      const reading: PalmReading = {
        id: Math.random().toString(36).substring(2, 15),
        userId,
        imageUrl,
        createdAt: new Date().toISOString(),
        results: {
          lifeLine: {
            strength: Math.random() * 100,
            prediction: "Your life line indicates a long and healthy life. You will face challenges in your mid-30s but overcome them with resilience.",
          },
          heartLine: {
            strength: Math.random() * 100,
            prediction: "Your heart line shows deep capacity for love and emotional connections. You may experience a significant romantic relationship in the near future.",
          },
          headLine: {
            strength: Math.random() * 100,
            prediction: "Your head line indicates strong analytical thinking and creativity. You have potential for success in academic or intellectual pursuits.",
          },
          fateLinePresent: Math.random() > 0.3,
          overallSummary: "Your palm reveals a balanced individual with strong potential for personal and professional growth. Focus on developing your natural talents and remain open to new opportunities.",
          personalityTraits: [
            "Empathetic",
            "Analytical",
            "Creative",
            "Resilient",
            "Adaptable"
          ]
        }
      };
      
      // Add fate line data if present
      if (reading.results.fateLinePresent) {
        reading.results.fate = {
          strength: Math.random() * 100,
          prediction: "Your fate line suggests a strong career trajectory with potential for leadership roles. A significant opportunity may arise within the next year."
        };
      }
      
      // Save to Supabase database
      const { error } = await supabase
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
        
      if (error) {
        console.error('Error saving reading to database:', error);
      }
      
      toast.success('Palm analysis complete', {
        description: 'Your palm reading is ready to view.',
      });
      
      return reading;
    } catch (error) {
      console.error('Palm analysis error:', error);
      
      toast.error('Analysis failed', {
        description: 'There was a problem analyzing your palm. Please try again.',
      });
      
      throw error;
    }
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
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        imageUrl: item.image_url,
        createdAt: item.created_at,
        results: item.results
      }));
    } catch (error) {
      console.error('Get palm readings error:', error);
      return [];
    }
  }

  public async getPalmReading(id: string): Promise<PalmReading | null> {
    try {
      const { data, error } = await supabase
        .from('palm_readings')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
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

export default PalmAnalysisService.getInstance();
