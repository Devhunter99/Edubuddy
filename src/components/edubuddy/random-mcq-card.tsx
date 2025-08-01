
"use client";

import { useState, useEffect, useCallback } from "react";
import { generateMCQ, type GenerateMCQOutput } from "@/ai/flows/generate-mcq";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import McqItem from "./mcq-item";
import { Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface RandomMcqCardProps {
    allNotesText: string;
}

export default function RandomMcqCard({ allNotesText }: RandomMcqCardProps) {
    const { toast } = useToast();
    const [randomMcq, setRandomMcq] = useState<GenerateMCQOutput['mcqs'][0] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);

    const fetchRandomMcq = useCallback(async () => {
        if (!allNotesText.trim()) {
            return;
        }

        setIsLoading(true);
        setIsAnswered(false);
        try {
            const result = await generateMCQ({
                text: allNotesText,
                difficulty: 'normal',
                questionCount: 1,
            });
            if (result.mcqs && result.mcqs.length > 0) {
                setRandomMcq(result.mcqs[0]);
            } else {
                 setRandomMcq(null);
                 toast({ title: "No questions found", description: "Couldn't generate a question from your notes.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Failed to generate random MCQ:", error);
            toast({
                title: "Error generating question",
                description: "Something went wrong. Please try again later.",
                variant: "destructive",
            });
             setRandomMcq(null);
        } finally {
            setIsLoading(false);
        }
    }, [allNotesText, toast]);

    useEffect(() => {
        fetchRandomMcq();
    }, [fetchRandomMcq]);

    const handleAnswer = () => {
        setIsAnswered(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 mt-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-10 w-full mt-2" />
            </div>
        )
    }

    if (!randomMcq) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Add some notes to get a random question!</p>
                <Button onClick={fetchRandomMcq} variant="secondary" size="sm" className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try to generate now
                </Button>
            </div>
        )
    }

    return (
        <div className="mt-4">
            <McqItem mcq={randomMcq} index={0} onAnswer={isAnswered ? undefined : handleAnswer} />
            <Button onClick={fetchRandomMcq} className="w-full mt-4" variant="outline">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Next Question
            </Button>
        </div>
    )
}
