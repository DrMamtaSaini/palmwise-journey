
import supabaseClient from '@/lib/supabase';

interface PaymentRecord {
  user_id: string;
  amount: number;
  description: string;
  payment_method: "card" | "paypal" | "razorpay";
  payment_id?: string;
  billing_period: "monthly" | "yearly";
}

export async function getPayPalClientId(): Promise<string> {
  try {
    console.log("Fetching PayPal client ID from Supabase function...");
    const { data, error } = await supabaseClient.functions.invoke("get-paypal-key");
    
    if (error) {
      console.error("Error fetching PayPal client ID:", error);
      throw error;
    }
    
    console.log("PayPal client ID response:", data);
    
    if (!data || !data.key) {
      console.error("PayPal client ID not found in response:", data);
      throw new Error("PayPal client ID not found");
    }
    
    return data.key;
  } catch (error) {
    console.error("Error in getPayPalClientId:", error);
    // Return sandbox client ID as fallback
    return "sb";
  }
}

export async function getRazorpayApiKey(): Promise<string> {
  // In a real implementation, this would fetch the key from a secure backend
  // For demo purposes, we're returning a test key
  return "rzp_test_iCzWHZ3ISj5oYe";
}

export async function recordPayment(paymentDetails: PaymentRecord): Promise<void> {
  try {
    console.log("Recording payment with details:", {
      user_id: paymentDetails.user_id,
      amount: paymentDetails.amount,
      description: paymentDetails.description,
      payment_method: paymentDetails.payment_method,
      billing_period: paymentDetails.billing_period
    });
    
    // Now that we have the payments table, we can insert directly
    const { error } = await supabaseClient
      .from('payments')
      .insert({
        user_id: paymentDetails.user_id,
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        payment_method: paymentDetails.payment_method,
        payment_id: paymentDetails.payment_id || null,
        billing_period: paymentDetails.billing_period
      });
    
    if (error) {
      console.error("Error recording payment:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log("Payment recorded successfully");
  } catch (error) {
    console.error("Exception in recordPayment:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    throw error;
  }
}
