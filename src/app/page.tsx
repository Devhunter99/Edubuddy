
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateMCQ, type GenerateMCQOutput, type GenerateMCQInput } from "@/ai/flows/generate-mcq";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Book, Timer, BrainCircuit, ArrowRight, Loader2, Shuffle, Settings, PieChart } from "lucide-react";
import DashboardCard from "@/components/edubuddy/dashboard-card";
import McqItem from "@/components/edubuddy/mcq-item";
import RandomMcqCard from "@/components/edubuddy/random-mcq-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Note } from "@/lib/types";
import HighlightsBanner from "@/components/edubuddy/highlights-banner";
import ShortcutButton from "@/components/edubuddy/shortcut-button";
import QuizResultsSummary from "@/components/edubuddy/quiz-results-summary";
import type { QuizResult } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useCoins } from "@/hooks/use-coins";


const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allNotesText, setAllNotesText] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const storedSubjects = localStorage.getItem("subjects");
        const subjectList: string[] = storedSubjects ? JSON.parse(storedSubjects) : [];
        setSubjects(subjectList);

        const allText = subjectList.map(subjectName => {
            const notesRaw = localStorage.getItem(subjectName);
            if (notesRaw) {
                try {
                    const notes: Note[] = JSON.parse(notesRaw);
                    return notes.map(note => `## ${note.title}\n\n${note.text}`).join('\n\n---\n\n');
                } catch {
                    return '';
                }
            }
            return '';
        }).join('\n\n');
        setAllNotesText(allText);

      } catch (error) {
        console.error("Failed to parse subjects from localStorage", error);
        setSubjects([]);
      }
    }
  }, [isClient]);

  return { subjects, allNotesText };
};


export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { subjects, allNotesText } = useSubjects();
    const { toast } = useToast();
    const { addCoinForQuestion } = useCoins();
    const [dailyQuiz, setDailyQuiz] = useState<GenerateMCQOutput | null>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
    
    // State for quiz answers and results
    const [quizAnswers, setQuizAnswers] = useState<Record<number, { selected: string; isCorrect: boolean }>>({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (index: number, selected: string, isCorrect: boolean) => {
      setQuizAnswers(prev => ({ ...prev, [index]: { selected, isCorrect } }));
      if (isCorrect && dailyQuiz?.mcqs[index]) {
        addCoinForQuestion(dailyQuiz.mcqs[index].question);
      }
    };

    const allQuestionsAnswered = dailyQuiz?.mcqs && Object.keys(quizAnswers).length === dailyQuiz.mcqs.length;

    useEffect(() => {
      if (allQuestionsAnswered) {
        setShowResults(true);

        if (!user) return; // Don't save for guests

        const newResult: QuizResult = {
          id: `quiz-${Date.now()}`,
          subjectName: 'Daily Quiz',
          timestamp: new Date().toISOString(),
          mcqs: dailyQuiz!.mcqs,
          answers: quizAnswers,
          score: Object.values(quizAnswers).filter(a => a.isCorrect).length,
        };

        const history: QuizResult[] = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        history.unshift(newResult);
        localStorage.setItem('quizHistory', JSON.stringify(history));

      }
    }, [allQuestionsAnswered, dailyQuiz, quizAnswers, user]);


    const handleGenerateQuiz = async (retake = false) => {
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to generate quizzes and save your progress.", variant: "destructive" });
            router.push('/login');
            return;
        }

        if (!retake && dailyQuiz) {
             setIsQuizDialogOpen(true);
             return;
        }

        if (!allNotesText.trim()) {
            toast({
                title: "No notes found",
                description: "Please add some notes to your subjects to generate a quiz.",
                variant: "destructive",
            });
            return;
        }

        setIsQuizLoading(true);
        setDailyQuiz(null);
        setQuizAnswers({});
        setShowResults(false);
        setIsQuizDialogOpen(true);

        try {
            const quiz = await generateMCQ({
                text: allNotesText,
                difficulty: 'normal',
                questionCount: 5,
            });
            setDailyQuiz(quiz);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            toast({
                title: "Error generating quiz",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
            setIsQuizDialogOpen(false);
        } finally {
            setIsQuizLoading(false);
        }
    };

  if (loading) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-8">
                    <ShortcutButton href="/subjects" icon={Book} label="Subjects" />
                    <ShortcutButton href="/study-timer" icon={Timer} label="Study Timer" />
                    <Dialog open={isQuizDialogOpen} onOpenChange={(open) => {
                      if(!open) {
                        // Reset quiz state when dialog closes, unless showing results
                         if (dailyQuiz && !showResults) {
                           setDailyQuiz(null);
                           setQuizAnswers({});
                         }
                      }
                      setIsQuizDialogOpen(open);
                    }}>
                        <DialogTrigger asChild>
                           <ShortcutButton icon={BrainCircuit} label="Daily Quiz" onClick={() => handleGenerateQuiz()} />
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl bg-card border-border">
                            <DialogHeader>
                                <DialogTitle>Daily Quiz</DialogTitle>
                            </DialogHeader>
                                <div className="py-4 max-h-[70vh] overflow-y-auto">
                                    {isQuizLoading ? (
                                        <div className="flex justify-center items-center h-40">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : showResults ? (
                                        <QuizResultsSummary 
                                            mcqs={dailyQuiz!.mcqs}
                                            answers={quizAnswers}
                                            onRetake={() => handleGenerateQuiz(true)}
                                            onFinish={() => setIsQuizDialogOpen(false)}
                                        />
                                    ) : dailyQuiz?.mcqs ? (
                                         <Carousel className="w-full" opts={{ loop: false, watchDrag: false }} >
                                            <CarouselContent>
                                                {dailyQuiz.mcqs.map((mcq, index) => (
                                                     <CarouselItem key={`${dailyQuiz.mcqs[0].question}-${index}`}>
                                                        <div className="p-1">
                                                            <McqItem 
                                                                mcq={mcq} 
                                                                index={index}
                                                                onAnswer={handleAnswer}
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    ) : (
                                        <p>No quiz generated yet.</p>
                                    )}
                                </div>
                        </DialogContent>
                    </Dialog>
                    <ShortcutButton href="/results" icon={PieChart} label="Results" />
                     <ShortcutButton href="/settings" icon={Settings} label="Settings" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Highlights Banner */}
                    <div className="md:col-span-2 lg:col-span-4">
                      <HighlightsBanner allNotesText={allNotesText} />
                    </div>

                    {/* Random Question */}
                     <DashboardCard
                        title="Random Question"
                        icon={Shuffle}
                        description="Quick practice."
                        className="lg:col-span-2"
                    >
                      <RandomMcqCard allNotesText={allNotesText} />
                    </DashboardCard>
                    
                    {/* Subjects */}
                    <DashboardCard
                        title="My Subjects"
                        icon={Book}
                        description={user ? "Jump back into your studies." : "Log in to save subjects."}
                        className="lg:col-span-2"
                    >
                        <div className="mt-4 space-y-2">
                             {subjects.length > 0 && user ? (
                                <div className="flex flex-wrap gap-2">
                                    {subjects.slice(0, 4).map(subject => (
                                        <Link href={`/subject/${encodeURIComponent(subject)}`} key={subject}>
                                            <Button variant="secondary" size="sm">{subject}</Button>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{user ? "No subjects yet." : "Log in to create and manage subjects."}</p>
                            )}
                        </div>
                         <Link href="/subjects" className="mt-4">
                            <Button variant="outline" size="sm" className="w-full">
                                View All Subjects <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </DashboardCard>
                    
                    {/* Study Timer */}
                     <DashboardCard
                        title="Study Timer"
                        icon={Timer}
                        description="Focus your study sessions."
                        className="lg:col-span-1"
                    >
                        <p className="text-sm text-muted-foreground mt-2">
                            Set a timer and get in the zone for a productive study session.
                        </p>
                       <Link href="/study-timer" className="mt-4">
                            <Button variant="outline" className="w-full">
                                Go to Timer <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </DashboardCard>

                    {/* Daily Quiz */}
                    <DashboardCard
                        title="Daily Quiz"
                        icon={BrainCircuit}
                        description="Test your knowledge."
                         className="lg:col-span-1"
                    >
                        <p className="text-sm text-muted-foreground mt-2">
                            A quick quiz based on your recent activity.
                        </p>
                         <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-4" onClick={() => handleGenerateQuiz()} disabled={isQuizLoading}>
                                     {isQuizLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                     {isQuizLoading ? 'Generating...' : (dailyQuiz && user ? 'View Quiz' : 'Start Quiz')}
                                </Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-2xl bg-card border-border">
                                <DialogHeader>
                                    <DialogTitle>Daily Quiz</DialogTitle>
                                </DialogHeader>
                                 <div className="py-4 max-h-[70vh] overflow-y-auto">
                                     {isQuizLoading ? (
                                        <div className="flex justify-center items-center h-40">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : showResults ? (
                                        <QuizResultsSummary 
                                            mcqs={dailyQuiz!.mcqs}
                                            answers={quizAnswers}
                                            onRetake={() => handleGenerateQuiz(true)}
                                            onFinish={() => setIsQuizDialogOpen(false)}
                                        />
                                    ) : dailyQuiz?.mcqs ? (
                                         <Carousel className="w-full" opts={{ loop: false, watchDrag: false }}>
                                            <CarouselContent>
                                                {dailyQuiz.mcqs.map((mcq, index) => (
                                                    <CarouselItem key={`${dailyQuiz.mcqs[0].question}-${index}`}>
                                                        <div className="p-1">
                                                            <McqItem 
                                                                mcq={mcq} 
                                                                index={index}
                                                                onAnswer={handleAnswer}
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                     ) : (
                                         <p>No quiz generated yet.</p>
                                     )}
                                 </div>
                             </DialogContent>
                        </Dialog>
                    </DashboardCard>
                </div>
            </div>
        </main>
      </div>
    </SidebarInset>
  );
}
