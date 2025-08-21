
"use client";

import { useState, useEffect, useCallback } from "react";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/rewisepanda/post-card";
import CreatePostForm from "@/components/rewisepanda/create-post-form";
import { getPosts, type PostWithAuthor, createPost, addCommentToPost, reactToPost } from "@/services/forum-service";
import type { UserProfile } from "@/services/user-service";

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (content: string) => {
    if (!user) return;
    const author: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || "Anonymous",
      email: user.email || "",
      photoURL: user.photoURL
    }
    await createPost({ author, content, visibility: "public" });
    fetchPosts(); // Refresh posts
  };
  
  const handleAddComment = async (postId: string, commentText: string) => {
    if (!user) return;
     const author: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || "Anonymous",
      email: user.email || "",
      photoURL: user.photoURL
    }
    await addCommentToPost(postId, author, commentText);
    fetchPosts(); // Refresh to show new comment
  }

  const handleReact = async (postId: string, reaction: 'like' | 'brain') => {
      if(!user) return;
      await reactToPost(postId, user.uid, reaction);
      fetchPosts(); // Refresh to show new reaction
  }

  if (authLoading || loading) {
    return (
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow container mx-auto p-4 md:p-8 flex justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </main>
            </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Community Feed</h1>
                
                {user && <CreatePostForm onSubmit={handleCreatePost} />}

                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post}
                            onAddComment={handleAddComment}
                            onReact={handleReact}
                            currentUser={user}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg border-border">
                        <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                    </div>
                )}
            </div>
        </main>
      </div>
    </SidebarInset>
  );
}
