
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/edubuddy/app-header";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex flex-col items-center justify-center flex-grow text-center p-4">
          <h1 className="text-4xl font-bold mb-4">Welcome to EduBuddy</h1>
          <p className="text-muted-foreground mb-8">
            Your AI-powered study partner.
          </p>
          <Link href="/subjects">
            <Button size="lg">Let's Get Started</Button>
          </Link>
        </main>
      </div>
    </SidebarInset>
  );
}
