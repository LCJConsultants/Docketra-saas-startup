import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Profile should be auto-created by trigger, but just in case
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email!,
      })
      .select()
      .single();
    profile = newProfile;
  }

  return (
    <DashboardShell
      user={profile ? {
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
      } : null}
    >
      {children}
    </DashboardShell>
  );
}
