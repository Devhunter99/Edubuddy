
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateMCQ, type GenerateMCQOutput, type GenerateMCQInput } from "@/ai/flows/generate-mcq";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Book, Timer, BrainCircuit, ArrowRight, Loader2, Shuffle, Settings } from "lucide-react";
import DashboardCard from "@/components/edubuddy/dashboard-card";
import { StudyTimer } from "@/components/edubuddy/study-timer";
import McqItem from "@/components/edubuddy/mcq-item";
import RandomMcqCard from "@/components/edubuddy/random-mcq-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Note } from "@/app/subject/[subjectName]/page";
import HighlightsBanner from "@/components/edubuddy/highlights-banner";
import ShortcutButton from "@/components/edubuddy/shortcut-button";


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
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-8">
                    <ShortcutButton href="/subjects" icon={Book} label="Subjects" />
                    <Dialog>
                        <DialogTrigger asChild>
                            <ShortcutButton icon={Timer} label="Study Timer" />
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm bg-card border-border">
                             <StudyTimer />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
                        <DialogTrigger asChild>
                           <ShortcutButton icon={BrainCircuit} label="Daily Quiz" onClick={handleGenerateQuiz} />
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
                                    ) : dailyQuiz?.mcqs ? (
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
                        className="flex flex-col justify-center items-center text-center lg:col-span-1"
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
                         className="lg:col-span-1"
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
                </div>
            </div>
        </main>
      </div>
    </SidebarInset>
  );
}
