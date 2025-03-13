
interface TranslationNoteProps {
  note: string;
}

const TranslationNote = ({ note }: TranslationNoteProps) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 text-sm">{note}</p>
      <p className="text-yellow-800 text-sm mt-2">
        We're using a dictionary-based translation method for common terms. This provides useful translations 
        while keeping the app lightweight without external API dependencies.
      </p>
    </div>
  );
};

export default TranslationNote;
