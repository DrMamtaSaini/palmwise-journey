
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const ReadingNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-full p-2">
            <AlertCircle className="h-6 w-6 text-gray-700" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Reading not found</h2>
        <p className="text-gray-600 mb-6">We couldn't find this palm reading</p>
        <button
          onClick={() => navigate("/upload-palm")}
          className="bg-palm-purple text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create New Reading
        </button>
      </div>
    </div>
  );
};

export default ReadingNotFound;
