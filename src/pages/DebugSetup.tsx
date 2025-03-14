
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CheckResult {
  status: "success" | "error" | "loading";
  message: string;
  details?: any;
}

const DebugSetup = () => {
  const [results, setResults] = useState<Record<string, CheckResult>>({
    auth: { status: "loading", message: "Checking authentication..." },
    paypalKey: { status: "loading", message: "Checking PayPal client ID..." },
    dbSetup: { status: "loading", message: "Checking database setup..." },
    secrets: { status: "loading", message: "Checking secrets..." }
  });
  
  const runChecks = async () => {
    // Reset all checks to loading
    setResults({
      auth: { status: "loading", message: "Checking authentication..." },
      paypalKey: { status: "loading", message: "Checking PayPal client ID..." },
      dbSetup: { status: "loading", message: "Checking database setup..." },
      secrets: { status: "loading", message: "Checking secrets..." }
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
    
    // Check database setup
    try {
      const { data, error } = await supabase.functions.invoke("check-db-setup");
      if (error) {
        setResults(prev => ({
          ...prev,
          dbSetup: { 
            status: "error", 
            message: `Error checking database setup: ${error.message}`,
            details: error
          }
        }));
      } else if (data) {
        const tablesFound = data.tablesFound;
        const functionsFound = data.functionsFound;
        
        if (tablesFound && functionsFound) {
          setResults(prev => ({
            ...prev,
            dbSetup: { 
              status: "success", 
              message: "Database setup is correct: payments table and insert_payment function exist",
              details: data
            }
          }));
        } else {
          setResults(prev => ({
            ...prev,
            dbSetup: { 
              status: "error", 
              message: `Database setup issue: ${!tablesFound ? "payments table missing" : ""} ${!functionsFound ? "insert_payment function missing" : ""}`,
              details: data
            }
          }));
        }
      } else {
        setResults(prev => ({
          ...prev,
          dbSetup: { 
            status: "error", 
            message: "No data returned from database setup check" 
          }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        dbSetup: { 
          status: "error", 
          message: `Database setup check failed: ${error instanceof Error ? error.message : String(error)}` 
        }
      }));
    }
    
    // Check secrets
    try {
      const { data, error } = await supabase.functions.invoke("check-secrets");
      if (error) {
        setResults(prev => ({
          ...prev,
          secrets: { 
            status: "error", 
            message: `Error checking secrets: ${error.message}`,
            details: error
          }
        }));
      } else if (data && data.results) {
        const allSecretsExist = Object.values(data.results).every((result: any) => result.exists);
        
        if (allSecretsExist) {
          setResults(prev => ({
            ...prev,
            secrets: { 
              status: "success", 
              message: "All required secrets are set",
              details: data.results
            }
          }));
        } else {
          const missingSecrets = Object.entries(data.results)
            .filter(([_, value]: [string, any]) => !value.exists)
            .map(([key]: [string, any]) => key)
            .join(", ");
          
          setResults(prev => ({
            ...prev,
            secrets: { 
              status: "error", 
              message: `Missing secrets: ${missingSecrets}`,
              details: data.results
            }
          }));
        }
      } else {
        setResults(prev => ({
          ...prev,
          secrets: { 
            status: "error", 
            message: "No data returned from secrets check" 
          }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        secrets: { 
          status: "error", 
          message: `Secrets check failed: ${error instanceof Error ? error.message : String(error)}` 
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
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Configuration Check</span>
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
  );
};

export default DebugSetup;
