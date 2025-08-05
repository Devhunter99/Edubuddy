
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
import { allStickers, type Sticker } from "@/lib/stickers";
import { Award, Mail, Star } from "lucide-react";

const getStickerById = (id: string): Sticker | undefined => {
    return allStickers.find(sticker => sticker.id === id);
};

export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const userProfile = await getUserProfile(userId);
                setProfile(userProfile);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
             <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto p-4 md:p-8">
                        <div className="max-w-2xl mx-auto">
                            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                            <Skeleton className="h-8 w-48 mx-auto mt-4" />
                            <Skeleton className="h-5 w-64 mx-auto mt-2" />
                            <Skeleton className="h-48 w-full mt-8" />
                        </div>
                    </main>
                </div>
            </SidebarInset>
        );
    }
    
    if (!profile) {
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


  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <Card className="shadow-lg">
                    <CardHeader className="text-center items-center bg-muted/30 pb-8">
                         <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                            <AvatarImage src={profile.photoURL ?? undefined} alt={profile.displayName} />
                            <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-3xl mt-4">{profile.displayName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <Mail className="h-4 w-4" /> {profile.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                             <Star className="h-6 w-6 text-amber-400" />
                            <h3 className="text-xl font-bold">Sticker Collection</h3>
                        </div>
                        {collectedStickers.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {collectedStickers.map((sticker) => (
                                    <div key={sticker.id} className="p-2 flex flex-col items-center justify-center aspect-square shadow-md rounded-lg bg-card transition-transform hover:scale-105" title={`${sticker.name} (${sticker.tier})`}>
                                        <Image 
                                            src={sticker.src}
                                            alt={sticker.name}
                                            width={100}
                                            height={100}
                                            className="object-contain"
                                            data-ai-hint={sticker.aiHint}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg border-border">
                                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground font-semibold">
                                    {profile.displayName}'s sticker book is empty.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
      </div>
    </SidebarInset>
  );
}
