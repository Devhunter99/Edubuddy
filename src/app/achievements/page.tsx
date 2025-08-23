
"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { getUserProfile, type UserProfile } from "@/services/user-service";
import { getUserStats, type UserStats } from "@/services/stats-service";
import { allAchievements, getUnlockedAchievements, type Achievement } from "@/lib/achievements";
import { allStickers } from "@/lib/stickers";
import { useAuth } from "@/hooks/use-auth";
import { useRewards } from "@/hooks/use-rewards";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle, Trophy, Coins } from "lucide-react";

function AchievementCard({ achievement, stats, subjectCount, isClaimed }: { achievement: Achievement, stats: UserStats, subjectCount: number, isClaimed: boolean }) {
    const { isUnlocked, progress, progressText } = achievement.progress(stats, subjectCount, [], allStickers);
    const Icon = achievement.icon;
    const tierColor = {
        'bronze': 'border-amber-700/50', 
        'silver': 'border-gray-400/50', 
        'gold': 'border-amber-500/50',
        'platinum': 'border-purple-500/50'
    }[achievement.tier];
    const tierBg = {
        'bronze': 'bg-amber-700/10 text-amber-700',
        'silver': 'bg-gray-400/10 text-gray-500',
        'gold': 'bg-amber-500/10 text-amber-500',
        'platinum': 'bg-purple-500/10 text-purple-500'
    }[achievement.tier];


    return (
        <Card className={cn(
            "p-4 flex items-center gap-4 transition-all",
            isUnlocked ? `border-2 ${tierColor}` : 'bg-muted/50'
        )}>
            <div className={cn(
                "p-3 rounded-lg",
                 isUnlocked ? tierBg : "bg-background/50 text-muted-foreground"
            )}>
                <Icon className="h-8 w-8" />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-base">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {isUnlocked && (
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className={cn(isClaimed ? "text-muted-foreground" : "text-amber-500")}>
                                +{achievement.coinReward}
                            </span>
                            <Coins className={cn("h-4 w-4", isClaimed ? "text-muted-foreground" : "text-amber-500")} />
                            <CheckCircle className={cn("h-5 w-5", isClaimed ? "text-green-500" : "text-muted-foreground")} />
                        </div>
                    )}
                </div>
                 <div className="flex items-center gap-3 mt-2">
                    <Progress value={progress} className="h-2" />
                    <span className="text-xs font-mono text-muted-foreground w-20 text-right">{progressText}</span>
                </div>
            </div>
        </Card>
    )
}

export default function AchievementsPage() {
    const { user, loading: authLoading } = useAuth();
    const { claimAchievementRewards, claimedAchievementRewards } = useRewards();
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [subjectCount, setSubjectCount] = useState(0);

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

            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, authLoading]);

    const handleClaimRewards = () => {
        if (!stats) return;
        const unlocked = getUnlockedAchievements(stats, profile?.collectedStickerIds || [], subjectCount, allStickers);
        const totalCoinsClaimed = claimAchievementRewards(unlocked);
        if (totalCoinsClaimed > 0) {
            toast({
                title: "Rewards Claimed!",
                description: `You have received ${totalCoinsClaimed} coins!`,
            });
        } else {
             toast({
                title: "No New Rewards",
                description: "You've already claimed all available rewards.",
            });
        }
    };

    if (loading || authLoading) {
        return (
             <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto p-4 md:p-8">
                         <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                            <CardDescription>Track your progress and unlock new milestones.</CardDescription>
                        </CardHeader>
                        <div className="space-y-4 mt-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </main>
                </div>
            </SidebarInset>
        );
    }
    
    if (!user || !stats) {
         return (
             <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto p-4 md:p-8 text-center">
                        <CardTitle>Log In to View Achievements</CardTitle>
                        <p>You need to be logged in to track your achievements.</p>
                    </main>
                </div>
            </SidebarInset>
        );
    }
    
    const unlockedAchievements = getUnlockedAchievements(stats, profile?.collectedStickerIds || [], subjectCount, allStickers);
    const hasUnclaimedRewards = unlockedAchievements.some(ach => !claimedAchievementRewards.has(ach.id));

    return (
        <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-7 w-7 text-primary" />
                                    <CardTitle className="text-3xl">Achievements</CardTitle>
                                </div>
                                <Button onClick={handleClaimRewards} disabled={!hasUnclaimedRewards}>
                                    <Coins className="mr-2 h-4 w-4" />
                                    Claim Rewards
                                </Button>
                            </div>
                            <CardDescription>Track your progress and unlock new milestones on your learning journey.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {allAchievements.map(ach => (
                                <AchievementCard 
                                    key={ach.id}
                                    achievement={ach}
                                    stats={stats}
                                    subjectCount={subjectCount}
                                    isClaimed={claimedAchievementRewards.has(ach.id)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
        </SidebarInset>
    );
}
