import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { FormDialog, FormField } from "@/components/FormDialog";
import { mockEvents, Event } from "@/lib/mock-data";
import { toast } from "sonner";

const fields: FormField[] = [
  { key: "title", label: "Event Title", type: "text", placeholder: "Event name" },
  { key: "date", label: "Date", type: "date" },
  { key: "time", label: "Time", type: "text", placeholder: "10:00 AM" },
  { key: "location", label: "Location", type: "text", placeholder: "Main Auditorium" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Event details..." },
];

export default function EventsPage() {
  const [data, setData] = useState<Event[]>(mockEvents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", date: "", time: "", location: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Event) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      setData((d) => d.map((i) => (i.id === editing.id ? { ...i, ...form } : i)));
      toast.success("Event updated");
    } else {
      setData((d) => [...d, { ...form as any, id: Date.now().toString(), featuredImage: "" }]);
      toast.success("Event created");
    }
    setDialogOpen(false);
  };

  const handleDelete = (item: Event) => {
    setData((d) => d.filter((i) => i.id !== item.id));
    toast.success("Event deleted");
  };

  return (
    <>
      <DataTable
        title="Events"
        data={data}
        searchKey="title"
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { key: "title", label: "Title", render: (item) => <span className="font-medium">{item.title}</span> },
          { key: "date", label: "Date" },
          { key: "time", label: "Time" },
          { key: "location", label: "Location", render: (item) => <span className="text-muted-foreground">{item.location}</span> },
        ]}
      />
      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Event" : "New Event"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onSubmit={handleSubmit}
      />
    </>
  );
}
