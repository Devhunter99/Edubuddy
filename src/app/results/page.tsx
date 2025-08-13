
"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { QuizResult } from "@/lib/types";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
};

export default function ResultsPage() {
    const [history, setHistory] = useState<QuizResult[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedHistory = localStorage.getItem("quizHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);
    
    const handleDeleteHistory = () => {
        localStorage.removeItem("quizHistory");
        setHistory([]);
    }

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <CardTitle>Quiz History</CardTitle>
              {isClient && history.length > 0 && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Clear History</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your quiz history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteHistory}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {isClient && history.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full space-y-4">
                     {history.map((result) => (
                        <Card key={result.id} className="bg-card">
                             <AccordionItem value={result.id} className="border-b-0">
                                <AccordionTrigger className="p-6 hover:no-underline">
                                    <div className="flex-1 text-left">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-lg">{result.subjectName}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(result.timestamp), "PPp")}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Progress value={(result.score / result.mcqs.length) * 100} className="h-2" indicatorClassName={getScoreColor(result.score, result.mcqs.length)}/>
                                            <span className="font-semibold text-foreground">{result.score} / {result.mcqs.length}</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                     <div className="space-y-4">
                                        {result.mcqs.map((mcq, index) => {
                                            const userAnswer = result.answers[index];
                                            if (!userAnswer) {
                                                return (
                                                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                                                        <p className="font-semibold">{index + 1}. {mcq.question}</p>
                                                        <p className="mt-2 text-sm text-muted-foreground">Not answered</p>
                                                    </div>
                                                )
                                            }
                                            const isCorrect = userAnswer.isCorrect;
                                            return (
                                                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                                                    <p className="font-semibold">{index + 1}. {mcq.question}</p>
                                                    <p className="mt-2 text-sm">Your answer: <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>{userAnswer.selected}</span></p>
                                                    {!isCorrect && <p className="text-sm">Correct answer: <span className="text-green-500">{mcq.correctAnswer}</span></p>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </AccordionContent>
                             </AccordionItem>
                        </Card>
                     ))}
                 </Accordion>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg border-border">
                  <p className="text-muted-foreground">No quiz results found.</p>
                  <p className="text-muted-foreground">
                    Complete a quiz to see your history here!
                  </p>
                </div>
            )}
        </main>
      </div>
    </SidebarInset>
  );
}

    
