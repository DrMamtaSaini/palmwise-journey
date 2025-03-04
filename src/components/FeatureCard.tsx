
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <div className="bg-palm-light w-16 h-16 rounded-full flex items-center justify-center mb-6">
        <Icon className="text-palm-purple" size={24} />
      </div>
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
