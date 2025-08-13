
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Repeat, Award } from "lucide-react";
import Link from "next/link";
import type { QuizResult } from "@/lib/types";

interface QuizResultsSummaryProps {
  mcqs: QuizResult['mcqs'];
  answers: QuizResult['answers'];
  onRetake: () => void;
  onFinish?: () => void;
}

const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
};

export default function QuizResultsSummary({ mcqs, answers, onRetake, onFinish }: QuizResultsSummaryProps) {
  const score = Object.values(answers).filter(a => a.isCorrect).length;
  const totalQuestions = mcqs.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Award className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="mt-4 text-2xl">Quiz Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-4xl font-bold">
          {score} / {totalQuestions}
        </p>
        <div className="flex items-center gap-4 px-4">
            <Progress value={percentage} className="h-3" indicatorClassName={getScoreColor(score, totalQuestions)} />
            <span className="font-bold text-lg">{percentage}%</span>
        </div>
        <p className="text-muted-foreground">
            You did a great job. Keep practicing to improve your score!
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button onClick={onRetake} variant="outline"><Repeat className="mr-2 h-4 w-4"/> Retake Quiz</Button>
        <Link href="/results">
            <Button>View History</Button>
        </Link>
        {onFinish && <Button onClick={onFinish} variant="secondary">Finish</Button>}
      </CardFooter>
    </Card>
  );
}

    
