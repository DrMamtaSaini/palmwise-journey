
import PaymentButton from "./PaymentButton";

interface PremiumFeaturesProps {
  onSuccess: () => void;
}

const PremiumFeatures = ({ onSuccess }: PremiumFeaturesProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Unlock Premium Features</h2>
      <p className="text-gray-600 mb-6">
        Get access to detailed readings on your relationships, career, health and more with our premium plan.
      </p>
      <PaymentButton 
        price="$9.99" 
        description="Premium Palm Reading" 
        isPrimary={true} 
        onClick={onSuccess}
      />
    </div>
  );
};

export default PremiumFeatures;
