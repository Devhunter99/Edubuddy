
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/edubuddy/app-sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/edubuddy/theme-provider";
import { CoinProvider } from "@/hooks/use-coins";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduBuddy",
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
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CoinProvider>
              <SidebarProvider>
                <div className="flex">
                  <AppSidebar />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            </CoinProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
