
"use client";

import { Bell, BookOpen, Clock, Menu, Settings, User } from "lucide-react";
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
import { StudyTimer } from "./study-timer";
import { useSidebar } from "@/components/ui/sidebar";

export default function AppHeader() {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
            EduBuddy
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
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
                <div className="flex flex-col">
                  <span>Quiz reminder</span>
                  <span className="text-xs text-muted-foreground">
                    Biology Chapter 5 - 10:00 AM
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span>New notes available</span>
                  <span className="text-xs text-muted-foreground">
                    History: The Roman Empire
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
