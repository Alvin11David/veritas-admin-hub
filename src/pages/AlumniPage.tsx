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

interface AlumniItem {
  id: string;
  name: string;
  graduationYear: number;
  program: string;
  currentRole: string;
  company: string;
  email: string;
  spotlight: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AlumniForm {
  name: string;
  graduationYear: number;
  program: string;
  currentRole: string;
  company: string;
  email: string;
  spotlight: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
}

const fields: FormField[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Dr. Alex Johnson",
  },
  {
    key: "graduationYear",
    label: "Graduation Year",
    type: "number",
    placeholder: "2020",
  },
  {
    key: "program",
    label: "Program",
    type: "text",
    placeholder: "Computer Science",
  },
  {
    key: "currentRole",
    label: "Current Role",
    type: "text",
    placeholder: "Senior Software Engineer",
  },
  {
    key: "company",
    label: "Company",
    type: "text",
    placeholder: "Tech Corp",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
  },
  {
    key: "spotlight",
    label: "Spotlight / Bio",
    type: "textarea",
    placeholder: "Short alumni spotlight description...",
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

const defaultForm: AlumniForm = {
  name: "",
  graduationYear: 2020,
  program: "Computer Science",
  currentRole: "",
  company: "",
  email: "",
  spotlight: "",
  featured: false,
  active: true,
  displayOrder: 1,
};

export default function AlumniPage() {
  const [data, setData] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AlumniItem | null>(null);
  const [form, setForm] = useState<AlumniForm>(defaultForm);

  useEffect(() => {
    void fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "alumni")));
      const alumni: AlumniItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        alumni.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<AlumniItem, "id">),
        });
      });

      alumni.sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return b.graduationYear - a.graduationYear;
      });

      setData(alumni);
    } catch (error) {
      console.error("Error loading alumni:", error);
      toast.error("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, displayOrder: data.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (item: AlumniItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      graduationYear: item.graduationYear,
      program: item.program,
      currentRole: item.currentRole,
      company: item.company,
      email: item.email,
      spotlight: item.spotlight,
      featured: item.featured,
      active: item.active,
      displayOrder: item.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.graduationYear ||
      !form.program ||
      !form.currentRole ||
      !form.company ||
      !form.email ||
      !form.spotlight
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name,
        graduationYear: Number(form.graduationYear) || new Date().getFullYear(),
        program: form.program,
        currentRole: form.currentRole,
        company: form.company,
        email: form.email,
        spotlight: form.spotlight,
        featured: !!form.featured,
        active: !!form.active,
        displayOrder: Number(form.displayOrder) || 1,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "alumni", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.name,
            type: "update",
            module: "alumni",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Alumni profile updated");
      } else {
        await addDoc(collection(db, "alumni"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.name,
            type: "create",
            module: "alumni",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Alumni profile created");
      }

      await fetchAlumni();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving alumni profile:", error);
      toast.error("Failed to save alumni profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: AlumniItem) => {
    try {
      await deleteDoc(doc(db, "alumni", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.name,
          type: "delete",
          module: "alumni",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Alumni profile deleted");
      await fetchAlumni();
    } catch (error) {
      console.error("Error deleting alumni profile:", error);
      toast.error("Failed to delete alumni profile");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading alumni...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Alumni"
          data={data}
          searchKey="name"
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (item) => <span className="font-medium">{item.name}</span>,
            },
            {
              key: "graduationYear",
              label: "Graduation Year",
              render: (item) => <span>{item.graduationYear}</span>,
            },
            {
              key: "program",
              label: "Program",
              render: (item) => <span className="text-muted-foreground">{item.program}</span>,
            },
            {
              key: "currentRole",
              label: "Current Role",
              render: (item) => <span>{item.currentRole}</span>,
            },
            {
              key: "company",
              label: "Company",
              render: (item) => <span className="text-muted-foreground">{item.company}</span>,
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
        title={editing ? "Edit Alumni Profile" : "New Alumni Profile"}
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
