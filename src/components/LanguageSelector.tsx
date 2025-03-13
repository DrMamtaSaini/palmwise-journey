
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName?: string;
}

export const indianLanguages: IndianLanguage[] = [
  { code: "english", name: "English" },
  { code: "hindi", name: "हिन्दी (Hindi)", nativeName: "हिन्दी" },
  { code: "bengali", name: "Bengali", nativeName: "বাংলা" },
  { code: "marathi", name: "Marathi", nativeName: "मराठी" },
  { code: "telugu", name: "Telugu", nativeName: "తెలుగు" },
  { code: "tamil", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "urdu", name: "Urdu", nativeName: "اردو" },
  { code: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "odia", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "malayalam", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "punjabi", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "assamese", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "maithili", name: "Maithili", nativeName: "मैथिली" },
  { code: "sanskrit", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "kashmiri", name: "Kashmiri", nativeName: "कॉशुर" },
  { code: "nepali", name: "Nepali", nativeName: "नेपाली" },
  { code: "konkani", name: "Konkani", nativeName: "कोंकणी" },
  { code: "sindhi", name: "Sindhi", nativeName: "سنڌي" },
  { code: "bodo", name: "Bodo", nativeName: "बड़ो" },
  { code: "santali", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "dogri", name: "Dogri", nativeName: "डोगरी" },
];

// Helper function to get language info from language code
export const getLanguageInfo = (languageCode: string): IndianLanguage | undefined => {
  return indianLanguages.find(lang => lang.code === languageCode);
};

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className,
}) => {
  const selectedLanguageInfo = getLanguageInfo(selectedLanguage);
  
  return (
    <div className={className}>
      <Select
        value={selectedLanguage}
        onValueChange={onLanguageChange}
        defaultValue="english"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Language">
            {selectedLanguageInfo && selectedLanguageInfo.nativeName 
              ? `${selectedLanguageInfo.nativeName} (${selectedLanguageInfo.name.split(' ')[0]})`
              : selectedLanguageInfo?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {indianLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.nativeName 
                ? `${language.nativeName} (${language.name.split(' ')[0]})`
                : language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
