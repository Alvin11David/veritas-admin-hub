import { StatCard } from "@/components/StatCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { dashboardStats, recentActivity } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  Download,
  Gauge,
  MessageSquareText,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "@/lib/app-settings";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDateString(
  date: Date,
  format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD",
) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  if (format === "DD/MM/YYYY") {
    return `${day}/${month}/${year}`;
  }

  if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }

  return `${month}/${day}/${year}`;
}

function formatTimeString(date: Date, timezone: string, format: "12h" | "24h") {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
    timeZone: timezone,
  }).format(date);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const now = new Date();
  const localInTimezone = new Date(
    now.toLocaleString("en-US", { timeZone: settings.timezone }),
  );
  const formattedDate = formatDateString(localInTimezone, settings.dateFormat);
  const formattedTime = formatTimeString(
    now,
    settings.timezone,
    settings.timeFormat,
  );
  const totalContentModules = dashboardStats.length;
  const activeQuickActions = [
    { label: "Add News Article", path: "/news" },
    { label: "Add Faculty Member", path: "/faculty" },
    { label: "Create Event", path: "/events" },
    { label: "View Submissions", path: "/submissions" },
    { label: "Upload to Gallery", path: "/gallery" },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Overview
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formattedDate}
                </Badge>
              </div>
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {settings.softwareName}
                </h1>
                <p className="text-base text-muted-foreground md:text-lg">
                  {settings.dashboardWelcome}
                </p>
                <p className="text-sm text-muted-foreground">
                  Local system time: {formattedTime} ({settings.timezone})
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <Card className="border-border/70 bg-background/70 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Modules
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {totalContentModules}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Managed sections
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-background/70 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquareText className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Activity
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {recentActivity.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recent updates
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-background/70 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Status
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    Live
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    System ready
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => navigate("/news")}>
              <Plus className="h-4 w-4 mr-1" /> New Article
            </Button>
            <Button variant="outline" className="border-border">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button
              variant="outline"
              className="border-border"
              onClick={() => navigate("/notifications")}
            >
              View Notifications <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
            <CardDescription>
              Latest content and admin changes across the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={recentActivity} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-4 w-4 text-primary" /> Quick Actions
            </CardTitle>
            <CardDescription>Jump into common admin tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeQuickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  {action.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
