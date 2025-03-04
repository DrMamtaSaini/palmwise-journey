
interface TestimonialCardProps {
  quote: string;
  name: string;
  index: number;
}

const TestimonialCard = ({ quote, name, index }: TestimonialCardProps) => {
  return (
    <div 
      className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-md transition-all duration-300"
      style={{ 
        animationDelay: `${index * 0.2}s`,
      }}
    >
      <p className="text-lg italic mb-6">{quote}</p>
      <div className="border-t border-gray-200 pt-4">
        <p className="font-semibold text-lg">{name}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
