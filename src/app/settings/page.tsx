
"use client"

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AvatarPicker from "@/components/edubuddy/avatar-picker";
import { Skeleton } from "@/components/ui/skeleton";

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
                  Customize the look and feel of your EduBuddy experience.
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
