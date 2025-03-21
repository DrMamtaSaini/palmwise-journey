
import { ExtendedPalmReading } from "../types/PalmReading";

export const getReadingContent = (reading: ExtendedPalmReading | null) => {
  if (!reading || !reading.results) return null;

  const content: any = {
    lifeLine: {
      title: "Life Line",
      content: [
        reading.results.lifeLine.prediction,
        `Strength: ${reading.results.lifeLine.strength}%`
      ],
      insights: reading.results.lifeLine.insights,
      premium: false
    },
    heartLine: {
      title: "Heart Line",
      content: [
        reading.results.heartLine.prediction,
        `Strength: ${reading.results.heartLine.strength}%`
      ],
      insights: reading.results.heartLine.insights,
      premium: false
    },
    headLine: {
      title: "Head Line",
      content: [
        reading.results.headLine.prediction,
        `Strength: ${reading.results.headLine.strength}%`
      ],
      insights: reading.results.headLine.insights,
      premium: false
    },
    past: {
      title: "Past",
      content: [
        reading.results.past?.prediction || "No past reading available.",
        reading.results.past ? `Significance: ${reading.results.past.significance}%` : ""
      ].filter(Boolean),
      insights: reading.results.past?.insights,
      premium: false
    },
    present: {
      title: "Present",
      content: [
        reading.results.present?.prediction || "No present reading available.",
        reading.results.present ? `Significance: ${reading.results.present.significance}%` : ""
      ].filter(Boolean),
      insights: reading.results.present?.insights,
      premium: false
    },
    future: {
      title: "Future",
      content: [
        reading.results.future?.prediction || "No future reading available.",
        reading.results.future ? `Significance: ${reading.results.future.significance}%` : ""
      ].filter(Boolean),
      insights: reading.results.future?.insights,
      premium: false
    }
  };

  if (reading.results.fateLinePresent && reading.results.fate) {
    content["fateLine"] = {
      title: "Fate Line",
      content: [
        reading.results.fate.prediction,
        `Strength: ${reading.results.fate.strength}%`
      ],
      insights: reading.results.fate.insights,
      premium: false
    };
  }

  if (reading.results.relationships) {
    content["relationships"] = {
      title: "Relationships",
      content: [
        reading.results.relationships.prediction,
        `Significance: ${reading.results.relationships.significance}%`
      ],
      insights: reading.results.relationships.insights,
      premium: true
    };
  }

  if (reading.results.career) {
    content["career"] = {
      title: "Career",
      content: [
        reading.results.career.prediction,
        `Significance: ${reading.results.career.significance}%`
      ],
      insights: reading.results.career.insights,
      premium: true
    };
  }

  if (reading.results.health) {
    content["health"] = {
      title: "Health",
      content: [
        reading.results.health.prediction,
        `Significance: ${reading.results.health.significance}%`
      ],
      insights: reading.results.health.insights,
      premium: true
    };
  }

  if (reading.results.elementalInfluences) {
    content["elements"] = {
      title: "Elemental Influences",
      content: [
        reading.results.elementalInfluences.description,
        `Earth: ${reading.results.elementalInfluences.earth}%`,
        `Water: ${reading.results.elementalInfluences.water}%`,
        `Fire: ${reading.results.elementalInfluences.fire}%`,
        `Air: ${reading.results.elementalInfluences.air}%`
      ],
      premium: true
    };
  }

  content["summary"] = {
    title: "Overall Summary",
    content: [
      reading.results.overallSummary,
      `Personality traits: ${reading.results.personalityTraits.join(', ')}`
    ],
    premium: false
  };

  return content;
};

export const generateFullReadingText = (readingContent: Record<string, any> | null, isPremium: boolean = false): string => {
  if (!readingContent) return '';

  let fullText = `PALM READING REPORT\n\n`;
  
  // First add the overall summary
  if (readingContent.summary) {
    fullText += `${readingContent.summary.title.toUpperCase()}\n`;
    readingContent.summary.content.forEach((paragraph: string) => {
      fullText += `${paragraph}\n`;
    });
    fullText += '\n';
  }
  
  // Add each section content except summary (which we already added)
  Object.entries(readingContent).forEach(([key, section]) => {
    if (key !== 'summary') {
      const typedSection = section as { 
        title: string; 
        content: string[];
        insights?: string[];
        premium: boolean;
      };
      
      // Skip premium sections if user doesn't have premium
      if (typedSection.premium && !isPremium) return;
      
      fullText += `${typedSection.title.toUpperCase()}\n`;
      
      typedSection.content.forEach((paragraph: string) => {
        fullText += `${paragraph}\n`;
      });
      
      if (typedSection.insights && typedSection.insights.length > 0) {
        fullText += `\nKey insights for ${typedSection.title}:\n`;
        typedSection.insights.forEach((insight, index) => {
          fullText += `${index + 1}. ${insight}\n`;
        });
      }
      
      fullText += '\n';
    }
  });

  return fullText;
};

// Helper function to translate text to Hindi if needed
export const translateReadingText = (text: string, language: string): string => {
  if (language !== 'hindi') return text;
  
  // Dictionary of translations
  const translations: Record<string, string> = {
    "PALM READING REPORT": "हस्तरेखा रिपोर्ट",
    "OVERALL SUMMARY": "समग्र सारांश",
    "LIFE LINE": "जीवन रेखा",
    "HEART LINE": "हृदय रेखा",
    "HEAD LINE": "मस्तिष्क रेखा",
    "FATE LINE": "भाग्य रेखा",
    "PAST": "भूतकाल",
    "PRESENT": "वर्तमान",
    "FUTURE": "भविष्य",
    "RELATIONSHIPS": "रिश्ते",
    "CAREER": "करियर",
    "HEALTH": "स्वास्थ्य",
    "ELEMENTAL INFLUENCES": "तत्वों का प्रभाव",
    "Strength:": "शक्ति:",
    "Significance:": "महत्व:",
    "Earth:": "पृथ्वी:",
    "Water:": "जल:",
    "Fire:": "अग्नि:",
    "Air:": "वायु:",
    "Personality traits:": "व्यक्तित्व विशेषताएँ:",
    "Key insights for": "के लिए प्रमुख अंतर्दृष्टि",
    "No past reading available.": "कोई अतीत की रीडिंग उपलब्ध नहीं है।",
    "No present reading available.": "कोई वर्तमान की रीडिंग उपलब्ध नहीं है।",
    "No future reading available.": "कोई भविष्य की रीडिंग उपलब्ध नहीं है।",
  };
  
  let translatedText = text;
  
  // Replace all occurrences of English terms with Hindi equivalents
  Object.entries(translations).forEach(([english, hindi]) => {
    translatedText = translatedText.replace(new RegExp(english, 'g'), hindi);
  });
  
  return translatedText;
};
