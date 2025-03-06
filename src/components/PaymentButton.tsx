
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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
  useEffect(() => {
    console.log(`PaymentButton mounted: ${description} - ${price}`);
  }, [description, price]);

  console.log(`Rendering PaymentButton: ${description} - ${price}`);
  
  return (
    <Button
      onClick={onClick}
      type="button"
      className={`w-full font-medium transition-all duration-300 ${
        isPrimary 
          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md" 
          : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
      }`}
    >
      <span className="mr-1">Pay</span>
      <span className="font-bold">{price}</span>
    </Button>
  );
};

export default PaymentButton;
