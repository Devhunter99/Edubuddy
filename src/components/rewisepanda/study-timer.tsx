
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { ToastAction } from "../ui/toast";
import { getStickerForDuration, type Sticker } from "@/lib/stickers";
import { Separator } from "../ui/separator";
import StickerChoiceDialog from "./sticker-choice-dialog";
import { useAuth } from "@/hooks/use-auth";
import { incrementUserStats } from "@/services/stats-service";

const PRESETS = [20, 40, 60]; // in minutes

interface StudyTimerProps {
  compact?: boolean;
}

export function StudyTimer({ compact = false }: StudyTimerProps) {
  const [initialDuration, setInitialDuration] = useState(20 * 60); // in seconds
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { addRewards, hasCompletedSession } = useRewards();
  const sessionStartTime = useRef<number | null>(null);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  
  const workerRef = useRef<Worker>();

  useEffect(() => {
    // Initialize the service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/timer-worker.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    }

    // Initialize the web worker
    workerRef.current = new Worker('/timer-worker.js');

    workerRef.current.onmessage = (event) => {
        const { type, timeRemaining: workerTime } = event.data;
        if (type === 'tick') {
            setTimeRemaining(workerTime);
        } else if (type === 'done') {
            handleTimerCompletion();
        }
    };

    return () => {
        workerRef.current?.terminate();
    };
  }, []);

  const handleTimerCompletion = () => {
      setIsActive(false);
      const coinsEarned = Math.floor(initialDuration / 60 / 10);
      const stickerEarned = selectedSticker ?? getStickerForDuration(initialDuration / 60);
      const sessionId = `timer-${sessionStartTime.current}`;

      if ((coinsEarned > 0 || stickerEarned) && !hasCompletedSession(sessionId)) {
        addRewards(coinsEarned, stickerEarned?.id, sessionId);
        if (user) {
          const sessionMinutes = initialDuration / 60;
          const statIncrements: { [key: string]: number } = { totalStudyTime: sessionMinutes };
          if (sessionMinutes >= 60) statIncrements.sessions60min = 1;
          else if (sessionMinutes >= 40) statIncrements.sessions40min = 1;
          else if (sessionMinutes >= 20) statIncrements.sessions20min = 1;
          incrementUserStats(user.uid, statIncrements);
        }
        toast({
          title: ( <div className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /><span className="font-bold">Session Complete!</span></div> ),
          description: ( <div className="flex flex-col gap-2 mt-2">{stickerEarned && ( <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg"><Image src={stickerEarned.src} alt={stickerEarned.name} width={48} height={48} data-ai-hint={stickerEarned.aiHint} /><div><p className="font-semibold">Sticker Unlocked!</p><p className="text-xs">{stickerEarned.name}</p></div></div>)}{coinsEarned > 0 && <p>You earned {coinsEarned} coin{coinsEarned > 1 ? 's' : ''} for your focus!</p>}</div>),
          duration: Infinity,
          action: <ToastAction altText="Continue">Continue</ToastAction>,
        });
      }
  };


  useEffect(() => {
    setIsActive(false);
    workerRef.current?.postMessage({ command: 'reset', value: { duration: initialDuration }});
    setTimeRemaining(initialDuration);
    setSelectedSticker(null);
  }, [initialDuration]);
  
  const toggleTimer = useCallback(async () => {
    if (timeRemaining > 0) {
      const newIsActive = !isActive;
      if (newIsActive) {
         if (Notification.permission === 'default') {
            await Notification.requestPermission();
         }
         if (Notification.permission === 'denied') {
             toast({
                 title: "Notification Permission Required",
                 description: "Please enable notifications in your browser settings for the timer to work in the background.",
                 variant: "destructive"
             });
             return;
         }
        workerRef.current?.postMessage({ command: 'start', value: { time: timeRemaining } });
        sessionStartTime.current = Date.now();
      } else {
        workerRef.current?.postMessage({ command: 'pause' });
        sessionStartTime.current = null;
      }
      setIsActive(newIsActive);
    }
  }, [isActive, timeRemaining, toast]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    workerRef.current?.postMessage({ command: 'reset', value: { duration: initialDuration }});
    setTimeRemaining(initialDuration);
    sessionStartTime.current = null;
  }, [initialDuration]);

  const selectPreset = useCallback((minutes: number) => {
    setInitialDuration(minutes * 60);
    setCustomMinutes("");
  }, []);

  const handleSetCustomTime = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
        setInitialDuration(minutes * 60);
    } else {
        toast({
            title: "Invalid Time",
            description: "Please enter a valid number of minutes.",
            variant: "destructive"
        })
    }
    setCustomMinutes("");
  }
  
  const handleSelectSticker = (sticker: Sticker) => {
    setSelectedSticker(sticker);
    setIsChooserOpen(false);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const CIRCLE_RADIUS = 80;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  const progressOffset = ((initialDuration - timeRemaining) / initialDuration) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
        {!compact && (
           <div className="relative h-48 w-48">
              <svg className="h-full w-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r={CIRCLE_RADIUS} fill="none" strokeWidth="15" className="stroke-muted" />
                  <circle cx="100" cy="100" r={CIRCLE_RADIUS} fill="none" strokeWidth="15" className="stroke-primary transition-all duration-1000 ease-linear animate-pulse-glow" strokeDasharray={CIRCLE_CIRCUMFERENCE} strokeDashoffset={progressOffset} strokeLinecap="round" transform="rotate(-90 100 100)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold font-mono text-primary tabular-nums tracking-wider">
                  {formatTime(timeRemaining)}
              </div>
          </div>
        )}
        
        {compact && (
          <div className="text-3xl font-bold font-mono text-primary tabular-nums tracking-wider">
            {formatTime(timeRemaining)}
          </div>
        )}


       {initialDuration >= 3600 && !compact &&( <p className="text-sm text-muted-foreground text-center px-4">That's a long session! Remember to take a short break every hour.</p> )}
      
      <div className="w-full space-y-3 px-2">
        <div className="flex w-full justify-center gap-2">
            {PRESETS.map((p) => (
            <Button key={p} variant={initialDuration / 60 === p && customMinutes === "" ? "default" : "outline"} size="sm" onClick={() => selectPreset(p)} className="flex-1">{p} min</Button>
            ))}
        </div>
        {!compact && (
          <div className="flex w-full justify-center gap-2">
              <Input type="number" placeholder="Custom minutes..." value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSetCustomTime()} className="bg-background" />
              <Button onClick={handleSetCustomTime} variant="secondary">Set</Button>
          </div>
        )}
      </div>
      
       {!compact && <Separator className="my-2" />}

       {!compact && (
          <div className="flex flex-col items-center gap-2 w-full px-2">
              <h3 className="font-semibold text-center">Your Rewards</h3>
              <div className="flex items-center justify-center gap-4 text-sm p-3 rounded-lg bg-muted w-full">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><Award className="h-5 w-5"/><span>Earn {Math.floor(initialDuration / 60 / 10)}</span></div>
                  <Separator orientation="vertical" className="h-6"/>
                  <StickerChoiceDialog duration={initialDuration / 60} onSelectSticker={handleSelectSticker} selectedSticker={selectedSticker} open={isChooserOpen} onOpenChange={setIsChooserOpen} />
              </div>
          </div>
       )}

      <div className="flex items-center justify-center gap-4 mt-4">
        <Button onClick={toggleTimer} size="lg" className={cn("w-24", isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90")} disabled={timeRemaining === 0}>{isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{isActive ? "Pause" : "Start"}</Button>
        <Button onClick={resetTimer} variant="secondary" size="icon" aria-label="Reset Timer"><RefreshCw className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
