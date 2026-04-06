import { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable";
import { MediaUpload, MediaFile } from "@/components/MediaUpload";
import { NewsArticle } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { db } from "@/config/firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function NewsPage() {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch articles from Firestore on mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "NewsArticles"));
      const querySnapshot = await getDocs(q);
      const articles: NewsArticle[] = [];

      querySnapshot.forEach((doc) => {
        articles.push({
          id: doc.id,
          ...(doc.data() as Omit<NewsArticle, "id">),
        });
      });

      // Sort by creation date (newest first)
      articles.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setData(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      excerpt: "",
      content: "",
      published: false,
      media: [],
    });
    setDialogOpen(true);
  };

  const openEdit = (item: NewsArticle) => {
    setEditing(item);
    setForm({ ...item, media: item.media || [] });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.excerpt || !form.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editing) {
        // Update existing article
        const docRef = doc(db, "NewsArticles", editing.id);
        await updateDoc(docRef, {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          published: form.published,
          media: form.media || [],
          updatedAt: new Date().toISOString().split("T")[0],
        });
        toast.success("Article updated");
      } else {
        // Create new article
        await addDoc(collection(db, "NewsArticles"), {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          published: form.published || false,
          featuredImage: "",
          media: form.media || [],
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        });
        toast.success("Article created");
      }

      await fetchArticles();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article");
    } finally {
      setSubmitting(false);
    }
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

  const handleDelete = async (item: NewsArticle) => {
    try {
      const docRef = doc(db, "NewsArticles", item.id);
      await deleteDoc(docRef);
      toast.success("Article deleted");
      await fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="News & Articles"
          data={data}
          searchKey="title"
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            {
              key: "title",
              label: "Title",
              render: (item) => (
                <span className="font-medium">{item.title}</span>
              ),
            },
            {
              key: "excerpt",
              label: "Excerpt",
              render: (item) => (
                <span className="text-muted-foreground truncate max-w-[200px] block">
                  {item.excerpt}
                </span>
              ),
            },
            {
              key: "media",
              label: "Media",
              render: (item) => (
                <span className="text-sm text-muted-foreground">
                  {item.media?.length || 0} files
                </span>
              ),
            },
            {
              key: "published",
              label: "Status",
              render: (item) => (
                <Badge
                  variant={item.published ? "default" : "secondary"}
                  className={
                    item.published ? "bg-success/20 text-success border-0" : ""
                  }
                >
                  {item.published ? "Published" : "Draft"}
                </Badge>
              ),
            },
            { key: "createdAt", label: "Created" },
          ]}
        />
      )}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !submitting && setDialogOpen(open)}
      >
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Article" : "New Article"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                type="text"
                placeholder="Article title"
                value={form.title ?? ""}
                onChange={(e) =>
                  !submitting &&
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                disabled={submitting}
                className="bg-secondary border-border"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Excerpt</Label>
              <Input
                type="text"
                placeholder="Brief description"
                value={form.excerpt ?? ""}
                onChange={(e) =>
                  !submitting &&
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                disabled={submitting}
                className="bg-secondary border-border"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Content</Label>
              <Textarea
                placeholder="Full article content..."
                value={form.content ?? ""}
                onChange={(e) =>
                  !submitting &&
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                disabled={submitting}
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>

            {/* Published Toggle */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Published</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!form.published}
                  onCheckedChange={(v) =>
                    !submitting && setForm((f) => ({ ...f, published: v }))
                  }
                  disabled={submitting}
                />
                <span className="text-sm text-foreground">
                  {form.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-sm text-muted-foreground">
                Images & Videos
              </Label>
              <MediaUpload
                articleId={editing?.id || "new"}
                media={form.media || []}
                onMediaAdded={handleMediaAdded}
                onMediaRemoved={handleMediaRemoved}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="border-border"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Article"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
