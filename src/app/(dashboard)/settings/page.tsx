import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { User, CreditCard, Bell, Plug, ChevronRight } from "lucide-react";

const settingsSections = [
  {
    title: "Profile",
    description: "Manage your personal and firm information",
    href: "/settings/profile",
    icon: User,
  },
  {
    title: "Integrations",
    description: "Connect Google Drive, Dropbox, and email accounts",
    href: "/settings/integrations",
    icon: Plug,
  },
  {
    title: "Billing",
    description: "Manage your subscription and payment methods",
    href: "/settings/billing",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    description: "Configure email and in-app notification preferences",
    href: "/settings/notifications",
    icon: Bell,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="space-y-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{section.title}</h3>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
