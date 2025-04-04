
import { jsPDF } from "jspdf";
import { DetailedLifeReport } from "./ReportService";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

class PDFService {
  private static instance: PDFService;

  private constructor() {}

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public async generatePDFFromReport(report: DetailedLifeReport): Promise<string> {
    try {
      toast.info('Generating PDF', {
        description: 'Creating your comprehensive palm reading report PDF...',
        duration: 5000
      });

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set initial position
      let y = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Add cover page
      this.addCoverPage(doc, report);
      doc.addPage();

      // Table of contents
      y = this.addTableOfContents(doc, report);
      doc.addPage();

      // Add all sections
      for (let i = 0; i < report.sections.length; i++) {
        const section = report.sections[i];
        
        // Add section title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        y = 20;
        doc.text(section.title, margin, y);
        y += 10;

        // Add section image if exists
        if (section.image) {
          try {
            // Get image dimensions to maintain aspect ratio
            const imgWidth = contentWidth;
            const imgHeight = 40;
            
            doc.addImage(section.image, 'JPEG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 10;
          } catch (imgError) {
            console.error("Error adding image:", imgError);
            // Continue without the image
          }
        }

        // Add section content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        
        // Split content into paragraphs
        const paragraphs = section.content.split('\n');
        
        for (const paragraph of paragraphs) {
          // Check if we need a new page
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          
          // Split paragraph into lines that fit within content width
          const lines = doc.splitTextToSize(paragraph, contentWidth);
          
          // Add lines to document
          doc.text(lines, margin, y);
          y += (lines.length * 7); // Adjust for line height
          
          // Add some space between paragraphs
          y += 5;
        }
        
        // Add a new page for each section (except the last one)
        if (i < report.sections.length - 1) {
          doc.addPage();
        }
      }

      // Add page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Skip page number on cover page
        if (i > 1) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, 290);
        }
      }

      // Generate PDF blob
      const pdfBlob = doc.output('blob');
      
      // Upload to Supabase Storage
      const fileName = `reports/${report.userId}/${report.id}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('palm-readings')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });
        
      if (error) {
        console.error("Error uploading PDF:", error);
        throw new Error("Failed to upload PDF");
      }
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('palm-readings')
        .getPublicUrl(fileName);
        
      const downloadUrl = urlData.publicUrl;
      
      // Update report record with download URL
      await supabase
        .from('detailed_reports')
        .update({ download_url: downloadUrl })
        .eq('id', report.id);
        
      toast.success('PDF Generated', {
        description: `Your comprehensive ${report.pageCount}-page palm reading report is ready to download.`,
        duration: 5000
      });
        
      return downloadUrl;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error('PDF Generation Failed', {
        description: 'There was a problem creating your PDF. Please try again later.'
      });
      throw error;
    }
  }
  
  private addCoverPage(doc: jsPDF, report: DetailedLifeReport): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add decorative border
    doc.setDrawColor(121, 83, 245); // Purple color (#7953F5)
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(121, 83, 245);
    doc.text(report.title, pageWidth / 2, 70, { align: 'center' });
    
    // Add subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    
    const subtitle = report.language === 'hindi' 
      ? "हस्तरेखा विश्लेषण और जीवन मार्गदर्शन" 
      : "Palm Analysis & Life Guidance";
    doc.text(subtitle, pageWidth / 2, 85, { align: 'center' });
    
    // Add creation date
    const dateText = report.language === 'hindi'
      ? `दिनांक: ${new Date(report.createdAt).toLocaleDateString()}`
      : `Date: ${new Date(report.createdAt).toLocaleDateString()}`;
    doc.setFontSize(12);
    doc.text(dateText, pageWidth / 2, 110, { align: 'center' });
    
    // Add page count
    const pageText = report.language === 'hindi'
      ? `${report.pageCount} पृष्ठ`
      : `${report.pageCount} pages`;
    doc.text(pageText, pageWidth / 2, 120, { align: 'center' });
    
    // Add disclaimer at bottom
    doc.setFontSize(10);
    const disclaimer = report.language === 'hindi'
      ? "यह रिपोर्ट मार्गदर्शन के लिए है और इसे चिकित्सा या वित्तीय सलाह के रूप में नहीं लिया जाना चाहिए।"
      : "This report is for guidance purposes and should not be taken as medical or financial advice.";
    doc.text(disclaimer, pageWidth / 2, pageHeight - 30, { align: 'center' });
    
    // Add a decorative element
    doc.setDrawColor(121, 83, 245);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, 95, pageWidth / 2 + 40, 95);
  }
  
  private addTableOfContents(doc: jsPDF, report: DetailedLifeReport): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;
    
    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    
    const contentsTitle = report.language === 'hindi' ? "विषय-सूची" : "Table of Contents";
    doc.text(contentsTitle, pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    // Add sections
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    report.sections.forEach((section, index) => {
      const pageNum = index + 3; // Cover page + TOC + section pages
      doc.text(section.title, margin, y);
      
      // Add dots
      const textWidth = doc.getTextWidth(section.title);
      const pageNumWidth = doc.getTextWidth(pageNum.toString());
      const dotsWidth = pageWidth - margin * 2 - textWidth - pageNumWidth;
      const dotCount = Math.floor(dotsWidth / doc.getTextWidth('.'));
      const dots = '.'.repeat(dotCount);
      
      doc.text(dots, margin + textWidth, y);
      doc.text(pageNum.toString(), pageWidth - margin - pageNumWidth, y);
      
      y += 10;
      
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    return y;
  }
}

export default PDFService.getInstance();
