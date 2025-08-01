"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Book } from "lucide-react";

import AppHeader from "@/components/edubuddy/app-header";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Simple in-memory/localStorage subject store for prototyping
const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    // This check is important to avoid "window is not defined" error during SSR
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
    }
  };

  return { subjects, addSubject };
};

export default function Home() {
  const { subjects, addSubject } = useSubjects();
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
    <div className="flex flex-col min-h-screen bg-background font-body">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center justify-between">
              <span>My Subjects</span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="subject-name"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. Biology"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddSubject}>Add Subject</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              Select a subject to start studying or add a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <Link href={`/subject/${encodeURIComponent(subject)}`} key={subject}>
                    <Card className="hover:shadow-md hover:border-primary transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                         <Book className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-semibold">{subject}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No subjects yet.</p>
                <p className="text-muted-foreground">
                  Click "Add Subject" to get started!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
