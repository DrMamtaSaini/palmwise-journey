
import { useNavigate } from "react-router-dom";

const ReadingNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Reading Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the requested palm reading.</p>
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
