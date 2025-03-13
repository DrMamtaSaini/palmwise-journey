
import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.functions.invoke("get-paypal-key");
    
    if (error) {
      console.error("Error fetching PayPal client ID:", error);
      throw error;
    }
    
    if (!data || !data.key) {
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
    // Use a manual query since we don't have the payments table in the TypeScript types yet
    const { error } = await supabase.rpc('insert_payment', {
      p_user_id: paymentDetails.user_id,
      p_amount: paymentDetails.amount,
      p_description: paymentDetails.description,
      p_payment_method: paymentDetails.payment_method,
      p_payment_id: paymentDetails.payment_id || null,
      p_billing_period: paymentDetails.billing_period
    });
    
    if (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in recordPayment:", error);
    throw error;
  }
}
