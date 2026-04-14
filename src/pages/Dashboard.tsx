import { StatCard } from "@/components/StatCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { dashboardStats, recentActivity } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "@/lib/app-settings";

export default function Dashboard() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{settings.dashboardWelcome}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => navigate("/news")}>
            <Plus className="h-4 w-4 mr-1" /> New Article
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground mb-3">Recent Activity</h2>
          <ActivityFeed items={recentActivity} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add News Article", path: "/news" },
              { label: "Add Faculty Member", path: "/faculty" },
              { label: "Create Event", path: "/events" },
              { label: "View Submissions", path: "/submissions" },
              { label: "Upload to Gallery", path: "/gallery" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Plus className="h-3 w-3 text-primary" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
