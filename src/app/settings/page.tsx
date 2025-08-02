
"use client"

import { useTheme } from "next-themes";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Customize your EduBuddy experience.
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
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Toggle dark mode"
                />
              </div>
              
              {/* Other settings can be added here */}
              <div className="text-center text-muted-foreground pt-4">
                  More settings coming soon!
              </div>

            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  );
}
