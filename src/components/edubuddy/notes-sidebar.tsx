
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, FileText, Library, Trash2, Sparkles } from "lucide-react";
import { type Note } from "@/app/subject/[subjectName]/page";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onAddNote: () => void;
  onGenerateFromAllNotes: () => void;
  isClient: boolean;
}

export default function NotesSidebar({ notes, activeNoteId, onSelectNote, onAddNote, onGenerateFromAllNotes, isClient }: NotesSidebarProps) {
  
  const renderNoteList = () => {
    if (!isClient) {
      return (
        <div className="space-y-2 pt-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }
    
    if (notes.length > 0) {
      return notes.map(note => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={cn(
            "w-full text-left p-3 rounded-md transition-colors flex items-center gap-3",
            activeNoteId === note.id ? "bg-primary/90 text-primary-foreground" : "hover:bg-muted"
          )}
        >
          <FileText className="h-5 w-5 shrink-0" />
          <span className="truncate flex-grow">{note.title}</span>
        </button>
      ));
    }

    return (
       <p className="text-sm text-muted-foreground text-center py-4">
        No notes yet. Add one to get started!
      </p>
    );
  };
  
  return (
    <Card className="shadow-lg h-fit">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex justify-between items-center">
          <span>Notes</span>
          <Button size="sm" onClick={onAddNote}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </CardTitle>
        <CardDescription>
          Your notes for this subject.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[52vh] px-6">
            {renderNoteList()}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col p-4 gap-2">
          <Separator className="mb-2" />
          <Button 
            className="w-full"
            onClick={onGenerateFromAllNotes}
            disabled={notes.length === 0}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate from All Notes
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Generate materials from all notes in this subject combined.
          </p>
      </CardFooter>
    </Card>
  );
}
