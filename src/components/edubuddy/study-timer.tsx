
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";

const PRESETS = [15, 25, 50]; // in minutes

export function StudyTimer() {
  const [duration, setDuration] = useState(25 * 60); // default 25 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      setIsActive(false);
      // Optional: Add a notification or sound
      if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
        new window.Notification("EduBuddy", { body: "Time's up! Great work." });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      Notification.requestPermission();
    }
  },[])

  useEffect(() => {
    setTimeRemaining(duration);
    setIsActive(false);
  }, [duration]);
  
  const toggleTimer = useCallback(() => {
    if (timeRemaining > 0) {
      setIsActive(!isActive);
    }
  }, [isActive, timeRemaining]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(duration);
  }, [duration]);

  const selectPreset = useCallback((minutes: number) => {
    setDuration(minutes * 60);
  }, []);

  const handleSetCustomTime = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
        setDuration(minutes * 60);
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
      <div className="text-5xl font-bold font-mono text-primary tabular-nums tracking-wider">
        {formatTime(timeRemaining)}
      </div>

       {duration >= 3600 && (
         <p className="text-sm text-muted-foreground text-center px-4">
            That's a long session! Remember to take a short break every hour.
        </p>
      )}

      <div className="w-full space-y-3 px-2">
        <div className="flex w-full justify-center gap-2">
            {PRESETS.map((p) => (
            <Button
                key={p}
                variant={duration / 60 === p && customMinutes === "" ? "default" : "outline"}
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
