
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReportSection from "../components/ReportSection";
import LanguageSelector from "../components/LanguageSelector";
import PaymentModal from "../components/PaymentModal";
import ReportService, { DetailedLifeReport } from "@/services/ReportService";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DetailedReport = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DetailedLifeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if this is a special sample report case
        if (reportId === 'sample-report' || reportId === 'sample-report-hindi') {
          const sampleReport = ReportService.getSampleReport(
            reportId === 'sample-report-hindi' ? 'hindi' : 'english'
          );
          setReport(sampleReport);
          setSelectedLanguage(sampleReport.language || 'english');
          setIsLoading(false);
          return;
        }
        
        const reportData = await ReportService.getDetailedReport(reportId);
        
        if (reportData) {
          setReport(reportData);
          if (reportData.language) {
            setSelectedLanguage(reportData.language);
          }
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setIsError(true);
        
        // Check for specific database error
        if ((error as any)?.code === "42P01") {
          setErrorMessage("The detailed reports database table does not exist yet. Please try generating a report first.");
        } else {
          setErrorMessage("There was an error loading your report. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  useEffect(() => {
    if (report && report.language && report.language !== selectedLanguage) {
      setSelectedLanguage(report.language);
    }
  }, [report]);

  const handleLanguageChange = async (newLanguage: string) => {
    if (!report) return;

    setSelectedLanguage(newLanguage);
    
    if (reportId === 'sample-report' || reportId === 'sample-report-hindi') {
      try {
        setIsLoading(true);
        const aiSampleReport = await ReportService.generateAISampleReport(newLanguage);
        setReport(aiSampleReport);
      } catch (error) {
        console.error("Error generating AI sample report:", error);
        toast.error("Failed to generate AI sample report");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // In a real app, you would regenerate the report in the new language
    // For this demo, we'll just update the state
    toast.info("Regenerating report in " + newLanguage);
  };

  const handleDownloadPDF = async () => {
    if (!report) return;

    setIsGeneratingPDF(true);
    try {
      const pdfUrl = await ReportService.generatePDFForReport(report);
      setDownloadUrl(pdfUrl);
      
      // Trigger the download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${report.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const handleViewSampleReport = async () => {
    if (!isAuthenticated) {
      setShowPaymentModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      const aiSampleReport = await ReportService.generateAISampleReport(selectedLanguage);
      setReport(aiSampleReport);
      navigate(`/detailed-report/${aiSampleReport.id}`, { replace: true });
    } catch (error) {
      console.error("Error generating AI sample report:", error);
      toast.error("Failed to generate AI sample report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async () => {
    try {
      setIsLoading(true);
      await ReportService.setupDetailedReportTable();
      toast.success("Database table created successfully");
      
      // Refresh the page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Failed to create database table");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
          <div className="text-center">
            <RefreshCw className="inline-block animate-spin mr-2" />
            Loading report...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
          <div className="max-w-lg w-full mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Report</AlertTitle>
              <AlertDescription>
                {errorMessage || "Sorry, we couldn't find the report you were looking for."}
              </AlertDescription>
            </Alert>
            
            {errorMessage && errorMessage.includes("database table") && (
              <div className="mt-4 text-center">
                <p className="mb-4 text-gray-600">
                  Would you like to create the required database table now?
                </p>
                <Button 
                  onClick={handleCreateTable} 
                  disabled={isLoading}
                  className="bg-palm-purple text-white hover:bg-palm-purple/90 mb-4"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Set Up Database Table"
                  )}
                </Button>
              </div>
            )}
            
            <div className="text-center mt-6">
              <Link to="/" className="text-palm-purple hover:underline">
                Go back to homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4 bg-palm-light">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
            <p className="text-gray-600">
              Sorry, we couldn't find the report you were looking for.
            </p>
            <Link to="/" className="text-palm-purple hover:underline">
              Go back to homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-palm-light py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-palm-purple transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-palm-purple mb-2">{report.title}</h1>
                <p className="text-gray-600">
                  Created on {new Date(report.createdAt).toLocaleDateString()}
                </p>
                {report.translationNote && (
                  <p className="text-sm text-gray-500 mt-2">{report.translationNote}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                />
                
                {isAuthenticated ? (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="bg-palm-purple text-white px-4 py-2 rounded-md hover:bg-palm-purple/90 transition-colors flex items-center"
                  >
                    {isGeneratingPDF ? (
                      <RefreshCw className="inline-block animate-spin mr-2" />
                    ) : (
                      <Download size={18} className="mr-2" />
                    )}
                    Download PDF
                  </button>
                ) : (
                  <button
                    onClick={handleViewSampleReport}
                    className="bg-palm-purple text-white px-4 py-2 rounded-md hover:bg-palm-purple/90 transition-colors flex items-center"
                  >
                    View Sample
                  </button>
                )}
              </div>
            </div>

            {report.sections.map((section, index) => (
              <ReportSection key={index} title={section.title} content={section.content} image={section.image} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default DetailedReport;
