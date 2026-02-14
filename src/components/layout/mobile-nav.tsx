"use client";

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
  X,
  Scale,
  Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadEmails();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar text-sidebar-foreground lg:hidden">
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Docketra</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 pt-4 pb-2">
            <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium bg-accent/20 hover:bg-accent/30 text-accent">
              <Sparkles className="h-4 w-4" />
              <span>AI Assistant</span>
            </button>
          </div>

          <nav className="px-3 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-white/70 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.name === "Emails" && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}
