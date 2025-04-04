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
    title: "Comprehensive Palmistry Report (20+ Pages)",
    language: "english",
    pageCount: 24,
    createdAt: new Date().toISOString(),
    downloadUrl: "",
    translationNote: "",
    sections: [
      {
        title: "Introduction to Your Palm Reading",
        content: "This report is based on your palm features, including the shape, lines, mounts, and markings. It provides deep insights into your past, present, and future, helping you understand your strengths, weaknesses, and opportunities for growth.\n\nYour palm is a map of your life journey, revealing the potential paths and possibilities that lie ahead. The analysis provided here is based on the ancient science of palmistry, combined with modern psychological insights.",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
      },
      {
        title: "Personality Analysis (Strengths, Weaknesses, Temperament)",
        content: "Your palm structure suggests a strong and independent personality. You have a sharp intellect and a keen sense of intuition. The shape of your fingers indicates a natural ability to analyze situations and make calculated decisions.\n\nKey Personality Traits:\n- Strong fate line: Indicates determination and success through hard work.\n- Deep head line: Suggests intelligence and deep thinking.\n- Straight fingers: Show discipline and organization.\n- Curved heart line: Reveals emotional depth and a need for strong relationships.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000"
      },
      {
        title: "Career & Professional Growth (Job vs. Business)",
        content: "Your career lines indicate both job stability and potential for entrepreneurship. If you have a strong Sun Line, it suggests recognition in your field, while a deep Mercury Line signifies business acumen.\n\nCareer Analysis:\n- Strong Fate Line: Suitable for long-term jobs and leadership roles.\\n- Prominent Sun Line: Potential for fame and success in creative or public fields.\\n- Well-defined Mercury Line: Business skills and negotiation power.\n\nJob vs. Business Decision:\n- If your Fate Line is deep and unbroken, a corporate career is favorable.\\n- If the Mercury Line is strong with multiple branches, entrepreneurship is a better choice.",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000"
      },
      {
        title: "Love & Relationships (Romantic, Family, and Social Life)",
        content: "The heart line in your palm suggests your emotional depth and the way you connect with people. A long, curved heart line indicates a passionate and expressive personality, while a short or broken heart line may suggest emotional struggles.\n\nLove & Marriage Insights:\n- A deep heart line indicates loyalty and strong emotional bonds.\\n- A broken heart line may suggest past heartbreaks or trust issues.\\n- Parallel lines near the heart line show long-lasting relationships.",
        image: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1000"
      },
      {
        title: "Health & Well-being (Mental, Emotional, and Physical Health)",
        content: "Your life line and health line provide insights into your overall well-being. A deep life line suggests robust health, while breaks in the line may indicate potential health concerns.\n\nKey Health Indicators:\n- A deep life line: Good overall health and longevity.\\n- A faint health line: Potential minor ailments or stress-related issues.\\n- Breaks in the life line: Major life changes affecting health.",
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000"
      },
      {
        title: "Wealth & Financial Growth (Income, Investments, Stability)",
        content: "Your palm reveals a steady accumulation of wealth rather than sudden riches. If your fate line is strong, financial stability is likely. A well-developed Sun Mount suggests financial gains through recognition.\n\nWealth & Prosperity Insights:\n- Clear money lines: Indicate financial stability and potential gains.\\n- A well-defined fate line: Shows structured financial growth over time.\\n- Breaks in the money line: Indicate financial ups and downs that require careful planning.",
        image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1000"
      },
      {
        title: "Life Phases & Key Transitions (Past, Present, Future)",
        content: "Palmistry reveals different phases of your life through changes in the fate line, life line, and other markings. Significant transitions can be seen where lines intersect or break.\n\nLife Stages Breakdown:\n- Childhood: Influence of early family life on personality and growth.\\n- Young Adulthood: Career choices, education, and major decisions.\\n- Midlife: Stability, financial growth, and family responsibilities.\\n- Later Years: Wisdom, legacy, and personal fulfillment.",
        image: "https://images.unsplash.com/photo-1506485338023-6ce5f36692df?q=80&w=1000"
      },
      {
        title: "Spiritual Growth & Inner Wisdom",
        content: "Your palm's Saturn and Jupiter mounts indicate your spiritual path and wisdom. A strong Mount of Jupiter suggests leadership in spiritual or philosophical matters.\n\nSpiritual Insights:\n- Strong Jupiter Mount: Leadership and wisdom.\\n- Well-developed Saturn Mount: Deep thinking and spiritual growth.",
        image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=1000"
      },
      {
        title: "Name, Fame & Public Influence",
        content: "The Sun Line plays a key role in determining your social recognition and influence. A strong Sun Line indicates fame and success in public life.\n\nFame & Recognition:\n- A strong Sun Line: Recognition in career and public life.\\n- Parallel success lines: Multiple achievements over time.",
        image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000"
      },
      {
        title: "Challenges & Solutions in Life",
        content: "Every palm has markings that reveal challenges and possible solutions. Crosses, breaks, and islands in the major lines suggest struggles, while a well-defined fate line indicates overcoming obstacles.\n\nCommon Challenges & Their Solutions:\n- Breaks in the fate line: Career or financial shifts; adaptability is key.\\n- Crosses on the heart line: Emotional struggles; patience is required.\\n- Weak life line: Low energy; focus on health and wellness.",
        image: "https://images.unsplash.com/photo-1544306094-e2dcf9479da3?q=80&w=1000"
      },
      {
        title: "Predictions for the Future (Opportunities & Threats)",
        content: "Based on your palm's current markings, the following predictions can be made:\n\n- Career Growth: Your career is set for major growth between the ages of 30-40.\\n- Financial Stability: Financial gains will be steady with possible investment success.\\n- Relationships: A strong, lasting relationship is likely, with some emotional hurdles.\\n- Health Awareness: Minor health concerns may arise, but can be managed with self-care.",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000"
      },
      {
        title: "Personalized Advice & Guidance",
        content: "Based on your palm reading, here are some key recommendations:\n- Career: Focus on stability and strategic career moves.\\n- Love: Communicate openly to strengthen relationships.\\n- Health: Adopt a stress-free lifestyle for long-term wellness.\\n- Finance: Invest wisely and plan for financial security.\\n- Personal Growth: Work on self-confidence and emotional intelligence.",
        image: "https://images.unsplash.com/photo-1513135185947-4f716b9c3b6f?q=80&w=1000"
      },
      {
        title: "Ask Any Question",
        content: "Would you like to ask about your career, business, love life, health, or any other aspect? Feel free to ask, and we will provide specific insights based on your palm reading.\n\nThis full detailed report provides an in-depth analysis of your palm, covering every aspect of life from career and wealth to relationships and health. It is designed to give you clarity and actionable guidance for your journey ahead.",
        image: "https://images.unsplash.com/photo-1577457943926-11d6cd3ce8ae?q=80&w=1000"
      }
    ]
  };

  private hindiSampleReport: DetailedLifeReport = {
    id: "sample-report-hindi",
    userId: "sample",
    readingId: "sample",
    title: "व्यापक हस्तरेखा रिपोर्ट (20+ पृष्ठ)",
    language: "hindi",
    pageCount: 24,
    createdAt: new Date().toISOString(),
    downloadUrl: "",
    translationNote: "हमने आपकी विस्तृत रिपोर्ट का हिंदी में अनुवाद किया है। यह हमारे उन्नत अनुवाद तकनीक का उपयोग करता है जो विशेष पारिभाषिक शब्दों को सटीक रूप से अनुवादित करता है।",
    sections: [
      {
        title: "आपकी हस्तरेखा पढ़ने का परिचय",
        content: "यह रिपोर्ट आपकी हथेली की विशेषताओं पर आधारित है, जिसमें आकार, रेखाएं, पर्वत और निशान शामिल हैं। यह आपके अतीत, वर्तमान और भविष्य में गहरी अंतर्दृष्टि प्रदान करता है, जिससे आपको अपनी ताकत, कमजोरियों और विकास के अवसरों को समझने में मदद मिलती है।\n\nआपकी हथेली आपके जीवन की यात्रा का एक नक्शा है, जो संभावित रास्तों और संभावनाओं को प्रकट करता है जो आगे हैं। यहां प्रदान किया गया विश्लेषण हस्तरेखा विज्ञान के प्राचीन विज्ञान पर आधारित है, जो आधुनिक मनोवैज्ञानिक अंतर्दृष्टि के साथ संयुक्त है।",
        image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
      },
      {
        title: "व्यक्तित्व विश्लेषण (ताकत, कमजोरियाँ, स्वभाव)",
        content: "आपकी हथेली की संरचना एक मजबूत और स्वतंत्र व्यक्तित्व का सुझाव देती है। आपके पास एक तेज बुद्धि और अंतर्ज्ञान की गहरी भावना है। आपकी उंगलियों का आकार स्थितियों का विश्लेषण करने और गणनात्मक निर्णय लेने की एक प्राकृतिक क्षमता को इंगित करता है।\n\nमुख्य व्यक्तित्व लक्षण:\n- मजबूत भाग्य रेखा: कड़ी मेहनत के माध्यम से दृढ़ संकल्प और सफलता को इंगित करता है।\n- गहरी सिर रेखा: बुद्धि और गहरी सोच का सुझाव देता है।\n- सीधी उंगलियां: अनुशासन और संगठन दिखाती हैं।\n- घुमावदार हृदय रेखा: भावनात्मक गहराई और मजबूत रिश्तों की आवश्यकता को प्रकट करता है।",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000"
      },
      {
        title: "कैरियर और व्यावसायिक विकास (नौकरी बनाम व्यवसाय)",
        content: "आपकी करियर लाइनें नौकरी की स्थिरता और उद्यमिता दोनों की क्षमता को दर्शाती हैं। यदि आपके पास एक मजबूत सूर्य रेखा है, तो यह आपके क्षेत्र में मान्यता का सुझाव देता है, जबकि एक गहरी बुध रेखा व्यावसायिक कौशल को दर्शाती है।\n\nकैरियर विश्लेषण:\n- मजबूत भाग्य रेखा: दीर्घकालिक नौकरियों और नेतृत्व भूमिकाओं के लिए उपयुक्त।\n- प्रमुख सूर्य रेखा: रचनात्मक या सार्वजनिक क्षेत्रों में प्रसिद्धि और सफलता की क्षमता।\n- अच्छी तरह से परिभाषित बुध रेखा: व्यावसायिक कौशल और बातचीत की शक्ति।\n\nनौकरी बनाम व्यवसाय निर्णय:\n- यदि आपकी भाग्य रेखा गहरी और अटूट है, तो एक कॉर्पोरेट कैरियर अनुकूल है।\n- यदि बुध रेखा कई शाखाओं के साथ मजबूत है, तो उद्यमिता एक बेहतर विकल्प है।",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000"
      },
      {
        title: "प्यार और रिश्ते (रोमांटिक, पारिवारिक और सामाजिक जीवन)",
        content: "आपकी हथेली में हृदय रेखा आपकी भावनात्मक गहराई और जिस तरह से आप लोगों से जुड़ते हैं, उसका सुझाव देती है। एक लंबी, घुमावदार हृदय रेखा एक भावुक और अभिव्यंजक व्यक्तित्व को इंगित करती है, जबकि एक छोटी या टूटी हुई हृदय रेखा भावनात्मक संघर्षों का सुझाव दे सकती है।\n\nप्यार और विवाह अंतर्दृष्टि:\n- एक गहरी हृदय रेखा वफादारी और मजबूत भावनात्मक बंधन को इंगित करती है।\n- एक टूटी हुई हृदय रेखा अतीत के दिल टूटने या विश्वास के मुद्दों का सुझाव दे सकती है।\n- हृदय रेखा के पास समानांतर रेखाएं लंबे समय तक चलने वाले रिश्तों को दिखाती हैं।",
        image: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1000"
      },
      {
        title: "स्वास्थ्य और कल्याण (मानसिक, भावनात्मक और शारीरिक स्वास्थ्य)",
        content: "आपकी जीवन रेखा और स्वास्थ्य रेखा आपके समग्र कल्याण में अंतर्दृष्टि प्रदान करती है। एक गहरी जीवन रेखा मजबूत स्वास्थ्य का सुझाव देती है, जबकि रेखा में विराम संभावित स्वास्थ्य चिंताओं को इंगित कर सकते हैं।\n\nमुख्य स्वास्थ्य संकेतक:\n- एक गहरी जीवन रेखा: अच्छा समग्र स्वास्थ्य और दीर्घायु।\n- एक बेहोश स्वास्थ्य रेखा: संभावित मामूली बीमारियों या तनाव से संबंधित मुद्दे।\n- जीवन रेखा में विराम: स्वास्थ्य को प्रभावित करने वाले प्रमुख जीवन परिवर्तन।",
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000"
      },
      {
        title: "धन और वित्तीय विकास (आय, निवेश, स्थिरता)",
        content: "आपकी हथेली अचानक धन के बजाय धन के स्थिर संचय को दर्शाती है। यदि आपकी भाग्य रेखा मजबूत है, तो वित्तीय स्थिरता की संभावना है। एक अच्छी तरह से विकसित सूर्य पर्वत मान्यता के माध्यम से वित्तीय लाभ का सुझाव देता है।\n\nधन और समृद्धि अंतर्दृष्टि:\n- स्पष्ट धन रेखाएं: वित्तीय स्थिरता और संभावित लाभ का संकेत देती हैं।\n- एक अच्छी तरह से परिभाषित भाग्य रेखा: समय के साथ संरचित वित्तीय विकास को दर्शाता है।\n- धन रेखा में विराम: वित्तीय उतार-चढ़ाव का संकेत देते हैं जिनके लिए सावधानीपूर्वक योजना की आवश्यकता होती है।",
        image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1000"
      },
      {
        title: "जीवन चरण और प्रमुख संक्रमण (अतीत, वर्तमान, भविष्य)",
        content: "हस्तरेखा विज्ञान भाग्य रेखा, जीवन रेखा और अन्य निशानों में परिवर्तन के माध्यम से आपके जीवन के विभिन्न चरणों को प्रकट करता है। महत्वपूर्ण संक्रमणों को देखा जा सकता है जहां रेखाएं प्रतिच्छेद करती हैं या टूटती हैं।\n\nजीवन चरणों का टूटना:\n- बचपन: व्यक्तित्व और विकास पर प्रारंभिक पारिवारिक जीवन का प्रभाव।\n- युवा वयस्कता: कैरियर विकल्प, शिक्षा और प्रमुख निर्णय।\n- मध्य जीवन: स्थिरता, वित्तीय विकास और पारिवारिक जिम्मेदारियाँ।\n- बाद के वर्ष: ज्ञान, विरासत और व्यक्तिगत पूर्ति।",
        image: "https://images.unsplash.com/photo-1506485338023-6ce5f36692df?q=80&w=1000"
      },
      {
        title: "आध्यात्मिक विकास और आंतरिक ज्ञान",
        content: "आपकी हथेली के शनि और बृहस्पति पर्वत आपके आध्यात्मिक पथ और ज्ञान को दर्शाते हैं। बृहस्पति का एक मजबूत पर्वत आध्यात्मिक या दार्शनिक मामलों में नेतृत्व का सुझाव देता है।\n\nआध्यात्मिक अंतर्दृष्टि:\n- मजबूत बृहस्पति पर्वत: नेतृत्व और ज्ञान।\n- अच्छी तरह से विकसित शनि पर्वत: गहरी सोच और आध्यात्मिक विकास।",
        image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=1000"
      },
      {
        title: "नाम, प्रसिद्धि और सार्वजनिक प्रभाव",
        content: "सूर्य रेखा आपकी सामाजिक मान्यता और प्रभाव को निर्धारित करने में महत्वपूर्ण भूमिका निभाती है। एक मजबूत सूर्य रेखा सार्वजनिक जीवन में प्रसिद्धि और सफलता को इंगित करती है।\n\nप्रसिद्धि और मान्यता:\n- एक मजबूत सूर्य रेखा: कैरियर और सार्वजनिक जीवन में मान्यता।\n- समानांतर सफलता रेखाएं: समय के साथ कई उपलब्धियां।",
        image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000"
      },
      {
        title: "जीवन में चुनौतियाँ और समाधान",
        content: "प्रत्येक हथेली में ऐसे निशान होते हैं जो चुनौतियों और संभावित समाधानों को प्रकट करते हैं। प्रमुख रेखाओं में क्रॉस, ब्रेक और द्वीप संघर्षों का सुझाव देते हैं, जबकि एक अच्छी तरह से परिभाषित भाग्य रेखा बाधाओं को दूर करने का संकेत देती है।\n\nसामान्य चुनौतियाँ और उनके समाधान:\n- भाग्य रेखा में विराम: कैरियर या वित्तीय बदलाव; अनुकूलनशीलता महत्वपूर्ण है।\n- हृदय रेखा पर क्रॉस: भावनात्मक संघर्ष; धैर्य की आवश्यकता है।\n- कमजोर जीवन रेखा: कम ऊर्जा; स्वास्थ्य और कल्याण पर ध्यान दें।",
        image: "https://images.unsplash.com/photo-1544306094-e2dcf9479da3?q=80&w=1000"
      },
      {
        title: "भविष्य के लिए भविष्यवाणियां (अवसर और खतरे)",
        content: "आपकी हथेली के वर्तमान निशानों के आधार पर, निम्नलिखित भविष्यवाणियां की जा सकती हैं:\n\n- कैरियर विकास: आपका कैरियर 30-40 वर्ष की आयु के बीच प्रमुख विकास के लिए तैयार है।\n- वित्तीय स्थिरता: संभावित निवेश सफलता के साथ वित्तीय लाभ स्थिर रहेगा।\n- रिश्ते: कुछ भावनात्मक बाधाओं के साथ एक मजबूत, स्थायी रिश्ते की संभावना है।\n- स्वास्थ्य जागरूकता: मामूली स्वास्थ्य संबंधी चिंताएं उत्पन्न हो सकती हैं, लेकिन स्व-देखभाल के साथ प्रबंधित की जा सकती हैं।",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000"
      },
      {
        title: "व्यक्तिगत सलाह और मार्गदर्शन",
        content: "आपकी हस्तरेखा पढ़ने के आधार पर, यहां कुछ प्रमुख सिफारिशें दी गई हैं:\n- कैरियर: स्थिरता और रणनीतिक कैरियर चालों पर ध्यान दें।\n- प्यार: रिश्तों को मजबूत करने के लिए खुलकर संवाद करें।\n- स्वास्थ्य: दीर्घकालिक कल्याण के लिए तनाव मुक्त जीवन शैली अपनाएं।\n- वित्त: बुद्धिमानी से निवेश करें और वित्तीय सुरक्षा के लिए योजना बनाएं।\n- व्यक्तिगत विकास: आत्मविश्वास और भावनात्मक बुद्धिमत्ता पर काम करें।",
        image: "https://images.unsplash.com/photo-1513135185947-4f716b9c3b6f?q=80&w=1000"
      },
      {
        title: "कोई भी प्रश्न पूछें",
        content: "क्या आप अपने कैरियर, व्यवसाय, प्रेम जीवन, स्वास्थ्य या किसी अन्य पहलू के बारे में पूछना चाहेंगे? बेझिझक पूछें, और हम आपकी हस्तरेखा पढ़ने के आधार पर विशिष्ट अंतर्दृष्टि प्रदान करेंगे।\n\nयह पूरी विस्तृत रिपोर्ट आपके हाथ की गहराई से विश्लेषण प्रदान करती है, जिसमें कैरियर और धन से लेकर रिश्तों और स्वास्थ्य तक जीवन के हर पहलू को शामिल किया गया है। यह आपको आगे की अपनी यात्रा के लिए स्पष्टता और कार्रवाई योग्य मार्गदर्शन देने के लिए डिज़ाइन किया गया है।",
        image: "https://images.unsplash.com/photo-1577457943926-11d6cd3ce8ae?q=80&w=1000"
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
        description: 'This comprehensive 20+ page report will include all life aspects and will take a few moments to complete.',
        duration: 5000
      });

      // Get the basic reading text
      const baseReadingText = generateFullReadingText(reading.results, isPremium);
      
      // Generate a more detailed report using Gemini API with improved prompt for a modern, comprehensive report
      let promptForAI = `Create a comprehensive 20+ page palmistry report that follows this exact structure:

1. Introduction to Your Palm Reading
2. Personality Analysis (Strengths, Weaknesses, Temperament)
3. Career & Professional Growth (Job vs. Business)
4. Love & Relationships (Romantic, Family, and Social Life)
5. Health & Well-being (Mental, Emotional, and Physical Health)
6. Wealth & Financial Growth (Income, Investments, Stability)
7. Life Phases & Key Transitions (Past, Present, Future)
8. Spiritual Growth & Inner Wisdom
9. Name, Fame & Public Influence
10. Challenges & Solutions in Life
11. Predictions for the Future (Opportunities & Threats)
12. Personalized Advice & Guidance
13. Ask Any Question

For each section, provide detailed insights with:
- Clear titles and subtitles
- Bullet points for key insights
- Age-based phases and predictions where relevant
- Practical advice based on palm features
- Specific personalized recommendations

Make the report engaging, positive, professional, and personalized based on these palm reading insights: ${baseReadingText}

Format your response as a JSON array of objects with 'title' and 'content' fields for each section. Each section should have rich, detailed content with solid analysis. Ensure the JSON is valid and properly formatted.`;

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
        title: language === "hindi" ? "व्यापक हस्तरेखा रिपोर्ट (20+ पृष्ठ)" : "Comprehensive Palmistry Report (20+ Pages)",
        sections: sections,
        language: language,
        pageCount: 24, // Updated page count for this new report format
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
      "Ad
