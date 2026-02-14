import { getProfile, updateNotificationPrefsAction } from "@/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface NotificationPrefs {
  email: boolean;
  in_app: boolean;
  digest: boolean;
  notify_deadlines?: boolean;
  notify_court_dates?: boolean;
  notify_filings?: boolean;
  notify_meetings?: boolean;
  notify_sol?: boolean;
}

export default async function NotificationSettingsPage() {
  const profile = await getProfile();
  const prefs = profile.notification_preferences as NotificationPrefs;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Notification Settings" description="Configure how you receive alerts" />

      <form action={updateNotificationPrefsAction}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Methods</CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                </div>
                <Select name="email_notifications" defaultValue={prefs.email ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground">Show notifications in the app</p>
                </div>
                <Select name="in_app_notifications" defaultValue={prefs.in_app ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Daily Digest</p>
                  <p className="text-xs text-muted-foreground">Morning summary of today&apos;s events and deadlines</p>
                </div>
                <Select name="digest_notifications" defaultValue={prefs.digest ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Types</CardTitle>
              <CardDescription>Choose which event types trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Deadlines</p>
                  <p className="text-xs text-muted-foreground">Filing deadlines and due dates</p>
                </div>
                <Select name="notify_deadlines" defaultValue={prefs.notify_deadlines !== false ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Court Dates</p>
                  <p className="text-xs text-muted-foreground">Hearings and court appearances</p>
                </div>
                <Select name="notify_court_dates" defaultValue={prefs.notify_court_dates !== false ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Filings</p>
                  <p className="text-xs text-muted-foreground">Document filing reminders</p>
                </div>
                <Select name="notify_filings" defaultValue={prefs.notify_filings !== false ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Meetings</p>
                  <p className="text-xs text-muted-foreground">Client and team meetings</p>
                </div>
                <Select name="notify_meetings" defaultValue={prefs.notify_meetings !== false ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Statute of Limitations</p>
                  <p className="text-xs text-muted-foreground">SOL expiration warnings</p>
                </div>
                <Select name="notify_sol" defaultValue={prefs.notify_sol !== false ? "true" : "false"}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit">Save Preferences</Button>
        </div>
      </form>
    </div>
  );
}
