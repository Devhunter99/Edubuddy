import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>About EduBuddy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>EduBuddy is your AI-powered study partner, designed to help you learn more effectively.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarInset>
  );
}
