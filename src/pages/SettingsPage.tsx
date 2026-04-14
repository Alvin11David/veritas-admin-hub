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
import {
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  type DateFormat,
  type TimeFormat,
  useAppSettings,
} from "@/lib/app-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [timezone, setTimezone] = useState(settings.timezone);
  const [dateFormat, setDateFormat] = useState<DateFormat>(settings.dateFormat);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(settings.timeFormat);
  const [maintenanceMode, setMaintenanceMode] = useState(
    settings.maintenanceMode,
  );
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setSoftwareNameInput(settings.softwareName);
    setSoftwareTagline(settings.softwareTagline);
    setDashboardWelcome(settings.dashboardWelcome);
    setShowNotificationDot(settings.showNotificationDot);
    setTimezone(settings.timezone);
    setDateFormat(settings.dateFormat);
    setTimeFormat(settings.timeFormat);
    setMaintenanceMode(settings.maintenanceMode);
  }, [settings]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = setAppSettings({
      softwareName,
      softwareTagline,
      dashboardWelcome,
      showNotificationDot,
      timezone,
      dateFormat,
      timeFormat,
      maintenanceMode,
    });
    setSoftwareNameInput(updated.softwareName);
    setSoftwareTagline(updated.softwareTagline);
    setDashboardWelcome(updated.dashboardWelcome);
    setShowNotificationDot(updated.showNotificationDot);
    setTimezone(updated.timezone);
    setDateFormat(updated.dateFormat);
    setTimeFormat(updated.timeFormat);
    setMaintenanceMode(updated.maintenanceMode);
    setStatusMessage("Settings saved.");
  };

  const onReset = () => {
    const updated = resetAppSettings();
    setSoftwareNameInput(updated.softwareName);
    setSoftwareTagline(updated.softwareTagline);
    setDashboardWelcome(updated.dashboardWelcome);
    setShowNotificationDot(updated.showNotificationDot);
    setTimezone(updated.timezone);
    setDateFormat(updated.dateFormat);
    setTimeFormat(updated.timeFormat);
    setMaintenanceMode(updated.maintenanceMode);
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

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(event) => {
                  setTimezone(event.target.value);
                  if (statusMessage) {
                    setStatusMessage("");
                  }
                }}
                placeholder="UTC"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground">
                Use an IANA timezone value, for example: America/New_York or
                Asia/Manila.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date format</Label>
                <Select
                  value={dateFormat}
                  onValueChange={(value) => {
                    setDateFormat(value as DateFormat);
                    if (statusMessage) {
                      setStatusMessage("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time format</Label>
                <Select
                  value={timeFormat}
                  onValueChange={(value) => {
                    setTimeFormat(value as TimeFormat);
                    if (statusMessage) {
                      setStatusMessage("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === "12h" ? "12-hour" : "24-hour"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

              <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance mode</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shows a global maintenance notice banner across the admin
                    interface.
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => {
                    setMaintenanceMode(checked);
                    if (statusMessage) {
                      setStatusMessage("");
                    }
                  }}
                />
              </div>
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
