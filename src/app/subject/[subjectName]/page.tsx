
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { generateSummary, type GenerateSummaryOutput } from "@/ai/flows/generate-summary";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateMCQ, type GenerateMCQInput, type GenerateMCQOutput } from "@/ai/flows/generate-mcq";
import { processPdf } from "@/ai/flows/process-pdf";

import AppHeader from "@/components/edubuddy/app-header";
import InputSection from "@/components/edubuddy/input-section";
import OutputSection from "@/components/edubuddy/output-section";
import NotesToolbar from "@/components/edubuddy/notes-toolbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import type { GeneratedContent, Note } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const ALL_NOTES_ID = "all-notes";

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
  
  const getInitialAllNotesContent = (): GeneratedContent => {
     if (typeof window === 'undefined') return { summary: null, flashcards: null, mcqs: null };
     try {
       const item = localStorage.getItem(`${subjectName}_${ALL_NOTES_ID}_content`);
       return item ? JSON.parse(item) : { summary: null, flashcards: null, mcqs: null };
     } catch (error) {
        console.error(`Error reading all notes content from localStorage`, error);
        return { summary: null, flashcards: null, mcqs: null };
     }
  };

  const [allNotesGeneratedContent, setAllNotesGeneratedContent] = useState<GeneratedContent>(getInitialAllNotesContent);

   useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
     if (notes.length === 0) {
      setActiveNoteId(null);
     }
   }, [notes, activeNoteId]);

  const saveNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem(subjectName, JSON.stringify(newNotes));
    }
  };
  
  const saveAllNotesContent = (content: GeneratedContent) => {
    setAllNotesGeneratedContent(content);
    if (typeof window !== 'undefined') {
        localStorage.setItem(`${subjectName}_${ALL_NOTES_ID}_content`, JSON.stringify(content));
    }
  }

  const addNote = (title?: string, text?: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title || `New Note ${notes.length + 1}`,
      text: text || '',
      generatedContent: { summary: null, flashcards: null, mcqs: null },
    };
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    return newNote;
  };
  
  const updateNote = (noteId: string, updatedFields: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, ...updatedFields } : note
    );
    saveNotes(updatedNotes);
  };

  const activeNote = notes.find(n => n.id === activeNoteId);
  
  const allNotesText = notes.map(n => `## ${n.title}\n\n${n.text}`).join('\n\n---\n\n');

  return { 
    notes, 
    activeNote, 
    activeNoteId, 
    setActiveNoteId, 
    addNote, 
    updateNote,
    allNotesText,
    allNotesGeneratedContent,
    setAllNotesGeneratedContent: saveAllNotesContent,
  };
}


export default function SubjectPage() {
  const { toast } = useToast();
  const params = useParams();
  const { user } = useAuth();
  const subjectName = decodeURIComponent(params.subjectName as string);

  const { 
    notes, 
    activeNote, 
    activeNoteId, 
    setActiveNoteId, 
    addNote, 
    updateNote,
    allNotesText,
    allNotesGeneratedContent,
    setAllNotesGeneratedContent
  } = useSubjectNotes(subjectName);
  
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState({
    summary: false,
    flashcards: false,
    mcqs: false,
  });
  const [mcqDifficulty, setMcqDifficulty] = useState<GenerateMCQInput['difficulty']>('normal');
  const [activeView, setActiveView] = useState<'note' | 'all-notes'>('note');
  const [studyLevel, setStudyLevel] = useState('undergraduate');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    if(notes.length > 0 && !activeNoteId){
      setActiveNoteId(notes[0].id)
    }
  }, [notes, activeNoteId]);
  
  useEffect(() => {
    if (activeNoteId) {
      setActiveView('note');
    }
  }, [activeNoteId]);
  
  useEffect(() => {
    if (isClient && user) {
        const level = localStorage.getItem(`user_study_level_${user.uid}`);
        if(level) {
            setStudyLevel(level);
        }
    }
  }, [isClient, user]);

  const isAllNotesView = activeView === 'all-notes';
  const currentText = isAllNotesView ? allNotesText : activeNote?.text ?? "";
  const currentContent = isAllNotesView ? allNotesGeneratedContent : activeNote?.generatedContent;

  const handleGenerate = async (text: string, forAllNotes: boolean, noteIdToUpdate?: string) => {
     if (!text.trim()) {
      toast({
        title: "Input required",
        description: "Please select a note with text or add some notes to the subject.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading({ summary: true, flashcards: true, mcqs: true });

    try {
      const [summaryResult, flashcardsResult, mcqsResult] = await Promise.all([
        generateSummary({ lectureNotes: text, studyLevel }).catch(err => {
          console.error("Summary generation failed:", err);
          toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" });
          return null;
        }),
        generateFlashcards({ text, studyLevel }).catch(err => {
          console.error("Flashcard generation failed:", err);
          toast({ title: "Error", description: "Failed to generate flashcards.", variant: "destructive" });
          return null;
        }),
        generateMCQ({ text, difficulty: mcqDifficulty, questionCount: 5, studyLevel }).catch(err => {
          console.error("MCQ generation failed:", err);
          toast({ title: "Error", description: "Failed to generate MCQs.", variant: "destructive" });
          return null;
        })
      ]);

      const newContent = {
        summary: summaryResult,
        flashcards: flashcardsResult,
        mcqs: mcqsResult
      };

      if (forAllNotes) {
        setAllNotesGeneratedContent(newContent);
        setActiveView('all-notes');
        setActiveNoteId(null);
      } else {
         const finalNoteId = noteIdToUpdate || activeNoteId;
         if (finalNoteId) {
            updateNote(finalNoteId, { generatedContent: newContent });
         }
      }
    } finally {
        setIsLoading({ summary: false, flashcards: false, mcqs: false });
    }
  }

  const handleGenerateForCurrentNote = () => {
    if (activeNote) {
      handleGenerate(activeNote.text, false);
    }
  }

  const handleGenerateForAllNotes = () => {
    setActiveView('all-notes');
    setActiveNoteId(null);
    handleGenerate(allNotesText, true);
  };
  
  const handleRegenerate = async (type: keyof GeneratedContent) => {
    if (!currentText.trim()) {
      toast({
        title: "Input required",
        description: "There is no text to regenerate content from.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let result: GenerateSummaryOutput | GenerateFlashcardsOutput | GenerateMCQOutput | null = null;
      if (type === 'summary') {
        result = await generateSummary({ lectureNotes: currentText, studyLevel });
      } else if (type === 'flashcards') {
        result = await generateFlashcards({ text: currentText, studyLevel });
      } else if (type === 'mcqs') {
        result = await generateMCQ({ text: currentText, difficulty: mcqDifficulty, questionCount: 5, studyLevel });
      }
      
      const newContent: GeneratedContent = { ...(currentContent as GeneratedContent), [type]: result };

      if (isAllNotesView) {
        setAllNotesGeneratedContent(newContent);
      } else if (activeNoteId) {
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

  const handleSetTitle = (newTitle: string) => {
    if (activeNoteId) {
      updateNote(activeNoteId, { title: newTitle });
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        toast({ title: "Invalid File", description: "Please upload a PDF file.", variant: "destructive" });
        return;
    }

    setIsUploading(true);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const pdfDataUri = reader.result as string;
            
            const { text } = await processPdf({ pdfDataUri });

            addNote(file.name.replace('.pdf', ''), text);
            
            toast({
                title: "PDF Uploaded",
                description: `${file.name} has been added as a new note.`,
            });
        };
        reader.onerror = () => {
          throw new Error("Failed to read the file.");
        }
    } catch (error) {
        console.error("PDF processing failed:", error);
        toast({ title: "Error", description: "Failed to process the PDF.", variant: "destructive" });
    } finally {
        setIsUploading(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectNote = (id: string | null) => {
    setActiveNoteId(id);
    if(id) {
        setActiveView('note');
    }
  }


  if (!isClient) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        </div>
    )
  }

  return (
    <SidebarInset>
    <div className="flex flex-col min-h-screen bg-background font-body">
      <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
           <NotesToolbar
              notes={notes}
              activeNoteId={activeNoteId}
              onSelectNote={handleSelectNote}
              onAddNote={() => addNote()}
              onGenerateFromAllNotes={handleGenerateForAllNotes}
              isClient={isClient}
              subjectName={subjectName}
              activeView={activeView}
              onSelectAllNotes={() => {
                setActiveView('all-notes');
                setActiveNoteId(null);
              }}
            />
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 xl:gap-12 mt-6">
            <div className="lg:max-w-xl xl:max-w-2xl">
              <InputSection
                title={activeNote?.title ?? ""}
                setTitle={handleSetTitle}
                text={activeNote?.text ?? ""}
                setText={handleSetText}
                onSubmit={handleGenerateForCurrentNote}
                isLoading={isLoading.summary || isLoading.flashcards || isLoading.mcqs}
                disabled={!activeNoteId}
                onPdfUpload={handlePdfUpload}
                fileInputRef={fileInputRef}
                isUploading={isUploading}
              />
            </div>
            <div className="mt-8 lg:mt-0">
              <OutputSection
                content={currentContent ?? { summary: null, flashcards: null, mcqs: null }}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
                mcqDifficulty={mcqDifficulty}
                setMcqDifficulty={setMcqDifficulty}
                key={isAllNotesView ? ALL_NOTES_ID : activeNoteId} // Re-mount when view changes
                isAllNotesView={isAllNotesView}
                subjectName={isAllNotesView ? 'All Notes' : activeNote?.title}
              />
            </div>
          </div>
        </main>
    </div>
    </SidebarInset>
  );
}
