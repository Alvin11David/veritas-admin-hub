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

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  featuredImage: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventForm {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  featuredImage: string;
}

const fields: FormField[] = [
  {
    key: "title",
    label: "Event Title",
    type: "text",
    placeholder: "Event name",
  },
  { key: "date", label: "Date", type: "date" },
  { key: "time", label: "Time", type: "text", placeholder: "10:00 AM" },
  {
    key: "location",
    label: "Location",
    type: "text",
    placeholder: "Main Auditorium",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Event details...",
  },
  {
    key: "featuredImage",
    label: "Featured Image URL",
    type: "text",
    placeholder: "https://...",
  },
];

const defaultForm: EventForm = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
  featuredImage: "",
};

export default function EventsPage() {
  const [data, setData] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);

  useEffect(() => {
    void fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "events")));
      const events: EventItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        events.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<EventItem, "id">),
        });
      });

      events.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return a.title.localeCompare(b.title);
      });
      setData(events);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item: EventItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      date: item.date,
      time: item.time,
      location: item.location,
      description: item.description,
      featuredImage: item.featuredImage ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.time || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        description: form.description,
        featuredImage: form.featuredImage,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      if (editing) {
        await updateDoc(doc(db, "events", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.title,
            type: "update",
            module: "events",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Event updated");
      } else {
        await addDoc(collection(db, "events"), {
          ...payload,
          createdAt: new Date().toISOString().split("T")[0],
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.title,
            type: "create",
            module: "events",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Event created");
      }

      await fetchEvents();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: EventItem) => {
    try {
      await deleteDoc(doc(db, "events", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.title,
          type: "delete",
          module: "events",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Event deleted");
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Events"
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
            { key: "date", label: "Date" },
            { key: "time", label: "Time" },
            {
              key: "location",
              label: "Location",
              render: (item) => (
                <span className="text-muted-foreground">{item.location}</span>
              ),
            },
          ]}
        />
      )}
      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Event" : "New Event"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Saving..." : "Save"}
        disabled={submitting}
      />
    </>
  );
}
