
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface CreatePostFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export default function CreatePostForm({ onSubmit }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setIsLoading(true);
    await onSubmit(content);
    setContent("");
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
                <Avatar>
                    <AvatarImage src={user?.photoURL ?? undefined} />
                    <AvatarFallback>{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <Textarea
                    placeholder="What's on your mind? Share a study tip or ask a question..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-24"
                    disabled={isLoading}
                />
            </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !content.trim()}>
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
