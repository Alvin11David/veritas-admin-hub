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

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FaqForm {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  active: boolean;
}

const fields: FormField[] = [
  {
    key: "question",
    label: "Question",
    type: "text",
    placeholder: "How do I apply for admission?",
  },
  {
    key: "answer",
    label: "Answer",
    type: "textarea",
    placeholder: "Provide a clear answer...",
  },
  {
    key: "category",
    label: "Category",
    type: "text",
    placeholder: "Admissions",
    options: [
      "Admissions",
      "Academics",
      "Tuition",
      "Scholarships",
      "Campus Life",
      "General",
    ],
  },
  {
    key: "displayOrder",
    label: "Display Order",
    type: "number",
    placeholder: "1",
  },
  {
    key: "active",
    label: "Active",
    type: "toggle",
  },
];

const defaultForm: FaqForm = {
  question: "",
  answer: "",
  category: "General",
  displayOrder: 1,
  active: true,
};

export default function FaqsPage() {
  const [data, setData] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqForm>(defaultForm);

  useEffect(() => {
    void fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, "faqs")));
      const faqs: FaqItem[] = [];

      snapshot.forEach((snapshotDoc) => {
        faqs.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<FaqItem, "id">),
        });
      });

      faqs.sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return a.question.localeCompare(b.question);
      });

      setData(faqs);
    } catch (error) {
      console.error("Error loading FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, displayOrder: data.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      displayOrder: item.displayOrder,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.question || !form.answer || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        displayOrder: Number(form.displayOrder) || 1,
        active: !!form.active,
        updatedAt: new Date().toISOString(),
      };

      if (editing) {
        await updateDoc(doc(db, "faqs", editing.id), payload);
        try {
          await createAdminNotification({
            action: "Updated",
            target: payload.question,
            type: "update",
            module: "faqs",
          });
        } catch (notificationError) {
          console.error(
            "Error creating activity notification:",
            notificationError,
          );
        }
        toast.success("FAQ updated");
      } else {
        await addDoc(collection(db, "faqs"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: payload.question,
            type: "create",
            module: "faqs",
          });
        } catch (notificationError) {
          console.error(
            "Error creating activity notification:",
            notificationError,
          );
        }
        toast.success("FAQ created");
      }

      await fetchFaqs();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("Failed to save FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: FaqItem) => {
    try {
      await deleteDoc(doc(db, "faqs", item.id));
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.question,
          type: "delete",
          module: "faqs",
        });
      } catch (notificationError) {
        console.error(
          "Error creating activity notification:",
          notificationError,
        );
      }
      toast.success("FAQ deleted");
      await fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="FAQs"
          data={data}
          searchKey="question"
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            {
              key: "question",
              label: "Question",
              render: (item) => (
                <span className="font-medium">{item.question}</span>
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
              key: "displayOrder",
              label: "Order",
              render: (item) => <span>{item.displayOrder}</span>,
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
        title={editing ? "Edit FAQ" : "New FAQ"}
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
