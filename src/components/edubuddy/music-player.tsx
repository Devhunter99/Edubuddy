
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

type Track = {
    title: string;
    artist: string;
    src: string;
    image: string;
    aiHint: string;
};

interface MusicPlayerProps {
    tracks: Track[];
}

export default function MusicPlayer({ tracks }: MusicPlayerProps) {
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { title, artist, src, image, aiHint } = tracks[trackIndex];

    useEffect(() => {
        if (typeof window !== "undefined") {
            audioRef.current = new Audio(src);
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = src;
            if (isPlaying) {
                audioRef.current.play();
            }
        }
    }, [trackIndex, src, isPlaying]);

    useEffect(() => {
        if (!audioRef.current) return;

        const updateProgress = () => {
            setProgress((audioRef.current!.currentTime / audioRef.current!.duration) * 100);
        };
        const handleEnded = () => nextTrack();

        audioRef.current.addEventListener("timeupdate", updateProgress);
        audioRef.current.addEventListener("ended", handleEnded);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener("timeupdate", updateProgress);
                audioRef.current.removeEventListener("ended", handleEnded);
            }
        };
    }, [trackIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        setTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    };

    const prevTrack = () => {
        setTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    };

    const handleProgressChange = (value: number[]) => {
        if (audioRef.current) {
            const newTime = (value[0] / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(value[0]);
        }
    };
    
    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
        if(isMuted && value[0] > 0) setIsMuted(false);
    }
    
    const toggleMute = () => {
        setIsMuted(!isMuted);
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden shadow-lg">
                <Image src={image} alt={title} layout="fill" objectFit="cover" data-ai-hint={aiHint} />
            </div>

            <div className="text-center">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground">{artist}</p>
            </div>

            <div className="w-full">
                <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={1}
                />
            </div>

            <div className="flex items-center justify-center gap-4">
                <Button onClick={prevTrack} variant="ghost" size="icon">
                    <SkipBack className="h-6 w-6" />
                </Button>
                <Button onClick={togglePlayPause} size="lg" className="rounded-full h-16 w-16">
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
                <Button onClick={nextTrack} variant="ghost" size="icon">
                    <SkipForward className="h-6 w-6" />
                </Button>
            </div>
            
             <div className="flex items-center gap-2 w-full max-w-xs pt-2">
                <Button onClick={toggleMute} variant="ghost" size="icon">
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.01}
                />
            </div>
        </div>
    );
}
