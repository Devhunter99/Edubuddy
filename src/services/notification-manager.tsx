
"use client";

import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { NotificationSettings, Note } from '@/lib/types';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';

const TIPS = [
    "Break down large tasks into smaller, manageable chunks.",
    "Use the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.",
    "Explain a concept to someone else to test your understanding.",
    "Get enough sleep! A rested mind learns more effectively.",
    "Stay hydrated. Drinking water can improve concentration.",
    "Review your notes within 24 hours to improve retention.",
    "Find a dedicated study space to minimize distractions.",
    "Set specific, measurable, achievable, relevant, and time-bound (SMART) goals for your study sessions.",
];

let intervalId: NodeJS.Timeout | null = null;

const getFrequencyInMs = (frequency: NotificationSettings['frequency']): number => {
    switch (frequency) {
        case 'hourly': return 60 * 60 * 1000;
        case '2-hours': return 2 * 60 * 60 * 1000;
        case '4-hours': return 4 * 60 * 60 * 1000;
        case 'daily': return 24 * 60 * 60 * 1000;
        default: return 24 * 60 * 60 * 1000; // Default to daily
    }
};

const NotificationManager = () => {
    const { toast } = useToast();

    const showNotification = async (settings: NotificationSettings) => {
        if (!settings.enabled || !('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const availableContentTypes: ('tips' | 'flashcards')[] = [];
        if (settings.content.tips) availableContentTypes.push('tips');
        if (settings.content.flashcards) availableContentTypes.push('flashcards');

        if (availableContentTypes.length === 0) return;
        
        const contentType = availableContentTypes[Math.floor(Math.random() * availableContentTypes.length)];

        let title = "Rewise Panda";
        let body = "";

        if (contentType === 'tips') {
            title = "Study Tip!";
            body = TIPS[Math.floor(Math.random() * TIPS.length)];
        } else if (contentType === 'flashcards') {
            try {
                // Get all notes from all subjects to generate a random flashcard
                const allNotesText = Object.keys(localStorage)
                    .filter(key => key.startsWith('rewisepanda_') === false && key !== 'subjects' && key !== 'user_study_level' && !key.startsWith('genkit'))
                    .map(subjectName => {
                        const notesRaw = localStorage.getItem(subjectName);
                        if (notesRaw) {
                            try {
                                const notes: Note[] = JSON.parse(notesRaw);
                                return notes.map(note => `## ${note.title}\n\n${note.text}`).join('\n\n---\n\n');
                            } catch { return ''; }
                        }
                        return '';
                    }).join('\n\n');
                
                if (allNotesText.trim()) {
                    const result = await generateFlashcards({ text: allNotesText });
                    if (result.flashcards.length > 0) {
                        const flashcard = result.flashcards[Math.floor(Math.random() * result.flashcards.length)];
                        title = `Flashcard: ${flashcard.question}`;
                        body = `Answer: ${flashcard.answer}`;
                    } else {
                        // Fallback to a tip if flashcard generation fails
                        title = "Study Tip!";
                        body = TIPS[Math.floor(Math.random() * TIPS.length)];
                    }
                } else {
                     title = "Study Tip!";
                     body = TIPS[Math.floor(Math.random() * TIPS.length)];
                }
            } catch (error) {
                console.error("Failed to generate flashcard for notification", error);
                // Fallback to a tip on error
                title = "Study Tip!";
                body = TIPS[Math.floor(Math.random() * TIPS.length)];
            }
        }

        new Notification(title, {
            body,
            icon: '/logo.png', // Make sure you have a logo at public/logo.png
            silent: !settings.sound,
            vibrate: settings.vibrate ? [200, 100, 200] : undefined,
        });
    };

    const setupNotifications = useCallback(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }

        const storedSettings = localStorage.getItem('notificationSettings');
        if (!storedSettings) return;

        try {
            const settings: NotificationSettings = JSON.parse(storedSettings);
            if (settings.enabled) {
                intervalId = setInterval(() => showNotification(settings), getFrequencyInMs(settings.frequency));
            }
        } catch (e) {
            console.error("Could not set up notifications", e);
        }
    }, []);

    useEffect(() => {
        setupNotifications();

        window.addEventListener('settings-updated', setupNotifications);

        return () => {
            if (intervalId) clearInterval(intervalId);
            window.removeEventListener('settings-updated', setupNotifications);
        };
    }, [setupNotifications]);

    return null; // This is a manager component, it doesn't render anything
};

export default NotificationManager;
