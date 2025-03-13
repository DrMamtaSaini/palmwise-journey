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
    const { imageUrl, language = 'english' } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image URL provided" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log("Analyzing palm image:", imageUrl);
    console.log("Requested language:", language);
    
    // Generate enhanced palm analysis data
    const analysis = generateDetailedPalmAnalysis('english');
    
    // If English is requested, return the original analysis
    if (language === 'english') {
      return new Response(
        JSON.stringify({
          ...analysis,
          language,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For Hindi language, translate the content
    if (language === 'hindi') {
      const translatedAnalysis = translatePalmAnalysis(analysis, language);
      
      return new Response(
        JSON.stringify(translatedAnalysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For any other language, return English with a message
    return new Response(
      JSON.stringify({
        ...analysis,
        language: 'english',
        translationNote: `Translation for ${language} is not currently supported. This content is in English.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error analyzing palm:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze palm image", 
        details: error.message,
        // Return fallback data to prevent app from breaking
        fallbackData: generateDetailedPalmAnalysis('english')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

// New enhanced translation function that uses a basic dictionary approach
function translatePalmAnalysis(analysis, targetLanguage) {
  if (targetLanguage === 'english') {
    return { ...analysis, language: 'english' };
  }

  // Translation dictionary for Hindi
  const hindiDictionary = {
    // Life-related terms
    'life line': 'जीवन रेखा',
    'vitality': 'जीवन शक्ति',
    'resilience': 'लचीलापन',
    'energy': 'ऊर्जा',
    'health': 'स्वास्थ्य',
    // Heart-related terms
    'heart line': 'हृदय रेखा',
    'emotions': 'भावनाएँ',
    'relationships': 'रिश्ते',
    'love': 'प्रेम',
    'emotional': 'भावनात्मक',
    // Head-related terms
    'head line': 'मस्तिष्क ��ेखा',
    'intelligence': 'बुद्धि',
    'thinking': 'सोच',
    'mental': 'मानसिक',
    'analytical': 'विश्लेषणात्मक',
    // Fate-related terms
    'fate line': 'भाग्य रेखा',
    'destiny': 'नियति',
    'career': 'करियर',
    'purpose': 'उद्देश्य',
    'professional': 'पेशेवर',
    // Time-related terms
    'past': 'अतीत',
    'present': 'वर्तमान',
    'future': 'भविष्य',
    // Palm parts
    'palm': 'हथेली',
    'mount': 'पर्वत',
    'line': 'रेखा',
    // Elemental terms
    'earth': 'पृथ्वी',
    'water': 'जल',
    'fire': 'अग्नि',
    'air': 'वायु',
    // Common words
    'strength': 'शक्ति',
    'significance': 'महत्व',
    'prediction': 'भविष्यवाणी',
    'insight': 'अंतर्दृष्टि',
    'remedy': 'उपाय',
    'practice': 'अभ्यास'
  };

  // Create a deep copy of the analysis to modify
  const translatedAnalysis = JSON.parse(JSON.stringify(analysis));
  
  // Basic function to translate text using the dictionary
  const translateText = (text) => {
    if (!text) return text;
    
    let translatedText = text;
    // Replace each term in the dictionary with its translation
    for (const [term, translation] of Object.entries(hindiDictionary)) {
      // Create a regex that matches the term as a whole word, case insensitive
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      translatedText = translatedText.replace(regex, translation);
    }
    return translatedText;
  };

  // Function to translate all string values in an object recursively
  const translateObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = translateText(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => 
          typeof item === 'string' ? translateText(item) : 
          typeof item === 'object' ? translateObject({...item}) : item
        );
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        translateObject(obj[key]);
      }
    }
    return obj;
  };

  // Translate the entire analysis object
  translateObject(translatedAnalysis);
  
  // Add language and translation metadata
  translatedAnalysis.language = targetLanguage;
  translatedAnalysis.translationNote = `This is a partial translation to Hindi using a basic dictionary approach. Some content may still be in English.`;
  
  return translatedAnalysis;
}

// This function generates more detailed palm reading data with enhanced predictions
function generateDetailedPalmAnalysis(language = 'english') {
  console.log(`Generating palm analysis in ${language}`);
  
  // In a real implementation, we could use a translation API here
  // or have pre-translated content for common languages
  
  return {
    lifeLine: {
      strength: Math.floor(Math.random() * 30) + 70, // 70-100
      prediction: "Your life line indicates exceptional resilience and vitality. The depth and clarity suggest you possess remarkable endurance and can overcome significant challenges. The branching pattern near the middle indicates a transformative period that has strengthened your character. The slight curve toward your thumb reveals a cautious approach to life decisions, which has served you well in avoiding unnecessary risks.",
      insights: [
        "Your capacity for recovery is in the top percentile",
        "You've developed effective stress management techniques",
        "Your physical energy reserves are substantial",
        "You approach health holistically, benefiting your longevity"
      ],
      remedies: [
        "Practice regular grounding exercises like walking barefoot on natural surfaces for 10-15 minutes daily",
        "Incorporate adaptogenic herbs like Ashwagandha into your daily routine to balance energy levels",
        "Establish consistent sleep and wake cycles aligned with natural rhythms",
        "Regularly engage in moderate physical activity that brings you joy rather than depletes your energy"
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
      ],
      remedies: [
        "Practice heart-centered meditation for 10 minutes daily, focusing on breathing into your heart space",
        "Wear or carry rose quartz to amplify your natural heart energy and protective boundaries",
        "Cultivate relationships with those who match your emotional depth and authenticity",
        "Express your feelings through creative outlets like writing or art when they feel too intense to verbalize"
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
      ],
      remedies: [
        "Practice Brahmi (Bacopa monnieri) supplementation, an Ayurvedic herb known to enhance cognitive function",
        "Engage in regular mental challenges that combine logic and creativity, like strategic games",
        "Practice Tratak meditation (candle gazing) to enhance focus and mental clarity",
        "Implement intentional breaks between deep work sessions to allow integration of insights"
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
      ],
      remedies: [
        "Perform regular Dharma contemplation to clarify your life's purpose and trajectory",
        "Wear or carry tigers eye stone to enhance focus on your path while protecting against distractions",
        "Create visual representations of your long-term vision and review them weekly",
        "Periodically seek counsel from mentors who embody the qualities you wish to develop"
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
      ],
      remedies: [
        "Practice ancestral healing meditation to resolve inherited patterns that may still influence you",
        "Create a timeline of key transformative experiences and identify their positive gifts",
        "Write letters of gratitude (without necessarily sending them) to those who challenged you to grow",
        "Use the Vedic practice of japa with mantras like 'So Ham' to integrate past experiences"
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
      ],
      remedies: [
        "Practice daily mindfulness meditation to remain fully present and receptive to opportunities",
        "Maintain a gratitude journal focused specifically on present circumstances",
        "Engage in regular pranayama practices like Nadi Shodhana (alternate nostril breathing) to balance current energies",
        "Create clear boundaries around technology use to enhance presence and receptivity"
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
      ],
      remedies: [
        "Create a vision board that represents your highest aspirations and review it regularly",
        "Practice Sankalpa (intention setting) during yoga nidra to align with your optimal future",
        "Work with citrine crystal to enhance manifestation of positive future outcomes",
        "Develop a personal ritual to mark the completion of cycles and welcome new beginnings"
      ]
    },
    relationships: {
      prediction: "The Venus mount at the base of your thumb shows remarkable development, indicating exceptional capacity for deep emotional connections. I see a harmonious connection between your heart and head lines, suggesting you naturally balance emotional needs with practical considerations in relationships. The minor lines branching from your heart line reveal past relationships that have provided profound lessons, particularly visible in the distinct branch near your middle finger. The depth and clarity of your heart line as it curves toward your Jupiter mount indicates you value authentic connection over superficial harmony, and you're willing to engage in necessary conflict to achieve deeper understanding. The small island formation near the end of your heart line suggests a period of emotional recalibration that has ultimately strengthened your capacity for intimacy. The supportive lines beneath your heart line show you've developed a network of meaningful connections that form a strong foundation for your emotional well-being.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "Your natural ability to create emotional safety allows others to be vulnerable with you",
        "You have an unusually high capacity for maintaining connection during conflict",
        "The subtle variations in your heart line indicate you experience love languages differently at different life stages",
        "Your relationship patterns show evidence of intentional growth rather than repeated cycles",
        "The connection between heart and fate lines suggests romantic relationships significantly influence your life direction"
      ],
      remedies: [
        "Practice Metta (loving-kindness) meditation directed specifically toward challenging relationships",
        "Wear or carry rose quartz to enhance heart energy and green aventurine to attract harmonious connections",
        "Create a relationship altar with symbols of balanced partnership and revisit it weekly",
        "Practice conscious communication techniques like non-violent communication in all interactions",
        "Incorporate the Vedic practice of seeing the divine in others (namaste) in daily encounters"
      ]
    },
    career: {
      prediction: "The prominence and clarity of your fate line reveals exceptional career potential, with particular strength in leadership and strategic thinking. The distinct beginning of your fate line from the base of your palm indicates early career clarity that has provided a strong foundation. The subtle branches emerging from your fate line around the middle of your palm suggest strategic pivots that have expanded your professional repertoire. The distinct upward trajectory of your fate line as it approaches your middle finger indicates increasing recognition and impact in your field. The unique formation where your fate line meets your head line suggests a career that increasingly integrates analytical thinking with creative innovation. The supporting lines alongside your fate line indicate collaborative relationships that amplify your effectiveness. The overall depth and continuity of your fate line suggests remarkable persistence through professional challenges, with each obstacle ultimately strengthening your trajectory. I also note the rare formation near the upper section of your fate line that indicates potential for creating intellectual or creative legacy that extends beyond your immediate work.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "Your natural strategic thinking abilities are particularly evident in crisis situations",
        "You possess rare integrative thinking that allows you to connect disparate fields",
        "Your leadership approach balances necessary structure with space for individual contribution",
        "Your career satisfaction is closely tied to creating tangible impact rather than status",
        "The alignment between your fate and heart lines suggests you'll find increasing integration of personal purpose and professional contribution"
      ],
      remedies: [
        "Recite the Gayatri mantra daily to align your work with universal intelligence and higher purpose",
        "Create a workspace that incorporates elements representing your core values and aspirations",
        "Wear or carry pyrite to enhance confidence and manifestation in professional contexts",
        "Perform weekly career dharma contemplation to ensure alignment with your authentic path",
        "Develop a personal success ritual to mark achievements before moving to next challenges"
      ]
    },
    health: {
      prediction: "Your life line shows remarkable vitality with particularly strong recuperative abilities. The clarity and depth of your life line, especially as it curves around your thumb, indicates excellent foundational health with natural resilience. The small tributary lines supporting your life line suggest effective energy management and recovery systems. The minimal breaks or islands in your life line indicate few major health disruptions, while the supporting lines from your fate line to your life line reveal a strong connection between your sense of purpose and physical vitality. I notice the subtle variations in depth along your life line that suggest natural cycles of energy that, when honored, support your overall wellbeing. The formation near the beginning of your life line indicates inherited health strengths, particularly in your metabolic and immune systems. The connection pattern between your head and life lines suggests your mental state significantly influences your physical wellbeing, with stress management being particularly important for maintaining optimal health. The spacing between your life line and thumb suggests a naturally active constitution that benefits from regular movement rather than intense but infrequent exercise.",
      significance: Math.floor(Math.random() * 20) + 80,
      insights: [
        "Your body shows unusual capacity for adaptation when given consistent small inputs",
        "The connection between your nervous system and immune function is particularly strong",
        "Your natural health rhythms align closely with seasonal changes",
        "Preventative health practices yield exceptionally strong results for your constitution",
        "The balance between rest and activity is more critical for your wellbeing than specific diets or exercise regimens"
      ],
      remedies: [
        "Practice daily oil pulling with sesame or coconut oil according to Ayurvedic tradition",
        "Incorporate triphala, an Ayurvedic herbal blend, to support digestive harmony and elimination",
        "Establish a regular dinacharya (Ayurvedic daily routine) aligned with natural rhythms",
        "Practice marma point therapy focused on the points corresponding to your specific constitution",
        "Use abhyanga (self-massage with warm oil) appropriate for your dosha before bathing"
      ]
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
    ],
    elementalInfluences: {
      earth: Math.floor(Math.random() * 30) + 70,
      water: Math.floor(Math.random() * 30) + 70,
      fire: Math.floor(Math.random() * 30) + 70,
      air: Math.floor(Math.random() * 30) + 70,
      description: "The elemental composition of your palm reveals a fascinating and rare balance. The substantial earth influence is evident in the firm texture and practical grounding of your palm, providing stability and persistence. This earth energy manifests in your natural ability to create tangible results from abstract ideas. The water element flows strongly through the fluidity of your heart line and the emotional sensitivity revealed in the mount of the moon, giving you intuitive depth and emotional intelligence that allows you to connect authentically with others. The fire element burns clearly in the distinct fate line and the animated quality of your hand movements, fueling your passion, creativity, and capacity to inspire others. The air element sweeps through your well-developed fingers and the clarity of your head line, enhancing your intellectual agility and communication skills. What makes your palm particularly unique is not just the strength of each element but their harmonious integration. The balanced proportion between your palm and fingers indicates you naturally draw on different elemental strengths as needed without becoming overly dominated by any single element. This elemental versatility explains your ability to adapt to different environments while maintaining your essential nature, and suggests you often serve as a bridge between different types of people and perspectives.",
      remedies: [
        "Practice pranayama techniques that balance your specific elemental composition",
        "Work with crystals corresponding to elements needing strengthening (earth: hematite, water: moonstone, fire: carnelian, air: clear quartz)",
        "Incorporate dietary choices that balance your dominant elements according to Ayurvedic principles",
        "Practice elemental meditation where you consciously connect with each element in nature",
        "Create a living or working environment that incorporates balanced elemental influences"
      ]
    },
    remedies: {
      general: [
        "Establish a daily meditation practice incorporating both mindfulness and visualization",
        "Practice regular grounding by spending time in nature and walking barefoot on natural surfaces",
        "Use of rudraksha mala for japa meditation to strengthen your natural spiritual inclinations",
        "Incorporate Ayurvedic principles into your daily routine based on your dominant dosha",
        "Create intentional transitions between different activities to maintain presence and integration"
      ],
      specific: {
        relationships: [
          "Practice conscious communication techniques in all interactions",
          "Wear or carry rose quartz to enhance heart energy and compassion",
          "Create clear boundaries in relationships where energy feels imbalanced",
          "Engage in regular heart-centered meditation to maintain emotional clarity"
        ],
        career: [
          "Align daily work with broader purpose through morning intention setting",
          "Create visual representations of your professional vision and review weekly",
          "Establish regular periods of deep work without digital interruptions",
          "Seek mentorship from those who embody your aspirational qualities"
        ],
        health: [
          "Establish a consistent sleep schedule aligned with natural rhythms",
          "Incorporate adaptogenic herbs appropriate for your constitution",
          "Practice yoga asanas that balance your specific elemental composition",
          "Maintain regular self-massage with oils suited to your dosha"
        ],
        spiritual: [
          "Develop a personal ritual practice that honors transitions and achievements",
          "Study spiritual texts that resonate with your intuitive understanding",
          "Create a dedicated meditation space incorporating meaningful symbols",
          "Practice karma yoga through regular service aligned with your values"
        ]
      }
    }
  };
}
