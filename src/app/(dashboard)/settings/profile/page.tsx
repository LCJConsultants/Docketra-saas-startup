import { getProfile, updateProfileAction } from "@/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function ProfileSettingsPage() {
  const profile = await getProfile();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" description="Your personal and firm information" />

      <form action={updateProfileAction}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm_name">Firm Name</Label>
                <Input id="firm_name" name="firm_name" defaultValue={profile.firm_name || ""} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={profile.phone || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bar_number">Bar Number</Label>
                <Input id="bar_number" name="bar_number" defaultValue={profile.bar_number || ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice_areas">Practice Areas (comma-separated)</Label>
              <Input
                id="practice_areas"
                name="practice_areas"
                placeholder="criminal, civil, family"
                defaultValue={profile.practice_areas?.join(", ") || ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>

            <Button type="submit">Save Changes</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
