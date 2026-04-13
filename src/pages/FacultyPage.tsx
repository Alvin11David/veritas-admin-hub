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

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  bio: string;
  specialization: string;
  photoUrl: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FacultyForm {
  name: string;
  title: string;
  department: string;
  email: string;
  specialization: string;
  bio: string;
  photoUrl: string;
  displayOrder: number;
}

const fields: FormField[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Dr. Jane Doe",
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    placeholder: "Professor",
    options: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
      "Senior Lecturer",
      "Department Chair",
      "Dean",
      "Adjunct Professor",
      "Research Fellow",
    ],
  },
  {
    key: "department",
    label: "Department",
    type: "text",
    placeholder: "Computer Science",
    options: [
      "Computer Science",
      "Information Technology",
      "Software Engineering",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Economics",
      "Business Administration",
      "Education",
    ],
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "name@veritas.edu",
  },
  {
    key: "specialization",
    label: "Specialization",
    type: "text",
    placeholder: "Area of expertise",
  },
  {
    key: "bio",
    label: "Biography",
    type: "textarea",
    placeholder: "Brief bio...",
  },
  {
    key: "photoUrl",
    label: "Photo URL",
    type: "text",
    placeholder: "https://...",
  },
  {
    key: "displayOrder",
    label: "Display Order",
    type: "number",
    placeholder: "1",
  },
];

const defaultForm: FacultyForm = {
  name: "",
  title: "",
  department: "",
  email: "",
  specialization: "",
  bio: "",
  photoUrl: "",
  displayOrder: 1,
};

export default function FacultyPage() {
  const [data, setData] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FacultyMember | null>(null);
  const [form, setForm] = useState<FacultyForm>(defaultForm);

  useEffect(() => {
    void fetchFaculty();
  }, []);

  const queueFacultyAddedEmail = async (payload: {
    name: string;
    email: string;
    title: string;
    department: string;
  }) => {
    const subject = "You have been added to Veritas Admin";
    const role = `${payload.title} - ${payload.department}`;

    await addDoc(collection(db, "mail"), {
      to: [payload.email],
      message: {
        subject,
        text: `Hello ${payload.name},\n\nYou have been added to the Veritas Admin system.\nRole: ${role}\n\nSender: Admin Notification`,
        html: `<p>Hello ${payload.name},</p><p>You have been added to the Veritas Admin system.</p><p><strong>Role:</strong> ${role}</p><p>Sender: Admin Notification</p>`,
      },
    });
  };

  const createFacultyMemberWithNotification = async (payload: {
    name: string;
    title: string;
    department: string;
    email: string;
    specialization: string;
    bio: string;
    photoUrl: string;
    displayOrder: number;
    updatedAt: string;
  }) => {
    const createdRef = await addDoc(collection(db, "faculty"), {
      ...payload,
      createdAt: new Date().toISOString().split("T")[0],
    });

    let emailQueued = true;
    try {
      await queueFacultyAddedEmail({
        name: payload.name,
        email: payload.email,
        title: payload.title,
        department: payload.department,
      });
    } catch (mailError) {
      emailQueued = false;
      console.error("Error queueing email notification:", mailError);
    }

    try {
      await createAdminNotification({
        action: "Created",
        target: `${payload.name} profile`,
        type: "create",
        module: "faculty",
      });
    } catch (notificationError) {
      console.error("Error creating activity notification:", notificationError);
    }

    return { createdId: createdRef.id, emailQueued };
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "faculty")));
      const faculty: FacultyMember[] = [];

      snapshot.forEach((snapshotDoc) => {
        faculty.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<FacultyMember, "id">),
        });
      });

      faculty.sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });
      setData(faculty);
    } catch (error) {
      console.error("Error loading faculty:", error);
      toast.error("Failed to load faculty members");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, displayOrder: data.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (item: FacultyMember) => {
    setEditing(item);
    setForm({
      name: item.name,
      title: item.title,
      department: item.department,
      email: item.email,
      specialization: item.specialization,
      bio: item.bio,
      photoUrl: item.photoUrl ?? "",
      displayOrder: item.displayOrder ?? 1,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.title || !form.department || !form.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        title: form.title,
        department: form.department,
        email: form.email,
        specialization: form.specialization,
        bio: form.bio,
        photoUrl: form.photoUrl,
        displayOrder: Number(form.displayOrder) || 1,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      if (editing) {
        await updateDoc(doc(db, "faculty", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: `${payload.name} profile`,
            type: "update",
            module: "faculty",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Faculty member updated");
      } else {
        const { emailQueued } =
          await createFacultyMemberWithNotification(payload);

        if (!emailQueued) {
          toast.warning(
            "Faculty was added, but notification email could not be queued",
          );
        }

        toast.success("Faculty member added");
      }

      await fetchFaculty();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving faculty:", error);
      toast.error("Failed to save faculty member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: FacultyMember) => {
    try {
      await deleteDoc(doc(db, "faculty", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: `${item.name} profile`,
          type: "delete",
          module: "faculty",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Faculty member removed");
      await fetchFaculty();
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast.error("Failed to remove faculty member");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading faculty members...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Faculty Members"
          data={data}
          searchKey="name"
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            {
              key: "name",
              label: "Name",
              render: (item) => (
                <span className="font-medium">{item.name}</span>
              ),
            },
            { key: "title", label: "Title" },
            { key: "department", label: "Department" },
            {
              key: "specialization",
              label: "Specialization",
              render: (item) => (
                <span className="text-muted-foreground">
                  {item.specialization}
                </span>
              ),
            },
            {
              key: "email",
              label: "Email",
              render: (item) => (
                <span className="text-primary">{item.email}</span>
              ),
            },
          ]}
        />
      )}
      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Faculty" : "Add Faculty"}
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
