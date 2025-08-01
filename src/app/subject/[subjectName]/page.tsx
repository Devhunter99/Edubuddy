
"use client";

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { generateSummary, type GenerateSummaryOutput } from "@/ai/flows/generate-summary";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateMCQ, type GenerateMCQOutput } from "@/ai/flows/generate-mcq";

import AppHeader from "@/components/edubuddy/app-header";
import InputSection from "@/components/edubuddy/input-section";
import OutputSection from "@/components/edubuddy/output-section";

type GeneratedContent = {
  summary: GenerateSummaryOutput | null;
  flashcards: GenerateFlashcardsOutput | null;
  mcqs: GenerateMCQOutput | null;
};

// Custom hook for managing state with localStorage
const useSubjectData = (subjectName: string) => {
  const getInitialText = () => {
    if (typeof window === 'undefined') return '';
    try {
      const item = localStorage.getItem(`${subjectName}_text`);
      return item || '';
    } catch (error) {
      console.error(`Error reading text from localStorage`, error);
      return '';
    }
  };

  const getInitialContent = (): GeneratedContent => {
     if (typeof window === 'undefined') return { summary: null, flashcards: null, mcqs: null };
     try {
       const item = localStorage.getItem(`${subjectName}_content`);
       return item ? JSON.parse(item) : { summary: null, flashcards: null, mcqs: null };
     } catch (error) {
       console.error(`Error reading content from localStorage`, error);
       return { summary: null, flashcards: null, mcqs: null };
     }
  };

  const [text, setTextState] = useState<string>(getInitialText);
  const [generatedContent, setGeneratedContentState] = useState<GeneratedContent>(getInitialContent);

  const setText = (newText: string) => {
    setTextState(newText);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${subjectName}_text`, newText);
    }
  };

  const setGeneratedContent = (newContent: React.SetStateAction<GeneratedContent>) => {
    const valueToStore = newContent instanceof Function ? newContent(generatedContent) : newContent;
    setGeneratedContentState(valueToStore);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${subjectName}_content`, JSON.stringify(valueToStore));
    }
  };

  return { text, setText, generatedContent, setGeneratedContent };
}


export default function SubjectPage() {
  const { toast } = useToast();
  const params = useParams();
  const subjectName = decodeURIComponent(params.subjectName as string);

  const { text, setText, generatedContent, setGeneratedContent } = useSubjectData(subjectName);
  const [isClient, setIsClient] = useState(false);


  const [isLoading, setIsLoading] = useState({
    summary: false,
    flashcards: false,
    mcqs: false,
  });
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateAll = async () => {
    if (!text.trim()) {
      toast({
        title: "Input required",
        description: "Please paste some text to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading({ summary: true, flashcards: true, mcqs: true });
    // Keep old content while generating new one
    // setGeneratedContent({ summary: null, flashcards: null, mcqs: null });

    const summaryPromise = generateSummary({ lectureNotes: text }).catch(err => {
      console.error("Summary generation failed:", err);
      toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" });
      return null;
    });

    const flashcardsPromise = generateFlashcards({ text }).catch(err => {
      console.error("Flashcard generation failed:", err);
      toast({ title: "Error", description: "Failed to generate flashcards.", variant: "destructive" });
      return null;
    });

    const mcqsPromise = generateMCQ({ text }).catch(err => {
      console.error("MCQ generation failed:", err);
      toast({ title: "Error", description: "Failed to generate MCQs.", variant: "destructive" });
      return null;
    });

    const [summaryResult, flashcardsResult, mcqsResult] = await Promise.all([
      summaryPromise,
      flashcardsPromise,
      mcqsPromise
    ]);

    setGeneratedContent({
      summary: summaryResult,
      flashcards: flashcardsResult,
      mcqs: mcqsResult
    });

    setIsLoading({ summary: false, flashcards: false, mcqs: false });
  };
  
  const handleRegenerate = async (type: keyof GeneratedContent) => {
    if (!text.trim()) {
      toast({
        title: "Input required",
        description: "Please paste some text to regenerate content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, [type]: true }));
    // Keep old content while regenerating
    // setGeneratedContent(prev => ({ ...prev, [type]: null }));

    try {
      let result: GenerateSummaryOutput | GenerateFlashcardsOutput | GenerateMCQOutput | null = null;
      if (type === 'summary') {
        result = await generateSummary({ lectureNotes: text });
      } else if (type === 'flashcards') {
        result = await generateFlashcards({ text });
      } else if (type === 'mcqs') {
        result = await generateMCQ({ text });
      }
      setGeneratedContent(prev => ({ ...prev, [type]: result }));
    } catch (error) {
      console.error(`Regeneration failed for ${type}:`, error);
      toast({ title: "Error", description: `Failed to regenerate ${type}.`, variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-bold mb-4 font-headline">{subjectName}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          <div className="lg:max-w-xl xl:max-w-2xl">
            <InputSection
              text={text}
              setText={setText}
              onSubmit={handleGenerateAll}
              isLoading={isLoading.summary || isLoading.flashcards || isLoading.mcqs}
            />
          </div>
          <div className="mt-8 lg:mt-0">
          {isClient ? (
            <OutputSection
              content={generatedContent}
              isLoading={isLoading}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-10 bg-muted w-1/3 rounded-md"></div>
                <div className="h-10 bg-muted w-1/3 rounded-md"></div>
                <div className="h-10 bg-muted w-1/3 rounded-md"></div>
              </div>
              <div className="h-[60vh] bg-muted rounded-md"></div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
