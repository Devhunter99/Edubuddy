
"use client";

import { type Dispatch, type SetStateAction, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";

interface InputSectionProps {
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

export default function InputSection({ text, setText, onSubmit, isLoading, disabled = false, onPdfUpload, fileInputRef }: InputSectionProps) {
  const getPlaceholder = () => {
    if (disabled) return "Add or select a note to start.";
    return "Paste your notes here, or upload a PDF.";
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Your Notes
        </CardTitle>
        <CardDescription>
          Paste your lecture notes below or upload a PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-2">
          <Label htmlFor="notes-input" className="sr-only">
            Lecture Notes
          </Label>
          <Textarea
            id="notes-input"
            placeholder={getPlaceholder()}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[40vh] text-base resize-y"
            aria-label="Lecture notes input"
            disabled={disabled}
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={onPdfUpload}
            className="hidden"
            accept="application/pdf"
            disabled={isLoading}
        />
        <Button
          onClick={handleUploadClick}
          disabled={isLoading}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading || disabled}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? "Generating..." : "Generate Materials"}
        </Button>
      </CardFooter>
    </Card>
  );
}
