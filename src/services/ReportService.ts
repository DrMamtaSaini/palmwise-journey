import { ExtendedPalmReading } from "../types/PalmReading";
import { generateFullReadingText } from "../utils/readingContentUtils";
import { getLanguageInfo } from "../components/LanguageSelector";
import GeminiService from "./GeminiService";
import PDFService from "./PDFService";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface ReportSection {
  title: string;
  content: string;
  image?: string;
}

export interface DetailedLifeReport {
  id: string;
  userId: string;
  readingId: string;
  title: string;
  sections: ReportSection[];
  language: string;
  pageCount: number;
  createdAt: string;
  downloadUrl?: string;
  translationNote?: string;
}

class ReportService {
  private static instance: ReportService;

  private sampleReport: DetailedLifeReport = {
    id: "sample-report",
    userId: "sample",
    readingId: "sample",
    title: "The Ultimate Palm Reading Report",
    language: "english",
    pageCount: 65,
    createdAt: new Date().toISOString(),
    downloadUrl: "", // Remove fixed URL to allow dynamic generation
    translationNote: "",
    sections: [
      {
        title: "Introduction: Your Palm, Your Destiny",
        content: "Your palm is a map of your past, present, and future—revealing hidden strengths, destined challenges, and pathways to success. The shape of your hand, the depth of your lines, and the mounts all contribute to who you are and where you're headed.\n\nThis report explores every area of your life—career, relationships, finances, health, intelligence, social influence, emotions, family life, travel, and legacy.",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
      },
      {
        title: "Career & Professional Growth",
        content: "Your Fate Line & Sun Line indicate stability, leadership, and growth in your professional journey. The direction and depth of your Head Line suggest strategic thinking and problem-solving abilities—key qualities for achieving success.\n\nKey Phases in Your Career:\n- 18-25 Years (Foundation Stage): Education, skill-building, and early career experiences.\n- 25-35 Years (Growth Stage): Rapid rise, financial stability, leadership roles.\n- 35-50 Years (Peak Stage): Industry recognition, career mastery, major achievements.\n- 50+ Years (Legacy Stage): Mentorship, business expansion, advisory roles.\n\nIdeal Career Choices:\n✔ Leadership (CEO, Director, Consultant)\n✔ Entrepreneurship (Startup, Business Ownership)\n✔ Strategic Professions (Law, Finance, Technology)\n✔ Creative Fields (Writing, Media, Advertising)\n\n🔹 Business vs. Job? Your palm strongly supports business success, but you can thrive in high-level job roles as well.",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000"
      },
      {
        title: "Love & Relationships",
        content: "Your Heart Line reveals how you experience and express love. A deep, well-defined line suggests intense emotions and loyalty, while breaks or curves indicate evolving relationships and personal growth through love.\n\nLove Life Stages:\n- Early Years (18-25): Passionate but learning experiences.\n- Mid-Life (25-40): Deep emotional connections, long-term commitments.\n- Later Years (40+): Stability, companionship, deep understanding of love.\n\nYour Personality in Relationships:\n✔ Deeply passionate and emotionally intuitive\n✔ Loyal and committed, values long-term bonds\n✔ Needs emotional security and trust\n\n🔹 Best Partner Match: Someone who complements your intellectual curiosity and emotional depth.",
        image: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1000"
      },
      {
        title: "Financial Outlook",
        content: "Your Fate Line and Sun Line indicate increasing prosperity over time. Financial success is strongly linked to your ability to take calculated risks and make strategic investments.\n\nFinancial Growth Timeline:\n- 20s: Learning and investment in skills.\n- 30s: Strong earning potential, possible business ventures.\n- 40s & Beyond: Financial stability, wealth accumulation, strategic investments.\n\nSources of Wealth:\n✔ Business and entrepreneurial ventures\n✔ Real estate and smart financial planning\n✔ High-income careers in strategy, finance, or leadership\n\n🔹 Money Management Tip: Focus on long-term investments and avoid impulsive spending.",
        image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1000"
      },
      {
        title: "Health & Well-Being",
        content: "Your Life Line suggests a strong energy flow and resilience. A well-marked line indicates good stamina, while breaks or chains might hint at periods of stress or low immunity.\n\nHealth Phases:\n- Youth (0-25 Years): High energy, minimal health concerns.\n- Mid-Life (25-50 Years): Need for balance in work and health.\n- Later Years (50+): Focus on diet, mental wellness, and physical fitness.\n\nWellness Focus:\n✔ A balanced lifestyle for longevity\n✔ Mental well-being through meditation and stress management\n✔ Regular exercise for sustained energy\n\n🔹 Health Tip: Mindfulness and stress management will help maintain long-term vitality.",
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000"
      },
      {
        title: "Intelligence & Talents",
        content: "Your Head Line indicates a sharp intellect, creativity, and an ability to think critically. A long, clear Head Line suggests logical reasoning and problem-solving skills, while a curved one shows artistic and intuitive thinking.\n\nKey Strengths:\n✔ Analytical and logical mindset\n✔ Creative problem-solving abilities\n✔ Strong communication and leadership skills\n\n🔹 Best Skill Development Areas: Public speaking, writing, critical thinking, leadership training.",
        image: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=1000"
      },
      {
        title: "Social Influence & Charisma",
        content: "The Mount of Jupiter on your palm reveals your leadership potential and influence in society. A well-developed Jupiter Mount signifies charisma, confidence, and the ability to inspire others.\n\nSocial Strengths:\n✔ Natural leadership and authority\n✔ Strong networking and public speaking skills\n✔ Ability to command respect in social settings\n\n🔹 Growth Tip: Engaging in public speaking, social networking, and leadership programs will enhance your influence.",
        image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000"
      },
      {
        title: "Family & Home Life",
        content: "Your Venus Mount and Heart Line indicate your approach to family relationships. A well-developed Venus Mount signifies deep emotional bonds and strong family ties.\n\nFamily Life Phases:\n- Early Life: Strong dependence on family support.\n- Mid-Life: Becoming a pillar of support for family.\n- Later Life: Creating a lasting family legacy.\n\n🔹 Family Tip: Strengthening emotional connections ensures a harmonious home life.",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000"
      },
      {
        title: "Travel & Exploration",
        content: "Your Mount of Moon and travel lines indicate a strong desire for exploration. A well-marked line suggests frequent travel for career, personal growth, or adventure.\n\nTravel Style:\n✔ Travel for work and global networking\n✔ Exploring different cultures and philosophies\n✔ Seeking adventure and spiritual experiences\n\n🔹 Best Travel Destinations: Historical and culturally rich places align with your intellectual curiosity.",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000"
      },
      {
        title: "Personal Growth & Spirituality",
        content: "Your Mount of Moon and intuition lines suggest a deep connection to wisdom and spirituality. You are drawn toward self-discovery and personal development.\n\nSelf-Development Path:\n- Early Life: Seeking knowledge and experiences.\n- Mid-Life: Finding purpose and deeper meaning.\n- Later Life: Becoming a mentor, spiritual guide, or thought leader.\n\n🔹 Personal Growth Tip: Meditation, self-reflection, and continuous learning enhance your inner wisdom.",
        image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=1000"
      },
      {
        title: "Legacy & Life Purpose",
        content: "Your Fate Line and Sun Line suggest a lasting impact on your industry, community, or family. Your legacy is one of knowledge, leadership, and inspiration.\n\nLegacy Impact:\n✔ Contribution to society through career or philanthropy\n✔ Influence in guiding and mentoring others\n✔ Leaving a lasting mark through creative or intellectual work\n\n🔹 Final Thought: Your journey is one of impact and success—embrace it with confidence!",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000"
      },
      {
        title: "Final Summary: Your Life Blueprint",
        content: "✔ Career Peak: 35-50 years, with steady growth before and after.\n✔ Financial Strength: Business and investments ensure long-term wealth.\n✔ Relationship Style: Passionate, loyal, and emotionally deep.\n✔ Health & Wellness: Strong vitality, with stress management needed.\n✔ Social Influence: Charismatic, a natural leader.\n✔ Spiritual Path: Growing wisdom and connection to higher purpose.",
        image: "https://images.unsplash.com/photo-1506485338023-6ce5f36692df?q=80&w=1000"
      }
    ]
  };

  private hindiSampleReport: DetailedLifeReport = {
    id: "sample-report-hindi",
    userId: "sample",
    readingId: "sample",
    title: "परम हस्तरेखा रिपोर्ट",
    language: "hindi",
    pageCount: 65,
    createdAt: new Date().toISOString(),
    downloadUrl: "", // Remove fixed URL to allow dynamic generation
    translationNote: "हमने आपकी विस्तृत रिपोर्ट का हिंदी में अनुवाद किया है। यह हमारे उन्नत अनुवाद तकनीक का उपयोग करता है जो विशेष पारिभाषिक शब्दों को सटीक रूप से अनुवादित करता है।",
    sections: [
      {
        title: "परिचय: आपकी हथेली, आपका भाग्य",
        content: "आपकी हथेली आपके अतीत, वर्तमान और भविष्य का एक नक्शा है—छिपी हुई ताकतों, निर्धारित चुनौतियों और सफलता के मार्गों को प्रकट करती है। आपके हाथ का आकार, आपकी रेखाओं की गहराई, और पहाड़ियाँ सभी योगदान करती हैं कि आप कौन हैं और आप कहाँ जा रहे हैं।\n\nयह रिपोर्ट आपके जीवन के हर क्षेत्र का अन्वेषण करती है—करियर, रिश्ते, वित्त, स्वास्थ्य, बुद्धिमत्ता, सामाजिक प्रभाव, भावनाएँ, पारिवारिक जीवन, यात्रा, और विरासत।",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
      },
      // ... keep existing code (Hindi sections similar to the English sample but translated)
    ]
  };

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public async generateDetailedReport(reading: ExtendedPalmReading, isPremium: boolean = true): Promise<DetailedLifeReport> {
    if (!reading || !reading.userId) {
      throw new Error("Invalid reading data");
    }

    try {
      const language = reading.language || "english";
      const languageInfo = getLanguageInfo(language);
      
      toast.info('Generating your detailed life report...', {
        description: 'This comprehensive 65-page report will include all life aspects and will take a few moments to complete.',
        duration: 5000
      });

      // Get the basic reading text
      const baseReadingText = generateFullReadingText(reading.results, isPremium);
      
      // Generate a more detailed report using Gemini API with improved prompt for a modern, comprehensive report
      let promptForAI = `Create an ultra-detailed modern palm reading report covering every major life aspect in depth, following this structured format:

The report should be titled "The Ultimate Palm Reading Report" with a subtitle "A Deep Insight into Your Life's Journey"

The report must include these major sections (with emojis as shown):
1. 🔮 Introduction: Your Palm, Your Destiny - Explain how the palm reveals past, present and future
2. 🛠 Career & Professional Growth - Analyze career path, ideal careers, key phases (18-25, 25-35, 35-50, 50+)
3. ❤️ Love & Relationships - Cover emotional style, relationship stages and patterns
4. 💰 Financial Outlook - Detail financial timeline, sources of wealth, money management
5. ⚕ Health & Well-Being - Cover physical and mental health phases and wellness focus
6. 🧠 Intelligence & Talents - Analyze mental strengths, skills and development areas
7. 🌍 Social Influence & Charisma - Examine leadership qualities and social impact
8. 👨‍👩‍👧 Family & Home Life - Explore family connections and home environment
9. ✈ Travel & Exploration - Discuss travel tendencies and exploration patterns
10. 🌟 Personal Growth & Spirituality - Cover inner development and spiritual journey
11. 📜 Legacy & Life Purpose - Examine lasting impact and ultimate purpose
12. 📌 Final Summary: Life Blueprint - Summarize key insights from all sections

For each section, provide detailed insights with:
- Specific timeframes where relevant
- Bullet points for key insights marked with ✔
- Special tips marked with 🔹
- Age-based phases and predictions
- Practical advice based on palm features

Make the report engaging and positive while being specific and personalized based on these palm reading insights: ${baseReadingText}

Format your response as a JSON array of objects with 'title' and 'content' fields for each section. Each section should have rich, detailed content with around 2-3 pages worth of analysis. Ensure the JSON is valid and properly formatted.`;

      // Use GeminiService to get the generated content
      const geminiResponse = await GeminiService.generateTextWithGemini(promptForAI);
      
      let sections: ReportSection[] = [];
      
      try {
        // Parse the response as JSON
        if (geminiResponse.includes('[') && geminiResponse.includes(']')) {
          const jsonStartIndex = geminiResponse.indexOf('[');
          const jsonEndIndex = geminiResponse.lastIndexOf(']') + 1;
          const jsonStr = geminiResponse.substring(jsonStartIndex, jsonEndIndex);
          
          console.log("Extracted JSON:", jsonStr.substring(0, 100) + "...");
          sections = JSON.parse(jsonStr);
        } else {
          console.log("Response not in expected JSON format, using fallback parsing");
          // Use sample report sections as fallback but customize with reading info
          sections = this.sampleReport.sections.map(section => ({
            ...section,
            content: section.content.replace(/Your (Life|Heart|Head|Fate) Line/g, 
              `Your ${Math.random() > 0.5 ? 'strong' : 'well-defined'} $1 Line`)
          }));
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        // Use sample sections as fallback
        sections = this.sampleReport.sections;
      }
      
      // Add images to sections
      sections = this.enrichSectionsWithImages(sections);
      
      // Translate content if needed
      if (language === "hindi") {
        sections = await this.translateSectionsToHindi(sections);
      }
      
      const reportId = uuidv4();
      const report: DetailedLifeReport = {
        id: reportId,
        userId: reading.userId,
        readingId: reading.id,
        title: language === "hindi" ? "परम हस्तरेखा रिपोर्ट" : "The Ultimate Palm Reading Report",
        sections: sections,
        language: language,
        pageCount: 65, // Fixed page count for this premium report format
        createdAt: new Date().toISOString(),
        translationNote: language === "hindi" ? "हमने आपकी विस्तृत रिपोर्ट का हिंदी में अनुवाद किया है। हम उन्नत अनुवाद तकनीक का उपयोग करते हैं और निरंतर अनुवाद की गुणवत्ता में सुधार कर रहे हैं।" : "",
      };
      
      console.log("Saving report to database:", report.id);
      
      // Store the report in Supabase
      const { error } = await supabase
        .from('detailed_reports')
        .insert([{
          id: report.id,
          user_id: report.userId,
          reading_id: report.readingId,
          title: report.title,
          sections: report.sections,
          language: report.language,
          page_count: report.pageCount,
          created_at: report.createdAt,
          translation_note: report.translationNote
        }]);
        
      if (error) {
        console.error("Error saving report to database:", error);
        throw new Error("Failed to save report: " + error.message);
      } else {
        console.log("Successfully saved report to database:", report.id);
        
        // Generate PDF and update the download URL
        try {
          const downloadUrl = await PDFService.generatePDFFromReport(report);
          report.downloadUrl = downloadUrl;
        } catch (pdfError) {
          console.error("PDF generation error:", pdfError);
          // Continue without PDF - we'll generate it on demand later
        }
      }
      
      return report;
    } catch (error) {
      console.error("Error generating detailed report:", error);
      toast.error("Error generating report", {
        description: "We encountered an issue creating your detailed report. Please try again later."
      });
      
      // Return sample report as fallback
      const currentLanguage = reading.language || "english";
      return currentLanguage === "hindi" ? this.hindiSampleReport : this.sampleReport;
    }
  }
  
  private parseFallbackResponse(response: string): ReportSection[] {
    const sections: ReportSection[] = [];
    const lines = response.split('\n');
    let currentTitle = '';
    let currentContent = '';
    
    for (const line of lines) {
      if (line.startsWith('#') || line.match(/^\d+\.\s/) || line.match(/^[A-Z\s]{5,}$/)) {
        // This is likely a title
        if (currentTitle && currentContent) {
          sections.push({
            title: currentTitle.trim(),
            content: currentContent.trim()
          });
        }
        
        currentTitle = line.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
        currentContent = '';
      } else {
        // This is content
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentTitle && currentContent) {
      sections.push({
        title: currentTitle.trim(),
        content: currentContent.trim()
      });
    }
    
    return sections;
  }
  
  private createBasicSections(readingText: string): ReportSection[] {
    const sections: ReportSection[] = [];
    const lines = readingText.split('\n');
    let currentTitle = 'Introduction';
    let currentContent = 'Your detailed palm reading reveals insights about your past, present, and future.';
    
    for (const line of lines) {
      if (line.toUpperCase() === line && line.trim().length > 0) {
        // This is likely a title (all caps)
        if (currentTitle && currentContent) {
          sections.push({
            title: currentTitle.trim(),
            content: currentContent.trim()
          });
        }
        
        currentTitle = line;
        currentContent = '';
      } else if (line.trim().length > 0) {
        // This is content
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentTitle && currentContent) {
      sections.push({
        title: currentTitle.trim(),
        content: currentContent.trim()
      });
    }
    
    // Add life phases sections if they don't exist
    const lifePhases = [
      "Early Childhood (0-7 years)",
      "Childhood (7-14 years)",
      "Adolescence (14-21 years)",
      "Early Adulthood (21-28 years)",
      "Adulthood (28-42 years)",
      "Middle Age (42-56 years)",
      "Maturity (56-70 years)",
      "Wisdom Years (70+ years)"
    ];
    
    for (const phase of lifePhases) {
      if (!sections.some(s => s.title.includes(phase.split(' ')[0]))) {
        sections.push({
          title: phase,
          content: `During this phase of life, your palm reading suggests important developments and experiences that will shape your journey. The influence of your life line, heart line, and head line during this period indicates a time of ${Math.random() > 0.5 ? 'growth and opportunity' : 'challenges and learning'}.`
        });
      }
    }
    
    return sections;
  }
  
  private enrichSectionsWithImages(sections: ReportSection[]): ReportSection[] {
    const images = [
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000",
      "https://images.unsplash.com/photo-1576505236555-42d3a0c1313d?q=80&w=1000",
      "https://images.unsplash.com/photo-1613336026275-d6d473084e85?q=80&w=1000",
      "https://images.unsplash.com/photo-1533562669260-32471363c5a9?q=80&w=1000",
      "https://images.unsplash.com/photo-1577457943926-11d6cd3ce8ae?q=80&w=1000",
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1000",
      "https://images.unsplash.com/photo-1612528443702-f6741f70a049?q=80&w=1000",
      "https://images.unsplash.com/photo-1538128845231-90c6d3f3abd3?q=80&w=1000",
      "https://images.unsplash.com/photo-1541534401786-2077eed87a74?q=80&w=1000",
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1000"
    ];
    
    return sections.map((section, index) => {
      return {
        ...section,
        image: section.image || images[index % images.length]
      };
    });
  }
  
  private async translateSectionsToHindi(sections: ReportSection[]): Promise<ReportSection[]> {
    // Enhanced Hindi translations for common titles
    const titleTranslations: Record<string, string> = {
      "Introduction": "परिचय",
      "How to Read This Report": "इस रिपोर्ट को कैसे पढ़ें",
      "Life Line Analysis": "जीवन रेखा विश्लेषण",
      "Heart Line Analysis": "हृदय रेखा विश्लेषण",
      "Head Line Analysis": "मस्तिष्क रेखा विश्लेषण",
      "Fate Line Analysis": "भाग्य रेखा विश्लेषण",
      "Early Childhood": "प्रारंभिक बचपन",
      "Childhood": "बचपन",
      "Adolescence": "किशोरावस्था",
      "Early Adulthood": "प्रारंभिक वयस्कता",
      "Adulthood": "वयस्कता",
      "Middle Age": "मध्य आयु",
      "Maturity": "परिपक्वता",
      "Wisdom Years": "बुद्धिमत्ता के वर्ष",
      "Conclusion": "निष्कर्ष",
      "Relationships": "रिश्ते",
      "Career": "करियर",
      "Health": "स्वास्थ्य",
      "Spiritual Growth": "आध्यात्मिक विकास",
      "Early Childhood (0-7 years)": "प्रारंभिक बचपन (0-7 वर्ष)",
      "Childhood (7-14 years)": "बचपन (7-14 वर्ष)",
      "Adolescence (14-21 years)": "किशोरावस्था (14-21 वर्ष)",
      "Early Adulthood (21-28 years)": "प्रारंभिक वयस्कता (21-28 वर्ष)",
      "Adulthood (28-42 years)": "वयस्कता (28-42 वर्ष)",
      "Middle Age (42-56 years)": "मध्य आयु (42-56 वर्ष)",
      "Maturity (56-70 years)": "परिपक्वता (56-70 वर्ष)",
      "Wisdom Years (70+ years)": "बुद्धिमत्ता के वर्ष (70+ वर्ष)",
      "Summary": "सारांश",
      "Overview": "सिंहावलोकन",
      "Life Purpose": "जीवन का उद्देश्य",
      "Major Life Events": "प्रमुख जीवन घटनाएँ",
      "Personality": "व्यक्तित्व",
      "Strengths and Challenges": "शक्तियाँ और चुनौतियाँ",
      "Financial Prospects": "वित्तीय संभावनाएँ",
      "Educational Path": "शैक्षिक मार्ग",
      "Family Life": "पारिवारिक जीवन",
      "Love and Romance": "प्रेम और रोम���ंस",
      "Personal Growth": "व्यक्तिगत विकास"
    };
    
    try {
      // For more complete translations of content, we'll use Gemini for batches of content
      let translatedSections = [...sections];
      
      // First pass - translate the titles using our dictionary
      translatedSections = translatedSections.map(section => {
        return {
          ...section,
          title: titleTranslations[section.title] || section.title
        };
      });
      
      // Log what we're about to translate
      console.log(`Translating ${sections.length} sections to Hindi`);
      
      // Second pass - translate sections in batches using Gemini
      // We'll translate batches of 3 sections at a time to avoid exceeding token limits
      for (let i = 0; i < sections.length; i += 3) {
        try {
          const batchToTranslate = sections.slice(i, i + 3);
          const batchJSON = JSON.stringify(batchToTranslate.map(s => ({
            title: s.title,
            content: s.content.substring(0, 1000) // Limit content length for API
          })));
          
          const prompt = `Translate the following JSON containing English text to Hindi. 
Maintain the meaning and tone, and provide a complete translation, not word-by-word.
Focus on natural Hindi phrasing rather than literal translation. 
Preserve the JSON structure exactly.

JSON to translate:
${batchJSON}`;
          
          const translatedJSON = await GeminiService.generateTextWithGemini(prompt);
          
          // Extract the JSON from the response
          let extractedJSON = translatedJSON;
          if (translatedJSON.includes('[') && translatedJSON.includes(']')) {
            const jsonStartIndex = translatedJSON.indexOf('[');
            const jsonEndIndex = translatedJSON.lastIndexOf(']') + 1;
            extractedJSON = translatedJSON.substring(jsonStartIndex, jsonEndIndex);
          }
          
          try {
            const translatedBatch = JSON.parse(extractedJSON);
            
            // Update the translated sections
            for (let j = 0; j < translatedBatch.length; j++) {
              if (i + j < translatedSections.length) {
                translatedSections[i + j].title = translatedBatch[j].title || translatedSections[i + j].title;
                translatedSections[i + j].content = translatedBatch[j].content || translatedSections[i + j].content;
              }
            }
            
            console.log(`Successfully translated batch ${i/3 + 1}`);
          } catch (parseError) {
            console.error("Error parsing translated JSON:", parseError);
            // If JSON parsing fails, use dictionary translation for this batch
            for (let j = 0; j < batchToTranslate.length; j++) {
              if (i + j < translatedSections.length) {
                // Keep the title translation from dictionary but use simpler content translation
                translatedSections[i + j].content = this.simpleTranslate(translatedSections[i + j].content);
              }
            }
          }
        } catch (batchError) {
          console.error(`Error translating batch starting at index ${i}:`, batchError);
        }
      }
      
      return translatedSections;
    } catch (error) {
      console.error("Translation error:", error);
      // If translation fails, return original sections
      return sections;
    }
  }
  
  // Simple word replacement for fallback translations
  private simpleTranslate(text: string): string {
    const commonPhrases: Record<string, string> = {
      "shows": "दिखाता है",
      "indicates": "संकेत देता है",
      "suggests": "सुझाव देता है",
      "reveals": "प्रकट करता है",
      "demonstrates": "प्रदर्शित करता है",
      "will": "करेंगे",
      "your": "आपके",
      "you": "आप",
      "life": "जीवन",
      "relationship": "रिश्ता",
      "health": "स्वास्थ्य",
      "career": "करियर",
      "success": "सफलता",
      "challenges": "चुनौतियाँ",
      "opportunities": "अवसर",
      "growth": "विकास",
      "spiritual": "आध्यात्मिक",
      "path": "मार्ग",
      "journey": "यात्रा",
      "potential": "संभावना",
      "future": "भविष्य",
      "past": "भूतकाल",
      "present": "वर्तमान"
    };
    
    let translatedText = text;
    
    Object.keys(commonPhrases).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translatedText = translatedText.replace(regex, commonPhrases[key]);
    });
    
    return translatedText;
  }
  
  public getSampleReport(languageParam: string = "english"): DetailedLifeReport {
    // Create a fresh copy to avoid modifying the original sample report objects
    const report = languageParam === "hindi" 
      ? JSON.parse(JSON.stringify(this.hindiSampleReport))
      : JSON.parse(JSON.stringify(this.sampleReport));
      
    // Ensure we have a download URL if it already exists in the database
    if (!report.downloadUrl) {
      // Check if we have a stored download URL in the database
      this.checkForExistingSampleReportURL(report.id).then(url => {
        if (url) {
          report.downloadUrl = url;
        }
      }).catch(err => console.error("Error checking for existing sample report URL:", err));
    }
    
    return report;
  }
  
  // New method to check for existing sample report download URLs
  private async checkForExistingSampleReportURL(reportId: string): Promise<string | null> {
    try {
      const { data } = await supabase
        .from('detailed_reports')
        .select('download_url')
        .eq('id', reportId)
        .maybeSingle();
        
      return data?.download_url || null;
    } catch (error) {
      console.error("Error checking for existing sample report:", error);
      return null;
    }
  }
  
  public async getReportsForUser(userId: string): Promise<DetailedLifeReport[]> {
    try {
      console.log("Fetching reports for user:", userId);
      
      const { data, error } = await supabase
        .from('detailed_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} reports for user`);
      
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        readingId: item.reading_id,
        title: item.title,
        sections: item.sections,
        language: item.language,
        pageCount: item.page_count,
        createdAt: item.created_at,
        downloadUrl: item.download_url,
        translationNote: item.translation_note
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }
  
  public async getReport(id: string): Promise<DetailedLifeReport | null> {
    try {
      console.log("Fetching report with ID:", id);
      
      const { data, error } = await supabase
        .from('detailed_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching report:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No report found with ID:", id);
        return null;
      }
      
      console.log("Successfully retrieved report:", id);
      
      return {
        id: data.id,
        userId: data.user_id,
        readingId: data.reading_id,
        title: data.title,
        sections: data.sections,
        language: data.language,
        pageCount: data.page_count,
        createdAt: data.created_at,
        downloadUrl: data.download_url,
        translationNote: data.translation_note
      };
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  }
  
  public async generatePDFForReport(report: DetailedLifeReport): Promise<string> {
    // If PDF already exists, return the URL
    if (report.downloadUrl && report.downloadUrl.startsWith('http')) {
      return report.downloadUrl;
    }
    
    try {
      console.log(`Generating PDF for report: ${report.id}`);
      
      // For sample reports, check if they exist in the database first
      if (report.id === "sample-report" || report.id === "sample-report-hindi") {
        const existingReport = await this.getReport(report.id);
        if (existingReport && existingReport.downloadUrl) {
          console.log(`Using existing download URL for sample report: ${existingReport.downloadUrl}`);
          return existingReport.downloadUrl;
        }
        
        // Ensure sample report exists in database
        await this.ensureSampleReportExists(report);
      }
      
      // Generate the PDF using PDFService
      const downloadUrl = await PDFService.generatePDFFromReport(report);
      
      // Update the report record in the database
      await this.updateReportDownloadUrl(report.id, downloadUrl);
      
      return downloadUrl;
    } catch (error) {
      console.error("Error generating PDF for report:", error);
      throw error;
    }
  }
  
  // Helper method to ensure sample reports exist in the database
  private async ensureSampleReportExists(report: DetailedLifeReport): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('detailed_reports')
        .select('id')
        .eq('id', report.id)
        .maybeSingle();
        
      if (!data) {
        console.log(`Sample report ${report.id} not found in database, creating it...`);
        
        // Insert the sample report
        const { error: insertError } = await supabase
          .from('detailed_reports')
          .insert({
            id: report.id,
            user_id: report.userId,
            reading_id: report.readingId,
            title: report.title,
            sections: report.sections,
            language: report.language,
            page_count: report.pageCount,
            created_at: report.createdAt,
            translation_note: report.translationNote || null
          });
          
        if (insertError) {
          console.error(`Error creating sample report in database: ${insertError.message}`);
        } else {
          console.log(`Successfully created sample report ${report.id} in database`);
        }
      } else {
        console.log(`Sample report ${report.id} already exists in database`);
      }
    } catch (error) {
      console.error(`Error ensuring sample report exists: ${error}`);
    }
  }
  
  // Helper method to update the download URL for a report
  private async updateReportDownloadUrl(reportId: string, downloadUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('detailed_reports')
        .update({ download_url: downloadUrl })
        .eq('id', reportId);
        
      if (error) {
        console.error(`Error updating report download URL: ${error.message}`);
      } else {
        console.log(`Successfully updated download URL for report ${reportId}`);
      }
    } catch (error) {
      console.error(`Error updating report download URL: ${error}`);
    }
  }
}

export default ReportService.getInstance();
