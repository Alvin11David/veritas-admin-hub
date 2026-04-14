import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  action: string;
  target: string;
  user: string;
  type: "create" | "update" | "delete";
  module:
    | "faculty"
    | "events"
    | "programs"
    | "gallery"
    | "faqs"
    | "quick-links"
    | "research"
    | "alumni";
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
        notifications.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<NotificationItem, "id">),
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
        (item.target?.toLowerCase() || "").includes(term) ||
        (item.action?.toLowerCase() || "").includes(term) ||
        (item.module?.toLowerCase() || "").includes(term)
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
            const config = typeConfig[item.type];
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
                      {item.action.toLowerCase()}{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Module: {item.module}
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
