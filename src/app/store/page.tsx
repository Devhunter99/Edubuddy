
"use client";

import { useState } from "react";
import Image from "next/image";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { allStickers, type Sticker } from "@/lib/stickers";
import { allFrames, type AvatarFrame } from "@/lib/frames";
import { cn } from "@/lib/utils";
import { ShoppingCart, CheckCircle2, Coins, Gem, Sparkles, Check } from "lucide-react";
import FramedAvatar from "@/components/rewisepanda/framed-avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const StickerStoreCard = ({ 
    sticker, 
    isOwned, 
    canAfford,
    onPurchase
}: { 
    sticker: Sticker; 
    isOwned: boolean;
    canAfford: boolean;
    onPurchase: (sticker: Sticker) => void;
}) => {

    const { toast } = useToast();

    const handlePurchase = () => {
        if(isOwned) {
            toast({ title: "Already Owned", description: "You already have this sticker in your collection."});
            return;
        }
        if(!canAfford) {
            toast({ title: "Not Enough Coins", description: "You need more coins to buy this sticker.", variant: "destructive" });
            return;
        }
        onPurchase(sticker);
    }

    return (
        <Card className="flex flex-col">
            <CardContent className="p-4 flex-grow flex items-center justify-center">
                 <Image 
                    src={sticker.src}
                    alt={sticker.name}
                    width={150}
                    height={150}
                    className={cn("object-contain transition-all", isOwned && "grayscale")}
                    data-ai-hint={sticker.aiHint}
                />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                <div className="text-center w-full">
                    <p className="font-bold">{sticker.name}</p>
                    <p className="text-sm text-muted-foreground">{sticker.tier}</p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button className="w-full" disabled={isOwned}>
                            {isOwned ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Owned
                                </>
                            ) : (
                                <>
                                    <Coins className="mr-2 h-4 w-4" />
                                    {sticker.cost}
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to buy the "{sticker.name}" sticker for {sticker.cost} coins?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePurchase}>Buy</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
};

const FrameStoreCard = ({
    frame,
    isOwned,
    isEquipped,
    canAfford,
    onUnlock,
    onEquip
}: {
    frame: AvatarFrame;
    isOwned: boolean;
    isEquipped: boolean;
    canAfford: boolean;
    onUnlock: (frame: AvatarFrame) => void;
    onEquip: (frameId: string) => void;
}) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleUnlock = () => {
        if (!canAfford) {
            toast({ title: "Not Enough Coins", description: `You need ${frame.cost} coins for this frame.`, variant: "destructive" });
            return;
        }
        onUnlock(frame);
    }
    
    return (
        <Card className="flex flex-col">
            <CardHeader className="p-4">
                <p className="font-bold text-center">{frame.name}</p>
                <p className="text-sm text-muted-foreground text-center">{frame.tier}</p>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex items-center justify-center">
                <FramedAvatar 
                    profile={{...user, equippedFrameId: frame.id}}
                    className="h-24 w-24"
                    fallbackClassName="text-2xl"
                />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                {isOwned ? (
                    <Button className="w-full" variant={isEquipped ? "secondary" : "default"} onClick={() => onEquip(frame.id)} disabled={isEquipped}>
                        {isEquipped ? (
                             <>
                                <Check className="mr-2 h-4 w-4" />
                                Equipped
                            </>
                        ) : "Equip"}
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full">
                                <Coins className="mr-2 h-4 w-4" />
                                {frame.cost}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Unlock Frame</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to unlock the "{frame.name}" frame for {frame.cost} coins?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleUnlock}>Unlock</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    )
}

const StickerTierSection = ({ 
    tier, 
    stickers,
    collectedStickers,
    coins,
    handlePurchase,
}: { 
    tier: Sticker['tier'];
    stickers: Sticker[];
    collectedStickers: Set<string>;
    coins: number;
    handlePurchase: (sticker: Sticker) => void;
}) => (
    <div>
        <div className="flex items-center gap-2 mb-4">
            <Gem className="h-5 w-5" />
            <h2 className="text-xl font-bold">{tier} Stickers</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stickers.map(sticker => (
                <StickerStoreCard 
                    key={sticker.id}
                    sticker={sticker}
                    isOwned={collectedStickers.has(sticker.id)}
                    canAfford={coins >= sticker.cost}
                    onPurchase={handlePurchase}
                />
            ))}
        </div>
    </div>
);


export default function StorePage() {
    const { 
        coins, 
        collectedStickers, 
        spendCoins, 
        addSticker,
        unlockedFrames,
        equippedFrame,
        unlockFrame,
        equipFrame
    } = useRewards();
    const { toast } = useToast();

    const handleStickerPurchase = (sticker: Sticker) => {
        try {
            spendCoins(sticker.cost);
            addSticker(sticker.id);
            toast({
                title: "Purchase Successful!",
                description: `You've unlocked the ${sticker.name} sticker!`,
            });
        } catch (error: any) {
            toast({
                title: "Purchase Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    }

    const handleFrameUnlock = (frame: AvatarFrame) => {
        try {
            spendCoins(frame.cost);
            unlockFrame(frame.id);
             toast({
                title: "Frame Unlocked!",
                description: `You can now equip the ${frame.name} frame.`,
            });
        } catch (error: any) {
             toast({
                title: "Unlock Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    }

    const handleEquipFrame = (frameId: string) => {
        equipFrame(frameId);
        toast({ title: "Frame Equipped!" });
    }

    const stickersByTier = {
        Small: allStickers.filter(s => s.tier === 'Small'),
        Medium: allStickers.filter(s => s.tier === 'Medium'),
        Large: allStickers.filter(s => s.tier === 'Large'),
    }

    return (
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow container mx-auto p-4 md:p-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-2xl"><ShoppingCart /> Store</CardTitle>
                                    <CardDescription>Use your coins to unlock new stickers and frames for your profile.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-amber-400/20 text-amber-600 dark:text-amber-400 font-bold px-4 py-2 rounded-lg text-lg">
                                    <Coins className="h-6 w-6" />
                                    <span>{coins}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            
                            {/* Frames Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <h2 className="text-xl font-bold">Avatar Frames</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {allFrames.map(frame => (
                                        <FrameStoreCard
                                            key={frame.id}
                                            frame={frame}
                                            isOwned={unlockedFrames.has(frame.id)}
                                            isEquipped={equippedFrame === frame.id}
                                            canAfford={coins >= frame.cost}
                                            onUnlock={handleFrameUnlock}
                                            onEquip={handleEquipFrame}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Stickers Section */}
                            <StickerTierSection 
                                tier="Small" 
                                stickers={stickersByTier.Small} 
                                coins={coins}
                                collectedStickers={collectedStickers}
                                handlePurchase={handleStickerPurchase}
                            />
                             <StickerTierSection 
                                tier="Medium" 
                                stickers={stickersByTier.Medium} 
                                coins={coins}
                                collectedStickers={collectedStickers}
                                handlePurchase={handleStickerPurchase}
                            />
                             <StickerTierSection 
                                tier="Large" 
                                stickers={stickersByTier.Large} 
                                coins={coins}
                                collectedStickers={collectedStickers}
                                handlePurchase={handleStickerPurchase}
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </SidebarInset>
    );
}
