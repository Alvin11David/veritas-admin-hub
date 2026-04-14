import { useEffect, useMemo, useState } from "react";
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
  create: { icon: Plus, color: "text-success" },
  update: { icon: Pencil, color: "text-info" },
  delete: { icon: Trash2, color: "text-destructive" },
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} total activity item{data.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border h-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-72">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const config = typeConfig[item.type] || typeConfig.create;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-1.5 rounded-md bg-secondary ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">
                        {item.user || "Admin"}
                      </span>{" "}
                      {getActionText(item)} {item.target || `an item in ${getModuleText(item)}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Module: {getModuleText(item)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(item.timestamp || item.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              No notifications found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
