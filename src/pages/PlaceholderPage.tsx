import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  const location = useLocation();
  const name = location.pathname.slice(1).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Page";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <Construction className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{name}</h1>
      <p className="text-muted-foreground max-w-md">This section is ready for content management. Full CRUD functionality coming soon.</p>
    </div>
  );
}
