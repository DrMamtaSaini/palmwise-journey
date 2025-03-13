
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
            {selectedLanguageInfo?.name}
            {selectedLanguageInfo?.nativeName && ` (${selectedLanguageInfo.nativeName})`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {indianLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
              {language.nativeName && ` (${language.nativeName})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
