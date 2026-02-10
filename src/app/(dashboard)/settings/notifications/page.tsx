import { getProfile, updateNotificationPrefsAction } from "@/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NotificationSettingsPage() {
  const profile = await getProfile();
  const prefs = profile.notification_preferences as { email: boolean; in_app: boolean; digest: boolean };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Notification Settings" description="Configure how you receive alerts" />

      <form action={updateNotificationPrefsAction}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
            <CardDescription>Choose which notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts via email</p>
              </div>
              <select
                name="email_notifications"
                defaultValue={prefs.email ? "true" : "false"}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">In-App Notifications</p>
                <p className="text-xs text-muted-foreground">Show notifications in the app</p>
              </div>
              <select
                name="in_app_notifications"
                defaultValue={prefs.in_app ? "true" : "false"}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Daily Digest</p>
                <p className="text-xs text-muted-foreground">Morning summary of today&apos;s events and deadlines</p>
              </div>
              <select
                name="digest_notifications"
                defaultValue={prefs.digest ? "true" : "false"}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <Button type="submit">Save Preferences</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
