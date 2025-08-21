
import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/rewisepanda/app-sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/rewisepanda/theme-provider";
import { RewardProvider } from "@/hooks/use-rewards";
import NotificationManager from "@/services/notification-manager";
import CubbyChat from "@/components/rewisepanda/cubby-chat";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Rewise Panda",
  description: "Your AI-powered study partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${ptSans.variable} font-sans bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RewardProvider>
              <SidebarProvider>
                <div className="flex">
                  <AppSidebar />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                <CubbyChat />
                <NotificationManager />
              </SidebarProvider>
            </RewardProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
