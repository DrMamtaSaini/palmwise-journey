
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentButton from "./PaymentButton";
import PayPalButton from "./PayPalButton";
import { useToast } from "@/hooks/use-toast";

interface PremiumFeaturesProps {
  onSuccess: () => void;
}

const PremiumFeatures = ({ onSuccess }: PremiumFeaturesProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const { toast } = useToast();
  
  const handlePaymentSuccess = () => {
    toast({
      title: "Premium Access Granted",
      description: "You now have access to all premium features!",
    });
    onSuccess();
  };
  
  const handlePaymentError = (error: Error) => {
    console.error("Payment error:", error);
    toast({
      title: "Payment Failed",
      description: "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <Card className="bg-white shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Unlock Premium Features</CardTitle>
        <CardDescription className="text-gray-600">
          Get access to detailed readings on your relationships, career, health and more with our premium plan.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                paymentMethod === "card" 
                  ? "bg-white shadow-sm text-gray-800" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              Credit Card
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                paymentMethod === "paypal" 
                  ? "bg-white shadow-sm text-gray-800" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setPaymentMethod("paypal")}
            >
              PayPal
            </button>
          </div>
        </div>
        
        {paymentMethod === "card" ? (
          <PaymentButton 
            price="$9.99" 
            description="Premium Palm Reading" 
            isPrimary={true} 
            onClick={handlePaymentSuccess}
          />
        ) : (
          <PayPalButton
            amount="9.99"
            description="Premium Palm Reading"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center pt-0">
        <p className="text-xs text-gray-500 text-center">
          Secure payment processing. Cancel anytime.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PremiumFeatures;
