
'use server';

import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment, WriteBatch, writeBatch } from 'firebase/firestore';
import { type UserStats } from '@/lib/achievements';
import { isToday, isYesterday } from 'date-fns';

const defaultStats: UserStats = {
    totalStudyTime: 0,
    totalQuizScore: 0,
    loginStreak: 0,
    lastLogin: new Date(0).toISOString(),
    sessions20min: 0,
    sessions40min: 0,
    sessions60min: 0,
    firstSubjectCreated: 0,
    studyMateCount: 0,
};

// Get a user's stats, creating them if they don't exist
export const getUserStats = async (uid: string): Promise<UserStats> => {
    const db = getDb();
    const statsRef = doc(db, 'stats', uid);
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
        // Combine fetched data with defaults to ensure all fields are present
        return { ...defaultStats, ...statsSnap.data() } as UserStats;
    } else {
        await setDoc(statsRef, defaultStats);
        return defaultStats;
    }
};

// Update a user's stats
export const updateUserStats = async (uid: string, updates: Partial<UserStats>) => {
    const db = getDb();
    const statsRef = doc(db, 'stats', uid);
    await setDoc(statsRef, updates, { merge: true });
};

// Increment a user's stats
export const incrementUserStats = async (uid: string, increments: { [K in keyof UserStats]?: number }) => {
    const db = getDb();
    const statsRef = doc(db, 'stats', uid);
    
    // Firestore's increment() requires a number. Filter out any non-numeric values.
    const updateData: { [key: string]: any } = {};
    for (const key in increments) {
        const value = increments[key as keyof typeof increments];
        if (typeof value === 'number') {
            updateData[key] = increment(value);
        }
    }
    
    if (Object.keys(updateData).length > 0) {
        await setDoc(statsRef, updateData, { merge: true });
    }
};


// Handle daily login streak logic
export const updateUserLoginStreak = async (uid: string): Promise<UserStats> => {
    const stats = await getUserStats(uid);
    const lastLoginDate = new Date(stats.lastLogin);
    const now = new Date();

    if (isToday(lastLoginDate)) {
        // Already logged in today, do nothing
        return stats;
    }
    
    const db = getDb();
    const statsRef = doc(db, 'stats', uid);
    const batch = writeBatch(db);

    batch.update(statsRef, { lastLogin: now.toISOString() });

    if (isYesterday(lastLoginDate)) {
        // Logged in yesterday, increment streak
        batch.update(statsRef, { loginStreak: increment(1) });
    } else {
        // Didn't log in yesterday, reset streak to 1
        batch.update(statsRef, { loginStreak: 1 });
    }
    
    await batch.commit();

    // Refetch the updated stats to return them
    return await getUserStats(uid);
};
