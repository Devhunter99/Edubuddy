
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText } from "lucide-react";
import { type Note } from "@/app/subject/[subjectName]/page";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
}

export default function NotesSidebar({ notes, activeNoteId, onSelectNote, onAddNote }: NotesSidebarProps) {
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
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
          <div className="space-y-2">
            {notes.length > 0 ? notes.map(note => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  "w-full text-left p-3 rounded-md transition-colors flex items-center gap-3",
                  activeNoteId === note.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <FileText className="h-5 w-5 shrink-0" />
                <span className="truncate flex-grow">{note.title}</span>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Add one to get started!</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    