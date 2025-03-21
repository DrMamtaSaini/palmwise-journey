
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import ReportService from "../services/ReportService";
import { useAuth } from "../hooks/useAuth";
import { ExtendedPalmReading } from "../types/PalmReading";
import { useNavigate } from "react-router-dom";

interface DetailedReportGeneratorProps {
  reading: ExtendedPalmReading;
  isPremium?: boolean;
}

const DetailedReportGenerator: React.FC<DetailedReportGeneratorProps> = ({
  reading,
  isPremium = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateReport = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in to generate a detailed report."
      });
      navigate("/login");
      return;
    }
    
    if (!isPremium) {
      toast.error("Premium feature", {
        description: "Detailed life reports are available for premium users only. Please upgrade to unlock this feature."
      });
      return;
    }
    
    setIsGenerating(true);
    toast.info("Generating report", {
      description: "We're creating your comprehensive 50-70 page life report. This may take a few moments."
    });
    
    try {
      const report = await ReportService.generateDetailedReport(reading, isPremium);
      
      toast.success("Report generated", {
        description: `Your ${report.pageCount}-page detailed life report is ready to view and download.`
      });
      
      // Navigate to report page
      navigate(`/detailed-report/${report.id}`);
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Report generation failed", {
        description: "There was a problem creating your detailed report. Please try again later."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-soft animate-fade-in border border-[#7953F5]/10">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-gradient-to-r from-[#7953F5] to-[#9672FF] text-white">
          <FileText size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Detailed Life Report</h3>
          <p className="text-gray-600 mb-4">
            Get a comprehensive 50-70 page detailed report that analyzes every phase of your life 
            from birth to old age. The report includes specific insights about relationships, career, 
            health, and spiritual growth at each life stage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !isPremium}
              className="bg-gradient-to-r from-[#7953F5] to-[#9672FF] text-white hover:shadow-md transition-all duration-300"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Generating Report...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Detailed Report
                </span>
              )}
            </Button>
            <Button
              onClick={() => navigate("/sample-report")}
              variant="outline"
              className="border border-[#7953F5]/30 text-[#7953F5] hover:bg-[#7953F5]/5"
            >
              <Download className="mr-2 h-4 w-4" />
              View Sample Report
            </Button>
          </div>
        </div>
      </div>
      {!isPremium && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          Detailed life reports are a premium feature. Please upgrade your account to access this feature.
        </div>
      )}
    </div>
  );
};

export default DetailedReportGenerator;
