
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
  updateDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { incrementUserStats } from './stats-service';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    collectedStickerIds?: string[];
    unlockedAchievementIds?: string[]; // Deprecated, but keep for migration if needed
}

export interface StudyMate extends UserProfile {
    status: 'pending' | 'accepted';
    requesterId: string;
}

// Get a single user's profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const db = getDb();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}

// Find a user by their email address
export const findUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const db = getDb();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const userDoc = querySnapshot.docs[0];
  return userDoc.data() as UserProfile;
};

// Function to create or update user profile in Firestore
export const updateUserProfile = async (user: Partial<UserProfile> & { uid: string }) => {
    const db = getDb();
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, user, { merge: true });
};

// Add a sticker to a user's collection
export const addStickerToProfile = async (uid: string, stickerId: string) => {
    const db = getDb();
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        collectedStickerIds: arrayUnion(stickerId)
    });
};


// Send a friend request
export const sendFriendRequest = async (currentUserId: string, targetUserId: string) => {
  if (currentUserId === targetUserId) throw new Error("You cannot send a request to yourself.");

  const db = getDb();
  const friendshipId = [currentUserId, targetUserId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  const friendshipSnap = await getDoc(friendshipRef);

  if (friendshipSnap.exists()) {
    const data = friendshipSnap.data();
    if(data.status === 'accepted') throw new Error("You are already study mates.");
    if(data.status === 'pending') throw new Error("A request is already pending.");
  }
  
  await setDoc(friendshipRef, {
    users: [currentUserId, targetUserId],
    status: 'pending',
    requesterId: currentUserId,
    createdAt: new Date(),
  });
};

// Get all study mates (pending and accepted) for a user
export const getStudyMates = async (currentUserId: string): Promise<StudyMate[]> => {
    const db = getDb();
    const friendshipsRef = collection(db, 'friendships');
    const q = query(friendshipsRef, where('users', 'array-contains', currentUserId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return [];

    const mateIds = new Set<string>();
    const friendshipData = new Map<string, any>();

    querySnapshot.forEach(doc => {
        const data = doc.data();
        const otherUserId = data.users.find((id: string) => id !== currentUserId);
        if (otherUserId) {
            mateIds.add(otherUserId);
            friendshipData.set(otherUserId, {
                status: data.status,
                requesterId: data.requesterId
            });
        }
    });

    if (mateIds.size === 0) return [];
    
    // Fetch user profiles for all mates
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where(documentId(), 'in', Array.from(mateIds)));
    const userDocsSnapshot = await getDocs(userQuery);

    const mates: StudyMate[] = [];
    userDocsSnapshot.forEach(doc => {
        const userData = doc.data() as UserProfile;
        const friendshipInfo = friendshipData.get(userData.uid);
        if (friendshipInfo) {
            mates.push({
                ...userData,
                status: friendshipInfo.status,
                requesterId: friendshipInfo.requesterId
            });
        }
    });

    return mates;
};

// Accept a friend request
export const acceptFriendRequest = async (requesterId: string, currentUserId: string) => {
    const db = getDb();
    const friendshipId = [requesterId, currentUserId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);
    
    await setDoc(friendshipRef, { status: 'accepted' }, { merge: true });

    // Increment study mate count for both users
    await incrementUserStats(currentUserId, { studyMateCount: 1 });
    await incrementUserStats(requesterId, { studyMateCount: 1 });
};

// Remove a friend or decline a request
export const removeFriend = async (currentUserId: string, friendId: string) => {
    const db = getDb();
    const friendshipId = [currentUserId, friendId].sort().join('_');
    const friendshipRef = doc(db, 'friendships', friendshipId);

    const friendshipSnap = await getDoc(friendshipRef);

    const batch = writeBatch(db);
    batch.delete(friendshipRef);
    await batch.commit();
    
    // Decrement study mate count for both users if they were friends
    if (friendshipSnap.exists() && friendshipSnap.data().status === 'accepted') {
        await incrementUserStats(currentUserId, { studyMateCount: -1 });
        await incrementUserStats(friendId, { studyMateCount: -1 });
    }
};
