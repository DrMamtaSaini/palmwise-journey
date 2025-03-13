
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
}

export const indianLanguages: IndianLanguage[] = [
  { code: "english", name: "English" },
  { code: "hindi", name: "Hindi" },
  { code: "bengali", name: "Bengali" },
  { code: "marathi", name: "Marathi" },
  { code: "telugu", name: "Telugu" },
  { code: "tamil", name: "Tamil" },
  { code: "gujarati", name: "Gujarati" },
  { code: "urdu", name: "Urdu" },
  { code: "kannada", name: "Kannada" },
  { code: "odia", name: "Odia" },
  { code: "malayalam", name: "Malayalam" },
  { code: "punjabi", name: "Punjabi" },
  { code: "assamese", name: "Assamese" },
  { code: "maithili", name: "Maithili" },
  { code: "sanskrit", name: "Sanskrit" },
  { code: "kashmiri", name: "Kashmiri" },
  { code: "nepali", name: "Nepali" },
  { code: "konkani", name: "Konkani" },
  { code: "sindhi", name: "Sindhi" },
  { code: "bodo", name: "Bodo" },
  { code: "santali", name: "Santali" },
  { code: "dogri", name: "Dogri" },
];

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
  return (
    <div className={className}>
      <Select
        value={selectedLanguage}
        onValueChange={onLanguageChange}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {indianLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
