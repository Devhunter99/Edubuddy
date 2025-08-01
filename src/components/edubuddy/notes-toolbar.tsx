"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, ChevronDown } from "lucide-react";
import { type Note } from "@/app/subject/[subjectName]/page";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NotesToolbarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onAddNote: () => void;
  onGenerateFromAllNotes: () => void;
  isClient: boolean;
  subjectName: string;
}

export default function NotesToolbar({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onGenerateFromAllNotes,
  isClient,
  subjectName,
}: NotesToolbarProps) {
  
  const activeNote = notes.find(n => n.id === activeNoteId);

  const renderNoteSelector = () => {
    if (!isClient) {
      return <Skeleton className="h-10 w-48" />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <span className="truncate pr-2">
              {activeNote ? activeNote.title : "Select a Note"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {notes.length > 0 ? (
            notes.map((note) => (
              <DropdownMenuItem
                key={note.id}
                onSelect={() => onSelectNote(note.id)}
              >
                {note.title}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No notes yet</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="bg-card border rounded-lg p-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold font-headline pl-2 pr-4 border-r">
          {subjectName}
        </h2>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Note:</span>
            {renderNoteSelector()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onAddNote}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Note
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onGenerateFromAllNotes}
          disabled={!isClient || notes.length === 0}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate from All Notes
        </Button>
      </div>
    </div>
  );
}
