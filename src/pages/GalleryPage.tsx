import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { FormDialog, FormField } from "@/components/FormDialog";
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

interface GalleryItem {
  id: string;
  title: string;
  mediaType: "image" | "video";
  url: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GalleryForm {
  title: string;
  mediaType: "image" | "video";
  url: string;
  description: string;
}

const fields: FormField[] = [
  {
    key: "title",
    label: "Media Title",
    type: "text",
    placeholder: "Campus Tour Highlights",
  },
  {
    key: "mediaType",
    label: "Media Type",
    type: "text",
    placeholder: "image",
    options: ["image", "video"],
  },
  {
    key: "url",
    label: "Media URL",
    type: "text",
    placeholder: "https://...",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Short description for this media item...",
  },
];

const defaultForm: GalleryForm = {
  title: "",
  mediaType: "image",
  url: "",
  description: "",
};

export default function GalleryPage() {
  const [data, setData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryForm>(defaultForm);

  useEffect(() => {
    void fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "gallery")));
      const items: GalleryItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        items.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<GalleryItem, "id">),
        });
      });

      items.sort((a, b) => {
        const aTime = a.updatedAt || a.createdAt || "";
        const bTime = b.updatedAt || b.createdAt || "";
        return bTime.localeCompare(aTime);
      });

      setData(items);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      mediaType: item.mediaType,
      url: item.url,
      description: item.description,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.mediaType || !form.url) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        mediaType: form.mediaType,
        url: form.url,
        description: form.description,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "gallery", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.title,
            type: "update",
            module: "gallery",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Gallery item updated");
      } else {
        await addDoc(collection(db, "gallery"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.title,
            type: "create",
            module: "gallery",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Gallery item created");
      }

      await fetchGallery();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast.error("Failed to save gallery item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    try {
      await deleteDoc(doc(db, "gallery", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.title,
          type: "delete",
          module: "gallery",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Gallery item deleted");
      await fetchGallery();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast.error("Failed to delete gallery item");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Gallery"
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
              key: "mediaType",
              label: "Type",
              render: (item) => (
                <span className="capitalize text-muted-foreground">{item.mediaType}</span>
              ),
            },
            {
              key: "url",
              label: "URL",
              render: (item) => (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Open media
                </a>
              ),
            },
            {
              key: "description",
              label: "Description",
              render: (item) => (
                <span className="text-muted-foreground line-clamp-1">{item.description}</span>
              ),
            },
          ]}
        />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Gallery Item" : "New Gallery Item"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v as any }))}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Saving..." : "Save"}
        disabled={submitting}
      />
    </>
  );
}
