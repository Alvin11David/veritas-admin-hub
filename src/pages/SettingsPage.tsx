import { FormEvent, useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAppSettings } from "@/lib/app-settings";

export default function SettingsPage() {
  const { settings, setAppSettings, resetAppSettings } = useAppSettings();
  const [softwareName, setSoftwareNameInput] = useState(settings.softwareName);
  const [softwareTagline, setSoftwareTagline] = useState(
    settings.softwareTagline,
  );
  const [dashboardWelcome, setDashboardWelcome] = useState(
    settings.dashboardWelcome,
  );
  const [showNotificationDot, setShowNotificationDot] = useState(
    settings.showNotificationDot,
  );
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setSoftwareNameInput(settings.softwareName);
    setSoftwareTagline(settings.softwareTagline);
    setDashboardWelcome(settings.dashboardWelcome);
    setShowNotificationDot(settings.showNotificationDot);
  }, [settings]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = setAppSettings({
      softwareName,
      softwareTagline,
      dashboardWelcome,
      showNotificationDot,
    });
    setSoftwareNameInput(updated.softwareName);
    setSoftwareTagline(updated.softwareTagline);
    setDashboardWelcome(updated.dashboardWelcome);
    setShowNotificationDot(updated.showNotificationDot);
    setStatusMessage("Settings saved.");
  };

  const onReset = () => {
    const updated = resetAppSettings();
    setSoftwareNameInput(updated.softwareName);
    setSoftwareTagline(updated.softwareTagline);
    setDashboardWelcome(updated.dashboardWelcome);
    setShowNotificationDot(updated.showNotificationDot);
    setStatusMessage("Settings reset to defaults.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace-level settings for the admin software.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure branding and interface behavior for this admin workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="software-name">Software name</Label>
              <Input
                id="software-name"
                value={softwareName}
                onChange={(event) => {
                  setSoftwareNameInput(event.target.value);
                  if (statusMessage) {
                    setStatusMessage("");
                  }
                }}
                placeholder="Enter software name"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground">
                Empty values automatically fall back to the default name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="software-tagline">Sidebar tagline</Label>
              <Input
                id="software-tagline"
                value={softwareTagline}
                onChange={(event) => {
                  setSoftwareTagline(event.target.value);
                  if (statusMessage) {
                    setStatusMessage("");
                  }
                }}
                placeholder="Admin Panel"
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard-welcome">Dashboard welcome text</Label>
              <Input
                id="dashboard-welcome"
                value={dashboardWelcome}
                onChange={(event) => {
                  setDashboardWelcome(event.target.value);
                  if (statusMessage) {
                    setStatusMessage("");
                  }
                }}
                placeholder="Welcome back, Admin"
                maxLength={120}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="show-notification-dot">
                  Header notification badge
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Show a small status dot on the notification bell in the
                  header.
                </p>
              </div>
              <Switch
                id="show-notification-dot"
                checked={showNotificationDot}
                onCheckedChange={(checked) => {
                  setShowNotificationDot(checked);
                  if (statusMessage) {
                    setStatusMessage("");
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm">
                <Save className="h-4 w-4" /> Save Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <RotateCcw className="h-4 w-4" /> Reset Defaults
              </Button>
            </div>
            {statusMessage && (
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
