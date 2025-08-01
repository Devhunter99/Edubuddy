
"use client";

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { generateSummary, type GenerateSummaryOutput } from "@/ai/flows/generate-summary";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateMCQ, type GenerateMCQOutput } from "@/ai/flows/generate-mcq";

import AppHeader from "@/components/edubuddy/app-header";
import InputSection from "@/components/edubuddy/input-section";
import OutputSection from "@/components/edubuddy/output-section";
import NotesSidebar from "@/components/edubuddy/notes-sidebar";

export type GeneratedContent = {
  summary: GenerateSummaryOutput | null;
  flashcards: GenerateFlashcardsOutput | null;
  mcqs: GenerateMCQOutput | null;
};

export type Note = {
  id: string;
  title: string;
  text: string;
  generatedContent: GeneratedContent;
}

// Custom hook for managing state with localStorage
const useSubjectNotes = (subjectName: string) => {
  const getInitialNotes = (): Note[] => {
    if (typeof window === 'undefined') return [];
    try {
      const item = localStorage.getItem(subjectName);
      // Simple migration for old format
      if (item && !item.startsWith('[')) {
        const oldText = localStorage.getItem(`${subjectName}_text`) || '';
        const oldContentRaw = localStorage.getItem(`${subjectName}_content`);
        const oldContent = oldContentRaw ? JSON.parse(oldContentRaw) : { summary: null, flashcards: null, mcqs: null };
        const migratedNote: Note = {
          id: `note-${Date.now()}`,
          title: 'My First Note',
          text: oldText,
          generatedContent: oldContent,
        };
        localStorage.setItem(subjectName, JSON.stringify([migratedNote]));
        // Clean up old keys
        localStorage.removeItem(`${subjectName}_text`);
        localStorage.removeItem(`${subjectName}_content`);
        return [migratedNote];
      }
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading notes from localStorage`, error);
      return [];
    }
  };

  const [notes, setNotesState] = useState<Note[]>(getInitialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

   useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
   }, [notes, activeNoteId]);

  const saveNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem(subjectName, JSON.stringify(newNotes));
    }
  };

  const addNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: `New Note ${notes.length + 1}`,
      text: '',
      generatedContent: { summary: null, flashcards: null, mcqs: null },
    };
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setActiveNoteId(newNote.id);
  };
  
  const updateNote = (noteId: string, updatedFields: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, ...updatedFields } : note
    );
    saveNotes(updatedNotes);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return { notes, activeNote, activeNoteId, setActiveNoteId, addNote, updateNote };
}


export default function SubjectPage() {
  const { toast } = useToast();
  const params = useParams();
  const subjectName = decodeURIComponent(params.subjectName as string);

  const { notes, activeNote, activeNoteId, setActiveNoteId, addNote, updateNote } = useSubjectNotes(subjectName);
  
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState({
    summary: false,
    flashcards: false,
    mcqs: false,
  });
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateAll = async () => {
    if (!activeNote || !activeNote.text.trim()) {
      toast({
        title: "Input required",
        description: "Please select a note and paste some text to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading({ summary: true, flashcards: true, mcqs: true });
    
    const { text } = activeNote;

    const summaryPromise = generateSummary({ lectureNotes: text }).catch(err => {
      console.error("Summary generation failed:", err);
      toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" });
      return null;
    });

    const flashcardsPromise = generateFlashcards({ text }).catch(err => {
      console.error("Flashcard generation failed:", err);
      toast({ title: "Error", description: "Failed to generate flashcards.", variant: "destructive" });
      return null;
    });

    const mcqsPromise = generateMCQ({ text }).catch(err => {
      console.error("MCQ generation failed:", err);
      toast({ title: "Error", description: "Failed to generate MCQs.", variant: "destructive" });
      return null;
    });

    const [summaryResult, flashcardsResult, mcqsResult] = await Promise.all([
      summaryPromise,
      flashcardsPromise,
      mcqsPromise
    ]);

    if (activeNoteId) {
       updateNote(activeNoteId, {
         generatedContent: {
           summary: summaryResult,
           flashcards: flashcardsResult,
           mcqs: mcqsResult
         }
       });
    }

    setIsLoading({ summary: false, flashcards: false, mcqs: false });
  };
  
  const handleRegenerate = async (type: keyof GeneratedContent) => {
    if (!activeNote || !activeNote.text.trim()) {
      toast({
        title: "Input required",
        description: "Please paste some text to regenerate content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let result: GenerateSummaryOutput | GenerateFlashcardsOutput | GenerateMCQOutput | null = null;
      if (type === 'summary') {
        result = await generateSummary({ lectureNotes: activeNote.text });
      } else if (type === 'flashcards') {
        result = await generateFlashcards({ text: activeNote.text });
      } else if (type === 'mcqs') {
        result = await generateMCQ({ text: activeNote.text });
      }
      
      if (activeNoteId) {
        const newContent = { ...activeNote.generatedContent, [type]: result };
        updateNote(activeNoteId, { generatedContent: newContent });
      }

    } catch (error) {
      console.error(`Regeneration failed for ${type}:`, error);
      toast({ title: "Error", description: `Failed to regenerate ${type}.`, variant: "destructive" });
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSetText = (newText: string) => {
    if (activeNoteId) {
      updateNote(activeNoteId, { text: newText });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-bold mb-4 font-headline">{subjectName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8">
          <NotesSidebar
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={setActiveNoteId}
            onAddNote={addNote}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 xl:gap-12">
            <div className="lg:max-w-xl xl:max-w-2xl">
              <InputSection
                text={activeNote?.text ?? ""}
                setText={handleSetText}
                onSubmit={handleGenerateAll}
                isLoading={isLoading.summary || isLoading.flashcards || isLoading.mcqs}
                disabled={!activeNoteId}
              />
            </div>
            <div className="mt-8 lg:mt-0">
            {isClient ? (
              <OutputSection
                content={activeNote?.generatedContent ?? { summary: null, flashcards: null, mcqs: null }}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
                key={activeNoteId} // Re-mount when note changes
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-10 bg-muted w-1/3 rounded-md"></div>
                  <div className="h-10 bg-muted w-1/3 rounded-md"></div>
                  <div className="h-10 bg-muted w-1/3 rounded-md"></div>
                </div>
                <div className="h-[60vh] bg-muted rounded-md"></div>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

    