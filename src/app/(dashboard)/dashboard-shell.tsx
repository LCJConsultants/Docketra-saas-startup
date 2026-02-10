"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AIChatPanel } from "@/components/layout/ai-chat-panel";

interface DashboardShellProps {
  user: {
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onMenuToggle={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>

      <AIChatPanel open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}
