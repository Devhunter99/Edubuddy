
import { type LucideIcon, BookOpen, BrainCircuit, Calendar, Clock, Award, Star, TrendingUp, Library } from "lucide-react";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    tier: 'bronze' | 'silver' | 'gold';
    check: (stats: UserStats) => boolean;
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
    subjectCount?: number;
}

export const allAchievements: Achievement[] = [
    // Study Time Achievements
    { id: 'study_1_hour', name: 'Dedicated Learner', description: 'Study for a total of 1 hour.', icon: Clock, tier: 'bronze', check: (stats) => stats.totalStudyTime >= 60 },
    { id: 'study_5_hours', name: 'Hard Worker', description: 'Study for a total of 5 hours.', icon: Clock, tier: 'silver', check: (stats) => stats.totalStudyTime >= 300 },
    { id: 'study_10_hours', name: 'Time Master', description: 'Study for a total of 10 hours.', icon: Clock, tier: 'gold', check: (stats) => stats.totalStudyTime >= 600 },
    
    // Quiz Score Achievements
    { id: 'score_100', name: 'Quiz Whiz', description: 'Get a total quiz score of 100 points.', icon: BrainCircuit, tier: 'bronze', check: (stats) => stats.totalQuizScore >= 100 },
    { id: 'score_500', name: 'Knowledge King', description: 'Get a total quiz score of 500 points.', icon: BrainCircuit, tier: 'silver', check: (stats) => stats.totalQuizScore >= 500 },
    { id: 'score_1000', name: 'Mastermind', description: 'Get a total quiz score of 1000 points.', icon: BrainCircuit, tier: 'gold', check: (stats) => stats.totalQuizScore >= 1000 },
    
    // Streak Achievements
    { id: 'streak_3_days', name: 'Consistent', description: 'Log in 3 days in a row.', icon: Calendar, tier: 'bronze', check: (stats) => stats.loginStreak >= 3 },
    { id: 'streak_7_days', name: 'Habit Builder', description: 'Log in 7 days in a row.', icon: Calendar, tier: 'silver', check: (stats) => stats.loginStreak >= 7 },
    { id: 'streak_30_days', name: 'Unstoppable', description: 'Log in 30 days in a row.', icon: Calendar, tier: 'gold', check: (stats) => stats.loginStreak >= 30 },
    
    // Session Duration Achievements
    { id: 'session_20_min', name: 'Quick Sprint', description: 'Complete a 20+ minute study session.', icon: Award, tier: 'bronze', check: (stats) => stats.sessions20min >= 1 },
    { id: 'session_40_min', name: 'Focused Forty', description: 'Complete a 40+ minute study session.', icon: Award, tier: 'silver', check: (stats) => stats.sessions40min >= 1 },
    { id: 'session_60_min', name: 'Sixty Minute Scholar', description: 'Complete a 60+ minute study session.', icon: Award, tier: 'gold', check: (stats) => stats.sessions60min >= 1 },
    
    // Other Achievements
    { id: 'first_note', name: 'Getting Started', description: 'Create your first subject.', icon: BookOpen, tier: 'bronze', check: (stats) => (stats.firstSubjectCreated ?? 0) > 0 },
    { id: 'first_sticker', name: 'Collector', description: 'Earn your first sticker.', icon: Star, tier: 'bronze', check: (stats) => true }, // Placeholder
    { id: 'five_subjects', name: 'Subject Explorer', description: 'Create 5 different subjects.', icon: Library, tier: 'silver', check: (stats) => (stats.subjectCount ?? 0) >= 5 },
];

export const getUnlockedAchievements = (stats: UserStats, collectedStickerIds: string[] = [], subjectCount: number = 0): Achievement[] => {
    // Inject subjectCount into stats for the check function
    const statsWithSubjectCount = { ...stats, subjectCount };
    
    const unlocked = allAchievements.filter(ach => ach.check(statsWithSubjectCount));
    
    // Handle achievements that depend on data not in stats (like stickers)
    if (collectedStickerIds.length > 0) {
        const firstStickerAch = allAchievements.find(a => a.id === 'first_sticker');
        if (firstStickerAch && !unlocked.some(a => a.id === firstStickerAch.id)) {
            unlocked.push(firstStickerAch);
        }
    }
    
    // Return unique achievements
    return Array.from(new Set(unlocked.map(a => a.id))).map(id => unlocked.find(a => a.id === id)!);
};
