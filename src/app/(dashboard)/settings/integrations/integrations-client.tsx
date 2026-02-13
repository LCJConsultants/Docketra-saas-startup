"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, Mail, HardDrive, Check, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";
import { disconnectIntegration } from "@/actions/settings";

interface IntegrationsClientProps {
  googleConnected: boolean;
  outlookConnected: boolean;
  dropboxConnected: boolean;
  success?: string;
  error?: string;
}

const integrations = [
  {
    id: "google" as const,
    name: "Google (Drive + Gmail)",
    description:
      "Connect your Google account to sync documents via Google Drive and send/receive emails through Gmail. One connection covers both services.",
    icon: Cloud,
    authUrl: "/api/integrations/google/auth",
  },
  {
    id: "outlook" as const,
    name: "Microsoft Outlook",
    description:
      "Connect your Microsoft account to send and receive emails through Outlook directly from Docketra.",
    icon: Mail,
    authUrl: "/api/integrations/outlook/auth",
  },
  {
    id: "dropbox" as const,
    name: "Dropbox",
    description:
      "Connect your Dropbox account to import and sync files. Keep your legal documents organized across platforms.",
    icon: HardDrive,
    authUrl: null, // Coming soon
  },
];

export function IntegrationsClient({
  googleConnected,
  outlookConnected,
  dropboxConnected,
  success,
  error,
}: IntegrationsClientProps) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const connectionStatus: Record<string, boolean> = {
    google: googleConnected,
    outlook: outlookConnected,
    dropbox: dropboxConnected,
  };

  useEffect(() => {
    if (success === "google") {
      toast.success("Google account connected successfully!");
    } else if (success === "outlook") {
      toast.success("Outlook account connected successfully!");
    }
    if (error) {
      toast.error(`Connection failed: ${error}`);
    }
  }, [success, error]);

  const handleConnect = (authUrl: string | null) => {
    if (!authUrl) {
      toast.info("This integration is coming soon!");
      return;
    }
    window.location.href = authUrl;
  };

  const handleDisconnect = async (provider: "google" | "outlook" | "dropbox") => {
    setDisconnecting(provider);
    try {
      await disconnectIntegration(provider);
      toast.success("Disconnected successfully");
      router.refresh();
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect third-party services to enhance your workflow"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = connectionStatus[integration.id];
          const isDisconnecting = disconnecting === integration.id;

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {integration.name}
                      </CardTitle>
                    </div>
                  </div>
                  {isConnected ? (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not connected</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-sm">
                  {integration.description}
                </CardDescription>
              </CardContent>

              <CardFooter className="flex justify-between">
                {isConnected ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDisconnect(integration.id)}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(integration.authUrl)}
                    disabled={!integration.authUrl}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {integration.authUrl ? "Connect" : "Coming Soon"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
