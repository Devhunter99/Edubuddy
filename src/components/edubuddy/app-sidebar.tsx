
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Home,
  Library,
  Settings,
  Info,
  PanelLeft,
  BookOpen,
  PieChart,
} from "lucide-react";
import { Button } from "../ui/button";
import { SheetHeader, SheetTitle } from "../ui/sheet";
import React from "react";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/subjects", label: "Subjects", icon: Library },
  { href: "/results", label: "Results", icon: PieChart },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useSidebar();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/subjects") return pathname.startsWith('/subject') || pathname === '/subjects';
    return pathname.startsWith(href);
  };

  const desktopHeader = (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground group-data-[collapsed=true]:hidden">
                EduBuddy
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
                EduBuddy
            </h1>
        </div>
      </SheetHeader>
  );

  return (
    <Sidebar>
       <SidebarHeader>
        {isClient && isMobile ? mobileHeader : desktopHeader}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
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
    </Sidebar>
  );
}
