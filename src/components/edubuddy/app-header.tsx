
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { Bell, BookOpen, Clock, Menu, Settings, User, ArrowLeft, LogOut, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudyTimer } from "./study-timer";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useCoins } from "@/hooks/use-coins";
import { Skeleton } from "../ui/skeleton";

export default function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { coins, loading: coinsLoading } = useCoins();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // This needs to be in a useEffect to avoid hydration errors
    setCanGoBack(typeof window !== 'undefined' && window.history.length > 1);
  }, []);

  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';


  const UserMenu = () => {
    if (loading) {
      return null;
    }

    if (user) {
      return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                 <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )
    }

    return (
        <Link href="/login">
            <Button>Login</Button>
        </Link>
    )
  }
  
  const CoinDisplay = () => {
    if (loading || !user) return null;
    return (
      <div className="flex items-center gap-2 bg-amber-400/20 text-amber-600 dark:text-amber-400 font-bold px-3 py-1.5 rounded-full text-sm">
        <Coins className="h-5 w-5" />
        {coinsLoading ? <Skeleton className="h-4 w-6" /> : <span>{coins}</span>}
      </div>
    )
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          {!isAuthPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          {canGoBack && !isHomePage && !isAuthPage &&(
             <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Go back</span>
              </Button>
          )}
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
            EduBuddy
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {!isAuthPage && (
              <>
                <CoinDisplay />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Clock className="h-5 w-5" />
                      <span className="sr-only">Open Study Timer</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <StudyTimer />
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">View Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem>
                        <div className="flex flex-col p-2 text-sm text-muted-foreground">
                            <span>No new notifications.</span>
                        </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </>
          )}

          <UserMenu />

        </div>
      </div>
    </header>
  );
}
