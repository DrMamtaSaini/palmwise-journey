
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PayPal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PayPalButtonProps {
  amount: string;
  description: string;
  onSuccess: () => void;
  onError?: (error: Error) => void;
}

const PayPalButton = ({ amount, description, onSuccess, onError }: PayPalButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Convert price string to number (remove $ sign)
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="paypal"]')) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=USD`;
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        toast({
          title: "PayPal Error",
          description: "Failed to load PayPal SDK. Please try again later.",
          variant: "destructive",
        });
      };

      document.body.appendChild(script);
    };

    loadPayPalScript();

    // Cleanup function
    return () => {
      const script = document.querySelector('script[src*="paypal"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  // Render PayPal buttons when SDK is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.paypal) return;

    try {
      const paypalButtonsContainer = document.getElementById("paypal-button-container");
      if (!paypalButtonsContainer) return;

      // Clear any existing buttons
      paypalButtonsContainer.innerHTML = "";

      // @ts-ignore - PayPal SDK is loaded dynamically
      window.paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: description,
                amount: {
                  currency_code: "USD",
                  value: numericAmount,
                },
              },
            ],
          });
        },
        onApprove: (_data: any, actions: any) => {
          setIsLoading(true);
          return actions.order.capture().then((details: any) => {
            const payerName = details.payer.name.given_name;
            toast({
              title: "Payment Successful",
              description: `Thank you, ${payerName}! Your payment was successful.`,
            });
            onSuccess();
            setIsLoading(false);
          });
        },
        onError: (err: Error) => {
          toast({
            title: "Payment Error",
            description: "There was a problem processing your payment. Please try again.",
            variant: "destructive",
          });
          if (onError) onError(err);
          console.error("PayPal Error:", err);
        },
      }).render("#paypal-button-container");
    } catch (error) {
      console.error("PayPal render error:", error);
      toast({
        title: "PayPal Error",
        description: "There was a problem loading PayPal. Please try again later.",
        variant: "destructive",
      });
    }
  }, [scriptLoaded, numericAmount, description, onSuccess, onError, toast]);

  // Placeholder button while PayPal is loading
  const renderPlaceholderButton = () => (
    <Button 
      disabled={true} 
      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
    >
      <PayPal className="mr-2" size={20} />
      {isLoading ? "Processing..." : "Loading PayPal..."}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div id="paypal-button-container" className="min-h-[45px]"></div>
      {!scriptLoaded && renderPlaceholderButton()}
    </div>
  );
};

export default PayPalButton;
