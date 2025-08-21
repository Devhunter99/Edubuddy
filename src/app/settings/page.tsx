
"use client"

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AvatarPicker from "@/components/rewisepanda/avatar-picker";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationSettings from "@/components/rewisepanda/notification-settings";
import { Lock } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your Rewise Panda experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                      <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                          Toggle between light and dark themes.
                      </p>
                  </div>
                  {mounted ? (
                    <Switch
                      id="dark-mode"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      aria-label="Toggle dark mode"
                    />
                  ) : (
                    <Skeleton className="h-6 w-11" />
                  )}
                </div>
              </CardContent>
            </Card>

            <AvatarPicker />
            
            <NotificationSettings />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock /> Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your profile information and activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                      <Label htmlFor="profile-privacy" className="text-base font-medium">Private Profile</Label>
                      <p className="text-sm text-muted-foreground">
                          If enabled, only your study mates can view your full profile.
                      </p>
                  </div>
                  <Switch
                    id="profile-privacy"
                    disabled // This is a UI-only change for now
                  />
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                      <Label htmlFor="achievements-visibility" className="text-base font-medium">Show Achievements</Label>
                      <p className="text-sm text-muted-foreground">
                          Allow others to see the achievements you've unlocked.
                      </p>
                  </div>
                  <Switch
                    id="achievements-visibility"
                    defaultChecked
                    disabled // This is a UI-only change for now
                  />
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                      <Label htmlFor="study-time-visibility" className="text-base font-medium">Show Study Time</Label>
                      <p className="text-sm text-muted-foreground">
                          Allow others to see your total study time.
                      </p>
                  </div>
                  <Switch
                    id="study-time-visibility"
                    defaultChecked
                    disabled // This is a UI-only change for now
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>More Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground pt-4">
                    More settings coming soon!
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarInset>
  );
}
