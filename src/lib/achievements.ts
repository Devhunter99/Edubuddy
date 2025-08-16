
import { type LucideIcon, BookOpen, BrainCircuit, Calendar, Clock, Award, Star, Library, Trophy, Users, Heart } from "lucide-react";
import type { Sticker } from "./stickers";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    // A function that returns unlocking progress details
    progress: (stats: UserStats, subjectCount: number, collectedStickerIds?: string[], allStickers?: Sticker[]) => {
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
    studyMateCount: number;
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
    { id: 'study_10_hours', name: 'Hard Worker', description: 'Study for a total of 10 hours.', icon: Clock, tier: 'silver', 
      progress: createProgressChecker(600, (s) => s.totalStudyTime, 'min') },
    { id: 'study_50_hours', name: 'Time Master', description: 'Study for a total of 50 hours.', icon: Clock, tier: 'gold', 
      progress: createProgressChecker(3000, (s) => s.totalStudyTime, 'min') },
    { id: 'study_100_hours', name: 'Centurion', description: 'Study for a total of 100 hours.', icon: Trophy, tier: 'platinum', 
      progress: createProgressChecker(6000, (s) => s.totalStudyTime, 'min') },

    // Quiz Score Achievements
    { id: 'score_100', name: 'Quiz Whiz', description: 'Get a total quiz score of 100 points.', icon: BrainCircuit, tier: 'bronze', 
      progress: createProgressChecker(100, (s) => s.totalQuizScore, 'point') },
    { id: 'score_500', name: 'Knowledge King', description: 'Get a total quiz score of 500 points.', icon: BrainCircuit, tier: 'silver', 
      progress: createProgressChecker(500, (s) => s.totalQuizScore, 'point') },
    { id: 'score_2000', name: 'Mastermind', description: 'Get a total quiz score of 2000 points.', icon: BrainCircuit, tier: 'gold', 
      progress: createProgressChecker(2000, (s) => s.totalQuizScore, 'point') },
    { id: 'score_10000', name: 'Prodigy', description: 'Get a total quiz score of 10,000 points.', icon: Trophy, tier: 'platinum', 
      progress: createProgressChecker(10000, (s) => s.totalQuizScore, 'point') },
    
    // Streak Achievements
    { id: 'streak_3_days', name: 'Consistent', description: 'Log in 3 days in a row.', icon: Calendar, tier: 'bronze', 
      progress: createProgressChecker(3, (s) => s.loginStreak, 'day') },
    { id: 'streak_7_days', name: 'Habit Builder', description: 'Log in 7 days in a row.', icon: Calendar, tier: 'silver', 
      progress: createProgressChecker(7, (s) => s.loginStreak, 'day') },
    { id: 'streak_30_days', name: 'Unstoppable', description: 'Log in 30 days in a row.', icon: Calendar, tier: 'gold', 
      progress: createProgressChecker(30, (s) => s.loginStreak, 'day') },
    { id: 'streak_100_days', name: 'True Dedication', description: 'Log in 100 days in a row.', icon: Trophy, tier: 'platinum', 
      progress: createProgressChecker(100, (s) => s.loginStreak, 'day') },

    // Session Duration Achievements
    { id: 'session_20_min', name: 'Quick Sprint', description: 'Complete a 20+ minute study session.', icon: Award, tier: 'bronze', 
      progress: createProgressChecker(1, (s) => s.sessions20min, 'session') },
    { id: 'session_40_min', name: 'Focused Forty', description: 'Complete a 40+ minute study session.', icon: Award, tier: 'silver', 
      progress: createProgressChecker(1, (s) => s.sessions40min, 'session') },
    { id: 'session_60_min', name: 'Sixty Minute Scholar', description: 'Complete a 60+ minute study session.', icon: Award, tier: 'gold', 
      progress: createProgressChecker(1, (s) => s.sessions60min, 'session') },

    // Subject Creation Achievements
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
    { id: 'ten_subjects', name: 'Librarian', description: 'Create 10 different subjects.', icon: Library, tier: 'gold', 
      progress: (stats, subjectCount) => {
        const goal = 10;
        const currentValue = subjectCount;
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} subjects`;
        return { isUnlocked: currentValue >= goal, progress, progressText };
      }
    },

    // Sticker Collection Achievements
    { id: 'first_sticker', name: 'Collector', description: 'Earn your first sticker.', icon: Star, tier: 'bronze', 
      progress: (stats, sc, collectedStickerIds = []) => {
        const goal = 1;
        const currentValue = collectedStickerIds?.length || 0;
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} sticker`;
        return { isUnlocked: currentValue >= goal, progress, progressText };
      }
    },
    { id: 'half_stickers', name: 'Sticker Enthusiast', description: 'Collect half of all available stickers.', icon: Star, tier: 'silver', 
      progress: (stats, sc, collectedStickerIds = [], allStickers = []) => {
        const goal = Math.ceil(allStickers.length / 2);
        const currentValue = collectedStickerIds?.length || 0;
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} stickers`;
        return { isUnlocked: currentValue >= goal, progress, progressText };
      }
    },
     { id: 'all_stickers', name: 'Sticker Master', description: 'Collect all available stickers.', icon: Star, tier: 'gold', 
      progress: (stats, sc, collectedStickerIds = [], allStickers = []) => {
        const goal = allStickers.length;
        const currentValue = collectedStickerIds?.length || 0;
        const progress = Math.min(100, (currentValue / goal) * 100);
        const progressText = `${Math.min(currentValue, goal)}/${goal} stickers`;
        return { isUnlocked: currentValue >= goal, progress, progressText };
      }
    },

    // Study Mates Achievements
    { id: 'first_mate', name: 'Friendly Learner', description: 'Add your first study mate.', icon: Heart, tier: 'bronze', 
      progress: createProgressChecker(1, (s) => s.studyMateCount, 'mate', 'mates') },
    { id: 'five_mates', name: 'Social Butterfly', description: 'Add 5 study mates.', icon: Users, tier: 'silver', 
      progress: createProgressChecker(5, (s) => s.studyMateCount, 'mate', 'mates') },
    { id: 'ten_mates', name: 'Community Builder', description: 'Add 10 study mates.', icon: Users, tier: 'gold', 
      progress: createProgressChecker(10, (s) => s.studyMateCount, 'mate', 'mates') },
];

export const getUnlockedAchievements = (stats: UserStats, collectedStickerIds: string[] = [], subjectCount: number = 0, allStickers: Sticker[] = []): Achievement[] => {
    return allAchievements.filter(ach => ach.progress(stats, subjectCount, collectedStickerIds, allStickers).isUnlocked);
};
