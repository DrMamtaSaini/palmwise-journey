
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
      className={`w-full ${
        isPrimary 
          ? "bg-palm-purple hover:bg-palm-purple/90 text-white" 
          : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
      }`}
    >
      <span className="mr-1">Pay</span>
      <span className="font-bold">{price}</span>
    </Button>
  );
};

export default PaymentButton;
