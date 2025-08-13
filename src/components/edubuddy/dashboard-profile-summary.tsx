
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, type UserProfile } from "@/services/user-service";
import { getUserStats, type UserStats } from "@/services/stats-service";
import { getUnlockedAchievements } from "@/lib/achievements";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Clock } from "lucide-react";

export default function DashboardProfileSummary() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [unlockedAchievementCount, setUnlockedAchievementCount] = useState(0);
    const [subjectCount, setSubjectCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) {
                if (!authLoading) setLoading(false);
                return;
            };
            setLoading(true);
            try {
                const [userProfile, userStats] = await Promise.all([
                    getUserProfile(user.uid),
                    getUserStats(user.uid)
                ]);
                setProfile(userProfile);
                setStats(userStats);

                if (typeof window !== 'undefined') {
                    const storedSubjects = localStorage.getItem("subjects");
                    const subjectList: string[] = storedSubjects ? JSON.parse(storedSubjects) : [];
                    setSubjectCount(subjectList.length);
                }

                if (userStats && userProfile) {
                    const unlocked = getUnlockedAchievements(userStats, userProfile.collectedStickerIds || [], subjectCount);
                    setUnlockedAchievementCount(unlocked.length);
                }

            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, authLoading, subjectCount]);
    
    if (authLoading || loading) {
        return (
            <Card className="mb-8 p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex items-center gap-4">
                             <Skeleton className="h-4 w-16" />
                             <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!user || !profile || !stats) {
        return null;
    }

    return (
        <Link href={`/profile/${user.uid}`}>
            <Card className="mb-8 p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={profile.photoURL ?? undefined} alt={profile.displayName} />
                        <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold">{profile.displayName}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1.5">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                <span>{unlockedAchievementCount} Achievements</span>
                            </div>
                             <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m Studied</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
