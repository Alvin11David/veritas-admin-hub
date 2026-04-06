import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { FormDialog, FormField } from "@/components/FormDialog";
import { mockFaculty, FacultyMember } from "@/lib/mock-data";
import { toast } from "sonner";

const fields: FormField[] = [
  { key: "name", label: "Full Name", type: "text", placeholder: "Dr. Jane Doe" },
  { key: "title", label: "Title", type: "text", placeholder: "Professor" },
  { key: "department", label: "Department", type: "text", placeholder: "Computer Science" },
  { key: "email", label: "Email", type: "email", placeholder: "name@veritas.edu" },
  { key: "specialization", label: "Specialization", type: "text", placeholder: "Area of expertise" },
  { key: "bio", label: "Biography", type: "textarea", placeholder: "Brief bio..." },
  { key: "displayOrder", label: "Display Order", type: "number", placeholder: "1" },
];

export default function FacultyPage() {
  const [data, setData] = useState<FacultyMember[]>(mockFaculty);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FacultyMember | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", title: "", department: "", email: "", specialization: "", bio: "", displayOrder: data.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (item: FacultyMember) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      setData((d) => d.map((i) => (i.id === editing.id ? { ...i, ...form } : i)));
      toast.success("Faculty member updated");
    } else {
      setData((d) => [...d, { ...form as any, id: Date.now().toString(), photoUrl: "" }]);
      toast.success("Faculty member added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (item: FacultyMember) => {
    setData((d) => d.filter((i) => i.id !== item.id));
    toast.success("Faculty member removed");
  };

  return (
    <>
      <DataTable
        title="Faculty Members"
        data={data}
        searchKey="name"
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
        columns={[
          { key: "name", label: "Name", render: (item) => <span className="font-medium">{item.name}</span> },
          { key: "title", label: "Title" },
          { key: "department", label: "Department" },
          { key: "specialization", label: "Specialization", render: (item) => <span className="text-muted-foreground">{item.specialization}</span> },
          { key: "email", label: "Email", render: (item) => <span className="text-primary">{item.email}</span> },
        ]}
      />
      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Faculty" : "Add Faculty"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onSubmit={handleSubmit}
      />
    </>
  );
}
