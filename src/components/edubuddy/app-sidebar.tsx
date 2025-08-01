
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
  BookOpen,
  Home,
  Library,
  Settings,
  Info,
  PanelLeft,
} from "lucide-react";
import { Button } from "../ui/button";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/subjects", label: "Subjects", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/subjects") return pathname === "/" || pathname.startsWith('/subject');
    return pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1
            className="text-2xl font-bold tracking-tight text-foreground font-headline group-data-[collapsed]:hidden"
          >
            EduBuddy
          </h1>
        </div>
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
                  <span className="group-data-[collapsed]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={toggleSidebar}
        >
          <PanelLeft
            className="transition-transform duration-300 h-5 w-5"
            style={{
              transform: state === "expanded" ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
          <span className="group-data-[collapsed]:hidden">Collapse</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
