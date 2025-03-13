
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
    const { error } = await supabase
      .from('payments')
      .insert([paymentDetails]);
    
    if (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in recordPayment:", error);
    throw error;
  }
}
