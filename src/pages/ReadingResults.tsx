
// src/pages/ReadingResults.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReadingHeader from "../components/ReadingHeader";
import ReadingTabs from "../components/ReadingTabs";
import ReadingLoader from "../components/ReadingLoader";
import ReadingNotFound from "../components/ReadingNotFound";
import PalmAnalysisService from "../services/PalmAnalysisService";
import TranslationNote from "../components/TranslationNote";
import DetailedReportGenerator from "../components/DetailedReportGenerator";
import { getReadingContent } from "../utils/readingContentUtils";
import { ExtendedPalmReading } from "../types/PalmReading";

const ReadingResults = () => {
  const { readingId } = useParams<{ readingId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reading, setReading] = useState<ExtendedPalmReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumTest, setIsPremiumTest] = useState(false);
  const [showReportInfo, setShowReportInfo] = useState(false);

  useEffect(() => {
    if (!readingId) return;

    const fetchReading = async () => {
      try {
        const fetchedReading = await PalmAnalysisService.getPalmReading(readingId);
        
        if (!fetchedReading) {
          setError("Reading not found");
        } else {
          // Check if the user is allowed to see this reading
          if (isAuthenticated) {
            // If user is authenticated, they should only see their own readings
            if (fetchedReading.userId !== user?.id) {
              setError("You don't have permission to view this reading");
            } else {
              setReading(fetchedReading);
              
              // For demo purposes, consider authenticated users as premium
              setIsPremium(true);
            }
          } else {
            // Unauthenticated users shouldn't see any readings
            setError("Please log in to view this reading");
          }
        }
      } catch (err) {
        console.error("Error fetching reading:", err);
        setError("There was an error loading your reading. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReading();
  }, [readingId, isAuthenticated, user]);

  const readingContent = getReadingContent(reading);

  const handleGenerateReport = () => {
    setShowReportInfo(true);
    
    // Show the report intro text for 3 seconds before scrolling to the generator
    setTimeout(() => {
      const reportElement = document.getElementById('detailed-report-generator');
      if (reportElement) {
        reportElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <ReadingLoader message="Loading your palm reading..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <ReadingNotFound message={error || "Reading not found"} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {reading.translationNote && (
            <TranslationNote note={reading.translationNote} />
          )}
          
          <ReadingHeader 
            title="Your Palm Reading Results"
            imageUrl={reading.imageUrl} 
            date={reading.createdAt}
            language={reading.language}
            isPremium={isPremium}
            isPremiumTest={isPremiumTest}
            setIsPremium={setIsPremium}
            setIsPremiumTest={setIsPremiumTest}
            readingContent={readingContent}
          />
          
          {readingContent && (
            <ReadingTabs 
              readingContent={readingContent} 
              isPremium={isPremium}
              isPremiumTest={isPremiumTest}
            />
          )}

          {showReportInfo && (
            <div className="mt-8 mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md animate-fade-in border border-purple-100">
              <h2 className="text-2xl font-bold text-[#7953F5] mb-4">Generating Your Full 20+ Page Detailed Report</h2>
              <p className="text-gray-700 mb-3">
                This comprehensive report will cover every aspect of your life in depth, ensuring a professional and insightful palmistry reading.
              </p>
              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-gray-800">Your report will include:</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Introduction to Your Palm Reading</li>
                  <li>Personality Analysis (Strengths, Weaknesses, Temperament)</li>
                  <li>Career & Professional Growth (Job vs. Business)</li>
                  <li>Love & Relationships (Romantic, Family, and Social Life)</li>
                  <li>Health & Well-being (Mental, Emotional, and Physical Health)</li>
                  <li>Wealth & Financial Growth (Income, Investments, Stability)</li>
                  <li>Life Phases & Key Transitions (Past, Present, Future)</li>
                  <li>Spiritual Growth & Inner Wisdom</li>
                  <li>Name, Fame & Public Influence</li>
                  <li>Challenges & Solutions in Life</li>
                  <li>Predictions for the Future (Opportunities & Threats)</li>
                  <li>Personalized Advice & Guidance</li>
                </ul>
              </div>
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 mr-3 rounded-full border-t-2 border-blue-500 border-r-2 border-blue-500 border-b-2 border-transparent"></div>
                <p className="text-blue-600 italic">Please scroll down to generate your full detailed report...</p>
              </div>
            </div>
          )}
          
          <div id="detailed-report-generator">
            <DetailedReportGenerator 
              reading={reading} 
              isPremium={isPremium} 
              onGenerateClick={handleGenerateReport}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReadingResults;
