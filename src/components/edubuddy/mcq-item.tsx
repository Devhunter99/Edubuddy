
"use client";

import { useState } from "react";
import { type GenerateMCQOutput } from "@/ai/flows/generate-mcq";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface McqItemProps {
  mcq: GenerateMCQOutput["mcqs"][0];
  index: number;
}

export default function McqItem({ mcq, index }: McqItemProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsChecked(true);
    }
  };

  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(value);
    setIsChecked(false);
  }

  const cleanCorrectAnswer = mcq.correctAnswer.replace(/\*$/, "");

  const getOptionStatus = (option: string) => {
    if (!isChecked) return "default";
    const cleanOption = option.replace(/\*$/, "");
    if (cleanOption === cleanCorrectAnswer) return "correct";
    if (cleanOption === selectedAnswer) return "incorrect";
    return "default";
  };
  
  return (
    <Card className="shadow-md bg-card border-border">
      <CardContent className="p-4">
        <p className="font-semibold mb-4">
          <span className="mr-2 font-bold">{index + 1}.</span>
          {mcq.question}
        </p>
        <RadioGroup
          value={selectedAnswer ?? undefined}
          onValueChange={handleSelectAnswer}
          className="space-y-2"
          disabled={isChecked}
        >
          {mcq.options.map((option, i) => {
            const cleanOption = option.replace(/\*$/, "");
            const status = getOptionStatus(option);
            const isCorrect = status === 'correct';
            const isIncorrect = status === 'incorrect';

            return (
              <Label
                key={i}
                htmlFor={`option-${index}-${i}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                  "border-transparent bg-muted/50",
                  !isChecked && "cursor-pointer hover:bg-muted/80",
                  isChecked && "cursor-default",
                  {
                    "border-green-500 bg-green-500/10 text-foreground font-semibold": isCorrect,
                    "border-red-500 bg-red-500/10 text-foreground font-semibold": isIncorrect,
                  }
                )}
              >
                <RadioGroupItem
                  value={cleanOption}
                  id={`option-${index}-${i}`}
                  className="shrink-0"
                />
                <span className="flex-grow">{cleanOption}</span>
                {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                {isIncorrect && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
      {!isChecked && (
        <CardFooter className="p-4 pt-0 justify-end">
            <Button onClick={handleCheckAnswer} disabled={!selectedAnswer} size="sm">
              Check Answer
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}

