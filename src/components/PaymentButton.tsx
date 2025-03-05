
import { Button } from "@/components/ui/button";

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
    <Button
      onClick={onClick}
      className={`w-full ${
        isPrimary 
          ? "bg-palm-purple hover:bg-palm-purple/90" 
          : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
      }`}
    >
      <span className="mr-1">Pay</span>
      <span className="font-bold">{price}</span>
    </Button>
  );
};

export default PaymentButton;
