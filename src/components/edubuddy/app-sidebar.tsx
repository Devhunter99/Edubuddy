
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
        <div className="flex items-center justify-end w-full">
          <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              >
              <PanelLeft
                  className="transition-transform duration-300 h-5 w-5"
                  style={{
                  transform: state === "expanded" ? "rotate(180deg)" : "rotate(0deg)",
                  }}
              />
                <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSeparator />
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
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  );
}
