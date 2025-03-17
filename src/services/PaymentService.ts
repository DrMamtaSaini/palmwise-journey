
import supabaseClient from '@/lib/supabaseClient';

interface PaymentRecord {
  user_id: string;
  amount: number;
  description: string;
  payment_method: "card" | "paypal";
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

export async function recordPayment(paymentDetails: PaymentRecord): Promise<void> {
  try {
    console.log("Recording payment with details:", {
      user_id: paymentDetails.user_id,
      amount: paymentDetails.amount,
      description: paymentDetails.description,
      payment_method: paymentDetails.payment_method,
      billing_period: paymentDetails.billing_period
    });
    
    // Use a manual query since we don't have the payments table in the TypeScript types yet
    const { data, error } = await supabaseClient.rpc('insert_payment', {
      p_user_id: paymentDetails.user_id,
      p_amount: paymentDetails.amount,
      p_description: paymentDetails.description,
      p_payment_method: paymentDetails.payment_method,
      p_payment_id: paymentDetails.payment_id || null,
      p_billing_period: paymentDetails.billing_period
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
    
    console.log("Payment recorded successfully:", data);
  } catch (error) {
    console.error("Exception in recordPayment:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    throw error;
  }
}
