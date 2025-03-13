
const ReadingLoader = () => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 flex justify-center items-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-palm-purple border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your palm reading...</p>
      </div>
    </div>
  );
};

export default ReadingLoader;
