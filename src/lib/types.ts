
import { type GenerateSummaryOutput } from "@/ai/flows/generate-summary";
import { type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { type GenerateMCQOutput } from "@/ai/flows/generate-mcq";

export type GeneratedContent = {
  summary: GenerateSummaryOutput | null;
  flashcards: GenerateFlashcardsOutput | null;
  mcqs: GenerateMCQOutput | null;
};

export type Note = {
  id: string;
  title: string;
  text: string;
  generatedContent: GeneratedContent;
}

export type QuizResult = {
  id: string;
  subjectName: string;
  timestamp: string;
  mcqs: GenerateMCQOutput['mcqs'];
  answers: Record<number, { selected: string; isCorrect: boolean }>;
  score: number;
}

    