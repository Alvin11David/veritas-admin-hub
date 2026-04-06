import { useState } from "react";
import { mockContacts, ContactSubmission } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Eye, CheckCircle, Mail } from "lucide-react";
import { toast } from "sonner";

export default function SubmissionsPage() {
  const [data, setData] = useState<ContactSubmission[]>(mockContacts);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<ContactSubmission | null>(null);

  const filtered = data.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase())
  );

  const markRead = (id: string) => {
    setData((d) => d.map((i) => (i.id === id ? { ...i, read: true } : i)));
    toast.success("Marked as read");
  };

  const markResponded = (id: string) => {
    setData((d) => d.map((i) => (i.id === id ? { ...i, responded: true, read: true } : i)));
    toast.success("Marked as responded");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">{data.filter((d) => !d.read).length} unread</p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border h-9" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border p-4 transition-colors cursor-pointer hover:border-primary/30 ${
              item.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
            }`}
            onClick={() => { setViewing(item); if (!item.read) markRead(item.id); }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!item.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground">({item.email})</span>
                </div>
                <p className="text-sm font-medium text-foreground/80">{item.subject}</p>
                <p className="text-sm text-muted-foreground truncate mt-1">{item.message}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.responded && <Badge className="bg-success/20 text-success border-0">Responded</Badge>}
                <span className="text-xs text-muted-foreground">{item.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{viewing?.subject}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">From:</span> <span className="text-foreground">{viewing.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-primary">{viewing.email}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground">{viewing.createdAt}</span></div>
              </div>
              <div className="p-3 rounded-md bg-secondary">
                <p className="text-sm text-foreground whitespace-pre-wrap">{viewing.message}</p>
              </div>
              <div className="flex justify-end gap-2">
                {!viewing.responded && (
                  <Button size="sm" variant="outline" onClick={() => { markResponded(viewing.id); setViewing(null); }}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Responded
                  </Button>
                )}
                <Button size="sm" asChild>
                  <a href={`mailto:${viewing.email}`}><Mail className="h-4 w-4 mr-1" /> Reply</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
