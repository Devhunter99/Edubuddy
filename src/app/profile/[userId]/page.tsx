
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from 'next/navigation';
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, type UserProfile } from "@/services/user-service";
import { getUserStats, type UserStats } from "@/services/stats-service";
import { allStickers, type Sticker } from "@/lib/stickers";
import { allAchievements, getUnlockedAchievements } from "@/lib/achievements";
import { Award, Mail, Star, Trophy, ArrowRight, Calendar, Clock, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import FramedAvatar from "@/components/rewisepanda/framed-avatar";


const getStickerById = (id: string): Sticker | undefined => {
    return allStickers.find(sticker => sticker.id === id);
};

export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const { user: currentUser } = useAuth();
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
                        <div className="max-w-4xl mx-auto space-y-6">
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </div>
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
    const unlockedAchievements = getUnlockedAchievements(stats, profile.collectedStickerIds, subjectCount, allStickers);
    const unlockedAchievementIds = new Set(unlockedAchievements.map(a => a.id));


    return (
        <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                     <Card className="shadow-lg overflow-hidden relative">
                        <div className="h-32 bg-gradient-to-r from-primary to-purple-600" />
                        <div className="p-6 pt-0">
                            <div className="flex justify-center -mt-16">
                                <FramedAvatar
                                    profile={profile}
                                    className="h-32 w-32 border-4 border-background shadow-xl"
                                    fallbackClassName="text-4xl"
                                />
                            </div>
                             <div className="text-center mt-4">
                                <div className="flex justify-center items-center gap-2">
                                  <CardTitle className="text-3xl">{profile.displayName}</CardTitle>
                                  {currentUser?.uid === userId && (
                                      <Link href="/settings" passHref>
                                          <Button variant="ghost" size="icon">
                                              <Edit className="h-5 w-5 text-muted-foreground" />
                                          </Button>
                                      </Link>
                                  )}
                                </div>
                                <CardDescription className="flex items-center justify-center gap-2 mt-1">
                                    <Mail className="h-4 w-4" /> {profile.email}
                                </CardDescription>
                            </div>
                            <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground border-t pt-4">
                                <div className="text-center">
                                    <p className="font-bold text-lg text-foreground">{Math.floor(stats.totalStudyTime / 60)}<span className="text-sm font-normal">h</span> {stats.totalStudyTime % 60}<span className="text-sm font-normal">m</span></p>
                                    <p className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3"/> Studied</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg text-foreground">{stats.loginStreak}</p>
                                    <p className="flex items-center gap-1 text-xs"><Calendar className="h-3 w-3"/> Day Streak</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Achievements Section */}
                        <Card>
                             <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-6 w-6 text-amber-500" />
                                        <h3 className="text-xl font-bold">Achievements</h3>
                                    </div>
                                    <Link href="/achievements">
                                        <Button variant="ghost" size="sm">
                                            Show All <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <TooltipProvider>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {allAchievements.slice(0, 10).map((ach) => {
                                        const isUnlocked = unlockedAchievementIds.has(ach.id);
                                        const Icon = ach.icon;
                                        const tierBorder = {
                                            'bronze': 'border-amber-700/50 bg-amber-700/10',
                                            'silver': 'border-gray-400/50 bg-gray-400/10',
                                            'gold': 'border-amber-500/50 bg-amber-500/10',
                                            'platinum': 'border-purple-500/50 bg-purple-500/10',
                                        }[ach.tier];
                                        const tierIcon = {
                                             'bronze': 'text-amber-700',
                                            'silver': 'text-gray-500',
                                            'gold': 'text-amber-500',
                                            'platinum': 'text-purple-500',
                                        }[ach.tier];
                                        return (
                                            <Tooltip key={ach.id}>
                                                <TooltipTrigger asChild>
                                                    <div className={cn(
                                                        "p-3 flex flex-col items-center justify-center aspect-square shadow-sm rounded-lg bg-card border-2 transition-all",
                                                        isUnlocked ? tierBorder : "border-border/50 bg-muted/50 grayscale opacity-60"
                                                    )}>
                                                        <Icon className={cn("h-8 w-8", isUnlocked ? tierIcon : "text-muted-foreground")} />
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
                            </CardContent>
                        </Card>

                        {/* Sticker Collection Section */}
                         <Card>
                             <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Star className="h-6 w-6 text-amber-400" />
                                    <h3 className="text-xl font-bold">Sticker Collection</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {collectedStickers.length > 0 ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                        {collectedStickers.slice(0, 10).map((sticker) => (
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
                                    <div className="text-center py-10 border-2 border-dashed rounded-lg border-border h-full flex flex-col justify-center">
                                        <Award className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground font-semibold">
                                            {profile.displayName}'s sticker book is empty.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
        </SidebarInset>
    );
}
