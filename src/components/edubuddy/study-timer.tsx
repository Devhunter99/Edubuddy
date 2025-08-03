
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCoins } from "@/hooks/use-coins";
import { ToastAction } from "../ui/toast";

const PRESETS = [20, 40, 60]; // in minutes

export function StudyTimer() {
  const [initialDuration, setInitialDuration] = useState(20 * 60); // in seconds
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const { toast } = useToast();
  const { addCoins, hasCompletedTimerSession } = useCoins();
  const sessionStartTime = useRef<number | null>(null);


  const CIRCLE_RADIUS = 80;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  const progressOffset = ((initialDuration - timeRemaining) / initialDuration) * CIRCLE_CIRCUMFERENCE;


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      setIsActive(false);
      
      const coinsEarned = Math.floor(initialDuration / 60 / 10);
      const sessionId = `timer-${sessionStartTime.current}`;

      if (coinsEarned > 0 && !hasCompletedTimerSession(sessionId)) {
        addCoins(coinsEarned, sessionId);
        toast({
          title: (
            <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="font-bold">Reward!</span>
            </div>
          ),
          description: `You earned ${coinsEarned} coin${coinsEarned > 1 ? 's' : ''} for your focused study session!`,
          duration: Infinity, // Make it persistent
          action: <ToastAction altText="Continue">Continue</ToastAction>,
        });
      }
      
      if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
        new window.Notification("EduBuddy", { body: "Time's up! Great work." });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, initialDuration, addCoins, toast, hasCompletedTimerSession]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      Notification.requestPermission();
    }
  },[])

  useEffect(() => {
    setTimeRemaining(initialDuration);
    setIsActive(false);
  }, [initialDuration]);
  
  const toggleTimer = useCallback(() => {
    if (timeRemaining > 0) {
      setIsActive(!isActive);
      if (!isActive) {
        // Timer starts
        sessionStartTime.current = Date.now();
      } else {
        // Timer pauses
        sessionStartTime.current = null;
      }
    }
  }, [isActive, timeRemaining]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(initialDuration);
    sessionStartTime.current = null;
  }, [initialDuration]);

  const selectPreset = useCallback((minutes: number) => {
    setInitialDuration(minutes * 60);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative h-48 w-48">
            <svg className="h-full w-full" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                    cx="100"
                    cy="100"
                    r={CIRCLE_RADIUS}
                    fill="none"
                    strokeWidth="15"
                    className="stroke-muted"
                />
                {/* Progress circle */}
                <circle
                    cx="100"
                    cy="100"
                    r={CIRCLE_RADIUS}
                    fill="none"
                    strokeWidth="15"
                    className="stroke-primary transition-all duration-1000 ease-linear animate-pulse-glow"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold font-mono text-primary tabular-nums tracking-wider">
                {formatTime(timeRemaining)}
            </div>
        </div>

       {initialDuration >= 3600 && (
         <p className="text-sm text-muted-foreground text-center px-4">
            That's a long session! Remember to take a short break every hour.
        </p>
      )}

      <div className="w-full space-y-3 px-2">
        <div className="flex w-full justify-center gap-2">
            {PRESETS.map((p) => (
            <Button
                key={p}
                variant={initialDuration / 60 === p && customMinutes === "" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                    selectPreset(p);
                    setCustomMinutes("");
                }}
                className="flex-1"
            >
                {p} min
            </Button>
            ))}
        </div>
        <div className="flex w-full justify-center gap-2">
            <Input 
                type="number"
                placeholder="Custom minutes..."
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetCustomTime()}
                className="bg-background"
            />
            <Button onClick={handleSetCustomTime} variant="secondary">Set</Button>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-2">
        <Button
          onClick={toggleTimer}
          size="lg"
          className={cn("w-24", isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90")}
          disabled={timeRemaining === 0}
        >
          {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button onClick={resetTimer} variant="secondary" size="icon" aria-label="Reset Timer">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
