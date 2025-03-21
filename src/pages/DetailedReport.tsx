
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";
import ReportService, { DetailedLifeReport } from "../services/ReportService";
import { useAuth } from "../hooks/useAuth";
import ReadingLoader from "../components/ReadingLoader";
import ReadingNotFound from "../components/ReadingNotFound";
import TranslationNote from "../components/TranslationNote";

const DetailedReport = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [report, setReport] = useState<DetailedLifeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!reportId) {
      setError("Report ID is missing");
      setIsLoading(false);
      return;
    }
    
    const fetchReport = async () => {
      try {
        const fetchedReport = await ReportService.getReport(reportId);
        
        if (!fetchedReport) {
          setError("Report not found");
        } else if (fetchedReport.userId !== "sample" && (!isAuthenticated || fetchedReport.userId !== user?.id)) {
          setError("You don't have permission to view this report");
        } else {
          setReport(fetchedReport);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load the report");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId, isAuthenticated, user]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
    // toast.success("Link copied to clipboard");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <ReadingLoader message="Loading your detailed life report..." />
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
          <ReadingNotFound message={error || "Report not found"} />
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
            
            <div className="flex gap-2">
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
              
              {report.downloadUrl && (
                <Button
                  variant="outline"
                  className="text-[#7953F5] border-[#7953F5]/30 hover:bg-[#7953F5]/5"
                  asChild
                >
                  <a href={report.downloadUrl} download>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </a>
                </Button>
              )}
            </div>
          </div>

          {report.language === "hindi" && (
            <TranslationNote note="हमने आपकी विस्तृत रिपोर्ट का हिंदी में अनुवाद किया है। यह मशीन अनुवाद है और कुछ शब्दों का सटीक अनुवाद नहीं हो सकता है।" />
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailedReport;
