
"use client";

import { type GenerateSummaryOutput } from "@/ai/flows/generate-summary";
import { type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { type GenerateMCQInput, type GenerateMCQOutput } from "@/ai/flows/generate-mcq";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, FileText, BotMessageSquare, Sparkles, Library } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Flashcard from "./flashcard";
import McqItem from "./mcq-item";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type GeneratedContent = {
  summary: GenerateSummaryOutput | null;
  flashcards: GenerateFlashcardsOutput | null;
  mcqs: GenerateMCQOutput | null;
};

interface OutputSectionProps {
  content: GeneratedContent;
  isLoading: {
    summary: boolean;
    flashcards: boolean;
    mcqs: boolean;
  };
  onRegenerate: (type: keyof GeneratedContent) => void;
  mcqDifficulty: GenerateMCQInput['difficulty'];
  setMcqDifficulty: (difficulty: GenerateMCQInput['difficulty']) => void;
  isAllNotesView?: boolean;
}

const downloadText = (filename: string, text: string) => {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const formatFlashcardsForDownload = (flashcards: GenerateFlashcardsOutput['flashcards']) => {
  return flashcards.map(f => `Question: ${f.question}\nAnswer: ${f.answer}`).join('\n\n');
};

const formatMcqsForDownload = (mcqs: GenerateMCQOutput['mcqs']) => {
  return mcqs.map((m, i) => `${i + 1}. ${m.question}\n${m.options.map(o => `   - ${o}`).join('\n')}\nCorrect Answer: ${m.correctAnswer}`).join('\n\n');
};

export default function OutputSection({ content, isLoading, onRegenerate, mcqDifficulty, setMcqDifficulty, isAllNotesView = false }: OutputSectionProps) {
  
  const renderEmptyState = () => (
    <Card className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 border-dashed">
      <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold text-muted-foreground">Ready to learn?</h3>
      <p className="text-muted-foreground mt-2">
        Generate your study materials to see them here.
      </p>
    </Card>
  );

  const isAnythingLoading = Object.values(isLoading).some(Boolean);
  const isEverythingEmpty = Object.values(content).every(c => c === null || (Array.isArray(c) && c.length === 0));

  if (!isAnythingLoading && isEverythingEmpty) {
    return renderEmptyState();
  }
  
  const renderSummary = () => {
    if (!content.summary) return null;
    const summaryText = content.summary.summary;

    // Split by newline and also handle numbered lists that might not have newlines
    const points = summaryText.split(/\n|\s(?=\d+\.\s)/).filter(s => s.trim().length > 0);

    return (
      <ul className="list-disc pl-5 space-y-2 text-base">
        {points.map((point, index) => (
          <li key={index}>{point.replace(/^\d+\.\s*/, '').replace(/^- /, '')}</li>
        ))}
      </ul>
    )
  }

  const PageTitle = () => {
    if (isAllNotesView) {
      return (
        <div className="flex items-center gap-2 text-lg font-semibold font-headline text-primary mb-4 border-b pb-2">
            <Library className="h-5 w-5" />
            <span>All Notes</span>
        </div>
      )
    }
    return null;
  }

  return (
    <>
    <PageTitle />
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="summary"><FileText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
        <TabsTrigger value="flashcards"><BotMessageSquare className="mr-2 h-4 w-4" />Flashcards</TabsTrigger>
        <TabsTrigger value="mcqs"><Sparkles className="mr-2 h-4 w-4" />MCQs</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <Card className="min-h-[60vh]">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold font-headline">Summary</h3>
              {content.summary && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onRegenerate('summary')} disabled={isLoading.summary}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadText('summary.txt', content.summary!.summary)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              )}
            </div>
            {isLoading.summary ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            ) : content.summary ? (
              renderSummary()
            ) : ( <p className="text-muted-foreground text-center pt-16">Generate a summary to see it here.</p> )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="flashcards">
        <Card className="min-h-[60vh]">
          <CardContent className="p-6">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold font-headline">Flashcards</h3>
              {content.flashcards && content.flashcards.flashcards.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onRegenerate('flashcards')} disabled={isLoading.flashcards}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadText('flashcards.txt', formatFlashcardsForDownload(content.flashcards!.flashcards))}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              )}
            </div>
            {isLoading.flashcards ? (
              <div className="flex justify-center items-center">
                <Skeleton className="h-48 w-80" />
              </div>
            ) : content.flashcards && content.flashcards.flashcards.length > 0 ? (
              <Carousel className="w-full max-w-xs mx-auto" opts={{ loop: true }}>
                <CarouselContent>
                  {content.flashcards.flashcards.map((card, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Flashcard question={card.question} answer={card.answer} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : ( <p className="text-muted-foreground text-center pt-16">Generate flashcards to see them here.</p> )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="mcqs">
        <Card className="min-h-[60vh] bg-transparent border-none shadow-none">
          <CardContent className="p-0">
             <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-lg font-semibold font-headline">Multiple Choice Questions</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="difficulty-select" className="text-sm font-medium">Difficulty:</Label>
                    <Select
                      value={mcqDifficulty}
                      onValueChange={(value) => setMcqDifficulty(value as GenerateMCQInput['difficulty'])}
                      disabled={isLoading.mcqs}
                    >
                      <SelectTrigger id="difficulty-select" className="w-[120px]">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {content.mcqs && content.mcqs.mcqs.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onRegenerate('mcqs')} disabled={isLoading.mcqs}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadText('mcqs.txt', formatMcqsForDownload(content.mcqs!.mcqs))}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  )}
                </div>
            </div>
            {isLoading.mcqs ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : content.mcqs && content.mcqs.mcqs.length > 0 ? (
              <div className="space-y-4">
                {content.mcqs.mcqs.map((mcq, index) => (
                  <McqItem key={index} mcq={mcq} index={index} />
                ))}
              </div>
            ) : ( 
              <Card className="min-h-[50vh] flex items-center justify-center">
                <p className="text-muted-foreground text-center">Generate MCQs to see them here.</p>
              </Card>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </>
  );
}
