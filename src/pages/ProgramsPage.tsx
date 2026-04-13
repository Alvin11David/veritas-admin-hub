import { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { db } from "@/config/firebase";
import { createAdminNotification } from "@/lib/notifications";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export interface Program {
  id: string;
  programName: string;
  programCode: string;
  department: string;
  description: string;
  duration: number;
  totalCredits: number;
  students: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function ProgramsPage() {
  const [data, setData] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch programs from Firestore on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "AcademicPrograms"));
      const querySnapshot = await getDocs(q);
      const programs: Program[] = [];

      querySnapshot.forEach((doc) => {
        programs.push({
          id: doc.id,
          ...(doc.data() as Omit<Program, "id">),
        });
      });

      // Sort by program name
      programs.sort((a, b) => a.programName.localeCompare(b.programName));
      setData(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      programName: "",
      programCode: "",
      department: "",
      description: "",
      duration: 4,
      totalCredits: 120,
      students: 0,
      status: "active",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: Program) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !form.programName ||
      !form.programCode ||
      !form.department ||
      !form.description ||
      !form.duration ||
      !form.totalCredits
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editing) {
        // Update existing program
        const docRef = doc(db, "AcademicPrograms", editing.id);
        const updatedName = form.programName;
        await updateDoc(docRef, {
          programName: form.programName,
          programCode: form.programCode.toUpperCase(),
          department: form.department,
          description: form.description,
          duration: parseInt(form.duration),
          totalCredits: parseInt(form.totalCredits),
          students: parseInt(form.students) || 0,
          status: form.status || "active",
          updatedAt: new Date().toISOString().split("T")[0],
        });
        try {
          await createAdminNotification({
            action: "Updated",
            target: updatedName,
            type: "update",
            module: "programs",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Program updated");
      } else {
        // Create new program
        const createdName = form.programName;
        await addDoc(collection(db, "AcademicPrograms"), {
          programName: form.programName,
          programCode: form.programCode.toUpperCase(),
          department: form.department,
          description: form.description,
          duration: parseInt(form.duration),
          totalCredits: parseInt(form.totalCredits),
          students: 0,
          status: form.status || "active",
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        });
        try {
          await createAdminNotification({
            action: "Created",
            target: createdName,
            type: "create",
            module: "programs",
          });
        } catch (notificationError) {
          console.error("Error creating activity notification:", notificationError);
        }
        toast.success("Program created");
      }

      await fetchPrograms();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: Program) => {
    try {
      const docRef = doc(db, "AcademicPrograms", item.id);
      await deleteDoc(docRef);
      try {
        await createAdminNotification({
          action: "Deleted",
          target: item.programName,
          type: "delete",
          module: "programs",
        });
      } catch (notificationError) {
        console.error("Error creating activity notification:", notificationError);
      }
      toast.success("Program deleted");
      await fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading programs...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title="Academic Programs"
          data={data}
          searchKey="programName"
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            {
              key: "programCode",
              label: "Code",
              render: (item) => (
                <span className="font-mono font-bold text-primary">
                  {item.programCode}
                </span>
              ),
            },
            {
              key: "programName",
              label: "Program Name",
              render: (item) => (
                <span className="font-medium">{item.programName}</span>
              ),
            },
            {
              key: "department",
              label: "Department",
              render: (item) => (
                <span className="text-muted-foreground">{item.department}</span>
              ),
            },
            {
              key: "duration",
              label: "Duration",
              render: (item) => (
                <span className="text-center">{item.duration} years</span>
              ),
            },
            {
              key: "totalCredits",
              label: "Total Credits",
              render: (item) => <span>{item.totalCredits}</span>,
            },
            {
              key: "students",
              label: "Students",
              render: (item) => (
                <span className="font-semibold">{item.students}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item) => (
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className={
                    item.status === "active"
                      ? "bg-success/20 text-success border-0"
                      : ""
                  }
                >
                  {item.status === "active" ? "Active" : "Inactive"}
                </Badge>
              ),
            },
          ]}
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !submitting && setDialogOpen(open)}
      >
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Program" : "New Program"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Program Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Program Code *
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., BCS"
                  value={form.programCode ?? ""}
                  onChange={(e) =>
                    !submitting &&
                    setForm((f) => ({ ...f, programCode: e.target.value }))
                  }
                  disabled={submitting}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Duration (Years) *
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  placeholder="4"
                  value={form.duration ?? 4}
                  onChange={(e) =>
                    !submitting &&
                    setForm((f) => ({
                      ...f,
                      duration: parseInt(e.target.value),
                    }))
                  }
                  disabled={submitting}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            {/* Program Name */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Program Name *
              </Label>
              <Input
                type="text"
                placeholder="Bachelor of Computer Science"
                value={form.programName ?? ""}
                onChange={(e) =>
                  !submitting &&
                  setForm((f) => ({ ...f, programName: e.target.value }))
                }
                disabled={submitting}
                className="bg-secondary border-border"
              />
            </div>

            {/* Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Department *
                </Label>
                <Input
                  type="text"
                  placeholder="School of Computing"
                  value={form.department ?? ""}
                  onChange={(e) =>
                    !submitting &&
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                  disabled={submitting}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Total Credits */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Total Credits *
                </Label>
                <Input
                  type="number"
                  min="30"
                  max="200"
                  placeholder="120"
                  value={form.totalCredits ?? 120}
                  onChange={(e) =>
                    !submitting &&
                    setForm((f) => ({
                      ...f,
                      totalCredits: parseInt(e.target.value),
                    }))
                  }
                  disabled={submitting}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Description *
              </Label>
              <Textarea
                placeholder="Program overview, goals, and key information..."
                value={form.description ?? ""}
                onChange={(e) =>
                  !submitting &&
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                disabled={submitting}
                className="bg-secondary border-border min-h-[100px]"
              />
            </div>

            {/* Current Students */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Current Students Enrolled
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.students ?? 0}
                onChange={(e) =>
                  !submitting &&
                  setForm((f) => ({
                    ...f,
                    students: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={submitting}
                className="bg-secondary border-border"
              />
            </div>

            {/* Status */}
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-sm text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.status === "active"}
                  onCheckedChange={(v) =>
                    !submitting &&
                    setForm((f) => ({
                      ...f,
                      status: v ? "active" : "inactive",
                    }))
                  }
                  disabled={submitting}
                />
                <span className="text-sm text-foreground">
                  {form.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="border-border"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Program"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
