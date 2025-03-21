
interface TranslationNoteProps {
  note: string;
}

const TranslationNote = ({ note }: TranslationNoteProps) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 text-sm">{note}</p>
      <p className="text-yellow-800 text-sm mt-2">
        हमारा अनुवाद इस समय आंशिक है और हम इसे सुधारने के लिए काम कर रहे हैं। कृपया ध्यान दें कि कुछ वाक्य अंग्रेजी और हिंदी का मिश्रण हो सकते हैं।
      </p>
      <p className="text-yellow-800 text-sm mt-2">
        We're using a basic translation approach and working to improve it. Some sentences may appear as a mix of English and Hindi.
      </p>
    </div>
  );
};

export default TranslationNote;
