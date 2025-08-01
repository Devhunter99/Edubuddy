"use client";

import { useState } from "react";
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

export default function Home() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    summary: null,
    flashcards: null,
    mcqs: null,
  });
  const [isLoading, setIsLoading] = useState({
    summary: false,
    flashcards: false,
    mcqs: false,
  });

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
    setGeneratedContent({ summary: null, flashcards: null, mcqs: null });

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
    setGeneratedContent(prev => ({ ...prev, [type]: null }));

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
            <OutputSection
              content={generatedContent}
              isLoading={isLoading}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
