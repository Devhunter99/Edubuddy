
"use client";

import { type Dispatch, type SetStateAction, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { Input } from "../ui/input";

interface InputSectionProps {
  title: string;
  setTitle: (title: string) => void;
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
  onPdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  isUploading: boolean;
}

export default function InputSection({ title, setTitle, text, setText, onSubmit, isLoading, disabled = false, onPdfUpload, fileInputRef, isUploading }: InputSectionProps) {
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
          Paste your lecture notes below, upload a PDF, or edit the note title.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
            <div>
              <Label htmlFor="notes-title" className="mb-2 block">
                Note Title
              </Label>
              <Input
                id="notes-title"
                placeholder="Enter a title for your note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={disabled}
                className="text-base"
              />
            </div>
            <div>
              <Label htmlFor="notes-input" className="sr-only">
                Lecture Notes
              </Label>
              <Textarea
                id="notes-input"
                placeholder={getPlaceholder()}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[35vh] text-base resize-y"
                aria-label="Lecture notes input"
                disabled={disabled}
              />
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={onPdfUpload}
            className="hidden"
            accept="application/pdf"
            disabled={isLoading || isUploading}
        />
        <Button
          onClick={handleUploadClick}
          disabled={isLoading || isUploading}
          variant="outline"
          className="w-full"
          size="lg"
        >
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploading ? "Uploading..." : "Upload PDF"}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading || disabled || isUploading}
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
