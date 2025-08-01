"use client";

import { type GenerateMCQOutput } from "@/ai/flows/generate-mcq";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";

interface McqItemProps {
  mcq: GenerateMCQOutput["mcqs"][0];
  index: number;
}

export default function McqItem({ mcq, index }: McqItemProps) {
  return (
    <AccordionItem value={`item-${index}`}>
      <AccordionTrigger className="text-left hover:no-underline">
        <span className="font-semibold mr-2">{index + 1}.</span> {mcq.question}
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-2 pl-4 pt-2">
          {mcq.options.map((option, i) => {
            const isCorrect = option === mcq.correctAnswer;
            const cleanOption = option.replace(/\*$/, "");
            return (
              <li
                key={i}
                className={`flex items-start gap-2 p-2 rounded-md ${
                  isCorrect ? "bg-primary/10" : ""
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                ) : (
                  <div className="h-5 w-5 shrink-0" />
                )}
                <span className="flex-grow">{cleanOption}</span>
              </li>
            );
          })}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
