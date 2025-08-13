
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { incrementUserStats } from "@/services/stats-service";

const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      try {
        const storedSubjects = localStorage.getItem("subjects");
        if (storedSubjects) {
          setSubjects(JSON.parse(storedSubjects));
        }
      } catch (error) {
        console.error("Failed to parse subjects from localStorage", error);
        setSubjects([]);
      }
    }
  }, []);

  const addSubject = (newSubject: string) => {
    if (newSubject && !subjects.includes(newSubject)) {
      const updatedSubjects = [...subjects, newSubject];
      setSubjects(updatedSubjects);
      if (typeof window !== "undefined") {
        localStorage.setItem("subjects", JSON.stringify(updatedSubjects));
      }
      if (user && updatedSubjects.length === 1) {
        // This is the first subject they've created in this session
        incrementUserStats(user.uid, { firstSubjectCreated: 1 });
      }
    }
  };
  
  const getNoteCount = (subject: string) => {
    if(!isClient) return '...';
    try {
        const notesRaw = localStorage.getItem(subject);
        if (notesRaw) {
            const notes = JSON.parse(notesRaw);
            return Array.isArray(notes) ? `${notes.length} Note${notes.length !== 1 ? 's' : ''}` : 'No notes yet';
        }
    } catch {
        return 'No notes yet';
    }
    return 'No notes yet';
  }

  return { subjects, addSubject, getNoteCount };
};

export default function SubjectsPage() {
  const { subjects, addSubject, getNoteCount } = useSubjects();
  const [newSubject, setNewSubject] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      addSubject(newSubject.trim());
      setNewSubject("");
      setIsDialogOpen(false);
    }
  };

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Subjects</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subject-name">
                        Name
                      </Label>
                      <Input
                        id="subject-name"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g. Biology"
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddSubject}>Add Subject</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </div>

          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjects.map((subject) => (
                <Link href={`/subject/${encodeURIComponent(subject)}`} key={subject}>
                    <Card className="bg-card border-border rounded-lg group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 flex flex-col justify-between min-h-[120px] p-6">
                      <CardHeader className="p-0">
                        <CardTitle className="text-lg font-semibold truncate">{subject}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-auto">
                        <CardDescription>{getNoteCount(subject)}</CardDescription>
                      </CardContent>
                    </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg border-border">
              <p className="text-muted-foreground">No subjects yet.</p>
              <p className="text-muted-foreground">
                Click "Add Subject" to get started!
              </p>
            </div>
          )}
        </main>
      </div>
    </SidebarInset>
  );
}
