
interface TranslationNoteProps {
  note: string;
}

const TranslationNote = ({ note }: TranslationNoteProps) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 text-sm">{note}</p>
      <p className="text-yellow-800 text-sm mt-2">
        हमारा अनुवाद अभी विकासशील है और हम इसे सुधारने के लिए निरंतर काम कर रहे हैं। हम उन्नत AI और भाषा मॉडल का उपयोग करते हैं जो निरंतर सीखते और सुधारते हैं।
      </p>
      <p className="text-yellow-800 text-sm mt-2">
        We're using advanced AI translation models to improve quality. Some technical terms may appear in both languages for clarity and precision.
      </p>
    </div>
  );
};

export default TranslationNote;
