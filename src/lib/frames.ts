
export interface AvatarFrame {
    id: string;
    name: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
    src: string; // URL to the frame image
    aiHint: string; // For AI image generation hints
    cost: number;
}

export const allFrames: AvatarFrame[] = [
    {
        id: 'gold-tier',
        name: 'Gold Ring',
        description: 'A brilliant and shining gold frame.',
        tier: 'gold',
        src: 'https://placehold.co/256x256/FFD700/000000.png?text=%20',
        aiHint: 'gold ring',
        cost: 0,
    },
    {
        id: 'silver-tier',
        name: 'Silver Ring',
        description: 'A sleek and polished silver frame.',
        tier: 'silver',
        src: 'https://placehold.co/256x256/C0C0C0/000000.png?text=%20',
        aiHint: 'silver ring',
        cost: 0,
    },
    {
        id: 'bronze-tier',
        name: 'Bronze Ring',
        description: 'A simple, classic bronze frame.',
        tier: 'bronze',
        src: 'https://placehold.co/256x256/CD7F32/000000.png?text=%20',
        aiHint: 'bronze ring',
        cost: 0,
    },
    {
        id: 'neon-blue',
        name: 'Neon Blue',
        description: 'A vibrant, glowing blue neon frame.',
        tier: 'special',
        src: 'https://placehold.co/256x256/0000FF/000000.png?text=%20',
        aiHint: 'glowing blue ring',
        cost: 0,
    },
     {
        id: 'neon-pink',
        name: 'Neon Pink',
        description: 'A bright, glowing pink neon frame.',
        tier: 'special',
        src: 'https://placehold.co/256x256/FF00FF/000000.png?text=%20',
        aiHint: 'glowing pink ring',
        cost: 0,
    },
     {
        id: 'rgb-lights',
        name: 'RGB Lights',
        description: 'A dynamic, color-shifting frame.',
        tier: 'special',
        src: 'https://placehold.co/256x256/FF0000/000000.png?text=%20',
        aiHint: 'rainbow ring',
        cost: 0,
    },
];

export const getFrameById = (id: string | null | undefined): AvatarFrame | undefined => {
    if (!id) return undefined;
    return allFrames.find(frame => frame.id === id);
}
