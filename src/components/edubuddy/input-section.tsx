
"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface InputSectionProps {
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function InputSection({ text, setText, onSubmit, isLoading, disabled = false }: InputSectionProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Notes</CardTitle>
        <CardDescription>
          Paste your lecture notes below. PDF upload coming soon!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-2">
          <Label htmlFor="notes-input" className="sr-only">
            Lecture Notes
          </Label>
          <Textarea
            id="notes-input"
            placeholder={disabled ? "Add or select a note to start." : "Paste your notes here..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[40vh] text-base resize-y"
            aria-label="Lecture notes input"
            disabled={disabled}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSubmit}
          disabled={isLoading || disabled}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Generating..." : "Generate Study Materials"}
        </Button>
      </CardFooter>
    </Card>
  );
}

    