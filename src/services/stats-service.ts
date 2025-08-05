
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
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
};

// Get a user's stats, creating them if they don't exist
export const getUserStats = async (uid: string): Promise<UserStats> => {
    const statsRef = doc(db, 'stats', uid);
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
        return statsSnap.data() as UserStats;
    } else {
        await setDoc(statsRef, defaultStats);
        return defaultStats;
    }
};

// Update a user's stats
export const updateUserStats = async (uid: string, updates: Partial<UserStats>) => {
    const statsRef = doc(db, 'stats', uid);
    await setDoc(statsRef, updates, { merge: true });
};

// Increment a user's stats
export const incrementUserStats = async (uid: string, increments: { [K in keyof UserStats]?: number }) => {
    const statsRef = doc(db, 'stats', uid);
    const updateData: { [key: string]: any } = {};
    for (const key in increments) {
        updateData[key] = increment(increments[key as keyof typeof increments]!);
    }
    await setDoc(statsRef, updateData, { merge: true });
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

    if (isYesterday(lastLoginDate)) {
        // Logged in yesterday, increment streak
        const newStats: Partial<UserStats> = {
            loginStreak: (stats.loginStreak || 0) + 1,
            lastLogin: now.toISOString(),
        };
        await updateUserStats(uid, newStats);
        return { ...stats, ...newStats };
    } else {
        // Didn't log in yesterday, reset streak to 1
         const newStats: Partial<UserStats> = {
            loginStreak: 1,
            lastLogin: now.toISOString(),
        };
        await updateUserStats(uid, newStats);
        return { ...stats, ...newStats };
    }
};
