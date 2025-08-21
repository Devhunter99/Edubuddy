
'use server';

import { getDb } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  writeBatch,
  documentId,
  addDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import type { UserProfile } from './user-service';
import { generateCubbyComment } from '@/ai/flows/generate-cubby-comment';

export type ReactionType = 'like' | 'brain';

export interface Post {
    id: string;
    authorId: string;
    content: string;
    visibility: 'public' | 'mates_only';
    timestamp: string; // ISO string for client
    commentCount: number;
    reactions: {
        [key in ReactionType]?: {
            count: number;
            reactors: string[]; // UIDs of users who reacted
        }
    };
}

export interface PostWithAuthor extends Post {
    author: UserProfile;
    comments: CommentWithAuthor[];
}

export interface Comment {
    id: string;
    authorId: string;
    content: string;
    timestamp: string; // ISO string
}

export interface CommentWithAuthor extends Comment {
    author: UserProfile;
}

const getCubbyProfile = (): UserProfile => ({
    uid: 'cubby-ai-assistant',
    displayName: 'Cubby',
    email: 'cubby@rewisepanda.app',
    photoURL: '/stickers/small/studious-panda.png',
});


// Get all public posts with author details and comments
export const getPosts = async (): Promise<PostWithAuthor[]> => {
    const db = getDb();
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('visibility', '==', 'public'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const posts: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate().toISOString(),
    } as Post));

    if (posts.length === 0) return [];
    
    // Get all author and commenter profiles in one go
    const authorIds = new Set<string>();
    posts.forEach(post => authorIds.add(post.authorId));

    const allComments = await Promise.all(posts.map(post => getCommentsForPost(post.id)));
    allComments.flat().forEach(comment => authorIds.add(comment.authorId));
    
    const profiles = await getBulkUserProfiles(Array.from(authorIds));
    const profilesMap = new Map(profiles.map(p => [p.uid, p]));
    profilesMap.set('cubby-ai-assistant', getCubbyProfile());


    return posts.map((post, index) => ({
        ...post,
        author: profilesMap.get(post.authorId) || { uid: post.authorId, displayName: 'Unknown User', email: '' },
        comments: allComments[index].map(comment => ({
            ...comment,
            author: profilesMap.get(comment.authorId) || { uid: comment.authorId, displayName: 'Unknown User', email: '' },
        })),
    }));
};

// Create a new post
export const createPost = async (
    { author, content, visibility }: { author: UserProfile; content: string; visibility: 'public' | 'mates_only' }
) => {
    const db = getDb();
    const postsRef = collection(db, 'posts');
    const newPostRef = await addDoc(postsRef, {
        authorId: author.uid,
        content,
        visibility,
        timestamp: serverTimestamp(),
        commentCount: 0,
        reactions: { like: { count: 0, reactors: [] }, brain: { count: 0, reactors: [] } },
    });

    // After creating the post, have Cubby generate and add a comment
    try {
        const { comment } = await generateCubbyComment({ postContent: content });
        if (comment) {
            await addCommentToPost(newPostRef.id, getCubbyProfile(), comment);
        }
    } catch (error) {
        console.error("Failed to generate Cubby's comment:", error);
        // Don't block post creation if Cubby fails
    }
};

// Add a comment to a post
export const addCommentToPost = async (postId: string, author: UserProfile, content: string) => {
    const db = getDb();
    const postRef = doc(db, 'posts', postId);
    const commentsRef = collection(postRef, 'comments');
    
    const batch = writeBatch(db);
    
    const newCommentRef = doc(commentsRef); // Create a new doc reference
    batch.set(newCommentRef, {
        authorId: author.uid,
        content,
        timestamp: serverTimestamp(),
    });

    batch.update(postRef, {
        commentCount: (await getDoc(postRef)).data()?.commentCount + 1,
    });
    
    await batch.commit();
}

// Get comments for a single post
export const getCommentsForPost = async (postId: string): Promise<CommentWithAuthor[]> => {
    const db = getDb();
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    const comments: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate().toISOString(),
    } as Comment));
    
    if (comments.length === 0) return [];
    
    const authorIds = comments.map(c => c.authorId);
    const profiles = await getBulkUserProfiles(authorIds);
    const profilesMap = new Map(profiles.map(p => [p.uid, p]));
    profilesMap.set('cubby-ai-assistant', getCubbyProfile());

    return comments.map(comment => ({
        ...comment,
        author: profilesMap.get(comment.authorId) || { uid: comment.authorId, displayName: 'Unknown User', email: '' },
    }));
};

// React to a post
export const reactToPost = async (postId: string, userId: string, reaction: ReactionType) => {
    const db = getDb();
    const postRef = doc(db, 'posts', postId);

    await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
            throw "Post does not exist!";
        }
        
        const postData = postDoc.data() as Post;
        const currentReaction = postData.reactions?.[reaction] || { count: 0, reactors: [] };
        
        const hasReacted = currentReaction.reactors.includes(userId);
        
        const newReactors = hasReacted 
            ? currentReaction.reactors.filter(uid => uid !== userId)
            : [...currentReaction.reactors, userId];
        
        const newCount = newReactors.length;
        
        const updatePath = `reactions.${reaction}`;
        transaction.update(postRef, {
            [updatePath]: {
                count: newCount,
                reactors: newReactors
            }
        });
    });
};

// Helper function to get multiple user profiles at once
const getBulkUserProfiles = async (uids: string[]): Promise<UserProfile[]> => {
    const db = getDb();
    const cleanUids = uids.filter(uid => uid !== 'cubby-ai-assistant'); // Don't query for Cubby
    if (cleanUids.length === 0) return [];
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where(documentId(), 'in', cleanUids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}
