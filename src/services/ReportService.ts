
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../lib/supabase";
import PDFService from './PDFService';
import GeminiService from './GeminiService';
import { ExtendedPalmReading } from '../types/PalmReading';
import { toast } from 'sonner';

export interface DetailedLifeReport {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  readingId: string;
  pageCount: number;
  sections: {
    title: string;
    content: string;
    image?: string;
  }[];
  language: string;
  translationNote?: string;
}

class ReportService {
  private static instance: ReportService;

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public async generateDetailedReport(reading: ExtendedPalmReading, isPremium: boolean): Promise<DetailedLifeReport> {
    try {
      if (!isPremium) {
        throw new Error("Premium subscription required to generate detailed reports");
      }

      // Check for existing report
      const { data: existingReport } = await supabase
        .from('detailed_reports')
        .select('*')
        .eq('reading_id', reading.id)
        .maybeSingle();

      if (existingReport) {
        // Return the existing report
        return {
          id: existingReport.id,
          userId: existingReport.user_id,
          title: existingReport.title,
          createdAt: existingReport.created_at,
          updatedAt: existingReport.updated_at,
          readingId: existingReport.reading_id,
          pageCount: existingReport.page_count,
          sections: existingReport.sections,
          language: existingReport.language || 'english'
        };
      }

      // Generate a new report
      const reportId = uuidv4();
      const language = reading.language || 'english';
      const title = language === 'hindi' 
        ? 'आपकी विस्तृत हस्तरेखा रिपोर्ट'
        : 'Your Detailed Palm Reading Report';
      
      // For demo purposes, create a report with placeholder sections
      const pageCount = 22;
      
      const sectionTitles = language === 'hindi' 
      ? [
          'परिचय और व्यक्तित्व विश्लेषण',
          'करियर और पेशेवर विकास',
          'प्रेम और रिश्ते',
          'स्वास्थ्य और कल्याण',
          'धन और वित्तीय समृद्धि',
          'जीवन के चरण और प्रमुख बदलाव',
          'आध्यात्मिक विकास और आंतरिक ज्ञान',
          'नाम, प्रसिद्धि और सार्वजनिक प्रभाव',
          'जीवन में चुनौतियां और समाधान',
          'भविष्य के लिए भविष्यवाणियां',
          'व्यक्तिगत सलाह और मार्गदर्शन'
        ]
      : [
          'Introduction & Personality Analysis',
          'Career & Professional Growth',
          'Love & Relationships',
          'Health & Wellbeing',
          'Wealth & Financial Prosperity',
          'Life Phases & Key Transitions',
          'Spiritual Growth & Inner Wisdom',
          'Name, Fame & Public Influence',
          'Challenges & Solutions in Life',
          'Predictions for the Future',
          'Personalized Advice & Guidance'
        ];
      
      // Generate report sections using a placeholder function
      const sections = await this.generateReportSections(sectionTitles, reading, language);
      
      const report: DetailedLifeReport = {
        id: reportId,
        userId: reading.userId,
        title: title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readingId: reading.id,
        pageCount: pageCount,
        sections: sections,
        language: language
      };
      
      // Save to database
      await supabase
        .from('detailed_reports')
        .insert([
          {
            id: report.id,
            user_id: report.userId,
            title: report.title,
            created_at: report.createdAt,
            updated_at: report.updatedAt,
            reading_id: report.readingId,
            page_count: report.pageCount,
            sections: report.sections,
            language: report.language
          }
        ]);
        
      return report;
    } catch (error) {
      console.error("Error generating detailed report:", error);
      throw error;
    }
  }
  
  private async generateReportSections(sectionTitles: string[], reading: ExtendedPalmReading, language: string) {
    // Simplified for demo, in a real app you would use AI to generate content for each section
    return Promise.all(sectionTitles.map(async (title, index) => {
      // Generate placeholder content
      const contentLength = 2000 + Math.floor(Math.random() * 1000);
      const paragraphCount = 3 + Math.floor(Math.random() * 3);
      
      const content = await this.generatePlaceholderContent(contentLength, paragraphCount, title, reading, language);
      
      // Placeholder images (in real app, these would be AI generated or from a library)
      const imageSrc = index % 3 === 0 ? `/placeholder.svg` : undefined;
      
      return {
        title,
        content,
        image: imageSrc
      };
    }));
  }
  
  private async generatePlaceholderContent(length: number, paragraphs: number, sectionTitle: string, reading: ExtendedPalmReading, language: string) {
    // In a real implementation, you would generate this content using AI
    // based on the reading data and section title
    
    try {
      // Try to generate content with AI
      return await this.generateContentWithAI(sectionTitle, reading, language);
    } catch (error) {
      console.error("Error generating content with AI, using fallback:", error);
      
      // Fallback content if AI fails
      const paragraphLength = Math.floor(length / paragraphs);
      let content = '';
      
      for (let i = 0; i < paragraphs; i++) {
        const baseText = language === 'hindi' 
          ? "यह एक व्यापक हस्तरेखा विश्लेषण है जो आपके जीवन के सभी पहलुओं का विस्तार से विवरण देता है। आपकी हस्तरेखाएँ दर्शाती हैं कि आप एक अद्वितीय व्यक्ति हैं जिनमें कई ताकतें और कुछ चुनौतियां हैं। आपकी जीवन रेखा मजबूत है, जो अच्छे स्वास्थ्य और लंबी आयु का संकेत देती है।" 
          : "This is a comprehensive palm reading analysis that delves into all aspects of your life in detail. Your palm lines indicate that you are a unique individual with many strengths and some challenges. Your life line is strong, suggesting good health and longevity.";
        
        content += baseText.repeat(Math.ceil(paragraphLength / baseText.length)).substring(0, paragraphLength);
        content += '\n\n';
      }
      
      return content.trim();
    }
  }
  
  private async generateContentWithAI(sectionTitle: string, reading: ExtendedPalmReading, language: string): Promise<string> {
    try {
      // Get relevant reading data for the section
      const sectionRelevantData = this.extractRelevantReadingData(sectionTitle, reading);
      
      // Create a prompt based on the section title and reading data
      const prompt = this.createAIPromptForSection(sectionTitle, sectionRelevantData, language);
      
      // Use the GeminiService to generate the content
      const generatedText = await GeminiService.generateTextWithGemini(prompt);
      
      return generatedText;
    } catch (error) {
      console.error("AI content generation error:", error);
      throw error;
    }
  }
  
  private extractRelevantReadingData(sectionTitle: string, reading: ExtendedPalmReading): any {
    // Extract data from reading that's relevant to the section
    const lowerTitle = sectionTitle.toLowerCase();
    const data: any = {
      general: {
        overallSummary: reading.results?.overallSummary || "",
        personalityTraits: reading.results?.personalityTraits || []
      }
    };
    
    if (lowerTitle.includes('personality') || lowerTitle.includes('व्यक्तित्व')) {
      data.personality = {
        headLine: reading.results?.headLine,
        heartLine: reading.results?.heartLine,
        personalityTraits: reading.results?.personalityTraits
      };
    }
    
    if (lowerTitle.includes('career') || lowerTitle.includes('professional') || lowerTitle.includes('करियर') || lowerTitle.includes('पेशेवर')) {
      data.career = reading.results?.career;
      data.fate = reading.results?.fate;
    }
    
    if (lowerTitle.includes('love') || lowerTitle.includes('relationship') || lowerTitle.includes('प्रेम') || lowerTitle.includes('रिश्ते')) {
      data.relationships = reading.results?.relationships;
      data.heartLine = reading.results?.heartLine;
    }
    
    if (lowerTitle.includes('health') || lowerTitle.includes('wellbeing') || lowerTitle.includes('स्वास्थ्य') || lowerTitle.includes('कल्याण')) {
      data.health = reading.results?.health;
      data.lifeLine = reading.results?.lifeLine;
    }
    
    if (lowerTitle.includes('wealth') || lowerTitle.includes('financial') || lowerTitle.includes('धन') || lowerTitle.includes('वित्तीय')) {
      data.fate = reading.results?.fate;
      data.elementalInfluences = reading.results?.elementalInfluences;
    }
    
    if (lowerTitle.includes('life phases') || lowerTitle.includes('transitions') || lowerTitle.includes('जीवन के चरण') || lowerTitle.includes('बदलाव')) {
      data.past = reading.results?.past;
      data.present = reading.results?.present;
      data.future = reading.results?.future;
    }
    
    if (lowerTitle.includes('spiritual') || lowerTitle.includes('wisdom') || lowerTitle.includes('आध्यात्मिक') || lowerTitle.includes('ज्ञान')) {
      data.elementalInfluences = reading.results?.elementalInfluences;
    }
    
    if (lowerTitle.includes('challenges') || lowerTitle.includes('solutions') || lowerTitle.includes('चुनौतियां') || lowerTitle.includes('समाधान')) {
      data.remedies = reading.results?.remedies;
    }
    
    if (lowerTitle.includes('predictions') || lowerTitle.includes('future') || lowerTitle.includes('भविष्यवाणियां') || lowerTitle.includes('भविष्य')) {
      data.future = reading.results?.future;
      data.fate = reading.results?.fate;
    }
    
    return data;
  }
  
  private createAIPromptForSection(sectionTitle: string, data: any, language: string): string {
    // Create a detailed prompt for the AI based on the section title and reading data
    const basePrompt = language === 'hindi' 
      ? `कृपया एक हस्तरेखा रिपोर्ट के निम्न अनुभाग के लिए विस्तृत और व्यावसायिक सामग्री तैयार करें: "${sectionTitle}". यह एक गंभीर व्यावसायिक दस्तावेज़ होना चाहिए, न कि एक सामान्य पाम रीडिंग। आपको निम्न पाम रीडिंग विवरण दिए गए हैं:\n\n`
      : `Please create detailed and professional content for the following section of a palm reading report: "${sectionTitle}". This should be a serious professional document, not a casual palm reading. You have been provided with the following palm reading details:\n\n`;
    
    // Add relevant data to the prompt
    const dataString = JSON.stringify(data, null, 2);
    
    const instructionsPrompt = language === 'hindi'
      ? `\n\nकृपया उपरोक्त जानकारी का उपयोग करके 3-4 पैराग्राफ की सामग्री तैयार करें। यह विश्वसनीय, व्यावसायिक और आत्म-सुधार पर केंद्रित होनी चाहिए। किसी भी अंधविश्वास या अतिरंजित दावों से बचें। हर पैराग्राफ के बीच एक लाइन की दूरी रखें। सामग्री का केवल मुख्य भाग दें, कोई शीर्षक, प्रारूपण या अतिरिक्त टिप्पणियां न दें।`
      : `\n\nPlease create 3-4 paragraphs of content using the information above. It should be credible, professional, and focused on self-improvement. Avoid any superstition or exaggerated claims. Keep one line of space between paragraphs. Provide only the main body of content, no headings, formatting, or additional comments.`;
    
    return `${basePrompt}${dataString}${instructionsPrompt}`;
  }
  
  public async getDetailedReport(reportId: string): Promise<DetailedLifeReport | null> {
    try {
      // Special case for sample reports
      if (reportId === 'sample-report' || reportId === 'sample-report-hindi') {
        return this.getSampleReport(reportId === 'sample-report-hindi' ? 'hindi' : 'english');
      }
      
      const { data, error } = await supabase
        .from('detailed_reports')
        .select('*')
        .eq('id', reportId)
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
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        readingId: data.reading_id,
        pageCount: data.page_count,
        sections: data.sections,
        language: data.language || 'english'
      };
    } catch (error) {
      console.error("Error getting detailed report:", error);
      return null;
    }
  }
  
  public getSampleReport(language: string = 'english'): DetailedLifeReport {
    const isSample = true;
    const demoUserId = '00000000-0000-0000-0000-000000000000';
    
    return {
      id: language === 'hindi' ? 'sample-report-hindi' : 'sample-report',
      userId: demoUserId,
      title: language === 'hindi' ? 'नमूना विस्तृत हस्तरेखा रिपोर्ट' : 'Sample Detailed Palm Reading Report',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingId: 'sample-reading',
      pageCount: 24,
      language: language,
      translationNote: language === 'hindi' ? "यह एक मशीन अनुवादित नमूना है। वास्तविक रिपोर्ट में अधिक परिष्कृत भाषा होगी।" : undefined,
      sections: this.generateSampleSections(language)
    };
  }
  
  private generateSampleSections(language: string) {
    // For a real implementation, this would generate AI content for the sample
    const sections = language === 'hindi' 
    ? [
        {
          title: 'परिचय और व्यक्तित्व विश्लेषण',
          content: 'आपकी हस्तरेखाओं से आपके व्यक्तित्व की एक विशिष्ट और जटिल तस्वीर सामने आती है। आपकी हथेली पर मौजूद प्रमुख रेखाएँ - जीवन रेखा, हृदय रेखा और मस्तिष्क रेखा - एक ऐसे व्यक्ति को प्रकट करती हैं जो बुद्धिमान, भावनात्मक रूप से परिपक्व और जीवन शक्ति से भरपूर है। आपकी हृदय रेखा की स्पष्टता और गहराई उच्च भावनात्मक बुद्धिमत्ता का संकेत देती है, जो आपको दूसरों की भावनाओं को समझने और अपनी स्वयं की भावनाओं को संतुलित तरीके से व्यक्त करने की क्षमता देती है।\n\nआपकी मस्तिष्क रेखा, जो आपकी हथेली के मध्य से गुजरती है, विश्लेषणात्मक सोच और रचनात्मक प्रतिभा के बीच असाधारण संतुलन दिखाती है। इसकी स्पष्ट गहराई और मामूली लहराव इंगित करता है कि आप सूक्ष्म विवरणों को देख सकते हैं जबकि व्यापक दृष्टि भी बनाए रखते हैं - एक दुर्लभ गुण जो आपको पेशेवर और व्यक्तिगत दोनों क्षेत्रों में विशेष रूप से प्रभावी बनाता है। आपकी जीवन रेखा जो अंगूठे के चारों ओर घूमती है, लचीलापन और जीवन शक्ति के साथ स्पष्ट रूप से अंकित है, जो दर्शाती है कि आप चुनौतियों का सामना करने के बाद जल्दी से उबर सकते हैं और मानसिक और शारीरिक ऊर्जा के स्वाभाविक स्रोत हैं।\n\nआपके हाथ के पर्वतों (हथेली के उभरे हुए क्षेत्र) से अतिरिक्त अंतर्दृष्टि मिलती है। अपोलो पर्वत (अनामिका उंगली के नीचे) का विकास रचनात्मकता और आत्म-अभिव्यक्ति की प्रवृत्ति दिखाता है, जबकि मर्करी पर्वत (कनिष्ठिका के नीचे) का स्पष्ट उपस्थिति संचार कौशल और त्वरित बुद्धिमत्ता इंगित करता है। आपकी उंगलियों की संरचना भी महत्वपूर्ण है, जिसमें विश्लेषणात्मक तर्जनी और प्रेरित मध्यमा कौशल और रचनात्मकता के संयोजन का संकेत देती है। यह व्यक्तित्व प्रोफ़ाइल एक बहुमुखी, आत्म-जागरूक व्यक्ति की पहचान करती है जो जटिल विचारों को कुशलता से संभाल सकता है और साथ ही मानवीय संबंधों में सहजता महसूस कर सकता है।',
          image: '/placeholder.svg'
        },
        {
          title: 'करियर और पेशेवर विकास',
          content: 'आपकी भाग्य रेखा, जो आपकी हथेली के केंद्र में ऊपर की ओर जाती है, अत्यधिक विकसित है, जो एक लक्ष्य-उन्मुख व्यावसायिक पथ का संकेत देती है जिसमें महत्वपूर्ण प्रभाव और वृद्धि की क्षमता है। इस रेखा की स्पष्टता और गहराई ऐसे करियर का सुझाव देती है जो केवल आर्थिक लाभ से परे है - यह मार्गदर्शन, नेतृत्व और महत्वपूर्ण योगदान की भूमिका का संकेत देता है। आपकी भाग्य रेखा और मस्तिष्क रेखा के बीच का कनेक्शन विशेष रूप से महत्वपूर्ण है, जो इंगित करता है कि आपके सोचने का तरीका और निर्णय लेने की क्षमता आपके पेशेवर सफलता के प्रमुख कारक हैं।\n\nआपकी हथेली के ज्यूपिटर पर्वत (तर्जनी उंगली के नीचे) का विकास नेतृत्व क्षमताओं को इंगित करता है, जबकि आपके सैटर्न पर्वत (मध्य उंगली के नीचे) की स्थिरता जिम्मेदारियों को संभालने और जटिल संरचनाओं में काम करने की क्षमता दिखाती है। आपकी मस्तिष्क रेखा पर स्टार के समान निशान रचनात्मक समस्या-समाधान क्षमता का संकेत देते हैं जो आपको नवीन समाधान विकसित करने और अपने क्षेत्र में मूल्य जोड़ने की अनुमति देती है। पेशेवर संदर्भ में, आपकी जीवन रेखा और हृदय रेखा के बीच का संतुलन इंगित करता है कि वृद्धि सबसे अधिक होती है जब आपका काम आपके मूल्यों के साथ संरेखित होता है।\n\nध्यान देने योग्य एक और पहलू है आपकी उंगलियों के बीच का अंतरिक्ष, विशेष रूप से अनामिका और कनिष्ठिका के बीच का अंतर। यह पैटर्न आपकी अंतर्निहित रचनात्मकता और नवाचार क्षमता का संकेत देता है, लेकिन साथ ही व्यावहारिक अनुप्रयोगों के लिए प्राकृतिक झुकाव भी दिखाता है। यह संयोजन आपको डिजाइन, रणनीतिक नेतृत्व, प्रबंधन सलाहकार, स्वास्थ्य देखभाल, शिक्षा, या अन्य क्षेत्रों जहां तकनीकी विशेषज्ञता और मानवीय संपर्क दोनों आवश्यक हैं, जैसे क्षेत्रों के लिए उपयुक्त बनाता है। आपकी हथेली यह भी संकेत देती है कि आपकी सबसे बड़ी पेशेवर संतुष्टि तब आती है जब आप अपनी विश्लेषणात्मक क्षमताओं और मानवीय अंतर्दृष्टि का उपयोग समान रूप से कर सकते हैं, जो केवल पारंपरिक करियर मार्गों के बजाय पेशेवर संतुलन की जटिल, बहुआयामी समझ का सुझाव देता है।',
          image: undefined
        },
        {
          title: 'प्रेम और रिश्ते',
          content: 'आपकी हृदय रेखा, जो आपकी हथेली के ऊपरी भाग में फैली है, भावनात्मक स्वास्थ्य और रिश्तों के प्रति आपके दृष्टिकोण के बारे में महत्वपूर्ण अंतर्दृष्टि प्रदान करती है। इसकी स्पष्ट, गहरी प्रकृति आपके रिश्तों में गहन भावनात्मक क्षमता और प्रामाणिकता का संकेत देती है। विशेष रूप से महत्वपूर्ण है आपकी हृदय रेखा का ज्यूपिटर की ओर (तर्जनी उंगली के नीचे) थोड़ा झुकाव, जो दर्शाता है कि आप अपने साथी में प्रामाणिकता और बौद्धिक संगति को महत्व देते हैं, न कि केवल सतही आकर्षण को।\n\nआपकी वीनस पर्वत (अंगूठे के आधार पर) के लक्षण प्यार और भावनात्मक कनेक्शन के प्रति आपके दृष्टिकोण को और समृद्ध करते हैं। इसका विकास और कुछ महीन रेखाएँ जो इस पर मौजूद हैं, इंगित करती हैं कि आप गहरे, अर्थपूर्ण संबंधों की तलाश करते हैं जो समय के साथ विकसित होते हैं। आपकी हृदय रेखा पर रिंग ऑफ सॉलोमन का संकेत (मध्य और अनामिका उंगली के बीच) अपने साथी की भावनाओं और आवश्यकताओं के प्रति असाधारण अंतर्ज्ञान दिखाता है, जो आपको एक परवाह करने वाला और समझदार जीवनसाथी बनाता है।\n\nआपकी जीवन रेखा और हृदय रेखा के बीच का संबंध भी महत्वपूर्ण है। ये दोनों रेखाएँ एक दूसरे को समर्थन देती प्रतीत होती हैं, जो दर्शाती हैं कि स्वस्थ रिश्ते आपके समग्र जीवन शक्ति और कल्याण में महत्वपूर्ण भूमिका निभाते हैं। इसके साथ ही, आपकी मर्करी पर्वत (कनिष्ठिका उंगली के नीचे) पर स्पष्ट रेखाएँ उत्कृष्ट संचार कौशल का संकेत देती हैं - जो किसी भी स्वस्थ संबंध का आधार है। आपकी हथेली यह भी सुझाव देती है कि आप अपने साथी के साथ पारस्परिक विकास और शेयरिंग पर आधारित संबंध में सबसे अधिक संतुष्टि पाते हैं, जहां दोनों व्यक्ति स्वतंत्रता और घनिष्ठता के बीच एक स्वस्थ संतुलन पाते हैं। यह पैटर्न सुझाव देता है कि आप एक साथी की तलाश करते हैं जो आपकी भावनात्मक गहराई को समझता हो, लेकिन साथ ही आपके व्यक्तिगत लक्ष्यों और आकांक्षाओं का भी सम्मान करता हो।',
          image: undefined
        }
      ]
    : [
        {
          title: 'Introduction & Personality Analysis',
          content: 'Your palm reveals a distinct and complex personality profile. The three major lines on your palm—the life line, heart line, and head line—present a picture of an individual who is intellectually sharp, emotionally mature, and filled with vitality. The clarity and depth of your heart line indicate high emotional intelligence, giving you the ability to understand others' feelings and express your own emotions in a balanced manner.\n\nYour head line, which runs across the middle of your palm, shows an exceptional balance between analytical thinking and creative talent. Its clear depth and slight wave indicate that you can see minute details while maintaining a broad vision—a rare quality that makes you particularly effective in both professional and personal spheres. Your life line, which curves around your thumb, is distinctly marked with resilience and vitality, suggesting you recover quickly after facing challenges and are a natural source of mental and physical energy.\n\nAdditional insight comes from the mounts of your hand (the padded areas). The development of the Mount of Apollo (under your ring finger) shows a tendency toward creativity and self-expression, while the prominent Mount of Mercury (under your little finger) indicates communication skills and quick intelligence. The structure of your fingers is also significant, with an analytical index finger and an inspired middle finger suggesting a combination of skill and creativity. This personality profile identifies a versatile, self-aware individual who can handle complex ideas with ease while also being comfortable in human relationships.',
          image: '/placeholder.svg'
        },
        {
          title: 'Career & Professional Growth',
          content: 'Your fate line, rising up the center of your palm, is highly developed, indicating a goal-oriented career path with potential for significant impact and growth. The clarity and depth of this line suggest a career that extends beyond financial gain—it points to a role of guidance, leadership, and meaningful contribution. The connection between your fate line and head line is particularly significant, indicating that your way of thinking and decision-making ability are key factors in your professional success.\n\nThe development of the Mount of Jupiter (under your index finger) on your palm indicates leadership capabilities, while the solidity of your Mount of Saturn (under your middle finger) shows ability to handle responsibilities and work within complex structures. Star-like markings on your head line suggest creative problem-solving abilities that allow you to develop innovative solutions and add value in your field. The balance between your life line and heart line in a professional context indicates that growth is greatest when your work aligns with your values.\n\nAnother noteworthy aspect is the spacing between your fingers, particularly the gap between the ring and little fingers. This pattern indicates innate creativity and capacity for innovation, but also shows a natural inclination toward practical applications. This combination makes you well-suited for fields like design, strategic leadership, management consulting, healthcare, education, or other areas where both technical expertise and human connection are essential. Your palm also indicates that your greatest professional satisfaction comes when you can utilize both your analytical capabilities and human insight equally, suggesting a complex, multidimensional understanding of professional fulfillment rather than just traditional career paths.',
          image: undefined
        },
        {
          title: 'Love & Relationships',
          content: 'Your heart line, spanning the upper part of your palm, provides significant insight into your emotional health and approach to relationships. Its clear, deep nature indicates profound emotional capacity and authenticity in your relationships. Particularly significant is the slight curve of your heart line toward Jupiter (under the index finger), suggesting that you value authenticity and intellectual compatibility in a partner rather than just surface attraction.\n\nThe markings on your Mount of Venus (at the base of the thumb) further enrich your approach to love and emotional connection. Its development and some fine lines present on it indicate that you seek deep, meaningful relationships that evolve over time. The indication of the Ring of Solomon on your heart line (between the middle and ring fingers) shows exceptional intuition regarding your partner's emotions and needs, making you a caring and understanding companion.\n\nThe relationship between your life line and heart line is also significant. These two lines appear to support each other, indicating that healthy relationships play a crucial role in your overall vitality and wellbeing. Additionally, clear lines on your Mercury mount (beneath your little finger) indicate excellent communication skills—the foundation of any healthy relationship. Your palm also suggests that you find the most satisfaction in a relationship based on mutual growth and sharing, where both individuals find a healthy balance between independence and intimacy. This pattern suggests you seek a partner who understands your emotional depth but also respects your individual goals and aspirations.',
          image: undefined
        }
      ];
      
    // In a production app, we'd have all sections completed
    return sections;
  }
  
  public async generatePDFForReport(report: DetailedLifeReport | string): Promise<string> {
    try {
      let reportObject: DetailedLifeReport;
      
      // If a string is provided, treat it as a report ID and fetch the report
      if (typeof report === 'string') {
        const fetchedReport = await this.getDetailedReport(report);
        if (!fetchedReport) {
          throw new Error("Report not found");
        }
        reportObject = fetchedReport;
      } else {
        reportObject = report;
      }
      
      // Use the PDFService to generate a PDF from the report
      const pdfUrl = await PDFService.generatePDFFromReport(reportObject);
      return pdfUrl;
    } catch (error) {
      console.error("Error generating PDF for report:", error);
      throw error;
    }
  }
  
  public async generateAISampleReport(language: string = 'english'): Promise<DetailedLifeReport> {
    try {
      toast.info('Generating AI sample report', {
        description: 'Creating your AI-powered sample report. This may take a moment...',
        duration: 5000
      });

      // Create the base sample report structure
      const demoUserId = '00000000-0000-0000-0000-000000000000';
      const reportId = language === 'hindi' ? 'sample-report-hindi' : 'sample-report';
      const title = language === 'hindi' ? 'AI नमूना हस्तरेखा रिपोर्ट' : 'AI Sample Palm Reading Report';
      
      const sectionTitles = language === 'hindi' 
        ? [
            'परिचय और व्यक्तित्व विश्लेषण',
            'करियर और पेशेवर विकास',
            'प्रेम और रिश्ते',
            'स्वास्थ्य और कल्याण',
            'धन और वित्तीय समृद्धि',
            'जीवन के चरण और प्रमुख बदलाव'
          ]
        : [
            'Introduction & Personality Analysis',
            'Career & Professional Growth',
            'Love & Relationships',
            'Health & Wellbeing',
            'Wealth & Financial Prosperity',
            'Life Phases & Key Transitions'
          ];
      
      // Create a mock reading to pass to the AI
      const mockReading: any = {
        id: 'sample-reading',
        userId: demoUserId,
        language: language,
        results: {
          lifeLine: {
            strength: 85,
            prediction: language === 'hindi' 
              ? "आपकी जीवन रेखा असाधारण जीवन शक्ति और लचीलापन प्रकट करती है"
              : "Your life line reveals exceptional vitality and resilience"
          },
          heartLine: {
            strength: 90,
            prediction: language === 'hindi'
              ? "आपकी हृदय रेखा असाधारण भावनात्मक बुद्धिमत्ता का संकेत देती है"
              : "Your heart line indicates exceptional emotional intelligence"
          },
          headLine: {
            strength: 88,
            prediction: language === 'hindi'
              ? "आपकी मस्तिष्क रेखा मानसिक फुर्ती और गहराई का प्रदर्शन करती है"
              : "Your head line demonstrates mental agility paired with uncommon depth"
          },
          fateLinePresent: true,
          fate: {
            strength: 92,
            prediction: language === 'hindi'
              ? "आपकी भाग्य रेखा स्पष्ट उद्देश्य द्वारा निर्देशित जीवन का संकेत देती है"
              : "Your fate line indicates a life guided by clear purpose"
          },
          overallSummary: language === 'hindi'
            ? "आपकी हथेली बौद्धिकता, भावना और उद्देश्य का असाधारण एकीकरण प्रकट करती है"
            : "Your palm reveals exceptional integration of intellect, emotion, and purpose",
          personalityTraits: language === 'hindi'
            ? ["संवेदनशील फिर भी विवेकपूर्ण", "विश्लेषणात्मक रूप से रचनात्मक", "दबाव में लचीला"]
            : ["Empathetic yet discerning", "Analytically creative", "Resilient under pressure"]
        }
      };
      
      // Generate AI content for each section
      const sections = await Promise.all(sectionTitles.map(async (title, index) => {
        try {
          // Create AI prompt for this section
          const sectionData = this.extractRelevantReadingData(title, mockReading);
          const prompt = this.createAIPromptForSection(title, sectionData, language);
          
          // Generate content using AI
          const content = await GeminiService.generateTextWithGemini(prompt);
          
          // Placeholder image for some sections
          const image = index === 0 ? '/placeholder.svg' : undefined;
          
          return {
            title,
            content,
            image
          };
        } catch (error) {
          console.error(`Error generating AI content for section "${title}":`, error);
          
          // Fallback content
          return {
            title,
            content: language === 'hindi'
              ? "इस अनुभाग के लिए AI सामग्री जनरेट करने में त्रुटि। यह एक स्थानापन्न पाठ है।"
              : "Error generating AI content for this section. This is placeholder text.",
            image: index === 0 ? '/placeholder.svg' : undefined
          };
        }
      }));
      
      const report: DetailedLifeReport = {
        id: reportId,
        userId: demoUserId,
        title: title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readingId: 'sample-reading',
        pageCount: 20 + sections.length,
        language: language,
        translationNote: language === 'hindi' ? "यह एक AI द्वारा जनित नमूना रिपोर्ट है। वास्तविक रिपोर्ट में और अधिक विस्तृत सामग्री होगी।" : undefined,
        sections: sections
      };
      
      toast.success('AI sample report generated', {
        description: 'Your AI-powered sample report is ready to view'
      });
      
      return report;
    } catch (error) {
      console.error("Error generating AI sample report:", error);
      toast.error('Failed to generate AI sample', {
        description: 'Using fallback sample report instead'
      });
      
      // Fall back to the static sample report
      return this.getSampleReport(language);
    }
  }
}

export default ReportService.getInstance();
