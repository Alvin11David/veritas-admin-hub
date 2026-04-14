import { useEffect, useState } from "react";
import { Calendar, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { FormDialog, type FormField } from "@/components/FormDialog";
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

type ScholarshipStatus = "Open" | "Closing Soon" | "Closed";

interface ScholarshipItem {
  id: string;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  url: string;
  openInNewTab: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ScholarshipForm {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  url: string;
  openInNewTab: boolean;
  active: boolean;
}

const fields: FormField[] = [
  {
    key: "title",
    label: "Scholarship Title",
    type: "text",
    placeholder: "Merit Excellence Scholarship",
  },
  {
    key: "amount",
    label: "Award Amount",
    type: "text",
    placeholder: "Up to $5,000",
  },
  { key: "deadline", label: "Application Deadline", type: "date" },
  {
    key: "url",
    label: "Application Link",
    type: "text",
    placeholder: "https://...",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe the scholarship eligibility and purpose.",
  },
  { key: "openInNewTab", label: "Open In New Tab", type: "toggle" },
  { key: "active", label: "Active", type: "toggle" },
];

const defaultForm: ScholarshipForm = {
  title: "",
  description: "",
  amount: "",
  deadline: "",
  url: "",
  openInNewTab: true,
  active: true,
};

function formatDeadline(deadline: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${deadline}T00:00:00`));
}

function deadlineDate(deadline: string) {
  return new Date(`${deadline}T23:59:59`);
}

function diffDays(deadline: string) {
  const now = new Date();
  const diff = deadlineDate(deadline).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatus(item: ScholarshipItem): ScholarshipStatus {
  if (!item.active) {
    return "Closed";
  }

  const daysLeft = diffDays(item.deadline);
  if (daysLeft < 0) {
    return "Closed";
  }

  if (daysLeft <= 14) {
    return "Closing Soon";
  }

  return "Open";
}

export default function ScholarshipsPage() {
  const [data, setData] = useState<ScholarshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScholarshipItem | null>(null);
  const [form, setForm] = useState<ScholarshipForm>(defaultForm);

  useEffect(() => {
    void fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "scholarships")));
      const scholarships: ScholarshipItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        scholarships.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<ScholarshipItem, "id">),
        });
      });

      scholarships.sort((a, b) => {
        const order =
          deadlineDate(a.deadline).getTime() -
          deadlineDate(b.deadline).getTime();
        if (order !== 0) return order;
        return a.title.localeCompare(b.title);
      });

      setData(scholarships);
    } catch (error) {
      console.error("Error loading scholarships:", error);
      toast.error("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ScholarshipItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      amount: item.amount,
      deadline: item.deadline,
      url: item.url,
      openInNewTab: item.openInNewTab,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.amount ||
      !form.deadline ||
      !form.url
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        description: form.description,
        amount: form.amount,
        deadline: form.deadline,
        url: form.url,
        openInNewTab: !!form.openInNewTab,
        active: !!form.active,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "scholarships", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.title,
            type: "update",
            module: "scholarships",
          });
        } catch (notificationError) {
          console.error(
            "Error creating activity notification:",
            notificationError,
          );
        }
        toast.success("Scholarship updated");
      } else {
        await addDoc(collection(db, "scholarships"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.title,
            type: "create",
            module: "scholarships",
          });
        } catch (notificationError) {
          console.error(
            "Error creating activity notification:",
            notificationError,
          );
        }
        toast.success("Scholarship created");
      }

      await fetchScholarships();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving scholarship:", error);
      toast.error("Failed to save scholarship");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: ScholarshipItem) => {
    try {
      await deleteDoc(doc(db, "scholarships", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.title,
          type: "delete",
          module: "scholarships",
        });
      } catch (notificationError) {
        console.error(
          "Error creating activity notification:",
          notificationError,
        );
      }
      toast.success("Scholarship deleted");
      await fetchScholarships();
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      toast.error("Failed to delete scholarship");
    }
  };

  const activeCount = data.filter(
    (item) => getStatus(item) !== "Closed",
  ).length;

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading scholarships...</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-4 w-4 text-primary" /> Scholarships
              </CardTitle>
              <CardDescription>
                Admins manage scholarship records here. Add, edit, or delete
                links and deadlines from this table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No scholarships yet
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    The admin needs to create the first scholarship record.
                    Click Add New to add a title, deadline, amount, and
                    application link.
                  </p>
                  <Button className="mt-5" onClick={openCreate}>
                    Add First Scholarship
                  </Button>
                </div>
              ) : (
                <DataTable
                  title="Scholarships"
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
                      key: "amount",
                      label: "Amount",
                      render: (item) => (
                        <span className="text-muted-foreground">
                          {item.amount}
                        </span>
                      ),
                    },
                    {
                      key: "deadline",
                      label: "Deadline",
                      render: (item) => (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDeadline(item.deadline)}
                        </span>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (item) => {
                        const status = getStatus(item);
                        return (
                          <Badge
                            variant={
                              status === "Closed"
                                ? "secondary"
                                : status === "Closing Soon"
                                  ? "destructive"
                                  : "default"
                            }
                            className={
                              status === "Closing Soon"
                                ? "bg-amber-500/15 text-amber-700 border-amber-200"
                                : ""
                            }
                          >
                            {status}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: "url",
                      label: "Link",
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
                  ]}
                />
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {activeCount} active scholarship{activeCount === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Scholarship" : "New Scholarship"}
        fields={fields}
        values={form}
        onChange={(k, v) =>
          setForm((current) => ({ ...current, [k]: v as never }))
        }
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Saving..." : "Save"}
        disabled={submitting}
      />
    </>
  );
}
