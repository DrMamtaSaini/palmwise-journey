
import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  price: string;
  description: string;
  isPrimary?: boolean;
  onClick: () => void;
  priceId?: string; // Stripe price ID
}

const PaymentButton = ({ 
  price, 
  description, 
  isPrimary = false, 
  onClick,
  priceId
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // If we have a priceId, process through Stripe checkout
      if (priceId) {
        // In a real implementation, this would call your backend endpoint to create a checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            successUrl: `${window.location.origin}/dashboard`,
            cancelUrl: `${window.location.origin}/pricing`,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        // Fall back to the original onClick handler (for development)
        onClick();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`w-full p-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
        isPrimary 
          ? "bg-palm-purple text-white hover:shadow-lg" 
          : "bg-white border border-gray-200 hover:border-palm-purple text-gray-800"
      } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {isLoading ? (
        <span className="animate-pulse">Processing...</span>
      ) : (
        <>
          <CreditCard size={20} />
          <span>
            Pay {price} - {description}
          </span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;
