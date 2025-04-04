
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, ExternalLink } from "lucide-react";
import ReportService from "../services/ReportService";
import LanguageSelector from "../components/LanguageSelector";
import TranslationNote from "../components/TranslationNote";
import { toast } from "sonner";

const SampleReport = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [report, setReport] = useState(ReportService.getSampleReport());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // Update report when language changes
    setReport(ReportService.getSampleReport(selectedLanguage));
    setDownloadUrl(null); // Reset download URL when language changes
    setDownloadError(null); // Reset any errors
  }, [selectedLanguage]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleDownloadSample = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadUrl(null);
      
      toast.info('Preparing sample PDF', {
        description: 'Generating your comprehensive 20+ page sample report PDF...',
        duration: 5000
      });

      // Get the sample report for download
      const sampleReport = ReportService.getSampleReport(selectedLanguage);
      
      // Use the PDF service to generate and download the PDF
      const url = await ReportService.generatePDFForReport(sampleReport);
      setDownloadUrl(url);
      
      // For URLs created with URL.createObjectURL, we don't automatically open in a new tab
      // as it could be blocked by popup blockers. Instead, let the user click the "Open PDF" button
      if (!url.startsWith('blob:')) {
        window.open(url, '_blank');
      }
      
      toast.success('Sample PDF ready', {
        description: 'Your comprehensive 20+ page sample report PDF has been generated successfully'
      });
    } catch (error) {
      console.error("Error downloading sample report:", error);
      
      setDownloadError(
        error.message?.includes("relation") ? 
          "Database tables not set up. Please run the setup function first." :
        error.message?.includes("Bucket not found") ?
          "Storage bucket not configured. The PDF can still be downloaded locally." :
          "There was a problem generating the sample PDF. Please try again."
      );
      
      toast.error('Download failed', {
        description: 'There was a problem generating the sample PDF. Please try again.'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPDF = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

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
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              className="w-48"
            />
          </div>

          {selectedLanguage === "hindi" && report.translationNote && (
            <TranslationNote note={report.translationNote} />
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.title}</h1>
              <p className="text-gray-500">
                Sample Report • {report.pageCount} pages • {selectedLanguage === "hindi" ? "हिन्दी" : "English"}
              </p>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Preview
                </h2>
                <div className="space-x-2">
                  {downloadUrl && (
                    <Button
                      variant="outline"
                      className="flex items-center text-[#7953F5] border-[#7953F5]/30 hover:bg-[#7953F5]/5"
                      onClick={handleOpenPDF}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open PDF
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex items-center text-[#7953F5] border-[#7953F5]/30 hover:bg-[#7953F5]/5"
                    onClick={handleDownloadSample}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-[#7953F5] border-t-transparent rounded-full"></span>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Sample
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {downloadError && (
                <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-700">
                  <p className="font-medium">PDF Generation Info</p>
                  <p className="text-sm">{downloadError}</p>
                </div>
              )}

              <div className="space-y-12">
                {report.sections.map((section, index) => (
                  <div key={index} className="border-b border-gray-100 pb-12 last:border-b-0 last:pb-0">
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

          <div className="bg-gradient-to-r from-[#7953F5] to-[#9672FF] rounded-xl shadow-md overflow-hidden text-white mb-8">
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Your Personal Detailed 20+ Page Life Report</h3>
                  <p className="opacity-90 mb-4">
                    Unlock a comprehensive 20+ page analysis of your entire life journey, with specific insights 
                    for career, relationships, health, wealth, and more. This professional report gives you actionable 
                    guidance for your path ahead.
                  </p>
                  <Button 
                    onClick={() => navigate("/pricing")}
                    className="bg-white text-[#7953F5] hover:bg-white/90"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SampleReport;
