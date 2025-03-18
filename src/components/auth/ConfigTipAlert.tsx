
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ConfigTipAlert = () => {
  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200 hidden">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <p className="font-medium">Authentication configuration tip:</p>
        <p className="text-sm mt-1">Make sure your Supabase project's Site URL is set to "{window.location.origin}" in the Authentication settings.</p>
      </AlertDescription>
    </Alert>
  );
};

export default ConfigTipAlert;
