
"use client";

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
    
    const frameClasses = equippedFrame ? cn(equippedFrame.className, 'rounded-full') : '';
    const avatarClasses = cn(
        // Default size, can be overridden by className
        "h-10 w-10",
        // If there's a frame, we need to ensure the avatar itself is rounded
        equippedFrame && 'rounded-full',
        className
    );
    
    const fallbackText = profile?.displayName ? profile.displayName[0].toUpperCase() : "U";

    if (equippedFrame) {
        return (
            <div className={frameClasses}>
                 <Avatar className={avatarClasses}>
                    <AvatarImage src={profile?.photoURL ?? undefined} alt={profile?.displayName} className={cn('rounded-full', imageClassName)} />
                    <AvatarFallback className={cn('rounded-full', fallbackClassName)}>{fallbackText}</AvatarFallback>
                </Avatar>
            </div>
        )
    }

    return (
        <Avatar className={avatarClasses}>
            <AvatarImage src={profile?.photoURL ?? undefined} alt={profile?.displayName} className={imageClassName} />
            <AvatarFallback className={fallbackClassName}>{fallbackText}</AvatarFallback>
        </Avatar>
    )
}
