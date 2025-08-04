
export interface Sticker {
    id: string;
    name: string;
    tier: 'Small' | 'Medium' | 'Large';
    src: string;
    aiHint: string;
}

export const allStickers: Sticker[] = [
    // Small Stickers (20-39 mins)
    { id: 's1', name: 'Focused Atom', tier: 'Small', src: 'https://placehold.co/100x100/A7C7E7/FFFFFF.png?text=⚛️', aiHint: 'atom science' },
    { id: 's2', name: 'Happy Flask', tier: 'Small', src: 'https://placehold.co/100x100/C1E1C1/FFFFFF.png?text=🧪', aiHint: 'chemistry flask' },
    { id: 's3', name: 'Clever Cactus', tier: 'Small', src: 'https://placehold.co/100x100/FAD2E1/FFFFFF.png?text=🌵', aiHint: 'smart cactus' },
    
    // Medium Stickers (40-59 mins)
    { id: 'm1', name: 'Stellar Scholar', tier: 'Medium', src: 'https://placehold.co/150x150/FFDDC1/FFFFFF.png?text=⭐', aiHint: 'scholar star' },
    { id: 'm2', name: 'Brainy Bookworm', tier: 'Medium', src: 'https://placehold.co/150x150/E0BBE4/FFFFFF.png?text=🐛', aiHint: 'bookworm glasses' },
    { id: 'm3', name: 'Genius Globe', tier: 'Medium', src: 'https://placehold.co/150x150/D4F1F4/FFFFFF.png?text=🌍', aiHint: 'globe graduation' },

    // Large Stickers (60+ mins)
    { id: 'l1', name: 'Cosmic Mind', tier: 'Large', src: 'https://placehold.co/200x200/BDB2FF/FFFFFF.png?text=🌌', aiHint: 'cosmic brain' },
    { id: 'l2', name: 'Enlightened Owl', tier: 'Large', src: 'https://placehold.co/200x200/FFC8A2/FFFFFF.png?text=🦉', aiHint: 'wise owl' },
    { id: 'l3', name: 'Peak Performer', tier: 'Large', src: 'https://placehold.co/200x200/A2D2FF/FFFFFF.png?text=🏆', aiHint: 'mountain trophy' },
];

export const getStickerForDuration = (minutes: number): Sticker | undefined => {
    let potentialStickers: Sticker[] = [];
    if (minutes >= 60) {
        potentialStickers = allStickers.filter(s => s.tier === 'Large');
    } else if (minutes >= 40) {
        potentialStickers = allStickers.filter(s => s.tier === 'Medium');
    } else if (minutes >= 20) {
        potentialStickers = allStickers.filter(s => s.tier === 'Small');
    } else {
        return undefined;
    }
    
    // Return a random sticker from the determined tier
    return potentialStickers[Math.floor(Math.random() * potentialStickers.length)];
}
