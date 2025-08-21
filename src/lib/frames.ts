
export interface AvatarFrame {
    id: string;
    name: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
    className: string; // Tailwind classes for styling the frame
    cost: number;
}

export const allFrames: AvatarFrame[] = [
    // --- Metallic Tiers ---
    {
        id: 'bronze-tier',
        name: 'Bronze Ring',
        description: 'A simple, classic bronze frame.',
        tier: 'bronze',
        className: 'p-1 bg-gradient-to-br from-amber-200 via-amber-600 to-amber-800',
        cost: 0,
    },
    {
        id: 'silver-tier',
        name: 'Silver Ring',
        description: 'A sleek and polished silver frame.',
        tier: 'silver',
        className: 'p-1 bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500',
        cost: 0,
    },
    {
        id: 'gold-tier',
        name: 'Gold Ring',
        description: 'A brilliant and shining gold frame.',
        tier: 'gold',
        className: 'p-1 bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600',
        cost: 0,
    },
    {
        id: 'platinum-tier',
        name: 'Platinum Ring',
        description: 'An elegant and rare platinum frame.',
        tier: 'platinum',
        className: 'p-1 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-300',
        cost: 0,
    },

    // --- Glowing / Neon Frames ---
    {
        id: 'neon-blue',
        name: 'Neon Blue',
        description: 'A vibrant, glowing blue neon frame.',
        tier: 'special',
        className: 'p-0.5 animate-pulse-glow-blue shadow-lg shadow-blue-500/50',
        cost: 0,
    },
     {
        id: 'neon-pink',
        name: 'Neon Pink',
        description: 'A bright, glowing pink neon frame.',
        tier: 'special',
        className: 'p-0.5 animate-pulse-glow-pink shadow-lg shadow-pink-500/50',
        cost: 0,
    },
     {
        id: 'rgb-lights',
        name: 'RGB Lights',
        description: 'A dynamic, color-shifting frame.',
        tier: 'special',
        className: 'p-1 animate-rgb-gradient',
        cost: 0,
    },
];

export const getFrameById = (id: string | null | undefined): AvatarFrame | undefined => {
    if (!id) return undefined;
    return allFrames.find(frame => frame.id === id);
}
