import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { FormDialog, FormField } from "@/components/FormDialog";
import { MediaUpload, MediaFile } from "@/components/MediaUpload";
import { mockNews, NewsArticle } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

const fields: FormField[] = [
  { key: "title", label: "Title", type: "text", placeholder: "Article title" },
  { key: "excerpt", label: "Excerpt", type: "text", placeholder: "Brief description" },
  { key: "content", label: "Content", type: "textarea", placeholder: "Full article content..." },
  { key: "published", label: "Published", type: "toggle" },
];

export default function NewsPage() {
  const [data, setData] = useState<NewsArticle[]>(mockNews);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", published: false, media: [] });
    setDialogOpen(true);
  };

  const openEdit = (item: NewsArticle) => {
    setEditing(item);
    setForm({ ...item, media: item.media || [] });
    setDialogOpen(true);
  };

  const openMediaManager = (item: NewsArticle) => {
    setEditing(item);
    setForm({ ...item, media: item.media || [] });
    setMediaDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      setData((d) => d.map((i) => (i.id === editing.id ? { ...i, ...form, updatedAt: new Date().toISOString().split("T")[0] } : i)));
      toast.success("Article updated");
    } else {
      const newItem: NewsArticle = {
        ...form as any,
        id: Date.now().toString(),
        featuredImage: "",
        media: [],
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setData((d) => [newItem, ...d]);
      toast.success("Article created");
    }
    setDialogOpen(false);
  };

  const handleMediaAdded = (media: MediaFile) => {
    setForm((f) => ({
      ...f,
      media: [...(f.media || []), media],
    }));
  };

  const handleMediaRemoved = (mediaId: string) => {
    setForm((f) => ({
      ...f,
      media: (f.media || []).filter((m: MediaFile) => m.id !== mediaId),
    }));
  };

  const handleSaveMedia = () => {
    if (editing) {
      setData((d) => d.map((i) => (i.id === editing.id ? { ...i, media: form.media || [] } : i)));
      toast.success("Media updated");
    }
    setMediaDialogOpen(false);
  };

  const handleDelete = (item: NewsArticle) => {
    setData((d) => d.filter((i) => i.id !== item.id));
    toast.success("Article deleted");
  };

  return (
    <>
      <DataTable
        title="News & Articles"
        data={data}
        searchKey="title"
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { key: "title", label: "Title", render: (item) => <span className="font-medium">{item.title}</span> },
          { key: "excerpt", label: "Excerpt", render: (item) => <span className="text-muted-foreground truncate max-w-[200px] block">{item.excerpt}</span> },
          { key: "media", label: "Media", render: (item) => (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{item.media?.length || 0} files</span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openMediaManager(item);
                }}
              >
                Manage
              </Button>
            </div>
          )},
          { key: "published", label: "Status", render: (item) => (
            <Badge variant={item.published ? "default" : "secondary"} className={item.published ? "bg-success/20 text-success border-0" : ""}>
              {item.published ? "Published" : "Draft"}
            </Badge>
          )},
          { key: "createdAt", label: "Created" },
        ]}
      />
      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Article" : "New Article"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onSubmit={handleSubmit}
      />

      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Media - {editing?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MediaUpload
              articleId={editing?.id || ""}
              media={form.media || []}
              onMediaAdded={handleMediaAdded}
              onMediaRemoved={handleMediaRemoved}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMediaDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMedia}>
                Save Media
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
