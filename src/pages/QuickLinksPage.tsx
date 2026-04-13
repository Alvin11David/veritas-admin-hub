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

interface QuickLinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  displayOrder: number;
  openInNewTab: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface QuickLinkForm {
  title: string;
  url: string;
  category: string;
  displayOrder: number;
  openInNewTab: boolean;
  active: boolean;
}

const fields: FormField[] = [
  {
    key: "title",
    label: "Link Title",
    type: "text",
    placeholder: "Admissions Portal",
  },
  {
    key: "url",
    label: "URL",
    type: "text",
    placeholder: "https://...",
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    placeholder: "Admissions",
    options: ["Admissions", "Academics", "Resources", "Support", "General"],
  },
  {
    key: "displayOrder",
    label: "Display Order",
    type: "number",
    placeholder: "1",
  },
  {
    key: "openInNewTab",
    label: "Open In New Tab",
    type: "toggle",
  },
  {
    key: "active",
    label: "Active",
    type: "toggle",
  },
];

const defaultForm: QuickLinkForm = {
  title: "",
  url: "",
  category: "General",
  displayOrder: 1,
  openInNewTab: true,
  active: true,
};

export default function QuickLinksPage() {
  const [data, setData] = useState<QuickLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuickLinkItem | null>(null);
  const [form, setForm] = useState<QuickLinkForm>(defaultForm);

  useEffect(() => {
    void fetchQuickLinks();
  }, []);

  const fetchQuickLinks = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "quickLinks")));
      const links: QuickLinkItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        links.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<QuickLinkItem, "id">),
        });
      });

      links.sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return a.title.localeCompare(b.title);
      });

      setData(links);
    } catch (error) {
      console.error("Error loading quick links:", error);
      toast.error("Failed to load quick links");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, displayOrder: data.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (item: QuickLinkItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      url: item.url,
      category: item.category,
      displayOrder: item.displayOrder,
      openInNewTab: item.openInNewTab,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.url || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        url: form.url,
        category: form.category,
        displayOrder: Number(form.displayOrder) || 1,
        openInNewTab: !!form.openInNewTab,
        active: !!form.active,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "quickLinks", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.title,
            type: "update",
            module: "quick-links",
          });
        } catch (notificationError) {
          console.error(
            "Error creating activity notification:",
            notificationError,
          );
        }
        toast.success("Quick link updated");
      } else {
        await addDoc(collection(db, "quickLinks"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.title,
            type: "create",
            module: "quick-links",
          });
        } catch (notificationError) {
          console.error(
            "Error creating activity notification:",
            notificationError,
          );
        }
        toast.success("Quick link created");
      }

      await fetchQuickLinks();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving quick link:", error);
      toast.error("Failed to save quick link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: QuickLinkItem) => {
    try {
      await deleteDoc(doc(db, "quickLinks", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.title,
          type: "delete",
          module: "quick-links",
        });
      } catch (notificationError) {
        console.error(
          "Error creating activity notification:",
          notificationError,
        );
      }
      toast.success("Quick link deleted");
      await fetchQuickLinks();
    } catch (error) {
      console.error("Error deleting quick link:", error);
      toast.error("Failed to delete quick link");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading quick links...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Quick Links"
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
              key: "url",
              label: "URL",
              render: (item) => (
                <a
                  href={item.url}
                  target={item.openInNewTab ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Open link
                </a>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (item) => (
                <span className="text-muted-foreground">{item.category}</span>
              ),
            },
            {
              key: "active",
              label: "Status",
              render: (item) => (
                <Badge
                  variant={item.active ? "default" : "secondary"}
                  className={
                    item.active ? "bg-success/20 text-success border-0" : ""
                  }
                >
                  {item.active ? "Active" : "Inactive"}
                </Badge>
              ),
            },
          ]}
        />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Quick Link" : "New Quick Link"}
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
