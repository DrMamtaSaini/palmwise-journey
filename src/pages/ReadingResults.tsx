
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
            imageUrl={reading.imageUrl} 
            date={reading.createdAt}
            language={reading.language}
          />
          
          {readingContent && (
            <ReadingTabs content={readingContent} isPremium={isPremium} />
          )}
          
          <DetailedReportGenerator reading={reading} isPremium={isPremium} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReadingResults;
