"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  question: string;
  answer: string;
}

export default function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group h-64 w-full [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(!isFlipped)}
      aria-label={`Flashcard: ${question}. Click to reveal answer.`}
    >
      <div
        className={cn(
          "relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="h-full w-full flex flex-col items-center justify-center text-center p-4 bg-card">
            <CardContent className="p-2">
              <p className="text-sm text-muted-foreground mb-2">Question</p>
              <p className="font-semibold text-lg">{question}</p>
            </CardContent>
          </Card>
        </div>
        <div className="absolute inset-0 h-full w-full rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <Card className="h-full w-full flex flex-col items-center justify-center text-center p-4 bg-primary text-primary-foreground">
            <CardContent className="p-2">
              <p className="text-sm opacity-80 mb-2">Answer</p>
              <p className="font-semibold text-lg">{answer}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
