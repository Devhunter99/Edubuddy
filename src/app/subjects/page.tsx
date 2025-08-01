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
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image src="https://placehold.co/60x60/8A2BE2/000000.png?text=BR" alt="Benjamin Ray" width={60} height={60} className="rounded-full border-2 border-primary" data-ai-hint="user avatar"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Benjamin Ray</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400"/>
              <span>4.5</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500"/>
              <span>92</span>
            </div>
          </div>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search" className="pl-10 w-full md:w-64 bg-card border-border" />
        </div>
      </header>

      <main>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">My Collections</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add New Collection</DialogTitle>
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
                      placeholder="e.g. Abstract Art"
                      className="bg-background"
                    />
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddSubject}>Add Collection</Button>
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
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-primary font-bold">1.25 ETH</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Heart className="w-4 h-4"/>
                          <span>92</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg border-border">
            <p className="text-muted-foreground">No collections yet.</p>
            <p className="text-muted-foreground">
              Click "Add Collection" to get started!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
