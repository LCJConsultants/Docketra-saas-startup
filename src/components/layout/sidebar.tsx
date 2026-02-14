"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Receipt,
  Mail,
  FileStack,
  Settings,
  ChevronLeft,
  ChevronRight,
  Scale,
  Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUnreadEmails } from "@/hooks/use-unread-emails";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Cases", href: "/cases", icon: Briefcase },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Time Tracking", href: "/time-tracking", icon: Clock },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Emails", href: "/emails", icon: Mail },
  { name: "Templates", href: "/templates", icon: FileStack },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onAiToggle?: () => void;
}

export function Sidebar({ onAiToggle }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useUnreadEmails();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out",
          collapsed ? "w-[68px]" : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">Docketra</span>
          )}
        </div>

        {/* AI Assistant Button */}
        <div className="px-3 pt-4 pb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onAiToggle}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors bg-accent/20 hover:bg-accent/30 text-accent",
                  collapsed && "justify-center px-0"
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                {!collapsed && <span>AI Assistant</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">AI Assistant</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="flex-1">{item.name}</span>}
                    {item.name === "Emails" && unreadCount > 0 && (
                      collapsed ? (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                      ) : (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.name}
                    {item.name === "Emails" && unreadCount > 0 && ` (${unreadCount})`}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 py-3 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center justify-center w-full rounded-lg p-2 text-white/50 hover:text-white hover:bg-sidebar-accent/50 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
