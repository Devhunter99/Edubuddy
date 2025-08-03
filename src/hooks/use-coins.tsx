
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';

interface CoinContextType {
  coins: number;
  addCoinForQuestion: (questionText: string) => void;
  addCoins: (amount: number, sessionId: string) => void;
  hasCompletedTimerSession: (sessionId: string) => boolean;
  loading: boolean;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

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


export function CoinProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [coins, setCoins] = useState(0);
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const getStorageKey = useCallback((key: 'coins' | 'completed') => {
        if (!user) return null;
        return `edubuddy_${key}_${user.uid}`;
    }, [user]);

    // Load initial state from localStorage
    useEffect(() => {
        if (user) {
            setLoading(true);
            try {
                const coinsKey = getStorageKey('coins');
                const completedKey = getStorageKey('completed');

                const storedCoins = coinsKey ? localStorage.getItem(coinsKey) : '0';
                const storedCompleted = completedKey ? localStorage.getItem(completedKey) : '[]';

                setCoins(storedCoins ? parseInt(storedCoins, 10) : 0);
                setCompletedItems(new Set(storedCompleted ? JSON.parse(storedCompleted) : []));
            } catch (error) {
                console.error("Failed to load coin data from localStorage", error);
                setCoins(0);
                setCompletedItems(new Set());
            } finally {
                setLoading(false);
            }
        } else {
            setCoins(0);
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

    const addCoinForQuestion = useCallback((questionText: string) => {
        if (!user) return; // Only logged-in users can earn coins

        const questionId = generateQuestionId(questionText);
        
        if (!completedItems.has(questionId)) {
            updateCoins(coins + 1);
            const newCompletedSet = new Set(completedItems).add(questionId);
            updateCompletedItems(newCompletedSet);
        }

    }, [user, coins, completedItems, getStorageKey]);
    
    const addCoins = useCallback((amount: number, sessionId: string) => {
        if (!user || amount <= 0) return;
        
        if (!completedItems.has(sessionId)) {
            updateCoins(coins + amount);
            const newCompletedSet = new Set(completedItems).add(sessionId);
            updateCompletedItems(newCompletedSet);
        }

    }, [user, coins, completedItems, getStorageKey]);
    
    const hasCompletedTimerSession = useCallback((sessionId: string) => {
        return completedItems.has(sessionId);
    }, [completedItems]);


    const value = { coins, addCoinForQuestion, addCoins, hasCompletedTimerSession, loading };

    return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
}

export const useCoins = () => {
    const context = useContext(CoinContext);
    if (context === undefined) {
        throw new Error('useCoins must be used within a CoinProvider');
    }
    return context;
};
