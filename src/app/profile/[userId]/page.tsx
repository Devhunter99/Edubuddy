
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from 'next/navigation';
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, type UserProfile } from "@/services/user-service";
import { getUserStats, type UserStats } from "@/services/stats-service";
import { allStickers, type Sticker } from "@/lib/stickers";
import { allAchievements, getUnlockedAchievements, type Achievement } from "@/lib/achievements";
import { Award, Mail, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const getStickerById = (id: string): Sticker | undefined => {
    return allStickers.find(sticker => sticker.id === id);
};

export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [subjectCount, setSubjectCount] = useState(0);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Fetch profile and stats
                const [userProfile, userStats] = await Promise.all([
                    getUserProfile(userId),
                    getUserStats(userId)
                ]);
                setProfile(userProfile);
                setStats(userStats);

                // Fetch subject count from local storage
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
    }, [userId]);

    if (loading) {
        return (
             <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto">
                             <Card className="shadow-lg p-6">
                                <div className="flex flex-col items-center">
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                    <Skeleton className="h-8 w-48 mt-4" />
                                    <Skeleton className="h-5 w-64 mt-2" />
                                </div>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Skeleton className="h-48 w-full" />
                                    <Skeleton className="h-48 w-full" />
                                </div>
                             </Card>
                        </div>
                    </main>
                </div>
            </SidebarInset>
        );
    }
    
    if (!profile || !stats) {
        return (
             <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto p-4 md:p-8 text-center">
                        <CardTitle>User not found</CardTitle>
                        <p>The profile you are looking for does not exist.</p>
                    </main>
                </div>
            </SidebarInset>
        );
    }

    const collectedStickers = profile.collectedStickerIds?.map(getStickerById).filter(Boolean) as Sticker[] || [];
    const unlockedAchievements = getUnlockedAchievements(stats, profile.collectedStickerIds, subjectCount);
    const unlockedAchievementIds = new Set(unlockedAchievements.map(a => a.id));


    return (
        <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-lg overflow-hidden">
                        <CardHeader className="text-center items-center bg-muted/30 p-8">
                            <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                <AvatarImage src={profile.photoURL ?? undefined} alt={profile.displayName} />
                                <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-3xl mt-4">{profile.displayName}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> {profile.email}
                            </CardDescription>
                             <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                                <span>Studied: <b>{Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m</b></span>
                                <span>Streak: <b>{stats.loginStreak} day{stats.loginStreak !== 1 && 's'}</b></span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Achievements Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Trophy className="h-6 w-6 text-amber-500" />
                                    <h3 className="text-xl font-bold">Achievements</h3>
                                </div>
                                <TooltipProvider>
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                    {allAchievements.map((ach) => {
                                        const isUnlocked = unlockedAchievementIds.has(ach.id);
                                        const Icon = ach.icon;
                                        return (
                                            <Tooltip key={ach.id}>
                                                <TooltipTrigger asChild>
                                                    <div className={cn(
                                                        "p-3 flex flex-col items-center justify-center aspect-square shadow-sm rounded-lg bg-card border-2 transition-all",
                                                        isUnlocked ? {
                                                            'bronze': 'border-amber-700/50 bg-amber-700/10',
                                                            'silver': 'border-gray-400/50 bg-gray-400/10',
                                                            'gold': 'border-amber-500/50 bg-amber-500/10'
                                                        }[ach.tier] : "border-border/50 bg-muted/50 grayscale opacity-60"
                                                    )}>
                                                        <Icon className={cn("h-8 w-8", isUnlocked ? {
                                                            'bronze': 'text-amber-700',
                                                            'silver': 'text-gray-500',
                                                            'gold': 'text-amber-500'
                                                        }[ach.tier] : "text-muted-foreground")} />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs text-center">
                                                    <p className="font-bold">{ach.name}</p>
                                                    <p>{ach.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                                </TooltipProvider>
                            </div>

                            {/* Sticker Collection Section */}
                             <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Star className="h-6 w-6 text-amber-400" />
                                    <h3 className="text-xl font-bold">Sticker Collection</h3>
                                </div>
                                {collectedStickers.length > 0 ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                        {collectedStickers.map((sticker) => (
                                            <TooltipProvider key={sticker.id}>
                                                <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="p-2 flex flex-col items-center justify-center aspect-square shadow-sm rounded-lg bg-card border transition-transform hover:scale-105" title={`${sticker.name} (${sticker.tier})`}>
                                                        <Image 
                                                            src={sticker.src}
                                                            alt={sticker.name}
                                                            width={100}
                                                            height={100}
                                                            className="object-contain"
                                                            data-ai-hint={sticker.aiHint}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{sticker.name}</p>
                                                    <p className="text-sm text-muted-foreground">{sticker.tier}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed rounded-lg border-border">
                                        <Award className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground font-semibold">
                                            {profile.displayName}'s sticker book is empty.
                                        </p>
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
        </SidebarInset>
    );
}
