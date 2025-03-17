
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CheckResult {
  status: "success" | "error" | "loading";
  message: string;
  details?: any;
}

const PaymentDebug = () => {
  const [results, setResults] = useState<Record<string, CheckResult>>({
    auth: { status: "loading", message: "Checking authentication..." },
    paypalKey: { status: "loading", message: "Checking PayPal client ID..." },
    payments: { status: "loading", message: "Checking payments table..." }
  });
  
  const runChecks = async () => {
    // Reset all checks to loading
    setResults({
      auth: { status: "loading", message: "Checking authentication..." },
      paypalKey: { status: "loading", message: "Checking PayPal client ID..." },
      payments: { status: "loading", message: "Checking payments table..." }
    });
    
    // Check authentication
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setResults(prev => ({
          ...prev,
          auth: { 
            status: "error", 
            message: `Authentication error: ${error.message}` 
          }
        }));
      } else if (data.user) {
        setResults(prev => ({
          ...prev,
          auth: { 
            status: "success", 
            message: `Authenticated as ${data.user.email}`,
            details: { userId: data.user.id }
          }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          auth: { 
            status: "error", 
            message: "Not authenticated" 
          }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        auth: { 
          status: "error", 
          message: `Authentication check failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      }));
    }
    
    // Check PayPal client ID
    try {
      const { data, error } = await supabase.functions.invoke("get-paypal-key");
      if (error) {
        setResults(prev => ({
          ...prev,
          paypalKey: { 
            status: "error", 
            message: `Error fetching PayPal client ID: ${error.message}`,
            details: error
          }
        }));
      } else if (data && data.key) {
        const keyHint = data.key === "sb" 
          ? "Using sandbox key (sb)" 
          : `Using production key (${data.key.substring(0, 3)}...${data.key.substring(data.key.length - 3)})`;
        
        setResults(prev => ({
          ...prev,
          paypalKey: { 
            status: "success", 
            message: `PayPal client ID found: ${keyHint}` 
          }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          paypalKey: { 
            status: "error", 
            message: "PayPal client ID not found in response",
            details: data
          }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        paypalKey: { 
          status: "error", 
          message: `PayPal client ID check failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      }));
    }
    
    // Check payments table
    try {
      // Try to query the payments table
      const { data, error } = await supabase
        .from('payments')
        .select('count')
        .limit(1)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // This means no rows returned, which is fine
        setResults(prev => ({
          ...prev,
          payments: { 
            status: "success", 
            message: "Payments table exists and is accessible",
          }
        }));
      } else if (error) {
        setResults(prev => ({
          ...prev,
          payments: { 
            status: "error", 
            message: `Error accessing payments table: ${error.message}`,
            details: error
          }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          payments: { 
            status: "success", 
            message: "Payments table exists and is accessible",
          }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        payments: { 
          status: "error", 
          message: `Payments table check failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      }));
    }
  };
  
  useEffect(() => {
    runChecks();
  }, []);
  
  const getStatusIcon = (status: string) => {
    if (status === "success") return <Check className="text-green-500" />;
    if (status === "error") return <X className="text-red-500" />;
    return <AlertCircle className="text-yellow-500 animate-pulse" />;
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Payment System Diagnostic</span>
              <Button onClick={runChecks} size="sm">
                Run Checks Again
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(results).map(([key, result]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize">{key} Check</h3>
                      <p className={`mt-1 ${result.status === "error" ? "text-red-600" : ""}`}>
                        {result.message}
                      </p>
                      
                      {result.details && (
                        <div className="mt-2">
                          <details>
                            <summary className="text-sm text-gray-500 cursor-pointer">
                              Show details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default PaymentDebug;
