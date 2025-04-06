
import React from 'react';

interface ReportSectionProps {
  title: string;
  content: string;
  image?: string;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, content, image }) => {
  // Split content into paragraphs based on newline characters
  const paragraphs = content.split('\n\n').filter(paragraph => paragraph.trim() !== '');
  
  return (
    <div className="mb-10 pb-8 border-b border-gray-100 last:border-b-0 last:pb-0 last:mb-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      {image && (
        <div className="mb-6">
          <img 
            src={image} 
            alt={title} 
            className="w-full max-h-64 object-cover rounded-lg shadow-sm"
          />
        </div>
      )}
      
      <div className="text-gray-700 leading-relaxed space-y-4">
        {paragraphs.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export default ReportSection;
