import { useEffect, useState } from "react";
import {
  Calendar,
  ExternalLink,
  GraduationCap,
  ShieldAlert,
  Loader2,
} from "lucide-react";
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

  const openItems = data.filter((item) => getStatus(item) !== "Closed");
  const nextDeadline = [...openItems].sort(
    (a, b) =>
      deadlineDate(a.deadline).getTime() - deadlineDate(b.deadline).getTime(),
  )[0];

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
        <div className="mx-auto max-w-6xl space-y-6">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    Admin Managed
                  </Badge>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Scholarships
                  </h1>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Admins can create, update, and remove scholarship links with
                    deadlines, visibility, and application behavior.
                  </p>
                </div>

                <div className="rounded-lg border border-primary/20 bg-background/80 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Next deadline
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {nextDeadline
                      ? nextDeadline.title
                      : "No active scholarships"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nextDeadline
                      ? formatDeadline(nextDeadline.deadline)
                      : "Add a scholarship to get started"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/80 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-4 w-4 text-primary" /> Scholarship
                  Records
                </CardTitle>
                <CardDescription>
                  Manage scholarship links directly from the admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldAlert className="h-4 w-4 text-primary" /> Admin Notes
                </CardTitle>
                <CardDescription>
                  Deadline-aware display keeps expired scholarships from being
                  promoted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Use Add, Edit, and Delete to manage scholarships directly.
                  Status updates automatically based on active state and
                  deadline.
                </p>
                <p>
                  Scholarship links marked inactive or past their deadline will
                  show as closed in the table.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>
              {openItems.length} active scholarship
              {openItems.length === 1 ? "" : "s"}
            </span>
          </div>
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
import {
  Calendar,
  ExternalLink,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ScholarshipLink = {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  url: string;
  status: "Open" | "Closing Soon" | "Closed";
};

const scholarships: ScholarshipLink[] = [
  {
    title: "Merit Excellence Scholarship",
    description:
      "For high-achieving incoming and continuing students with strong academic records.",
    amount: "Up to $5,000",
    deadline: "2026-05-31",
    url: "https://example.edu/scholarships/merit-excellence",
    status: "Open",
  },
  {
    title: "Community Leadership Grant",
    description:
      "Supports students who demonstrate leadership in service, clubs, and outreach programs.",
    amount: "$2,500",
    deadline: "2026-05-10",
    url: "https://example.edu/scholarships/community-leadership",
    status: "Closing Soon",
  },
  {
    title: "STEM Future Scholars Award",
    description:
      "A scholarship for students pursuing science, technology, engineering, or mathematics degrees.",
    amount: "Up to $7,500",
    deadline: "2026-04-01",
    url: "https://example.edu/scholarships/stem-future",
    status: "Closed",
  },
];

function formatDeadline(deadline: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(deadline));
}

function isPastDeadline(deadline: string) {
  return (
    new Date(deadline).getTime() < new Date("2026-04-14T00:00:00").getTime()
  );
}

export default function ScholarshipsPage() {
  const openScholarships = scholarships.filter(
    (item) => !isPastDeadline(item.deadline),
  );
  const nextDeadline = openScholarships.sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  )[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Scholarships
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Scholarship Opportunities
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Share active scholarship links with clear deadlines so
                applicants know exactly when to apply.
              </p>
            </div>

            {nextDeadline ? (
              <div className="rounded-lg border border-primary/20 bg-background/80 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Next deadline
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {nextDeadline.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDeadline(nextDeadline.deadline)}
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-4 w-4 text-primary" /> Active
              Scholarship Links
            </CardTitle>
            <CardDescription>
              Each link includes its deadline so students can apply before the
              window closes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scholarships.map((scholarship) => {
              const expired = isPastDeadline(scholarship.deadline);

              return (
                <div
                  key={scholarship.title}
                  className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {scholarship.title}
                        </h3>
                        <Badge
                          variant={
                            scholarship.status === "Closed"
                              ? "secondary"
                              : scholarship.status === "Closing Soon"
                                ? "destructive"
                                : "default"
                          }
                          className={
                            scholarship.status === "Closing Soon"
                              ? "bg-amber-500/15 text-amber-700 border-amber-200"
                              : ""
                          }
                        >
                          {expired ? "Closed" : scholarship.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scholarship.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Deadline: {formatDeadline(scholarship.deadline)}
                        </span>
                        <span className="font-medium text-foreground">
                          Award: {scholarship.amount}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-40 md:items-end">
                      <Button
                        asChild
                        disabled={expired}
                        className="w-full md:w-auto"
                      >
                        <a
                          href={expired ? undefined : scholarship.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={expired}
                          tabIndex={expired ? -1 : 0}
                          onClick={(event) => {
                            if (expired) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {expired ? "Deadline Passed" : "Apply Now"}
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground text-right">
                        {expired
                          ? "This opportunity is no longer accepting applications."
                          : "Applications remain open until the listed deadline."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-4 w-4 text-primary" /> Deadline Reminder
            </CardTitle>
            <CardDescription>
              Keep the scholarship link visible until the deadline expires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The top application link now includes a deadline badge, and
              expired links are disabled automatically.
            </p>
            <p>
              You can update the URL and deadline values in this page whenever a
              scholarship cycle changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
