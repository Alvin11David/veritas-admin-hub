import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  action?: string;
  target?: string;
  user?: string;
  type: "create" | "update" | "delete";
  module:
    | "faculty"
    | "events"
    | "programs"
    | "gallery"
    | "faqs"
    | "quick-links"
    | "research"
    | "alumni"
    | "scholarships"
    | "student-stories";
  timestamp?: string;
  createdAt?: string;
}

const typeConfig = {
  create: { icon: Plus, color: "text-success", label: "Created", accent: "border-l-success" },
  update: { icon: Pencil, color: "text-info", label: "Updated", accent: "border-l-info" },
  delete: { icon: Trash2, color: "text-destructive", label: "Deleted", accent: "border-l-destructive" },
};

function formatTimestamp(value?: string) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleString();
}

function asText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toLowerText(value: unknown) {
  return asText(value).toLowerCase();
}

function getActionText(item: NotificationItem) {
  const action = asText(item.action);
  if (action) return action.toLowerCase();

  if (item.type === "update") return "updated";
  if (item.type === "delete") return "deleted";
  return "created";
}

function getModuleText(item: NotificationItem) {
  return asText(item.module, "unknown module");
}

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "notifications")));
      const notifications: NotificationItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data() as Partial<Omit<NotificationItem, "id">>;

        notifications.push({
          id: snapshotDoc.id,
          action: asText(data.action),
          target: asText(data.target),
          user: asText(data.user, "Admin"),
          type: data.type === "update" || data.type === "delete" ? data.type : "create",
          module: data.module ?? "faculty",
          timestamp: asText(data.timestamp),
          createdAt: asText(data.createdAt),
        });
      });

      notifications.sort((a, b) => {
        const aTime = a.timestamp || a.createdAt || "";
        const bTime = b.timestamp || b.createdAt || "";
        return bTime.localeCompare(aTime);
      });

      setData(notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return data.filter((item) => {
      return (
        toLowerText(item.target).includes(term) ||
        toLowerText(item.action).includes(term) ||
        toLowerText(item.module).includes(term)
      );
    });
  }, [data, search]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/70 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardContent className="p-6 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  Activity Stream
                </Badge>
                <Badge variant="outline">
                  {filtered.length} visible
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Notifications
                </h1>
                <CardDescription className="max-w-2xl text-sm md:text-base">
                  Track content changes across the admin workspace with a clearer, more readable activity feed.
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.length} total activity item{data.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 border-border/70 bg-background pl-9 shadow-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">Loading notifications</p>
                <p className="text-sm text-muted-foreground">Fetching the latest activity from Firestore.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const config = typeConfig[item.type] || typeConfig.create;
            const Icon = config.icon;

            return (
              <Card
                key={item.id}
                className={`border-border/70 border-l-4 ${config.accent} bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary ${config.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em]">
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em]">
                          {getModuleText(item)}
                        </Badge>
                      </div>

                      <p className="text-sm leading-6 text-foreground">
                        <span className="font-medium text-muted-foreground">
                          {item.user || "Admin"}
                        </span>{" "}
                        {getActionText(item)} {item.target || `an item in ${getModuleText(item)}`}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary/70 px-2.5 py-1">
                          {formatTimestamp(item.timestamp || item.createdAt)}
                        </span>
                        <span className="rounded-full bg-secondary/70 px-2.5 py-1">
                          ID {item.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card className="border-dashed border-border bg-card/70">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">No notifications found</p>
                  <p className="text-sm text-muted-foreground">
                    Try a different search term or wait for new activity to appear.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
