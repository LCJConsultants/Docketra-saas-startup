"use client";

import { useState } from "react";
import { Cloud, HardDrive, ExternalLink, Check, Loader2 } from "lucide-react";
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

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description:
      "Connect your Google Drive to sync documents automatically. Access and manage your Drive files directly from Docketra.",
    icon: Cloud,
    connected: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description:
      "Connect your Dropbox account to import and sync files. Keep your legal documents organized across platforms.",
    icon: HardDrive,
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setLoadingId(id);

    // Simulate a brief delay for the placeholder action
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    setLoadingId(null);
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
          const isLoading = loadingId === integration.id;

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                  </div>
                  {integration.connected ? (
                    <Badge variant="success" className="flex items-center gap-1">
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
                <Button
                  variant={integration.connected ? "destructive" : "default"}
                  onClick={() => handleToggle(integration.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {integration.connected ? "Disconnecting..." : "Connecting..."}
                    </>
                  ) : integration.connected ? (
                    "Disconnect"
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Info note */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Integration connections are placeholder implementations. To enable real
            connectivity, configure OAuth credentials in your environment variables and
            connect the respective SDKs in <code className="text-xs">src/lib/google.ts</code>{" "}
            and <code className="text-xs">src/lib/dropbox.ts</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
