
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Library,
  Settings,
  Info,
  PanelLeft,
  BookOpen,
  PieChart,
  Timer,
  LogOut,
  Star,
  Music,
  Users,
  User,
  Trophy,
} from "lucide-react";
import { Button } from "../ui/button";
import { SheetHeader, SheetTitle } from "../ui/sheet";
import React from "react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/subjects", label: "Subjects", icon: Library },
  { href: "/study-timer", label: "Study Timer", icon: Timer },
  { href: "/study-music", label: "Study Music", icon: Music },
  { href: "/results", label: "Results", icon: PieChart },
  { href: "/rewards", label: "Rewards", icon: Star },
  { href: "/study-mates", label: "Study Mates", icon: Users },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

const bottomMenuItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/about", label: "About", icon: Info },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const [isClient, setIsClient] = React.useState(false);
  const { user, logout, loading } = useAuth();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/subjects") return pathname.startsWith('/subject') || pathname === '/subjects';
    if (href.startsWith("/profile")) return pathname.startsWith('/profile');
    if (href === "/achievements") return pathname === "/achievements";
    return pathname.startsWith(href);
  };

  const desktopHeader = (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground group-data-[collapsed=true]:hidden">
                Rewise Panda
            </h1>
        </div>
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
  );

  const mobileHeader = (
     <SheetHeader>
        <SheetTitle className="sr-only">Main Menu</SheetTitle>
        <div className="flex items-center gap-2 p-4">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Rewise Panda
            </h1>
        </div>
      </SheetHeader>
  );

  return (
    <Sidebar>
       <SidebarHeader>
        {isClient && isMobile ? mobileHeader : desktopHeader}
      </SidebarHeader>

      <SidebarContent className="justify-between">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsed=true]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {!loading && user && (
               <SidebarMenuItem>
                 <Link href={`/profile/${user.uid}`} passHref onClick={handleLinkClick}>
                    <SidebarMenuButton
                        isActive={isActive(`/profile/${user.uid}`)}
                        tooltip="Profile"
                    >
                        <User className="h-5 w-5" />
                        <span className="group-data-[collapsed=true]:hidden">Profile</span>
                    </SidebarMenuButton>
                 </Link>
                </SidebarMenuItem>
          )}
        </SidebarMenu>

        <SidebarMenu>
          {!loading && user && (
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => { logout(); handleLinkClick(); }} tooltip="Logout">
                    <LogOut className="h-5 w-5" />
                    <span className="group-data-[collapsed=true]:hidden">Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsed=true]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  );
}
