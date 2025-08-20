
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellRing } from "lucide-react";
import type { NotificationSettings as SettingsType } from "@/lib/types";

const useNotificationSettings = () => {
    const [settings, setSettings] = useState<SettingsType>({
        enabled: false,
        frequency: 'daily',
        sound: true,
        vibrate: true,
        content: {
            tips: true,
            flashcards: true,
        },
    });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const storedSettings = localStorage.getItem('notificationSettings');
            if (storedSettings) {
                try {
                    const parsed = JSON.parse(storedSettings);
                    setSettings(s => ({...s, ...parsed}));
                } catch (e) {
                    console.error("Failed to parse notification settings", e);
                }
            }
        }
    }, []);

    const updateSettings = (newSettings: Partial<SettingsType>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            if (typeof window !== 'undefined') {
                localStorage.setItem('notificationSettings', JSON.stringify(updated));
                // Dispatch event for notification manager to pick up changes
                window.dispatchEvent(new Event('settings-updated'));
            }
            return updated;
        });
    };
    
    return { settings, updateSettings, isClient };
};

export default function NotificationSettings() {
    const { settings, updateSettings, isClient } = useNotificationSettings();
    const { toast } = useToast();

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast({ title: "Error", description: "This browser does not support desktop notifications.", variant: "destructive"});
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            toast({ title: "Success", description: "Notifications have been enabled." });
            updateSettings({ enabled: true });
        } else {
             toast({ title: "Permission Denied", description: "You have disabled notifications. To enable them, check your browser settings.", variant: "destructive" });
             updateSettings({ enabled: false });
        }
    }

    const handleEnableToggle = (checked: boolean) => {
        if (checked) {
            requestNotificationPermission();
        } else {
            updateSettings({ enabled: false });
        }
    };
    
    const handleTestNotification = () => {
        if (!settings.enabled) {
            toast({ title: "Enable Notifications", description: "Please enable notifications first."});
            return;
        }
        new Notification("Rewise Panda Test", {
            body: "This is a test notification!",
            icon: '/logo.png',
            silent: !settings.sound,
            vibrate: settings.vibrate ? [200, 100, 200] : undefined,
        });
    }

    if (!isClient) {
        return <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                <CardDescription>
                    Receive helpful study tips and flashcards to stay on track.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="notifications-enabled" className="text-base font-medium">Enable Notifications</Label>
                    <Switch
                        id="notifications-enabled"
                        checked={settings.enabled}
                        onCheckedChange={handleEnableToggle}
                    />
                </div>

                <div className={`space-y-6 ${!settings.enabled && 'opacity-50 pointer-events-none'}`}>
                    <div className="grid gap-2">
                        <Label htmlFor="frequency">Frequency</Label>
                         <Select
                            value={settings.frequency}
                            onValueChange={(value: SettingsType['frequency']) => updateSettings({ frequency: value })}
                         >
                            <SelectTrigger id="frequency">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="2-hours">Every 2 Hours</SelectItem>
                                <SelectItem value="4-hours">Every 4 Hours</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Content</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="tips" 
                                checked={settings.content.tips}
                                onCheckedChange={(checked) => updateSettings({ content: {...settings.content, tips: !!checked }})}
                             />
                            <label htmlFor="tips" className="text-sm font-medium leading-none">Study Tips</label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="flashcards" 
                                checked={settings.content.flashcards}
                                onCheckedChange={(checked) => updateSettings({ content: {...settings.content, flashcards: !!checked }})}
                            />
                            <label htmlFor="flashcards" className="text-sm font-medium leading-none">Random Flashcards</label>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Preferences</Label>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="sound"
                                checked={settings.sound}
                                onCheckedChange={(checked) => updateSettings({ sound: checked })}
                             />
                            <label htmlFor="sound">Sound</label>
                        </div>
                         <div className="flex items-center space-x-2">
                             <Switch 
                                id="vibrate"
                                checked={settings.vibrate}
                                onCheckedChange={(checked) => updateSettings({ vibrate: checked })}
                              />
                            <label htmlFor="vibrate">Vibrate</label>
                        </div>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={handleTestNotification}>
                       <BellRing className="mr-2 h-4 w-4" /> Send Test Notification
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
