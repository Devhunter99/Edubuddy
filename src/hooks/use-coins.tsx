
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';

interface CoinContextType {
  coins: number;
  addCoinForQuestion: (questionText: string) => void;
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
    const [correctlyAnswered, setCorrectlyAnswered] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const getStorageKey = useCallback((key: 'coins' | 'answered') => {
        if (!user) return null;
        return `edubuddy_${key}_${user.uid}`;
    }, [user]);

    // Load initial state from localStorage
    useEffect(() => {
        if (user) {
            setLoading(true);
            try {
                const coinsKey = getStorageKey('coins');
                const answeredKey = getStorageKey('answered');

                const storedCoins = coinsKey ? localStorage.getItem(coinsKey) : '0';
                const storedAnswered = answeredKey ? localStorage.getItem(answeredKey) : '[]';

                setCoins(storedCoins ? parseInt(storedCoins, 10) : 0);
                setCorrectlyAnswered(new Set(storedAnswered ? JSON.parse(storedAnswered) : []));
            } catch (error) {
                console.error("Failed to load coin data from localStorage", error);
                setCoins(0);
                setCorrectlyAnswered(new Set());
            } finally {
                setLoading(false);
            }
        } else {
            setCoins(0);
            setCorrectlyAnswered(new Set());
            setLoading(false);
        }
    }, [user, getStorageKey]);

    const addCoinForQuestion = useCallback((questionText: string) => {
        if (!user) return; // Only logged-in users can earn coins

        const questionId = generateQuestionId(questionText);
        
        if (!correctlyAnswered.has(questionId)) {
            // Update coins
            const newCoinTotal = coins + 1;
            setCoins(newCoinTotal);
            const coinsKey = getStorageKey('coins');
            if (coinsKey) localStorage.setItem(coinsKey, newCoinTotal.toString());

            // Update answered questions
            const newAnsweredSet = new Set(correctlyAnswered).add(questionId);
            setCorrectlyAnswered(newAnsweredSet);
            const answeredKey = getStorageKey('answered');
            if (answeredKey) localStorage.setItem(answeredKey, JSON.stringify(Array.from(newAnsweredSet)));
        }

    }, [user, coins, correctlyAnswered, getStorageKey]);


    const value = { coins, addCoinForQuestion, loading };

    return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
}

export const useCoins = () => {
    const context = useContext(CoinContext);
    if (context === undefined) {
        throw new Error('useCoins must be used within a CoinProvider');
    }
    return context;
};
