"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { PlusCircle, FileText, Sparkles, BookOpen } from "lucide-react";
import { type Note } from "@/app/subject/[subjectName]/page";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onAddNote: () => void;
  onGenerateFromAllNotes: () => void;
  isClient: boolean;
  subjectName: string;
}

export default function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onGenerateFromAllNotes,
  isClient,
  subjectName,
}: NotesSidebarProps) {
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
      return notes.map((note) => (
        <SidebarMenuItem key={note.id}>
          <SidebarMenuButton
            onClick={() => onSelectNote(note.id)}
            isActive={activeNoteId === note.id}
            className="w-full justify-start"
          >
            <FileText />
            <span className="truncate flex-grow">{note.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ));
    }

    return (
      <p className="text-sm text-muted-foreground text-center py-4 px-2">
        No notes yet. Add one to get started!
      </p>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
           <BookOpen className="h-6 w-6 text-primary" />
           <h3 className="font-semibold text-lg truncate">{subjectName}</h3>
        </div>
        <Button size="sm" onClick={onAddNote} className="w-full">
          <PlusCircle className="mr-2" />
          Add Note
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>{renderNoteList()}</SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="flex-col p-2 gap-2">
        <SidebarSeparator />
        <Button
          className="w-full"
          onClick={onGenerateFromAllNotes}
          disabled={!isClient || notes.length === 0}
        >
          <Sparkles className="mr-2" />
          Generate from All Notes
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
