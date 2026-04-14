import { useEffect, useState } from "react";
import { Loader2, MessageSquareText, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { FormDialog, type FormField } from "@/components/FormDialog";
import { db } from "@/config/firebase";
import { createAdminNotification } from "@/lib/notifications";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc } from "firebase/firestore";

type StoryStatus = "Published" | "Draft";

interface StudentStoryItem {
  id: string;
  title: string;
  studentName: string;
  program: string;
  excerpt: string;
  story: string;
  imageUrl: string;
  displayOrder: number;
  featured: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface StudentStoryForm {
  title: string;
  studentName: string;
  program: string;
  excerpt: string;
  story: string;
  imageUrl: string;
  displayOrder: number;
  featured: boolean;
  active: boolean;
}

const fields: FormField[] = [
  { key: "title", label: "Story Title", type: "text", placeholder: "From Campus Start to Career Launch" },
  { key: "studentName", label: "Student Name", type: "text", placeholder: "Jane Doe" },
  { key: "program", label: "Program", type: "text", placeholder: "Bachelor of Science in Computer Science" },
  { key: "excerpt", label: "Short Excerpt", type: "textarea", placeholder: "A short intro shown in the stories list." },
  { key: "story", label: "Full Story", type: "textarea", placeholder: "Write the full student story here." },
  { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
  { key: "displayOrder", label: "Display Order", type: "number", placeholder: "1" },
  { key: "featured", label: "Featured", type: "toggle" },
  { key: "active", label: "Active", type: "toggle" },
];

const defaultForm: StudentStoryForm = {
  title: "",
  studentName: "",
  program: "",
  excerpt: "",
  story: "",
  imageUrl: "",
  displayOrder: 1,
  featured: false,
  active: true,
};

function getStatus(item: StudentStoryItem): StoryStatus {
  return item.active ? "Published" : "Draft";
}

export default function StudentStoriesPage() {
  const [data, setData] = useState<StudentStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudentStoryItem | null>(null);
  const [form, setForm] = useState<StudentStoryForm>(defaultForm);

  useEffect(() => {
    void fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "studentStories")));
      const stories: StudentStoryItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        stories.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<StudentStoryItem, "id">),
        });
      });

      stories.sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return a.title.localeCompare(b.title);
      });

      setData(stories);
    } catch (error) {
      console.error("Error loading student stories:", error);
      toast.error("Failed to load student stories");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item: StudentStoryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      studentName: item.studentName,
      program: item.program,
      excerpt: item.excerpt,
      story: item.story,
      imageUrl: item.imageUrl,
      displayOrder: item.displayOrder,
      featured: item.featured,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.studentName || !form.program || !form.excerpt || !form.story) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        studentName: form.studentName,
        program: form.program,
        excerpt: form.excerpt,
        story: form.story,
        imageUrl: form.imageUrl,
        displayOrder: Number(form.displayOrder) || 1,
        featured: !!form.featured,
        active: !!form.active,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "studentStories", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.title,
            type: "update",
            module: "student-stories",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Student story updated");
      } else {
        await addDoc(collection(db, "studentStories"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.title,
            type: "create",
            module: "student-stories",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Student story created");
      }

      await fetchStories();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving student story:", error);
      toast.error("Failed to save student story");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: StudentStoryItem) => {
    try {
      await deleteDoc(doc(db, "studentStories", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.title,
          type: "delete",
          module: "student-stories",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Student story deleted");
      await fetchStories();
    } catch (error) {
      console.error("Error deleting student story:", error);
      toast.error("Failed to delete student story");
    }
  };

  const publishedCount = data.filter((item) => item.active).length;

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading student stories...</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquareText className="h-4 w-4 text-primary" /> Student Stories
              </CardTitle>
              <CardDescription>
                Admins manage student story entries here. Add, edit, or delete stories for the public-facing section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No student stories yet</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    The admin needs to create the first student story record. Click Add New to add a title, student name, program, and full story.
                  </p>
                  <Button className="mt-5" onClick={openCreate}>
                    Add First Student Story
                  </Button>
                </div>
              ) : (
                <DataTable
                  title="Student Stories"
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
                      key: "studentName",
                      label: "Student",
                      render: (item) => <span className="text-muted-foreground">{item.studentName}</span>,
                    },
                    {
                      key: "program",
                      label: "Program",
                      render: (item) => <span className="text-muted-foreground">{item.program}</span>,
                    },
                    {
                      key: "displayOrder",
                      label: "Order",
                      render: (item) => <span>{item.displayOrder}</span>,
                    },
                    {
                      key: "featured",
                      label: "Featured",
                      render: (item) => (
                        <Badge variant={item.featured ? "default" : "secondary"}>
                          {item.featured ? "Yes" : "No"}
                        </Badge>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (item) => {
                        const status = getStatus(item);
                        return (
                          <Badge variant={status === "Published" ? "default" : "secondary"}>
                            {status}
                          </Badge>
                        );
                      },
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {publishedCount} published student story{publishedCount === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        title={editing ? "Edit Student Story" : "New Student Story"}
        fields={fields}
        values={form}
        onChange={(k, v) => setForm((current) => ({ ...current, [k]: v as never }))}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Saving..." : "Save"}
        disabled={submitting}
      />
    </>
  );
}