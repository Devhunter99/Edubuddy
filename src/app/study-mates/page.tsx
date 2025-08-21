
"use client";

import Link from "next/link";
import AppHeader from "@/components/rewisepanda/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// This page is now deprecated in favor of the /community page with tabs.
// This component redirects users to the new community page.
export default function DeprecatedStudyMatesPage() {

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">This page has moved!</h1>
            <p className="text-muted-foreground mt-2">Study Mates are now part of the Community page.</p>
            <Link href="/community?tab=mates" passHref>
                <Button className="mt-4">Go to Community</Button>
            </Link>
          </div>
        </main>
      </div>
    </SidebarInset>
  );
}
