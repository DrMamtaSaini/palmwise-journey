
interface TranslationNoteProps {
  note: string;
}

const TranslationNote = ({ note }: TranslationNoteProps) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 text-sm">{note}</p>
      <p className="text-yellow-800 text-sm mt-2">
        हमारा अनुवाद अभी विकासशील है और हम इसे सुधारने के लिए निरंतर काम कर रहे हैं। कृपया ध्यान दें कि कुछ विवरण अंग्रेजी और हिंदी का मिश्रण हो सकते हैं।
      </p>
      <p className="text-yellow-800 text-sm mt-2">
        We're using advanced translation methods to improve the quality. Some technical terms may appear in both languages for clarity.
      </p>
    </div>
  );
};

export default TranslationNote;
