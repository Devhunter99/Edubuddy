
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, Star, Heart } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

const useSubjects = () => {
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedSubjects = localStorage.getItem("subjects");
        if (storedSubjects) {
          setSubjects(JSON.parse(storedSubjects));
        } else {
          // Pre-populate with some default subjects if none are stored
          const defaultSubjects = ["Hologram hand left", "Hologram hand right", "Liquid sculpture", "Crystal rock"];
          setSubjects(defaultSubjects);
          localStorage.setItem("subjects", JSON.stringify(defaultSubjects));
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

export default function SubjectsPage() {
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

  const subjectImages = [
    "https://placehold.co/400x400/8A2BE2/FFFFFF.png?text=hand",
    "https://placehold.co/400x400/1E90FF/FFFFFF.png?text=hand",
    "https://placehold.co/400x400/FF1493/FFFFFF.png?text=liquid",
    "https://placehold.co/400x400/32CD32/FFFFFF.png?text=crystal",
  ];

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
              {subjects.map((subject, index) => (
                <Link href={`/subject/${encodeURIComponent(subject)}`} key={subject}>
                    <Card className="bg-card border-border rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
                      <CardHeader className="p-0">
                        <Image 
                          src={subjectImages[index % subjectImages.length]} 
                          alt={subject} 
                          width={400} 
                          height={400} 
                          className="object-cover w-full h-64"
                          data-ai-hint="hologram hand"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-semibold truncate">{subject}</CardTitle>
                        <CardDescription>{(localStorage.getItem(subject)?.length || 0) > 2 ? `${JSON.parse(localStorage.getItem(subject)!).length} Notes` : 'No notes yet'}</CardDescription>
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
