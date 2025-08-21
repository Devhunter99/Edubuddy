
"use client";

import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getFrameById } from "@/lib/frames";
import { type UserProfile } from "@/services/user-service";
import { cn } from "@/lib/utils";

interface FramedAvatarProps {
    profile: UserProfile | null;
    className?: string;
    imageClassName?: string;
    fallbackClassName?: string;
}

export default function FramedAvatar({ profile, className, imageClassName, fallbackClassName }: FramedAvatarProps) {

    const equippedFrame = getFrameById(profile?.equippedFrameId);
    
    const avatarClasses = cn(
        "h-full w-full",
        className
    );
    
    const fallbackText = profile?.displayName ? profile.displayName[0].toUpperCase() : "U";

    if (equippedFrame && equippedFrame.src) {
        return (
             <div className={cn("relative h-12 w-12", className)}>
                <Image 
                    src={equippedFrame.src} 
                    alt={equippedFrame.name} 
                    layout="fill" 
                    className="absolute inset-0 z-10"
                    data-ai-hint={equippedFrame.aiHint}
                />
                <Avatar className={cn("absolute inset-0 m-auto h-[80%] w-[80%]", imageClassName)}>
                    <AvatarImage src={profile?.photoURL ?? undefined} alt={profile?.displayName} />
                    <AvatarFallback className={fallbackClassName}>{fallbackText}</AvatarFallback>
                </Avatar>
            </div>
        )
    }

    return (
        <Avatar className={cn("h-10 w-10", className)}>
            <AvatarImage src={profile?.photoURL ?? undefined} alt={profile?.displayName} className={imageClassName} />
            <AvatarFallback className={fallbackClassName}>{fallbackText}</AvatarFallback>
        </Avatar>
    )
}
