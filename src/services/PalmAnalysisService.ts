
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
      prediction: "The depth and quality of your life line reveals remarkable vitality and resilience. The clear, unbroken path it traces around your thumb's mount indicates exceptional recuperative abilities and adaptability in the face of challenges. The small supportive lines branching toward your life line suggest periods where support systems have strengthened your inherent resilience. The slight variations in depth along your life line's path show natural cycles of energy that, when honored, enhance your overall wellbeing and longevity.",
      insights: [
        "Your physical stamina recovers rapidly after periods of stress or exertion",
        "You have an intuitive sense of when to conserve versus expend energy",
        "Your health responds strongly to preventative rather than reactive approaches",
        "The connection between your mental and physical wellbeing is particularly pronounced"
      ]
    },
    heartLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your heart line reveals exceptional emotional intelligence and capacity for deep connection. The smooth, clearly defined curve extending toward your Jupiter mount indicates authentic emotional expression balanced with discernment. The depth of your heart line suggests you experience emotions with intensity while maintaining perspective. The subtle branches at the end of your heart line indicate meaningful relationships that have profoundly shaped your emotional landscape. The quality of connection between your heart and head lines reveals natural integration of feeling and thinking that allows for both passionate engagement and thoughtful response.",
      insights: [
        "You naturally create emotional safety that allows others to be authentic around you",
        "Your capacity for emotional self-regulation has developed through intentional practice",
        "You perceive emotional nuances that others often miss",
        "Your relationships deepen rather than diminish through navigating conflict"
      ]
    },
    headLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your head line demonstrates remarkable mental agility paired with uncommon depth of thought. The length traversing across your palm indicates comprehensive thinking that considers multiple perspectives. The slight curve suggests creative intelligence that balances analytical thinking with intuitive insight. The clarity and definition throughout your head line indicates mental focus that allows sustained concentration. The subtle variations in depth along your head line show your ability to shift between different thinking modes as situations require – from analytical problem-solving to creative ideation to practical implementation.",
      insights: [
        "You naturally recognize patterns and connections between seemingly unrelated concepts",
        "Your mental energy is sustained longest when engaged with complex, meaningful problems",
        "You have an unusual ability to shift perspectives to understand different viewpoints",
        "Your mental clarity remains accessible even during emotional intensity"
      ]
    },
    fateLinePresent: Math.random() > 0.3,
    fate: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your fate line shows exceptional clarity and definition, indicating a life guided by clear purpose and direction. The straight, unbroken quality of your fate line suggests consistency of effort that builds meaningful momentum over time. The depth particularly evident in the middle section indicates current work that aligns with your authentic strengths and values. The supportive lines connecting to your fate line reveal collaborative relationships that enhance your effectiveness and reach. The way your fate line connects to your life line indicates natural integration between your career and personal fulfillment – your work nourishes rather than depletes your vitality.",
      insights: [
        "You naturally align with opportunities that utilize your unique combination of strengths",
        "Your professional impact extends beyond obvious metrics through subtle ripple effects",
        "You find creative solutions to obstacles that would deter others from their path",
        "Your sense of purpose provides resilience during challenging professional periods"
      ]
    },
    past: {
      prediction: "Your palm's lower region reveals a past marked by significant transformation experiences that have shaped your core resilience. The deepening of your life line in its early section indicates foundational experiences that required and developed your adaptability. The initial connection between your head and life lines suggests early intellectual curiosity that has continued to expand your perspective. The formative influence of your heart line's beginning shows emotional experiences that have developed your capacity for authenticity and empathy. The subtle markings near your wrist show inherited tendencies that you've consciously evolved beyond, creating new patterns rather than repeating unconscious cycles.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "Early challenges catalyzed unusual resilience that now serves all areas of your life",
        "A pivotal relationship reframed your understanding of authentic connection",
        "Educational experiences sparked intellectual curiosity that continues to expand",
        "A period of questioning established values that ultimately strengthened your core convictions"
      ]
    },
    present: {
      prediction: "The central region of your palm shows a present moment characterized by integration of different aspects of your experience into a more cohesive whole. The current intersection of your heart and head lines indicates emotional wisdom informing practical decisions. The prominence of your fate line at its middle section suggests professional momentum building toward significant achievement. The supportive lines surrounding your main lines in this region show a strong current support system that amplifies your effectiveness. The clarity in your palm's center indicates present mental clarity that allows you to recognize and seize appropriate opportunities. The balanced proportion between different areas of your palm suggests current harmony between various life domains – work, relationships, health, and personal growth.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "Your current intuitive guidance is particularly accurate when heeded promptly",
        "Present circumstances are developing your capacity to maintain calm amid intensity",
        "Current relationships are reflecting your authentic self-expression back to you",
        "This period is building skills that will prove essential in your future path"
      ]
    },
    future: {
      prediction: "The upper region of your palm reveals a future characterized by expanding influence and integration of your unique gifts. The extension of your head line suggests intellectual pursuits that will bring both satisfaction and recognition. The way your heart line curves toward your fingers indicates emotional fulfillment through authentic connection and creative expression. The upward trajectory of your fate line points to professional opportunities that align with your core values and strengths. The supportive lines in the upper region of your palm suggest collaborative relationships that will enhance your effectiveness and reach. The overall clarity in this region indicates future decisions guided by wisdom gained through present experiences.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "An unexpected opportunity will align perfectly with your preparation and interests",
        "Your capacity to integrate different knowledge areas will create unique contributions",
        "A meaningful mentorship will accelerate your development in a key area",
        "Your future includes a period of recognition after sustained, focused effort"
      ]
    },
    relationships: {
      prediction: "The formation of your heart line reveals a relationship approach characterized by emotional depth, authenticity, and discernment. The smoothness and clarity indicate emotional stability that allows you to remain present during relational intensity. The upward curve suggests inherent optimism in how you view and engage with others. The well-defined mount beneath your little finger indicates sensitivity that allows you to perceive subtle emotional nuances. The connection between your heart and head lines shows integration of feeling and thinking that creates relational wisdom. The supportive lines near your heart line suggest meaningful connections that form a strong interpersonal foundation. The overall pattern reveals evolution toward increasing authenticity and mutual growth in your significant relationships.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "You naturally create spaces where authentic connection can flourish",
        "Your relationships increasingly reflect and support your core values",
        "You maintain healthy boundaries while creating deep connection",
        "Your relationship patterns show conscious evolution rather than unconscious repetition"
      ]
    },
    career: {
      prediction: "Your fate line reveals exceptional professional potential characterized by purpose-driven contribution and strategic influence. The clarity and directness suggest consistency of effort that builds meaningful momentum over time. The depth particularly evident in the middle section indicates current work that aligns with your authentic strengths and values. The positioning of your fate line in relation to your other main lines suggests work that increasingly integrates different aspects of your abilities rather than compartmentalizing your talents. The supportive lines connecting to your fate line reveal collaborative relationships that enhance your effectiveness and reach. The overall quality suggests evolution toward work that creates lasting impact aligned with your deepest values.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "Your strategic thinking abilities will become increasingly valuable in your field",
        "You naturally excel in roles requiring both analytical and interpersonal skills",
        "Your work will increasingly align with your authentic purpose",
        "You're developing a unique professional approach that draws on multiple disciplines"
      ]
    },
    health: {
      prediction: "The formation of your life line indicates exceptional vitality with natural cycles of energy that, when honored, support optimal wellbeing. The clarity and depth suggest strong recuperative abilities and fundamental resilience. The supportive lines near your life line indicate effective energy management and recovery systems. The minimal breaks or islands suggest few major health disruptions, with periods of lower energy serving as necessary recalibration rather than depletion. The connection between your head and life lines reveals the significant influence of your mental state on your physical wellbeing. The overall pattern suggests health that responds strongly to preventative practices, consistent small habits, and alignment between your daily activities and deeper values.",
      significance: Math.floor(Math.random() * 30) + 70,
      insights: [
        "Your body shows unusual responsiveness to mind-body integration practices",
        "Your natural health rhythms align with seasonal changes",
        "Small, consistent health practices yield stronger results than intensive but inconsistent approaches",
        "Your physical wellbeing is particularly influenced by your sense of purpose and meaning"
      ]
    },
    elementalInfluences: {
      earth: Math.floor(Math.random() * 30) + 70,
      water: Math.floor(Math.random() * 30) + 70,
      fire: Math.floor(Math.random() * 30) + 70,
      air: Math.floor(Math.random() * 30) + 70,
      description: "The elemental composition of your palm reveals a fascinating and rare balance. The substantial earth influence is evident in the firm texture and practical grounding of your palm, providing stability and persistence. This earth energy manifests in your natural ability to create tangible results from abstract ideas. The water element flows strongly through the fluidity of your heart line and the emotional sensitivity revealed in the mount of the moon, giving you intuitive depth and emotional intelligence that allows you to connect authentically with others. The fire element burns clearly in the distinct fate line and the animated quality of your hand movements, fueling your passion, creativity, and capacity to inspire others. The air element sweeps through your well-developed fingers and the clarity of your head line, enhancing your intellectual agility and communication skills. What makes your palm particularly unique is not just the strength of each element but their harmonious integration. The balanced proportion between your palm and fingers indicates you naturally draw on different elemental strengths as needed without becoming overly dominated by any single element. This elemental versatility explains your ability to adapt to different environments while maintaining your essential nature, and suggests you often serve as a bridge between different types of people and perspectives."
    },
    overallSummary: "Your palm reveals an exceptional integration of intellect, emotion, and purpose that creates remarkable potential for both personal fulfillment and meaningful contribution. The harmonious relationship between your head and heart lines indicates natural balance between analytical thinking and emotional intelligence. The depth and clarity of your life line shows fundamental vitality and resilience that allows you to transform challenges into growth. Your fate line suggests purpose-driven work that aligns with your authentic strengths and values. The supportive minor lines throughout your palm indicate a natural ability to build meaningful connections that enhance all areas of your life. The distinctive formation where your heart line extends toward your Jupiter mount reveals idealism tempered by practical wisdom. The connection patterns between your main lines show unusual capacity for integrating different aspects of life rather than compartmentalizing. The overall proportion and spacing of your palm's features suggest adaptability paired with persistence – you maintain core direction while adjusting tactics as needed. The coming period appears particularly significant for integration of disparate skills and experiences into a cohesive whole, suggesting a time of both consolidation and expansion.",
    personalityTraits: [
      "Empathetic yet discerning",
      "Analytically creative",
      "Resilient under pressure",
      "Intuitively strategic",
      "Authentically diplomatic",
      "Thoughtfully expressive",
      "Adaptively persistent"
    ]
  };
}

export default PalmAnalysisService.getInstance();
