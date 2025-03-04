
import { CreditCard } from "lucide-react";

interface PaymentButtonProps {
  price: string;
  description: string;
  isPrimary?: boolean;
  onClick: () => void;
}

const PaymentButton = ({ 
  price, 
  description, 
  isPrimary = false, 
  onClick 
}: PaymentButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
        isPrimary 
          ? "bg-palm-purple text-white hover:shadow-lg" 
          : "bg-white border border-gray-200 hover:border-palm-purple text-gray-800"
      }`}
    >
      <CreditCard size={20} />
      <span>
        Pay {price} - {description}
      </span>
    </button>
  );
};

export default PaymentButton;
