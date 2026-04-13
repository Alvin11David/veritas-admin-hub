import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { FormDialog, FormField } from "@/components/FormDialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { db } from "@/config/firebase";
import { createAdminNotification } from "@/lib/notifications";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";

interface ResearchItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  link: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ResearchForm {
  title: string;
  category: string;
  summary: string;
  link: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
}

const fields: FormField[] = [
  {
    key: "title",
    label: "Research Title",
    type: "text",
    placeholder: "AI in Higher Education",
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    placeholder: "Technology",
    options: [
      "Technology",
      "Science",
      "Health",
      "Education",
      "Business",
      "Innovation",
    ],
  },
  {
    key: "summary",
    label: "Summary",
    type: "textarea",
    placeholder: "Short description of the research item...",
  },
  {
    key: "link",
    label: "External Link",
    type: "text",
    placeholder: "https://...",
  },
  {
    key: "displayOrder",
    label: "Display Order",
    type: "number",
    placeholder: "1",
  },
  {
    key: "featured",
    label: "Featured",
    type: "toggle",
  },
  {
    key: "active",
    label: "Active",
    type: "toggle",
  },
];

const defaultForm: ResearchForm = {
  title: "",
  category: "Technology",
  summary: "",
  link: "",
  featured: false,
  active: true,
  displayOrder: 1,
};

export default function ResearchPage() {
  const [data, setData] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ResearchItem | null>(null);
  const [form, setForm] = useState<ResearchForm>(defaultForm);

  useEffect(() => {
    void fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "research")));
      const items: ResearchItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        items.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<ResearchItem, "id">),
        });
      });

      items.sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return a.title.localeCompare(b.title);
      });

      setData(items);
    } catch (error) {
      console.error("Error loading research:", error);
      toast.error("Failed to load research items");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, displayOrder: data.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (item: ResearchItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      category: item.category,
      summary: item.summary,
      link: item.link,
      featured: item.featured,
      active: item.active,
      displayOrder: item.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.summary || !form.link) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title,
        category: form.category,
        summary: form.summary,
        link: form.link,
        featured: !!form.featured,
        active: !!form.active,
        displayOrder: Number(form.displayOrder) || 1,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "research", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.title,
            type: "update",
            module: "research",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Research item updated");
      } else {
        await addDoc(collection(db, "research"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.title,
            type: "create",
            module: "research",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Research item created");
      }

      await fetchResearch();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving research item:", error);
      toast.error("Failed to save research item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: ResearchItem) => {
    try {
      await deleteDoc(doc(db, "research", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.title,
          type: "delete",
          module: "research",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Research item deleted");
      await fetchResearch();
    } catch (error) {
      console.error("Error deleting research item:", error);
      toast.error("Failed to delete research item");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading research...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Research"
          data={data}
          searchKey="title"
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            {
              key: "title",
              label: "Title",
              render: (item) => <span className="font-medium">{item.title}</span>,
            },
            {
              key: "category",
              label: "Category",
              render: (item) => <span className="text-muted-foreground">{item.category}</span>,
            },
            {
              key: "link",
              label: "Link",
              render: (item) => (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Open link
                </a>
              ),
            },
            {
              key: "featured",
              label: "Featured",
              render: (item) => (
                <Badge
                  variant={item.featured ? "default" : "secondary"}
                  className={item.featured ? "bg-success/20 text-success border-0" : ""}
                >
                  {item.featured ? "Yes" : "No"}
                </Badge>
              ),
            },
          ]}
        />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Research Item" : "New Research Item"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v as never }))}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Saving..." : "Save"}
        disabled={submitting}
      />
    </>
  );
}
