import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentButton from "./PaymentButton";
import PayPalButton from "./PayPalButton";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { getPayPalClientId, recordPayment } from "@/services/PaymentService";
import { supabase } from "@/integrations/supabase/client";

interface PremiumFeaturesProps {
  onSuccess: () => void;
}

const PremiumFeatures = ({ onSuccess }: PremiumFeaturesProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [paypalClientId, setPaypalClientId] = useState<string>("sb");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchPayPalClientId() {
      try {
        console.log("Component: Fetching PayPal client ID...");
        const clientId = await getPayPalClientId();
        console.log("Component: Received PayPal client ID:", clientId);
        setPaypalClientId(clientId);
      } catch (error) {
        console.error("Component: Failed to fetch PayPal client ID:", error);
        setPaypalClientId("sb");
        setPaymentError(`Error fetching PayPal client ID: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    fetchPayPalClientId();
  }, []);
  
  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    setPaymentError(null);
    
    try {
      console.log("Getting current user...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        setPaymentError(`Authentication error: ${userError.message}`);
        toast({
          title: "Authentication Error",
          description: userError.message,
          variant: "destructive",
        });
        return;
      }
      
      if (!user) {
        console.error("No user found");
        setPaymentError("No authenticated user found");
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete this purchase.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Recording payment for user:", user.id);
      await recordPayment({
        user_id: user.id,
        amount: billingPeriod === "monthly" ? 10 : 100,
        description: getPlanDescription(),
        payment_method: paymentMethod,
        billing_period: billingPeriod,
      });
      
      console.log("Payment recorded successfully");
      toast({
        title: "Premium Access Granted",
        description: "You now have access to all premium features!",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Payment processing error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setPaymentError(`Payment error: ${errorMessage}`);
      toast({
        title: "Payment Processing Error",
        description: "There was an issue recording your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaymentError = (error: Error) => {
    console.error("Payment error:", error);
    setPaymentError(`Payment processing error: ${error.message}`);
    toast({
      title: "Payment Failed",
      description: "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const getPlanPrice = () => {
    if (billingPeriod === "monthly") {
      return "$10";
    } else {
      return "$100";
    }
  };

  const getPlanDescription = () => {
    if (billingPeriod === "monthly") {
      return "Pro Plan (Monthly)";
    } else {
      return "Pro Plan (Yearly) - 2 months free";
    }
  };

  const getPayPalAmount = () => {
    return billingPeriod === "monthly" ? "10.00" : "100.00";
  };

  return (
    <Card className="bg-white shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Choose Your Plan</CardTitle>
        <CardDescription className="text-gray-600">
          Select a plan that works best for you
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {paymentError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <p className="font-semibold">Error Details (for debugging):</p>
            <p className="font-mono text-xs break-all whitespace-pre-wrap">{paymentError}</p>
          </div>
        )}
        
        <Tabs defaultValue="basic" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Basic Plan</h3>
              <p className="text-3xl font-bold mb-4">Free</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Basic palm analysis</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>One palm reading per month</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Text format only</span>
                </li>
              </ul>
              <button 
                className="w-full mt-6 p-3 bg-gray-200 text-gray-800 rounded-md font-medium"
                onClick={() => {
                  toast({
                    title: "Using Basic Plan",
                    description: "You're already using the basic plan features!",
                  });
                }}
              >
                Current Plan
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="pro" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-palm-purple">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Pro Plan</h3>
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      billingPeriod === "monthly" 
                        ? "bg-white shadow-sm text-gray-800" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setBillingPeriod("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      billingPeriod === "yearly" 
                        ? "bg-white shadow-sm text-gray-800" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setBillingPeriod("yearly")}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              
              <p className="text-3xl font-bold mb-1">{getPlanPrice()}</p>
              {billingPeriod === "yearly" && (
                <p className="text-sm text-green-600 mb-4">Save 16% with annual billing</p>
              )}
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Advanced palm analysis</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Unlimited palm readings</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Text and audio formats</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Personalized recommendations</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
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
                  price={getPlanPrice()} 
                  description={getPlanDescription()} 
                  isPrimary={true} 
                  onClick={handlePaymentSuccess}
                />
              ) : (
                <PayPalButton
                  amount={getPayPalAmount()}
                  description={getPlanDescription()}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  clientId={paypalClientId}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
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
