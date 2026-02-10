import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getNotifications, markAllNotificationsRead } from "@/actions/notifications";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";

const typeIcon: Record<string, string> = {
  deadline: "bg-amber-100 text-amber-600",
  event: "bg-blue-100 text-blue-600",
  system: "bg-gray-100 text-gray-600",
  ai_complete: "bg-purple-100 text-purple-600",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  async function handleMarkAllRead() {
    "use server";
    await markAllNotificationsRead();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Notifications"
        description="Stay on top of deadlines and updates"
        action={
          <form action={handleMarkAllRead}>
            <Button variant="outline" size="sm" type="submit">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </form>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications about deadlines, events, and AI tasks will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 ${typeIcon[n.type] || typeIcon.system}`}>
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.is_read && (
                        <Badge variant="info" className="text-[10px] px-1.5 py-0">New</Badge>
                      )}
                    </div>
                    {n.message && (
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelative(n.created_at)}
                    </p>
                  </div>
                  {n.link && (
                    <Link href={n.link}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
