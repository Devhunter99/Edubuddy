
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Send, Globe, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post } from "@/services/forum-service";
import FramedAvatar from "./framed-avatar";


interface CreatePostFormProps {
  onSubmit: (content: string, visibility: Post['visibility']) => Promise<void>;
}

export default function CreatePostForm({ onSubmit }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Post['visibility']>("public");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setIsLoading(true);
    await onSubmit(content, visibility);
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
                <FramedAvatar profile={user} />
                <Textarea
                    placeholder="What's on your mind? Share a study tip or ask a question..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-24"
                    disabled={isLoading}
                />
            </div>
          <div className="flex justify-between items-center">
            <Select onValueChange={(value: Post['visibility']) => setVisibility(value)} defaultValue={visibility} disabled={isLoading}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="public">
                        <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Public</div>
                    </SelectItem>
                    <SelectItem value="mates_only">
                         <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Mates Only</div>
                    </SelectItem>
                </SelectContent>
            </Select>
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
