
import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface PaymentButtonProps {
  price: string;
  description: string;
  isPrimary?: boolean;
  onClick: () => void;
  priceId?: string;
}

const PaymentButton = ({ 
  price, 
  description, 
  isPrimary = false, 
  onClick,
  priceId
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { toast } = useToast();
  
  // Convert price string to number (remove $ sign and convert to paisa/cents)
  const getNumericAmount = () => {
    const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    return Math.round(numericPrice * 100); // Convert to paisa/cents
  };
  
  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="razorpay"]') || window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay");
        toast({
          title: "Payment Error",
          description: "Failed to load payment gateway. Please try again later.",
          variant: "destructive",
        });
      };

      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, [toast]);
  
  const handleRazorpayPayment = () => {
    if (!window.Razorpay) {
      toast({
        title: "Payment Error",
        description: "Payment gateway not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, you would call your backend to create an order
    // For demo purposes, we're creating the options directly
    const options = {
      key: "rzp_test_iCzWHZ3ISj5oYe", // Replace with your key in production
      amount: getNumericAmount(),
      currency: "INR",
      name: "Palm Reader",
      description: description,
      image: "https://your-logo-url.png",
      handler: function(response: any) {
        // Handle successful payment
        toast({
          title: "Payment Successful",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        // Add payment ID to the onClick callback
        onClick();
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
      },
      theme: {
        color: "#7953F5", // palm-purple
      },
      modal: {
        ondismiss: function() {
          setIsLoading(false);
        }
      }
    };
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      if (razorpayLoaded) {
        handleRazorpayPayment();
      } else if (priceId) {
        // Fallback to Stripe checkout (if implemented)
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
      if (!razorpayLoaded) {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
        isPrimary 
          ? "bg-gradient-to-r from-[#7953F5] to-[#9672FF] text-white hover:shadow-lg" 
          : "bg-white border border-gray-200 hover:border-[#7953F5] text-gray-800"
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
