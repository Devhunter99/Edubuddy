
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';

interface RewardContextType {
  coins: number;
  collectedStickers: Set<string>;
  addCoinForQuestion: (questionText: string) => void;
  addRewards: (coinsToAdd: number, stickerId: string | undefined, sessionId: string) => void;
  hasCompletedSession: (sessionId: string) => boolean;
  loading: boolean;
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
    const { user } = useAuth();
    const [coins, setCoins] = useState(0);
    const [collectedStickers, setCollectedStickers] = useState<Set<string>>(new Set());
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const getStorageKey = useCallback((key: 'coins' | 'stickers' | 'completed') => {
        if (!user) return null;
        return `edubuddy_${key}_${user.uid}`;
    }, [user]);

    // Load initial state from localStorage
    useEffect(() => {
        if (user) {
            setLoading(true);
            try {
                const coinsKey = getStorageKey('coins');
                const stickersKey = getStorageKey('stickers');
                const completedKey = getStorageKey('completed');

                const storedCoins = coinsKey ? localStorage.getItem(coinsKey) : '0';
                const storedStickers = stickersKey ? localStorage.getItem(stickersKey) : '[]';
                const storedCompleted = completedKey ? localStorage.getItem(completedKey) : '[]';

                setCoins(storedCoins ? parseInt(storedCoins, 10) : 0);
                setCollectedStickers(new Set(storedStickers ? JSON.parse(storedStickers) : []));
                setCompletedItems(new Set(storedCompleted ? JSON.parse(storedCompleted) : []));
            } catch (error) {
                console.error("Failed to load reward data from localStorage", error);
                setCoins(0);
                setCollectedStickers(new Set());
                setCompletedItems(new Set());
            } finally {
                setLoading(false);
            }
        } else {
            setCoins(0);
            setCollectedStickers(new Set());
            setCompletedItems(new Set());
            setLoading(false);
        }
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

    const addCoinForQuestion = useCallback((questionText: string) => {
        if (!user) return; // Only logged-in users can earn coins

        const questionId = generateQuestionId(questionText);
        
        if (!completedItems.has(questionId)) {
            updateCoins(coins + 1);
            const newCompletedSet = new Set(completedItems).add(questionId);
            updateCompletedItems(newCompletedSet);
        }

    }, [user, coins, completedItems, getStorageKey]);
    
    const addRewards = useCallback((coinsToAdd: number, stickerId: string | undefined, sessionId: string) => {
        if (!user || (!coinsToAdd && !stickerId)) return;
        
        if (!completedItems.has(sessionId)) {
            // Add coins
            if (coinsToAdd > 0) {
                updateCoins(coins + coinsToAdd);
            }
            // Add sticker
            if (stickerId) {
                const newStickerSet = new Set(collectedStickers).add(stickerId);
                updateStickers(newStickerSet);
            }
            // Mark session as completed
            const newCompletedSet = new Set(completedItems).add(sessionId);
            updateCompletedItems(newCompletedSet);
        }

    }, [user, coins, collectedStickers, completedItems, getStorageKey]);
    
    const hasCompletedSession = useCallback((sessionId: string) => {
        return completedItems.has(sessionId);
    }, [completedItems]);


    const value = { coins, collectedStickers, addCoinForQuestion, addRewards, hasCompletedSession, loading };

    return <RewardContext.Provider value={value}>{children}</RewardContext.Provider>;
}

export const useRewards = () => {
    const context = useContext(RewardContext);
    if (context === undefined) {
        throw new Error('useRewards must be used within a RewardProvider');
    }
    return context;
};
