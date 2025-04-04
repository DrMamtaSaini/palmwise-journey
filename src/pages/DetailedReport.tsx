import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Share2, FileText } from "lucide-react";
import ReportService, { DetailedLifeReport } from "../services/ReportService";
import { useAuth } from "../hooks/useAuth";
import ReadingLoader from "../components/ReadingLoader";
import ReadingNotFound from "../components/ReadingNotFound";
import TranslationNote from "../components/TranslationNote";
import { toast } from "sonner";

const DetailedReport = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [report, setReport] = useState<DetailedLifeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  useEffect(() => {
    if (!reportId) {
      setError("Report ID is missing");
      setIsLoading(false);
      return;
    }
    
    const fetchReport = async () => {
      try {
        console.log(`Fetching report with ID: ${reportId} (retry: ${retryCount})`);
        
        // Check if this is a sample report ID
        if (reportId === "sample-report" || reportId === "sample-report-hindi") {
          const language = reportId === "sample-report-hindi" ? "hindi" : "english";
          console.log(`Loading sample report for language: ${language}`);
          const sampleReport = ReportService.getSampleReport(language);
          setReport(sampleReport);
          return;
        }
        
        const fetchedReport = await ReportService.getReport(reportId);
        
        if (!fetchedReport) {
          // If this is a new report and we're within retry limits, try again
          if (retryCount < 3) {
            console.log(`Report not found, will retry in 3 seconds (retry ${retryCount + 1})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => setIsLoading(true), 3000);
            return;
          }
          
          setError("Report not found or still being generated");
          setShowDebugInfo(retryCount >= 3);
        } else if (!isAuthenticated || (fetchedReport.userId !== user?.id && fetchedReport.userId !== "sample")) {
          setError("You don't have permission to view this report");
        } else {
          console.log("Report found:", fetchedReport.id);
          setReport(fetchedReport);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load the report");
        setShowDebugInfo(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isLoading) {
      fetchReport();
    }
  }, [reportId, isAuthenticated, user, isLoading, retryCount]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };
  
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setShowDebugInfo(false);
  };
  
  const handleDownloadPDF = async () => {
    if (!report) return;
    
    // If PDF already exists, open it
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
      return;
    }
    
    // Otherwise generate it
    try {
      setIsGeneratingPDF(true);
      toast.info('Generating PDF', {
        description: 'Creating your comprehensive palm reading report PDF. This may take a moment...',
        duration: 5000
      });
      
      const downloadUrl = await ReportService.generatePDFForReport(report);
      
      // Update report with download URL
      setReport({
        ...report,
        downloadUrl
      });
      
      // Open the PDF
      window.open(downloadUrl, '_blank');
      
      toast.success('PDF Ready', {
        description: 'Your comprehensive palm reading report PDF has been generated successfully.'
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error('PDF Generation Failed', {
        description: 'There was a problem creating your PDF. Please try again later.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <ReadingLoader message={`Loading your detailed life report${retryCount > 0 ? ` (attempt ${retryCount + 1})` : ''}...`} />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ReadingNotFound 
              message={error || "Report not found"} 
              retryAction={handleRetry}
              showDebugInfo={showDebugInfo}
            />
            {error && error.includes("still being generated") && (
              <div className="mt-4 text-center">
                <p className="mt-2 text-sm text-gray-500">
                  Report generation can take up to 60 seconds. Please wait or check again later.
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              
              <Button
                variant="outline"
                className="text-[#7953F5] border-[#7953F5]/30 hover:bg-[#7953F5]/5"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-[#7953F5] border-t-transparent rounded-full"></span>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF ({report.pageCount} pages)
                  </>
                )}
              </Button>
            </div>
          </div>

          {report.language === "hindi" && report.translationNote && (
            <TranslationNote note={report.translationNote} />
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 print:shadow-none">
            <div className="p-8 border-b border-gray-200 print:break-after-page">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.title}</h1>
              <p className="text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()} • {report.pageCount} pages • {report.language === "hindi" ? "हिन्दी" : "English"}
              </p>
            </div>

            <div className="p-8">
              <div className="space-y-12">
                {report.sections.map((section, index) => (
                  <div key={index} className="border-b border-gray-100 pb-12 last:border-b-0 last:pb-0 print:break-after-page">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">{section.title}</h3>
                    
                    {section.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={section.image} 
                          alt={section.title} 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="text-gray-700 space-y-4">
                      {section.content.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-[#7953F5]/5 p-6 rounded-xl border border-[#7953F5]/20 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#7953F5] rounded-full p-3 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download Your Full {report.pageCount}-Page Report</h3>
                <p className="text-gray-600 mt-1">Get your comprehensive palm reading report as a beautifully formatted PDF document.</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                className="bg-gradient-to-r from-[#7953F5] to-[#9672FF] text-white hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download {report.pageCount}-Page PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailedReport;
