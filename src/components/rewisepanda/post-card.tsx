
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Brain, MessageSquare } from 'lucide-react';
import { type PostWithAuthor, type CommentWithAuthor, type ReactionType } from '@/services/forum-service';
import { type UserProfile } from '@/services/user-service';
import { cn } from '@/lib/utils';
import FramedAvatar from './framed-avatar';


const Comment = ({ comment }: { comment: CommentWithAuthor }) => (
    <div className="flex gap-3">
        <Link href={`/profile/${comment.author.uid}`}>
            <FramedAvatar profile={comment.author} className="h-8 w-8" />
        </Link>
        <div className="bg-muted p-3 rounded-lg flex-1">
            <div className="flex items-center gap-2">
                <Link href={`/profile/${comment.author.uid}`}>
                    <p className="font-bold text-sm">{comment.author.displayName}</p>
                </Link>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </p>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
        </div>
    </div>
);

export default function PostCard({ post, onAddComment, onReact, currentUser }: {
    post: PostWithAuthor;
    onAddComment: (postId: string, commentText: string) => Promise<void>;
    onReact: (postId: string, reaction: ReactionType) => Promise<void>;
    currentUser: UserProfile | null;
}) {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    
    const userHasReacted = (reaction: ReactionType) => {
        if (!currentUser) return false;
        const reactors = post.reactions[reaction]?.reactors || [];
        return reactors.includes(currentUser.uid);
    }
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        await onAddComment(post.id, commentText);
        setCommentText("");
        setShowComments(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Link href={`/profile/${post.author.uid}`}>
                    <FramedAvatar profile={post.author} />
                </Link>
                <div>
                    <Link href={`/profile/${post.author.uid}`}>
                        <p className="font-bold">{post.author.displayName}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onReact(post.id, 'like')}
                        className={cn("flex items-center gap-1.5", userHasReacted('like') && "text-primary")}
                    >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.reactions.like?.count || 0}</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onReact(post.id, 'brain')}
                        className={cn("flex items-center gap-1.5", userHasReacted('brain') && "text-primary")}
                    >
                        <Brain className="h-4 w-4" />
                         <span>{post.reactions.brain?.count || 0}</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex items-center gap-1.5" onClick={() => setShowComments(!showComments)}>
                        <MessageSquare className="h-4 w-4" />
                         <span>{post.commentCount}</span>
                    </Button>
                </div>

                {showComments && (
                    <div className="w-full space-y-4 pt-4 border-t">
                        {post.comments.length > 0 ? (
                           post.comments.map(comment => <Comment key={comment.id} comment={comment} />)
                        ) : (
                            <p className="text-sm text-muted-foreground">No comments yet.</p>
                        )}

                        {currentUser && (
                            <form onSubmit={handleCommentSubmit} className="flex gap-3 pt-2">
                                 <Link href={`/profile/${currentUser.uid}`}>
                                    <FramedAvatar profile={currentUser} className="h-8 w-8" />
                                </Link>
                                <Textarea
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="min-h-0"
                                    rows={1}
                                />
                                <Button type="submit" size="sm">Comment</Button>
                            </form>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
