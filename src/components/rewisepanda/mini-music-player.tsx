
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

type Track = {
    title: string;
    artist: string;
    src: string;
    image: string;
    aiHint: string;
};

const tracks: Track[] = [
    { title: "Peaceful Mind", artist: "Ambient Dreams", src: "https://storage.googleapis.com/starthinker-ui-misc-public/music/sample-1.mp3", image: "https://placehold.co/400x400/A7C7E7/FFFFFF.png", aiHint: "peaceful ambient" },
    { title: "Focus Flow", artist: "Chill Beats", src: "https://storage.googleapis.com/starthinker-ui-misc-public/music/sample-2.mp3", image: "https://placehold.co/400x400/C1E1C1/FFFFFF.png", aiHint: "lofi beats" },
    { title: "Starlight Study", artist: "Cosmic Waves", src: "https://storage.googleapis.com/starthinker-ui-misc-public/music/sample-3.mp3", image: "https://placehold.co/400x400/BDB2FF/FFFFFF.png", aiHint: "cosmic space" },
];

export default function MiniMusicPlayer() {
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Use a single audio element for the whole app session
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { title, artist, src, image, aiHint } = tracks[trackIndex];

    useEffect(() => {
        setIsClient(true);
        // Initialize Audio element only on the client
        if (typeof window !== "undefined" && !audioRef.current) {
            audioRef.current = new Audio(src);
        }
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = src;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [trackIndex, src, isPlaying]);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handleEnded = () => nextTrack();
        audio.addEventListener("ended", handleEnded);
        
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [trackIndex]);


    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        setTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-3 mt-2">
             <div className="flex items-center gap-3 w-full">
                <div className="relative w-12 h-12 rounded-md overflow-hidden shadow-md flex-shrink-0">
                    <Image src={image} alt={title} layout="fill" objectFit="cover" data-ai-hint={aiHint} />
                </div>
                <div className="text-left overflow-hidden">
                    <h3 className="text-sm font-bold truncate">{title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{artist}</p>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2">
                <Button onClick={prevTrack} variant="ghost" size="icon" className="h-8 w-8">
                    <SkipBack className="h-5 w-5" />
                </Button>
                <Button onClick={togglePlayPause} size="icon" className="rounded-full h-10 w-10">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button onClick={nextTrack} variant="ghost" size="icon" className="h-8 w-8">
                    <SkipForward className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
