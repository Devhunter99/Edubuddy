
import AppHeader from "@/components/rewisepanda/app-header";
import { StudyTimer } from "@/components/rewisepanda/study-timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Timer } from "lucide-react";

export default function StudyTimerPage() {
  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Timer className="h-10 w-10 text-primary" />
                </div>
              <CardTitle className="text-2xl">Study Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <StudyTimer />
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  );
}
