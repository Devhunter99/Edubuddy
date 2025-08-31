
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getPosts, type PostWithAuthor } from "@/services/forum-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Brain, ArrowRight } from "lucide-react";

const calculateTrendingScore = (post: PostWithAuthor): number => {
    const likeScore = (post.reactions.like?.count || 0) * 1.5;
    const brainScore = (post.reactions.brain?.count || 0) * 2;
    const commentScore = post.commentCount || 0;
    
    // Recency factor: posts from the last 24 hours get a boost
    const postDate = new Date(post.timestamp);
    const now = new Date();
    const hoursAgo = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    const recencyBoost = Math.max(0, 1 - (hoursAgo / 48)); // Boost for posts in the last 2 days

    return (likeScore + brainScore + commentScore) * (1 + recencyBoost);
};


const PostItem = ({ post }: { post: PostWithAuthor }) => (
    <div className="py-3 border-b last:border-b-0">
        <Link href="/community">
            <p className="font-semibold truncate hover:underline">{post.content}</p>
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span>By {post.author.displayName}</span>
            <div className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.reactions.like?.count || 0}</div>
            <div className="flex items-center gap-1"><Brain className="h-3 w-3" /> {post.reactions.brain?.count || 0}</div>
            <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentCount || 0}</div>
        </div>
    </div>
);


export default function TrendingPosts() {
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts for trending card:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const trendingPosts = useMemo(() => {
        return posts
            .map(post => ({ ...post, score: calculateTrendingScore(post) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }, [posts]);
    

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }
    
    if (trendingPosts.length === 0) {
        return (
            <div className="text-center text-muted-foreground flex-grow justify-center flex flex-col">
                <p>No community posts yet.</p>
                 <Link href="/community" className="mt-4">
                    <Button variant="outline" size="sm">
                        Be the first to post!
                    </Button>
                </Link>
            </div>
        );
    }


    return (
        <div className="flex flex-col justify-between flex-grow">
            <div className="space-y-1 -mt-2">
                {trendingPosts.map(post => (
                    <PostItem key={post.id} post={post} />
                ))}
            </div>
             <Link href="/community" className="mt-4">
                <Button variant="outline" className="w-full">
                    View All Posts <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}

