
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Info } from "lucide-react";
import { toast } from "sonner";
import ReportService from "../services/ReportService";
import { useAuth } from "../hooks/useAuth";
import { ExtendedPalmReading } from "../types/PalmReading";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
  
  const checkTableExists = async () => {
    try {
      const response = await supabase.functions.invoke('create-detailed-report-table', {
        method: 'POST',
      });
      
      console.log("Table check response:", response);
      
      if (!response.data?.success) {
        console.error("Error in table creation:", response.data?.error);
        throw new Error(response.data?.error || "Failed to create table");
      }
    } catch (error) {
      console.error("Error checking/creating table:", error);
      toast.error("Setup error", {
        description: "There was a problem setting up the detailed report feature. Please try again."
      });
    }
  };
  
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
        description: "The Ultimate Palm Reading Report is available for premium users only. Please upgrade to unlock this feature."
      });
      return;
    }
    
    setIsGenerating(true);
    toast.info("Generating ultimate report", {
      description: "We're creating your comprehensive 65-page life report with insights on career, relationships, finances, health and more. This may take up to 1 minute.",
      duration: 5000
    });
    
    try {
      // First ensure the table exists
      await checkTableExists();
      
      console.log("Generating report for reading:", reading.id);
      const report = await ReportService.generateDetailedReport(reading, isPremium);
      
      console.log("Report generated:", report.id);
      toast.success("Ultimate report generated", {
        description: `Your ${report.pageCount}-page comprehensive life report is ready to view and download.`
      });
      
      // Navigate to report page
      navigate(`/detailed-report/${report.id}`);
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Report generation failed", {
        description: "There was a problem creating your ultimate report. Please try again later."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleViewSample = () => {
    // Show the sample report for the current language
    const sampleReportId = reading.language === "hindi" ? "sample-report-hindi" : "sample-report";
    navigate(`/detailed-report/${sampleReportId}`);
  };
  
  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-soft animate-fade-in border border-[#7953F5]/10">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-gradient-to-r from-[#7953F5] to-[#9672FF] text-white">
          <FileText size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Ultimate 65-Page Palm Reading Report</h3>
          <p className="text-gray-600 mb-4">
            Get an ultra-detailed 65-page professional report that analyzes every aspect of your life: 
            career, relationships, finances, health, intelligence, social influence, family, travel, 
            spirituality, and your ultimate legacy.
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Premium Feature</p>
              <p>Your ultimate report includes practical insights and age-based predictions for each life area, beautifully formatted for download or printing.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !isPremium}
              className="bg-gradient-to-r from-[#7953F5] to-[#9672FF] text-white hover:shadow-md transition-all duration-300"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Generating Ultimate Report...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Ultimate Report
                </span>
              )}
            </Button>
            <Button
              onClick={handleViewSample}
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
          The Ultimate Palm Reading Report is a premium feature. Please upgrade your account to access this comprehensive analysis.
        </div>
      )}
    </div>
  );
};

export default DetailedReportGenerator;
