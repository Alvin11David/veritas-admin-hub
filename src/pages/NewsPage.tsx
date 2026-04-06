import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { FormDialog, FormField } from "@/components/FormDialog";
import { mockNews, NewsArticle } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const fields: FormField[] = [
  { key: "title", label: "Title", type: "text", placeholder: "Article title" },
  { key: "excerpt", label: "Excerpt", type: "text", placeholder: "Brief description" },
  { key: "content", label: "Content", type: "textarea", placeholder: "Full article content..." },
  { key: "published", label: "Published", type: "toggle" },
];

export default function NewsPage() {
  const [data, setData] = useState<NewsArticle[]>(mockNews);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", published: false });
    setDialogOpen(true);
  };

  const openEdit = (item: NewsArticle) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
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
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setData((d) => [newItem, ...d]);
      toast.success("Article created");
    }
    setDialogOpen(false);
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
    </>
  );
}
