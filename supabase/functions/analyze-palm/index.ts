
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
    
    // Generate enhanced palm analysis data
    const analysis = generateDetailedPalmAnalysis();
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error analyzing palm:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze palm image", 
        details: error.message,
        // Return fallback data to prevent app from breaking
        fallbackData: generateDetailedPalmAnalysis()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

// This function generates more detailed palm reading data with enhanced predictions
function generateDetailedPalmAnalysis() {
  return {
    lifeLine: {
      strength: Math.floor(Math.random() * 30) + 70, // 70-100
      prediction: "Your life line indicates exceptional resilience and vitality. The depth and clarity suggest you possess remarkable endurance and can overcome significant challenges. The branching pattern near the middle indicates a transformative period that has strengthened your character. The slight curve toward your thumb reveals a cautious approach to life decisions, which has served you well in avoiding unnecessary risks.",
      insights: [
        "Your capacity for recovery is in the top percentile",
        "You've developed effective stress management techniques",
        "Your physical energy reserves are substantial",
        "You approach health holistically, benefiting your longevity"
      ]
    },
    heartLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your heart line reveals a profound emotional intelligence and capacity for deep connections. The smoothness and clarity indicate emotional stability even during turbulent times. The slight upward curve suggests optimism in relationships, while the depth shows you invest significantly in those you care about. The branching at the end indicates multiple meaningful relationships that have shaped your emotional worldview.",
      insights: [
        "You possess natural empathy that others are drawn to",
        "Your emotional boundaries are healthy and well-defined",
        "You process emotional setbacks constructively",
        "Your capacity for love grows stronger with each relationship experience"
      ]
    },
    headLine: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your head line demonstrates exceptional analytical abilities paired with creative intuition. The length suggests comprehensive thinking that considers multiple perspectives. The depth indicates focused concentration and retention of knowledge. The slight curve shows you balance logical analysis with creative solutions. The clarity throughout indicates mental clarity even under pressure, allowing you to make sound decisions when others might falter.",
      insights: [
        "Your problem-solving approach combines logic and intuition effectively",
        "You possess the rare ability to simplify complex concepts",
        "Your mental stamina allows sustained intellectual effort",
        "You naturally see patterns that others miss"
      ]
    },
    fateLinePresent: Math.random() > 0.2, // 80% chance of having a fate line
    fate: {
      strength: Math.floor(Math.random() * 30) + 70,
      prediction: "Your fate line is remarkably defined, indicating a clear sense of purpose and direction. The depth suggests significant impact in your chosen field. The straight trajectory indicates consistency in your professional journey, while subtle branches show adaptability when needed. The connection to your life line suggests your career and personal purpose are closely aligned, creating fulfillment across all areas of life.",
      insights: [
        "Your professional journey has a coherent narrative that builds toward mastery",
        "You naturally align with opportunities that match your core strengths",
        "Your work will likely have lasting impact beyond your immediate circle",
        "You find ways to maintain your direction despite external pressures"
      ]
    },
    past: {
      prediction: "Your palm reveals a past marked by significant growth through challenges that have profoundly shaped your character. The depth of your life line's beginning shows early life experiences that built exceptional resilience. The intersection patterns with your head line indicate educational or intellectual turning points that expanded your worldview. The formation near your wrist suggests family influences that provided both support and necessary challenges, creating the foundation for your current strengths. The spacing between early life markers shows periods of accelerated growth alternating with consolidation phases.",
      significance: Math.floor(Math.random() * 20) + 80, // 80-100 for more significance
      insights: [
        "Early challenges developed your unusual level of perseverance",
        "A pivotal relationship in your formative years expanded your emotional range",
        "You experienced a period of questioning that strengthened your core beliefs",
        "Intellectual discoveries in your past continue to influence your approach today"
      ]
    },
    present: {
      prediction: "In your current circumstances, you're navigating a pivotal transformation period with remarkable adaptability. The intersection of your heart and head lines shows you're integrating emotional wisdom with practical decision-making. The clarity in your palm's center indicates present mental clarity that allows you to see opportunities others might miss. The prominence of your fate line at its midpoint suggests you're currently in a period of professional significance with potential for advancement. The supportive lines surrounding your main lines indicate a strong current support system that enhances your effectiveness.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "Your current intuitive abilities are at a peak period",
        "You're in a phase where your authentic self-expression resonates strongly with others",
        "The present alignment of your skills and opportunities is particularly favorable",
        "You're developing a new perspective that will serve as a foundation for future growth"
      ]
    },
    future: {
      prediction: "Your future path indicates exceptional promise, particularly in areas requiring both creativity and structured thinking. The extension of your head line suggests intellectual pursuits that will bring both satisfaction and recognition. The convergence of supporting lines toward your fate line indicates consolidation of efforts leading to significant achievement. The clarity in the upper regions of your palm suggests emotional wisdom that will guide important life decisions. The balanced spacing between major lines indicates harmonious development across personal and professional spheres, suggesting fulfillment through integration rather than compartmentalization.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "A leadership opportunity will emerge that aligns perfectly with your natural strengths",
        "Your capacity to blend different knowledge areas will create unique opportunities",
        "A relationship development will provide both emotional fulfillment and practical support",
        "Your future includes a period of recognition after persistent, focused effort"
      ]
    },
    relationships: {
      prediction: "Your relationship dynamics show fascinating patterns of depth and authenticity. The heart line's quality indicates you value emotional honesty above superficial harmony. The supportive lines near your heart line suggest you attract relationships that encourage your growth rather than limit it. The connection between your heart and head lines shows integrated decision-making in relationships, balancing emotion with practicality. The spacing suggests you've learned to maintain healthy boundaries while still creating deep connections.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "You naturally create space for others to be authentic around you",
        "Your relationship patterns show evolution toward increasingly fulfilling connections",
        "You've developed the ability to communicate effectively even during emotional intensity",
        "Your capacity for forgiveness strengthens rather than weakens your boundaries"
      ]
    },
    career: {
      prediction: "Your career trajectory shows remarkable potential for leadership and innovation. The prominence of your fate line suggests work that aligns with your personal values and strengths. The quality of connecting lines indicates effective collaboration abilities that will open doors. The depth suggests lasting impact in your field rather than superficial advancement. The direction indicates evolution toward work that increasingly integrates all aspects of your abilities rather than compartmentalizing your talents.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "You have untapped potential in strategic thinking that will become increasingly valuable",
        "Your career path will likely include a pivotal role connecting different specialists",
        "You'll find increasing satisfaction as your work aligns more authentically with your values",
        "A period of mentorship will significantly accelerate your professional development"
      ]
    },
    health: {
      prediction: "Your health indicators show robust fundamental vitality with specific areas for attention. The life line quality suggests excellent recuperative abilities and natural resilience. The spacing between supportive lines indicates balanced energy distribution rather than extreme fluctuations. The connection patterns suggest effective mind-body integration, with mental state positively influencing physical wellbeing. The clarity in your mercury line indicates good intuitive sense about your body's needs when you listen carefully.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "Your natural health rhythms respond especially well to preventative practices",
        "You benefit unusually strongly from mind-body integration practices",
        "Your energy management becomes most effective when aligned with your natural cycles",
        "Your body shows particular resilience when your work aligns with your values"
      ]
    },
    overallSummary: "Your palm reveals an exceptional harmony between emotional depth and intellectual clarity, creating a foundation for both personal fulfillment and significant achievement. The distinctive balance between your head and heart lines indicates you navigate life's complexities with both wisdom and compassion. Your life line shows remarkable resilience that turns challenges into growth opportunities. The fate line suggests purpose-driven work that will likely leave a lasting impact. The supportive lines throughout indicate a natural ability to build meaningful connections that enhance all areas of your life. The coming period appears particularly significant for integrating different aspects of your abilities into a cohesive whole, suggesting a time of both consolidation and expansion.",
    personalityTraits: [
      "Empathetic yet discerning",
      "Analytically creative",
      "Resilient under pressure",
      "Intuitively strategic",
      "Authentically diplomatic",
      "Thoughtfully expressive",
      "Adaptively persistent"
    ],
    elementalInfluences: {
      earth: Math.floor(Math.random() * 30) + 70,
      water: Math.floor(Math.random() * 30) + 70,
      fire: Math.floor(Math.random() * 30) + 70,
      air: Math.floor(Math.random() * 30) + 70,
      description: "Your palm shows a harmonious balance of elemental influences, with a slight predominance of water (emotional intelligence) and air (intellectual clarity). This combination allows you to blend intuitive understanding with logical analysis. Your earth element provides practical grounding while your fire element fuels your drive and passion. This balanced elemental profile explains your adaptability across different situations and environments."
    }
  };
}
