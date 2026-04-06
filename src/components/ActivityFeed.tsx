import { ActivityItem } from "@/lib/mock-data";
import { Plus, Pencil, Trash2 } from "lucide-react";

const typeConfig = {
  create: { icon: Plus, color: "text-success" },
  update: { icon: Pencil, color: "text-info" },
  delete: { icon: Trash2, color: "text-destructive" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        return (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors">
            <div className={`p-1.5 rounded-md bg-secondary ${config.color}`}>
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">{item.user}</span>{" "}
                {item.action.toLowerCase()}{" "}
                <span className="font-medium">{item.target}</span>
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</span>
          </div>
        );
      })}
    </div>
  );
}
