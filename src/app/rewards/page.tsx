
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRewards } from "@/hooks/use-rewards";
import { Award, Star } from "lucide-react";
import { allStickers, type Sticker } from "@/lib/stickers";

export default function RewardsPage() {
    const { collectedStickers, loading } = useRewards();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getStickerById = (id: string): Sticker | undefined => {
        return allStickers.find(sticker => sticker.id === id);
    };

    if (!isClient || loading) {
        return (
            <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <AppHeader />
                    <main className="flex-grow container mx-auto p-4 md:p-8">
                         <CardTitle>My Sticker Collection</CardTitle>
                        <CardDescription>Complete study sessions to earn stickers!</CardDescription>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </main>
                </div>
            </SidebarInset>
        );
    }


  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="flex items-center gap-4 mb-2">
                <Star className="h-8 w-8 text-amber-400" />
                <CardTitle>My Sticker Collection</CardTitle>
            </div>
            <CardDescription className="mb-6">
                Complete study sessions in the Study Timer to earn stickers and fill up your collection.
            </CardDescription>

            {collectedStickers.size > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {Array.from(collectedStickers).map((stickerId) => {
                        const sticker = getStickerById(stickerId);
                        if (!sticker) return null;
                        return (
                            <Card key={sticker.id} className="p-4 flex flex-col items-center justify-center aspect-square shadow-lg transition-transform hover:scale-105">
                                <Image 
                                    src={sticker.src}
                                    alt={sticker.name}
                                    width={150}
                                    height={150}
                                    className="object-contain"
                                    data-ai-hint={sticker.aiHint}
                                />
                                <p className="mt-2 text-sm font-semibold text-center">{sticker.name}</p>
                                <p className="text-xs text-muted-foreground">{sticker.tier}</p>
                            </Card>
                        )
                    })}
                 </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg border-border">
                    <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-semibold">Your sticker book is empty.</p>
                    <p className="text-muted-foreground mt-2">
                        Use the Study Timer to start earning rewards!
                    </p>
                </div>
            )}
        </main>
      </div>
    </SidebarInset>
  );
}
