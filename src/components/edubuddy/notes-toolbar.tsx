
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, ChevronDown, Library } from "lucide-react";
import type { Note } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotesToolbarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onAddNote: () => void;
  onGenerateFromAllNotes: () => void;
  isClient: boolean;
  subjectName: string;
  activeView: 'note' | 'all-notes';
  onSelectAllNotes: () => void;
}

export default function NotesToolbar({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onGenerateFromAllNotes,
  isClient,
  subjectName,
  activeView,
  onSelectAllNotes,
}: NotesToolbarProps) {
  
  const activeNote = notes.find(n => n.id === activeNoteId);

  const getButtonText = () => {
    if (activeView === 'all-notes') return 'All Notes';
    if (activeNote) return activeNote.title;
    return 'Select a Note';
  };

  const renderNoteSelector = () => {
    if (!isClient) {
      return <Skeleton className="h-10 w-48" />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <span className="truncate pr-2">
              {getButtonText()}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onSelect={onSelectAllNotes} className={cn(activeView === 'all-notes' && 'bg-accent')}>
              <Library className="mr-2 h-4 w-4" />
              All Notes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {notes.length > 0 ? (
            notes.map((note) => (
              <DropdownMenuItem
                key={note.id}
                onSelect={() => onSelectNote(note.id)}
                 className={cn(activeNoteId === note.id && 'bg-accent')}
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
            <span className="text-sm font-medium text-muted-foreground">View:</span>
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
          disabled={!isClient || notes.length === 0 || activeView !== 'all-notes'}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Materials
        </Button>
      </div>
    </div>
  );
}
