
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateMCQ, type GenerateMCQOutput, type GenerateMCQInput } from "@/ai/flows/generate-mcq";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, FileText, Timer, BrainCircuit, Layers, ArrowRight, Loader2, Shuffle } from "lucide-react";
import DashboardCard from "@/components/edubuddy/dashboard-card";
import { StudyTimer } from "@/components/edubuddy/study-timer";
import McqItem from "@/components/edubuddy/mcq-item";
import RandomMcqCard from "@/components/edubuddy/random-mcq-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Note } from "@/app/subject/[subjectName]/page";

const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allNotesText, setAllNotesText] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
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
  }, []);

  return { subjects, allNotesText };
};


export default function Home() {
    const { subjects, allNotesText } = useSubjects();
    const { toast } = useToast();
    const [dailyQuiz, setDailyQuiz] = useState<GenerateMCQOutput | null>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
    const [recentFlashcards, setRecentFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
    const [areFlashcardsLoading, setAreFlashcardsLoading] = useState(false);

    useEffect(() => {
        const fetchFlashcards = async () => {
            if (!allNotesText.trim()) return;

            setAreFlashcardsLoading(true);
            try {
                const result = await generateFlashcards({ text: allNotesText });
                // We only want to show 2 on the dashboard
                setRecentFlashcards(result.flashcards.slice(0, 2));
            } catch (error) {
                console.error("Failed to generate flashcards:", error);
                // Don't show a toast, fail silently
            } finally {
                setAreFlashcardsLoading(false);
            }
        };

        fetchFlashcards();
    }, [allNotesText]);


    const handleGenerateQuiz = async () => {
        if (!allNotesText.trim()) {
            toast({
                title: "No notes found",
                description: "Please add some notes to your subjects to generate a quiz.",
                variant: "destructive",
            });
            return;
        }

        setIsQuizLoading(true);
        try {
            const quiz = await generateMCQ({
                text: allNotesText,
                difficulty: 'normal',
                questionCount: 5,
            });
            setDailyQuiz(quiz);
            setIsQuizDialogOpen(true);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            toast({
                title: "Error generating quiz",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsQuizLoading(false);
        }
    };


  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Flashcards */}
                     <DashboardCard
                        title="Recent Flashcards"
                        icon={Layers}
                        description="Review your latest cards."
                        className="lg:col-span-2"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {areFlashcardsLoading ? (
                                <>
                                    <Skeleton className="h-24" />
                                    <Skeleton className="h-24" />
                                </>
                            ) : recentFlashcards && recentFlashcards.length > 0 ? (
                                recentFlashcards.map((card, index) => (
                                    <Card key={index} className="bg-card-foreground/5 p-3">
                                       <p className="text-sm font-semibold">{card.question}</p>
                                       <p className="text-sm text-muted-foreground mt-1">{card.answer}</p>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground col-span-2">Add some notes to see your flashcards here.</p>
                            )}
                        </div>
                         <Button variant="outline" className="w-full mt-4" disabled>View All Flashcards</Button>
                    </DashboardCard>

                    {/* Subjects */}
                    <DashboardCard
                        title="My Subjects"
                        icon={Book}
                        description="Jump back into your studies."
                        className="lg:col-span-2"
                    >
                        <div className="mt-4 space-y-2">
                             {subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {subjects.slice(0, 4).map(subject => (
                                        <Link href={`/subject/${encodeURIComponent(subject)}`} key={subject}>
                                            <Button variant="secondary" size="sm">{subject}</Button>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No subjects yet.</p>
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
                        className="flex flex-col justify-center items-center text-center"
                    >
                       <div className="w-full max-w-xs">
                         <StudyTimer />
                       </div>
                    </DashboardCard>

                    {/* Daily Quiz */}
                    <DashboardCard
                        title="Daily Quiz"
                        icon={BrainCircuit}
                        description="Test your knowledge."
                    >
                        <p className="text-sm text-muted-foreground mt-2">
                            A quick quiz based on your recent activity.
                        </p>
                         <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-4" onClick={handleGenerateQuiz} disabled={isQuizLoading}>
                                     {isQuizLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                     {isQuizLoading ? 'Generating...' : (dailyQuiz ? 'Retake Quiz' : 'Start Quiz')}
                                </Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-2xl bg-card border-border">
                                <DialogHeader>
                                    <DialogTitle>Daily Quiz</DialogTitle>
                                </DialogHeader>
                                 <div className="py-4 max-h-[70vh] overflow-y-auto">
                                     {dailyQuiz?.mcqs ? (
                                         <div className="space-y-4">
                                             {dailyQuiz.mcqs.map((mcq, index) => (
                                                 <McqItem key={index} mcq={mcq} index={index}/>
                                             ))}
                                         </div>
                                     ) : (
                                         <p>No quiz generated yet.</p>
                                     )}
                                 </div>
                             </DialogContent>
                        </Dialog>
                    </DashboardCard>
                    
                    {/* Random Question */}
                     <DashboardCard
                        title="Random Question"
                        icon={Shuffle}
                        description="Quick practice."
                        className="lg:col-span-2"
                    >
                      <RandomMcqCard allNotesText={allNotesText} />
                    </DashboardCard>
                </div>
            </div>
        </main>
      </div>
    </SidebarInset>
  );
}
