
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { addStickerToProfile, getUserProfile, addFrameToProfile, equipFrameInProfile } from '@/services/user-service';
import type { Achievement } from '@/lib/achievements';

interface RewardContextType {
  coins: number;
  collectedStickers: Set<string>;
  unlockedFrames: Set<string>;
  equippedFrame: string | null;
  addCoinForQuestion: (questionText: string) => void;
  addRewards: (coinsToAdd: number, stickerId: string | undefined, sessionId: string) => void;
  hasCompletedSession: (sessionId: string) => boolean;
  loading: boolean;
  spendCoins: (amount: number) => void;
  addSticker: (stickerId: string) => void;
  unlockFrame: (frameId: string) => void;
  equipFrame: (frameId: string | null) => void;
  claimAchievementRewards: (achievements: Achievement[]) => number;
  claimedAchievementRewards: Set<string>;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

// Simple hash function to create a semi-unique ID for a question
const generateQuestionId = (questionText: string) => {
    let hash = 0;
    for (let i = 0; i < questionText.length; i++) {
        const char = questionText.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return `q_${hash}`;
};


export function RewardProvider({ children }: { children: ReactNode }) {
    const { user, updateUser } = useAuth();
    const [coins, setCoins] = useState(0);
    const [collectedStickers, setCollectedStickers] = useState<Set<string>>(new Set());
    const [unlockedFrames, setUnlockedFrames] = useState<Set<string>>(new Set());
    const [equippedFrame, setEquippedFrame] = useState<string | null>(null);
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [claimedAchievementRewards, setClaimedAchievementRewards] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const getStorageKey = useCallback((key: 'coins' | 'stickers' | 'completed' | 'frames' | 'equippedFrame' | 'claimedAchievements') => {
        if (!user) return null;
        return `rewisepanda_${key}_${user.uid}`;
    }, [user]);

    // Load initial state from localStorage and Firestore
    useEffect(() => {
        const loadRewards = async () => {
            if (user) {
                setLoading(true);
                try {
                    const userProfile = await getUserProfile(user.uid);
                    const firestoreStickers = userProfile?.collectedStickerIds || [];
                    const firestoreFrames = userProfile?.unlockedFrameIds || [];
                    
                    const coinsKey = getStorageKey('coins');
                    const stickersKey = getStorageKey('stickers');
                    const framesKey = getStorageKey('frames');
                    const equippedFrameKey = getStorageKey('equippedFrame');
                    const completedKey = getStorageKey('completed');
                    const claimedAchievementsKey = getStorageKey('claimedAchievements');

                    const storedCoins = coinsKey ? localStorage.getItem(coinsKey) : '0';
                    const storedStickers = stickersKey ? localStorage.getItem(stickersKey) : '[]';
                    const storedFrames = framesKey ? localStorage.getItem(framesKey) : '[]';
                    const storedEquippedFrame = equippedFrameKey ? localStorage.getItem(equippedFrameKey) : null;
                    const storedCompleted = completedKey ? localStorage.getItem(completedKey) : '[]';
                    const storedClaimedAchievements = claimedAchievementsKey ? localStorage.getItem(claimedAchievementsKey) : '[]';
                    
                    const localStickers = new Set(storedStickers ? JSON.parse(storedStickers) : []);
                    const localFrames = new Set(storedFrames ? JSON.parse(storedFrames) : []);
                    
                    const combinedStickers = new Set([...localStickers, ...firestoreStickers]);
                    const combinedFrames = new Set([...localFrames, ...firestoreFrames]);

                    setCoins(storedCoins ? parseInt(storedCoins, 10) : 0);
                    setCollectedStickers(combinedStickers);
                    setUnlockedFrames(combinedFrames);
                    setEquippedFrame(userProfile?.equippedFrameId || storedEquippedFrame);
                    setCompletedItems(new Set(storedCompleted ? JSON.parse(storedCompleted) : []));
                    setClaimedAchievementRewards(new Set(storedClaimedAchievements ? JSON.parse(storedClaimedAchievements) : []));

                    // Sync combined data back to localStorage
                     if (stickersKey) localStorage.setItem(stickersKey, JSON.stringify(Array.from(combinedStickers)));
                     if (framesKey) localStorage.setItem(framesKey, JSON.stringify(Array.from(combinedFrames)));
                     if (equippedFrameKey && userProfile?.equippedFrameId) localStorage.setItem(equippedFrameKey, userProfile.equippedFrameId);


                } catch (error) {
                    console.error("Failed to load reward data", error);
                } finally {
                    setLoading(false);
                }
            } else {
                // Clear state for logged-out users
                setCoins(0);
                setCollectedStickers(new Set());
                setUnlockedFrames(new Set());
                setEquippedFrame(null);
                setCompletedItems(new Set());
                setClaimedAchievementRewards(new Set());
                setLoading(false);
            }
        }
        loadRewards();
    }, [user, getStorageKey]);
    
    const updateCompletedItems = (newCompletedSet: Set<string>) => {
        setCompletedItems(newCompletedSet);
        const completedKey = getStorageKey('completed');
        if (completedKey) {
            localStorage.setItem(completedKey, JSON.stringify(Array.from(newCompletedSet)));
        }
    }
    
    const updateCoins = (newCoinTotal: number) => {
        setCoins(newCoinTotal);
        const coinsKey = getStorageKey('coins');
        if (coinsKey) {
            localStorage.setItem(coinsKey, newCoinTotal.toString());
        }
    }

    const updateStickers = (newStickerSet: Set<string>) => {
        setCollectedStickers(newStickerSet);
        const stickersKey = getStorageKey('stickers');
        if (stickersKey) {
            localStorage.setItem(stickersKey, JSON.stringify(Array.from(newStickerSet)));
        }
    }

    const updateFrames = (newFrameSet: Set<string>) => {
        setUnlockedFrames(newFrameSet);
        const framesKey = getStorageKey('frames');
        if (framesKey) {
            localStorage.setItem(framesKey, JSON.stringify(Array.from(newFrameSet)));
        }
    }

    const updateEquippedFrame = (frameId: string | null) => {
        setEquippedFrame(frameId);
        const equippedFrameKey = getStorageKey('equippedFrame');
        if (equippedFrameKey) {
            if (frameId) {
                localStorage.setItem(equippedFrameKey, frameId);
            } else {
                localStorage.removeItem(equippedFrameKey);
            }
        }
    }

    const addCoinForQuestion = useCallback((questionText: string) => {
        if (!user) return;
        const questionId = generateQuestionId(questionText);
        if (!completedItems.has(questionId)) {
            updateCoins(coins + 1);
            const newCompletedSet = new Set(completedItems).add(questionId);
            updateCompletedItems(newCompletedSet);
        }
    }, [user, coins, completedItems, getStorageKey]);
    
    const addRewards = useCallback(async (coinsToAdd: number, stickerId: string | undefined, sessionId: string) => {
        if (!user || (!coinsToAdd && !stickerId)) return;
        if (completedItems.has(sessionId)) return;

        if (coinsToAdd > 0) updateCoins(coins + coinsToAdd);
        
        if (stickerId) {
            const newStickerSet = new Set(collectedStickers).add(stickerId);
            updateStickers(newStickerSet);
            await addStickerToProfile(user.uid, stickerId);
        }
        const newCompletedSet = new Set(completedItems).add(sessionId);
        updateCompletedItems(newCompletedSet);
    }, [user, coins, collectedStickers, completedItems, getStorageKey]);
    
    const hasCompletedSession = useCallback((sessionId: string) => completedItems.has(sessionId), [completedItems]);

    const spendCoins = useCallback((amount: number) => {
        if (!user) throw new Error("You must be logged in to spend coins.");
        if (coins < amount) throw new Error("Not enough coins.");
        updateCoins(coins - amount);
    }, [user, coins, getStorageKey]);
    
    const addSticker = useCallback(async (stickerId: string) => {
        if (!user) throw new Error("You must be logged in.");
        if (collectedStickers.has(stickerId)) return;
        const newStickerSet = new Set(collectedStickers).add(stickerId);
        updateStickers(newStickerSet);
        await addStickerToProfile(user.uid, stickerId);
    }, [user, collectedStickers, getStorageKey]);

    const unlockFrame = useCallback(async (frameId: string) => {
        if (!user) throw new Error("You must be logged in.");
        if (unlockedFrames.has(frameId)) return;
        const newFrameSet = new Set(unlockedFrames).add(frameId);
        updateFrames(newFrameSet);
        await addFrameToProfile(user.uid, frameId);
    }, [user, unlockedFrames, getStorageKey]);
    
    const equipFrame = useCallback(async (frameId: string | null) => {
        if (!user) throw new Error("You must be logged in.");
        // Optimistically update local state first for instant UI feedback
        updateEquippedFrame(frameId);
        updateUser({ equippedFrameId: frameId });
        
        // Then, update the backend
        await equipFrameInProfile(user.uid, frameId);
    }, [user, updateUser, getStorageKey]);
    
    const claimAchievementRewards = useCallback((achievements: Achievement[]): number => {
        if (!user) return 0;
        
        let totalCoinsClaimed = 0;
        const newClaimedSet = new Set(claimedAchievementRewards);

        achievements.forEach(ach => {
            if (!newClaimedSet.has(ach.id)) {
                totalCoinsClaimed += ach.coinReward;
                newClaimedSet.add(ach.id);
            }
        });

        if (totalCoinsClaimed > 0) {
            updateCoins(coins + totalCoinsClaimed);
            setClaimedAchievementRewards(newClaimedSet);
            const claimedKey = getStorageKey('claimedAchievements');
            if (claimedKey) {
                localStorage.setItem(claimedKey, JSON.stringify(Array.from(newClaimedSet)));
            }
        }
        
        return totalCoinsClaimed;
    }, [user, coins, claimedAchievementRewards, getStorageKey]);


    const value = { 
        coins, 
        collectedStickers,
        unlockedFrames,
        equippedFrame,
        addCoinForQuestion, 
        addRewards, 
        hasCompletedSession, 
        loading, 
        spendCoins, 
        addSticker,
        unlockFrame,
        equipFrame,
        claimAchievementRewards,
        claimedAchievementRewards,
    };

    return <RewardContext.Provider value={value}>{children}</RewardContext.Provider>;
}

export const useRewards = () => {
    const context = useContext(RewardContext);
    if (context === undefined) {
        throw new Error('useRewards must be used within a RewardProvider');
    }
    return context;
};
