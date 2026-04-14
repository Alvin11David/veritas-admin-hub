import { FormEvent, useEffect, useState } from "react";
import {
  Bell,
  Clock3,
  Paintbrush,
  Save,
  RotateCcw,
  Wrench,
  Globe,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
  const [studentPortalName, setStudentPortalName] = useState(
    settings.studentPortalName,
  );
  const [organizationMission, setOrganizationMission] = useState(
    settings.organizationMission,
  );
  const [organizationEmail, setOrganizationEmail] = useState(
    settings.organizationEmail,
  );
  const [organizationPhone, setOrganizationPhone] = useState(
    settings.organizationPhone,
  );
  const [organizationWhatsappCta, setOrganizationWhatsappCta] = useState(
    settings.organizationWhatsappCta,
  );
  const [organizationAddress, setOrganizationAddress] = useState(
    settings.organizationAddress,
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
    setStudentPortalName(settings.studentPortalName);
    setOrganizationMission(settings.organizationMission);
    setOrganizationEmail(settings.organizationEmail);
    setOrganizationPhone(settings.organizationPhone);
    setOrganizationWhatsappCta(settings.organizationWhatsappCta);
    setOrganizationAddress(settings.organizationAddress);
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
      studentPortalName,
      organizationMission,
      organizationEmail,
      organizationPhone,
      organizationWhatsappCta,
      organizationAddress,
    });
    setSoftwareNameInput(updated.softwareName);
    setSoftwareTagline(updated.softwareTagline);
    setDashboardWelcome(updated.dashboardWelcome);
    setShowNotificationDot(updated.showNotificationDot);
    setTimezone(updated.timezone);
    setDateFormat(updated.dateFormat);
    setTimeFormat(updated.timeFormat);
    setMaintenanceMode(updated.maintenanceMode);
    setStudentPortalName(updated.studentPortalName);
    setOrganizationMission(updated.organizationMission);
    setOrganizationEmail(updated.organizationEmail);
    setOrganizationPhone(updated.organizationPhone);
    setOrganizationWhatsappCta(updated.organizationWhatsappCta);
    setOrganizationAddress(updated.organizationAddress);
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
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Workspace Configuration
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Settings
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Fine-tune branding, display format, and admin interface behavior
                from one place.
              </p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-background/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Current software name
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {softwareName || "Application Management"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="h-full border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paintbrush className="h-4 w-4 text-primary" /> Branding
              </CardTitle>
              <CardDescription>
                Control the identity labels shown across navigation and
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  Empty value falls back to default automatically.
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
                <Label htmlFor="dashboard-welcome">
                  Dashboard welcome text
                </Label>
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
            </CardContent>
          </Card>

          <Card className="h-full border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock3 className="h-4 w-4 text-primary" /> Regional & Date Time
              </CardTitle>
              <CardDescription>
                Set timezone and date/time format used in dashboard displays.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  Use IANA format, such as America/New_York or Asia/Manila.
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
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-4 w-4 text-primary" /> Interface Controls
            </CardTitle>
            <CardDescription>
              Toggle global behaviors for the admin navigation and status
              messaging.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="space-y-1">
                <Label
                  htmlFor="show-notification-dot"
                  className="flex items-center gap-2"
                >
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" /> Header
                  notification badge
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show a small status dot on the top-right notification bell.
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

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="space-y-1">
                <Label htmlFor="maintenance-mode">Maintenance mode</Label>
                <p className="text-xs text-muted-foreground">
                  Show a global maintenance banner across the admin interface.
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

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" className="min-w-36">
                <Save className="h-4 w-4" /> Save Settings
              </Button>
              <Button type="button" variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4" /> Reset Defaults
              </Button>
              {statusMessage && (
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
