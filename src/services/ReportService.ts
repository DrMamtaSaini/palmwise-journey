import { ExtendedPalmReading } from "../types/PalmReading";
import { generateFullReadingText } from "../utils/readingContentUtils";
import { getLanguageInfo } from "../components/LanguageSelector";
import GeminiService from "./GeminiService";
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
    title: "Sample Detailed Life Report",
    language: "english",
    pageCount: 55,
    createdAt: new Date().toISOString(),
    downloadUrl: "/sample-palm-report.pdf",
    translationNote: "",
    sections: [
      {
        title: "Introduction",
        content: "This sample report demonstrates the depth and detail of our palm reading analysis. This comprehensive life report uses advanced palmistry techniques to analyze your unique hand features and provide insights about your past, present, and future.",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
      },
      {
        title: "Life Line Analysis",
        content: "Your life line reveals remarkable vitality and resilience. The clear, unbroken path it traces around your thumb's mount indicates exceptional recuperative abilities and adaptability in the face of challenges.",
        image: "https://images.unsplash.com/photo-1538128845231-90c6d3f3abd3?q=80&w=1000"
      },
      {
        title: "Early Life Phase (0-15 years)",
        content: "The beginning section of your life line indicates a childhood marked by significant formative experiences. The depth at this point suggests strong foundational influences that continue to shape your approach to life challenges.",
        image: "https://images.unsplash.com/photo-1576505236555-42d3a0c1313d?q=80&w=1000"
      }
    ]
  };

  private hindiSampleReport: DetailedLifeReport = {
    id: "sample-report-hindi",
    userId: "sample",
    readingId: "sample",
    title: "विस्तृत जीवन रिपोर्ट का नमूना",
    language: "hindi",
    pageCount: 55,
    createdAt: new Date().toISOString(),
    downloadUrl: "/sample-palm-report-hindi.pdf",
    translationNote: "हमने आपकी विस्तृत रिपोर्ट का हिंदी में अनुवाद किया है। यह मशीन अनुवाद है और कुछ शब्दों का सटीक अनुवाद नहीं हो सकता है।",
    sections: [
      {
        title: "परिचय",
        content: "यह नमूना रिपोर्ट हमारे हस्तरेखा विश्लेषण की गहराई और विवरण को दर्शाती है। यह व्यापक जीवन रिपोर्ट उन्नत हस्तरेखा तकनीकों का उपयोग करके आपकी अनूठी हाथ विशेषताओं का विश्लेषण करती है और आपके अतीत, वर्तमान और भविष्य के बारे में अंतर्दृष्टि प्रदान करती है।",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
      },
      {
        title: "जीवन रेखा विश्लेषण",
        content: "आपकी जीवन रेखा असाधारण जीवन शक्ति और लचीलापन दर्शाती है। आपके अंगूठे के पहाड़ के चारों ओर इसका स्पष्ट, अटूट पथ असाधारण पुनर्निर्माण क्षमताओं और चुनौतियों का सामना करने में अनुकूलनशीलता का संकेत देता है।",
        image: "https://images.unsplash.com/photo-1538128845231-90c6d3f3abd3?q=80&w=1000"
      },
      {
        title: "प्रारंभिक जीवन चरण (0-15 वर्ष)",
        content: "आपकी जीवन रेखा का शुरुआती हिस्सा महत्वपूर्ण रचनात्मक अनुभवों से चिह्नित बचपन का संकेत देता है। इस बिंदु पर गहराई मजबूत आधारभूत प्रभावों का सुझाव देती है जो जीवन की चुनौतियों के प्रति आपके दृष्टिकोण को आकार देना जारी रखते हैं।",
        image: "https://images.unsplash.com/photo-1576505236555-42d3a0c1313d?q=80&w=1000"
      }
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
        description: 'This comprehensive report will include all life phases and will take a few moments to complete.',
        duration: 5000
      });

      // Get the basic reading text
      const baseReadingText = generateFullReadingText(reading.results, isPremium);
      
      // Generate a more detailed report using Gemini API
      let promptForAI = `Create a very detailed, comprehensive palm reading report of 50-70 pages based on this palm reading summary. Break it down into clear phases of life: early childhood (0-7), childhood (7-14), adolescence (14-21), early adulthood (21-28), adulthood (28-42), middle age (42-56), maturity (56-70), and wisdom years (70+). For each phase, provide rich, specific details on key events, challenges, opportunities, relationships, career developments, and spiritual growth.

Basic reading for reference: ${baseReadingText}

Use palmistry terminology correctly. Connect different aspects of the palm (life line, heart line, head line, fate line, etc.) to specific periods of life. Include specific predictions that feel personal and detailed, not general.

Format your response as a list of JSON objects with 'title' and 'content' fields for each section of the report. Each section should be substantial - around 1-2 pages of content.

Start with an introduction section, then a section explaining how to read the report, then the life phases in chronological order, and end with a conclusion section.`;

      // Use GeminiService to get the generated content
      const geminiResponse = await GeminiService.generateTextWithGemini(promptForAI);
      
      let sections: ReportSection[] = [];
      
      try {
        // Try to parse the response as JSON
        if (geminiResponse.includes('[') && geminiResponse.includes(']')) {
          const jsonStartIndex = geminiResponse.indexOf('[');
          const jsonEndIndex = geminiResponse.lastIndexOf(']') + 1;
          const jsonStr = geminiResponse.substring(jsonStartIndex, jsonEndIndex);
          sections = JSON.parse(jsonStr);
        } else {
          // Fallback to manual parsing if JSON parsing fails
          const fallbackSections = this.parseFallbackResponse(geminiResponse);
          if (fallbackSections.length > 0) {
            sections = fallbackSections;
          } else {
            throw new Error("Failed to parse AI response");
          }
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        // Create basic sections from the original reading
        sections = this.createBasicSections(baseReadingText);
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
        title: language === "hindi" ? "आपकी विस्तृत जीवन रिपोर्ट" : "Your Detailed Life Report",
        sections: sections,
        language: language,
        pageCount: Math.min(70, Math.max(50, sections.length * 3)), // Rough page estimate
        createdAt: new Date().toISOString(),
        translationNote: language === "hindi" ? "हमने आपकी विस्तृत रिपोर्ट का हिंदी में अनुवाद किया है। यह मशीन अनुवाद है और कुछ शब्दों का सटीक अनुवाद नहीं हो सकता है।" : "",
      };
      
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
          created_at: report.createdAt
        }]);
        
      if (error) {
        console.error("Error saving report to database:", error);
        throw new Error("Failed to save report");
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
      if (line.startsWith('#') || line.match(/^\d+\.\s/)) {
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
    // Basic Hindi translations for common titles
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
      "Spiritual Growth": "आध्यात्मिक विकास"
    };
    
    // Simple phrases to translate
    const commonPhrases: Record<string, string> = {
      "Your palm reading indicates": "आपकी हस्तरेखा से पता चलता है",
      "This suggests": "यह सुझाव देता है",
      "You have": "आपके पास है",
      "You will": "आप करेंगे",
      "Your future": "आपका भविष्य",
      "During this phase": "इस चरण के दौरान",
      "Your life line": "आपकी जीवन रेखा",
      "Your heart line": "आपकी हृदय रेखा",
      "Your head line": "आपकी मस्तिष्क रेखा",
      "Your fate line": "आपकी भाग्य रेखा",
      "relationships": "रिश्तों",
      "career": "करियर",
      "health": "स्वास्थ्य",
      "spirituality": "आध्यात्मिकता",
      "challenges": "चुनौतियों",
      "opportunities": "अवसरों",
      "life path": "जीवन पथ",
      "destiny": "भाग्य",
      "growth": "विकास",
      "insights": "अंतर्दृष्टि",
      "analysis": "विश्लेषण",
      "indicates": "इंगित करता है",
      "suggests": "सुझाव देता है",
      "reveals": "प्रकट करता है",
      "years": "वर्ष",
      "life": "जीवन",
      "phase": "चरण"
    };
    
    return sections.map(section => {
      // Translate title
      let translatedTitle = titleTranslations[section.title] || section.title;
      
      // Attempt to translate titles with age ranges
      if (section.title.includes("(") && section.title.includes(")")) {
        const baseTitlePart = section.title.split("(")[0].trim();
        const translatedBasePart = titleTranslations[baseTitlePart] || baseTitlePart;
        const agePart = section.title.match(/\(([^)]+)\)/)?.[0] || "";
        
        if (translatedBasePart !== baseTitlePart) {
          translatedTitle = `${translatedBasePart} ${agePart.replace("years", "वर्ष")}`;
        }
      }
      
      // Basic content translation (replace known phrases)
      let translatedContent = section.content;
      Object.entries(commonPhrases).forEach(([english, hindi]) => {
        translatedContent = translatedContent.replace(new RegExp(english, 'gi'), hindi);
      });
      
      return {
        ...section,
        title: translatedTitle,
        content: translatedContent
      };
    });
  }
  
  public getSampleReport(languageParam: string = "english"): DetailedLifeReport {
    return languageParam === "hindi" ? this.hindiSampleReport : this.sampleReport;
  }
  
  public async getReportsForUser(userId: string): Promise<DetailedLifeReport[]> {
    try {
      const { data, error } = await supabase
        .from('detailed_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        readingId: item.reading_id,
        title: item.title,
        sections: item.sections,
        language: item.language,
        pageCount: item.page_count,
        createdAt: item.created_at,
        downloadUrl: item.download_url
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }
  
  public async getReport(id: string): Promise<DetailedLifeReport | null> {
    try {
      const { data, error } = await supabase
        .from('detailed_reports')
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
        readingId: data.reading_id,
        title: data.title,
        sections: data.sections,
        language: data.language,
        pageCount: data.page_count,
        createdAt: data.created_at,
        downloadUrl: data.download_url
      };
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  }
}

export default ReportService.getInstance();

