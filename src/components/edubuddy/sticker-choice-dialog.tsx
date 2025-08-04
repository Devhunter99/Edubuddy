
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { allStickers, type Sticker } from '@/lib/stickers';
import { useRewards } from '@/hooks/use-rewards';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, Star } from 'lucide-react';
import { Separator } from '../ui/separator';

interface StickerChoiceDialogProps {
  duration: number;
  onSelectSticker: (sticker: Sticker) => void;
  selectedSticker: Sticker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTierForDuration = (duration: number): Sticker['tier'] | null => {
  if (duration >= 60) return 'Large';
  if (duration >= 40) return 'Medium';
  if (duration >= 20) return 'Small';
  return null;
}

const StickerCard = ({
  sticker,
  isCollected,
  isSelected,
  onSelect,
}: {
  sticker: Sticker;
  isCollected: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "border-2 rounded-lg p-4 flex flex-col items-center justify-center aspect-square shadow-sm transition-all relative group",
        isSelected ? "border-primary ring-2 ring-primary" : "border-border",
        "hover:border-primary/50"
      )}
    >
      <Image
        src={sticker.src}
        alt={sticker.name}
        width={100}
        height={100}
        className={cn("object-contain", !isCollected && "grayscale opacity-50")}
        data-ai-hint={sticker.aiHint}
      />
      <p className="mt-2 text-sm font-semibold text-center">{sticker.name}</p>
      <p className="text-xs text-muted-foreground">{sticker.tier}</p>
      {!isCollected && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Lock className="h-8 w-8 text-foreground" />
        </div>
      )}
       {isSelected && (
        <div className="absolute top-2 right-2 p-1 bg-primary rounded-full">
            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </button>
  );
};


export default function StickerChoiceDialog({ duration, onSelectSticker, selectedSticker, open, onOpenChange }: StickerChoiceDialogProps) {
  const { collectedStickers } = useRewards();
  const [locallySelected, setLocallySelected] = useState<Sticker | null>(selectedSticker);
  
  const currentTier = getTierForDuration(duration);

  const handleConfirm = () => {
    if (locallySelected) {
      onSelectSticker(locallySelected);
    }
  }

  const renderTier = (tier: Sticker['tier']) => {
    const stickersInTier = allStickers.filter(s => s.tier === tier);
    const isEnabled = tier === currentTier;

    return (
      <div key={tier}>
         <div className="flex items-center gap-2 mb-2">
            <h3 className={cn("text-lg font-bold", !isEnabled && "text-muted-foreground")}>{tier} Stickers</h3>
            {!isEnabled && <span className="text-xs text-muted-foreground">(Requires {tier === 'Medium' ? '40+' : '60+'} min)</span>}
         </div>
        <div className={cn("grid grid-cols-3 gap-4", !isEnabled && "opacity-50 pointer-events-none")}>
          {stickersInTier.map(sticker => (
            <StickerCard
              key={sticker.id}
              sticker={sticker}
              isCollected={collectedStickers.has(sticker.id)}
              isSelected={locallySelected?.id === sticker.id}
              onSelect={() => setLocallySelected(sticker)}
            />
          ))}
        </div>
      </div>
    );
  };

  const triggerContent = (
    <div className="flex items-center gap-2 cursor-pointer">
        {selectedSticker ? (
            <>
            <Image src={selectedSticker.src} alt={selectedSticker.name} width={24} height={24} data-ai-hint={selectedSticker.aiHint} />
            <span className='truncate max-w-[100px]'>{selectedSticker.name}</span>
            </>
        ) : (
            <>
            <Star className="h-5 w-5" />
            <span>Choose Sticker</span>
            </>
        )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className='flex-1 text-sm font-medium p-1 rounded-md hover:bg-primary/10 transition-colors'>
            {triggerContent}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose Your Sticker Reward</DialogTitle>
          <DialogDescription>
            Select a sticker to earn for completing your study session. You can only select from the tier that matches your chosen time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {renderTier('Small')}
            <Separator />
            {renderTier('Medium')}
            <Separator />
            {renderTier('Large')}
        </div>
        <div className='flex justify-end'>
            <Button onClick={handleConfirm} disabled={!locallySelected || getTierForDuration(duration) !== locallySelected.tier}>
                Confirm Choice
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
