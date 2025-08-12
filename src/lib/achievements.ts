
import { type LucideIcon, BookOpen, BrainCircuit, Calendar, Clock, Award, Star, Library, Trophy } from "lucide-react";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    tier: 'bronze' | 'silver' | 'gold';
    // A function that returns unlocking progress details
    progress: (stats: UserStats, subjectCount: number, collectedStickerIds?: string[]) => {
        isUnlocked: boolean;
        progress: number; // A value from 0 to 100
        progressText: string;
    };
}

export interface UserStats {
    totalStudyTime: number; // in minutes
    totalQuizScore: number;
    loginStreak: number;
    lastLogin: string; // ISO string
    sessions20min: number;
    sessions40min: number;
    sessions60min: number;
    firstSubjectCreated?: number;
}

const createProgressChecker = (
    goal: number, 
    getValue: (stats: UserStats) => number, 
    unit: string, 
    pluralUnit?: string
) => {
    return (stats: UserStats) => {
        const currentValue = getValue(stats);
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} ${currentValue === 1 ? unit : (pluralUnit || unit + 's')}`;
        return {
            isUnlocked: currentValue >= goal,
            progress: progress,
            progressText: progressText
        };
    };
};

export const allAchievements: Achievement[] = [
    // Study Time Achievements
    { id: 'study_1_hour', name: 'Dedicated Learner', description: 'Study for a total of 1 hour.', icon: Clock, tier: 'bronze', 
      progress: createProgressChecker(60, (s) => s.totalStudyTime, 'min') },
    { id: 'study_5_hours', name: 'Hard Worker', description: 'Study for a total of 5 hours.', icon: Clock, tier: 'silver', 
      progress: createProgressChecker(300, (s) => s.totalStudyTime, 'min') },
    { id: 'study_10_hours', name: 'Time Master', description: 'Study for a total of 10 hours.', icon: Clock, tier: 'gold', 
      progress: createProgressChecker(600, (s) => s.totalStudyTime, 'min') },
    
    // Quiz Score Achievements
    { id: 'score_100', name: 'Quiz Whiz', description: 'Get a total quiz score of 100 points.', icon: BrainCircuit, tier: 'bronze', 
      progress: createProgressChecker(100, (s) => s.totalQuizScore, 'point') },
    { id: 'score_500', name: 'Knowledge King', description: 'Get a total quiz score of 500 points.', icon: BrainCircuit, tier: 'silver', 
      progress: createProgressChecker(500, (s) => s.totalQuizScore, 'point') },
    { id: 'score_1000', name: 'Mastermind', description: 'Get a total quiz score of 1000 points.', icon: BrainCircuit, tier: 'gold', 
      progress: createProgressChecker(1000, (s) => s.totalQuizScore, 'point') },
    
    // Streak Achievements
    { id: 'streak_3_days', name: 'Consistent', description: 'Log in 3 days in a row.', icon: Calendar, tier: 'bronze', 
      progress: createProgressChecker(3, (s) => s.loginStreak, 'day') },
    { id: 'streak_7_days', name: 'Habit Builder', description: 'Log in 7 days in a row.', icon: Calendar, tier: 'silver', 
      progress: createProgressChecker(7, (s) => s.loginStreak, 'day') },
    { id: 'streak_30_days', name: 'Unstoppable', description: 'Log in 30 days in a row.', icon: Calendar, tier: 'gold', 
      progress: createProgressChecker(30, (s) => s.loginStreak, 'day') },
    
    // Session Duration Achievements
    { id: 'session_20_min', name: 'Quick Sprint', description: 'Complete a 20+ minute study session.', icon: Award, tier: 'bronze', 
      progress: createProgressChecker(1, (s) => s.sessions20min, 'session') },
    { id: 'session_40_min', name: 'Focused Forty', description: 'Complete a 40+ minute study session.', icon: Award, tier: 'silver', 
      progress: createProgressChecker(1, (s) => s.sessions40min, 'session') },
    { id: 'session_60_min', name: 'Sixty Minute Scholar', description: 'Complete a 60+ minute study session.', icon: Award, tier: 'gold', 
      progress: createProgressChecker(1, (s) => s.sessions60min, 'session') },
    
    // Other Achievements
    { id: 'first_subject', name: 'Getting Started', description: 'Create your first subject.', icon: BookOpen, tier: 'bronze', 
      progress: createProgressChecker(1, (s) => s.firstSubjectCreated || 0, 'subject') },
    { id: 'five_subjects', name: 'Subject Explorer', description: 'Create 5 different subjects.', icon: Library, tier: 'silver', 
      progress: (stats, subjectCount) => {
        const goal = 5;
        const currentValue = subjectCount;
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} subjects`;
        return { isUnlocked: currentValue >= goal, progress, progressText };
      }
    },
    { id: 'first_sticker', name: 'Collector', description: 'Earn your first sticker.', icon: Star, tier: 'bronze', 
      progress: (stats, subjectCount, collectedStickerIds = []) => {
        const goal = 1;
        const currentValue = collectedStickerIds.length;
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} sticker`;
        return { isUnlocked: currentValue >= goal, progress, progressText };
      }
    },
];

export const getUnlockedAchievements = (stats: UserStats, collectedStickerIds: string[] = [], subjectCount: number = 0): Achievement[] => {
    return allAchievements.filter(ach => ach.progress(stats, subjectCount, collectedStickerIds).isUnlocked);
};
