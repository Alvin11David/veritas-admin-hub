import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

interface ProgramOption {
  id: string;
  programName: string;
  programCode: string;
  duration: number;
  department: string;
  status: "active" | "inactive";
}

interface CourseUnit {
  id: string;
  programId: string;
  programName: string;
  programCode: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  yearLevel: number;
  semesterNumber: number;
  semesterLabel: string;
  prerequisites: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface ProgramForm {
  programName: string;
  programCode: string;
  department: string;
  description: string;
  duration: number;
  totalCredits: number;
  students: number;
  status: "active" | "inactive";
}

interface CourseUnitForm {
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  yearLevel: number;
  semesterNumber: number;
  prerequisites: string;
  status: "active" | "inactive";
}

const defaultProgramForm: ProgramForm = {
  programName: "",
  programCode: "",
  department: "",
  description: "",
  duration: 4,
  totalCredits: 120,
  students: 0,
  status: "active",
};

const defaultCourseUnitForm: CourseUnitForm = {
  courseCode: "",
  courseName: "",
  instructor: "",
  credits: 3,
  yearLevel: 1,
  semesterNumber: 1,
  prerequisites: "",
  status: "active",
};

function buildSemesterLabel(yearLevel: number, semesterNumber: number) {
  return `Year ${yearLevel} - Semester ${semesterNumber}`;
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);

  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [programForm, setProgramForm] =
    useState<ProgramForm>(defaultProgramForm);

  const [courseUnitDialogOpen, setCourseUnitDialogOpen] = useState(false);
  const [editingCourseUnit, setEditingCourseUnit] = useState<CourseUnit | null>(
    null,
  );
  const [courseUnitForm, setCourseUnitForm] = useState<CourseUnitForm>(
    defaultCourseUnitForm,
  );

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) || null,
    [programs, selectedProgramId],
  );

  const semesterOptions = useMemo(() => {
    if (!selectedProgram) {
      return [] as Array<{
        value: string;
        label: string;
        yearLevel: number;
        semesterNumber: number;
      }>;
    }

    const options: Array<{
      value: string;
      label: string;
      yearLevel: number;
      semesterNumber: number;
    }> = [];
    for (let year = 1; year <= selectedProgram.duration; year += 1) {
      for (let semester = 1; semester <= 2; semester += 1) {
        options.push({
          value: `${year}-${semester}`,
          label: buildSemesterLabel(year, semester),
          yearLevel: year,
          semesterNumber: semester,
        });
      }
    }
    return options;
  }, [selectedProgram]);

  useEffect(() => {
    const initialize = async () => {
      await fetchPrograms();
      setLoading(false);
    };

    void initialize();
  }, []);

  useEffect(() => {
    if (!selectedProgramId) {
      setCourseUnits([]);
      return;
    }

    void fetchCourseUnits(selectedProgramId);
  }, [selectedProgramId]);

  const fetchPrograms = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, "AcademicPrograms")));
      const fetchedPrograms: ProgramOption[] = [];

      snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data() as Omit<ProgramOption, "id">;
        fetchedPrograms.push({ id: snapshotDoc.id, ...data });
      });

      fetchedPrograms.sort((a, b) =>
        a.programName.localeCompare(b.programName),
      );
      setPrograms(fetchedPrograms);

      if (fetchedPrograms.length > 0 && !selectedProgramId) {
        setSelectedProgramId(fetchedPrograms[0].id);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Failed to load programs");
    }
  };

  const fetchCourseUnits = async (programId: string) => {
    try {
      setLoading(true);

      const unitsSnapshot = await getDocs(
        query(
          collection(db, "AvailableCourses"),
          where("programId", "==", programId),
        ),
      );

      const units: CourseUnit[] = [];
      unitsSnapshot.forEach((snapshotDoc) => {
        units.push({
          id: snapshotDoc.id,
          ...(snapshotDoc.data() as Omit<CourseUnit, "id">),
        });
      });

      units.sort((a, b) => {
        if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
        if (a.semesterNumber !== b.semesterNumber)
          return a.semesterNumber - b.semesterNumber;
        return a.courseCode.localeCompare(b.courseCode);
      });

      setCourseUnits(units);
    } catch (error) {
      console.error("Error loading course units:", error);
      toast.error("Failed to load course units");
    } finally {
      setLoading(false);
    }
  };

  const openProgramDialog = () => {
    setProgramForm(defaultProgramForm);
    setProgramDialogOpen(true);
  };

  const handleCreateProgram = async () => {
    if (
      !programForm.programName ||
      !programForm.programCode ||
      !programForm.department ||
      !programForm.description
    ) {
      toast.error("Fill in all required program fields");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "AcademicPrograms"), {
        ...programForm,
        programCode: programForm.programCode.toUpperCase(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      });
      toast.success("Program added");
      setProgramDialogOpen(false);
      await fetchPrograms();
    } catch (error) {
      console.error("Error adding program:", error);
      toast.error("Failed to add program");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateCourseUnit = () => {
    if (!selectedProgram) {
      toast.error("Add or select a program first");
      return;
    }

    setEditingCourseUnit(null);
    setCourseUnitForm({ ...defaultCourseUnitForm });
    setCourseUnitDialogOpen(true);
  };

  const openEditCourseUnit = (unit: CourseUnit) => {
    setEditingCourseUnit(unit);
    setCourseUnitForm({
      courseCode: unit.courseCode,
      courseName: unit.courseName,
      instructor: unit.instructor,
      credits: unit.credits,
      yearLevel: unit.yearLevel,
      semesterNumber: unit.semesterNumber,
      prerequisites: unit.prerequisites,
      status: unit.status,
    });
    setCourseUnitDialogOpen(true);
  };

  const handleSubmitCourseUnit = async () => {
    if (!selectedProgram) {
      toast.error("Add or select a program first");
      return;
    }

    if (
      !courseUnitForm.courseCode ||
      !courseUnitForm.courseName ||
      !courseUnitForm.instructor
    ) {
      toast.error("Fill in all required course unit fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        programId: selectedProgram.id,
        programName: selectedProgram.programName,
        programCode: selectedProgram.programCode,
        courseCode: courseUnitForm.courseCode.toUpperCase(),
        courseName: courseUnitForm.courseName,
        instructor: courseUnitForm.instructor,
        credits: Number(courseUnitForm.credits) || 0,
        yearLevel: Number(courseUnitForm.yearLevel),
        semesterNumber: Number(courseUnitForm.semesterNumber),
        semesterLabel: buildSemesterLabel(
          Number(courseUnitForm.yearLevel),
          Number(courseUnitForm.semesterNumber),
        ),
        prerequisites: courseUnitForm.prerequisites,
        status: courseUnitForm.status,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      if (editingCourseUnit) {
        await updateDoc(
          doc(db, "AvailableCourses", editingCourseUnit.id),
          payload,
        );
        toast.success("Course unit updated");
      } else {
        await addDoc(collection(db, "AvailableCourses"), {
          ...payload,
          createdAt: new Date().toISOString().split("T")[0],
        });
        toast.success("Course unit added");
      }

      setCourseUnitDialogOpen(false);
      await fetchCourseUnits(selectedProgram.id);
    } catch (error) {
      console.error("Error saving course unit:", error);
      toast.error("Failed to save course unit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourseUnit = async (unit: CourseUnit) => {
    try {
      await deleteDoc(doc(db, "AvailableCourses", unit.id));
      toast.success("Course unit deleted");
      if (selectedProgram) {
        await fetchCourseUnits(selectedProgram.id);
      }
    } catch (error) {
      console.error("Error deleting course unit:", error);
      toast.error("Failed to delete course unit");
    }
  };

  const handleSemesterChange = (value: string) => {
    const [yearString, semesterString] = value.split("-");
    const yearLevel = Number(yearString);
    const semesterNumber = Number(semesterString);

    setCourseUnitForm((previous) => ({
      ...previous,
      yearLevel,
      semesterNumber,
    }));
  };

  const selectedSemesterValue = `${courseUnitForm.yearLevel}-${courseUnitForm.semesterNumber}`;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4 bg-card">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label className="text-sm text-muted-foreground">Program</Label>
            <select
              value={selectedProgramId}
              onChange={(event) => setSelectedProgramId(event.target.value)}
              className="w-full h-10 rounded-md border border-border bg-secondary px-3 text-sm"
            >
              {programs.length === 0 && (
                <option value="">No programs available</option>
              )}
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.programName} ({program.programCode})
                </option>
              ))}
            </select>
            {selectedProgram && (
              <p className="text-xs text-muted-foreground">
                {selectedProgram.duration} years {"->"}{" "}
                {selectedProgram.duration * 2} semesters
              </p>
            )}
          </div>
          <Button variant="outline" onClick={openProgramDialog}>
            Add Program First
          </Button>
          <Button onClick={openCreateCourseUnit} disabled={!selectedProgram}>
            Add Course Unit
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-72">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading course units...</p>
          </div>
        </div>
      ) : (
        <DataTable
          title={
            selectedProgram
              ? `${selectedProgram.programName} Course Units`
              : "Course Units"
          }
          data={courseUnits}
          searchKey="courseName"
          onAdd={openCreateCourseUnit}
          onEdit={openEditCourseUnit}
          onDelete={handleDeleteCourseUnit}
          columns={[
            {
              key: "courseCode",
              label: "Code",
              render: (item) => (
                <span className="font-mono font-semibold">
                  {item.courseCode}
                </span>
              ),
            },
            {
              key: "courseName",
              label: "Course Unit",
              render: (item) => (
                <span className="font-medium">{item.courseName}</span>
              ),
            },
            {
              key: "semesterLabel",
              label: "Semester",
            },
            {
              key: "instructor",
              label: "Instructor",
              render: (item) => (
                <span className="text-muted-foreground">{item.instructor}</span>
              ),
            },
            {
              key: "credits",
              label: "Credits",
            },
            {
              key: "status",
              label: "Status",
              render: (item) => (
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                >
                  {item.status === "active" ? "Active" : "Inactive"}
                </Badge>
              ),
            },
          ]}
        />
      )}

      <Dialog
        open={programDialogOpen}
        onOpenChange={(open) => !submitting && setProgramDialogOpen(open)}
      >
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Program</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Name *</Label>
                <Input
                  value={programForm.programName}
                  onChange={(event) =>
                    setProgramForm((previous) => ({
                      ...previous,
                      programName: event.target.value,
                    }))
                  }
                  placeholder="Bachelor of Computer Science"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Program Code *</Label>
                <Input
                  value={programForm.programCode}
                  onChange={(event) =>
                    setProgramForm((previous) => ({
                      ...previous,
                      programCode: event.target.value,
                    }))
                  }
                  placeholder="BCS"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Input
                  value={programForm.department}
                  onChange={(event) =>
                    setProgramForm((previous) => ({
                      ...previous,
                      department: event.target.value,
                    }))
                  }
                  placeholder="School of Computing"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={programForm.duration}
                  onChange={(event) =>
                    setProgramForm((previous) => ({
                      ...previous,
                      duration: Number(event.target.value) || 1,
                    }))
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={programForm.description}
                onChange={(event) =>
                  setProgramForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Program overview"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Credits *</Label>
                <Input
                  type="number"
                  min="1"
                  value={programForm.totalCredits}
                  onChange={(event) =>
                    setProgramForm((previous) => ({
                      ...previous,
                      totalCredits: Number(event.target.value) || 0,
                    }))
                  }
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={programForm.status === "active"}
                    onCheckedChange={(checked) =>
                      setProgramForm((previous) => ({
                        ...previous,
                        status: checked ? "active" : "inactive",
                      }))
                    }
                    disabled={submitting}
                  />
                  <span className="text-sm">
                    {programForm.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setProgramDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProgram} disabled={submitting}>
                {submitting ? "Saving..." : "Save Program"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={courseUnitDialogOpen}
        onOpenChange={(open) => !submitting && setCourseUnitDialogOpen(open)}
      >
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourseUnit ? "Edit Course Unit" : "Add Course Unit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input
                  value={courseUnitForm.courseCode}
                  onChange={(event) =>
                    setCourseUnitForm((previous) => ({
                      ...previous,
                      courseCode: event.target.value,
                    }))
                  }
                  placeholder="CSC101"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Credits *</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={courseUnitForm.credits}
                  onChange={(event) =>
                    setCourseUnitForm((previous) => ({
                      ...previous,
                      credits: Number(event.target.value) || 0,
                    }))
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course Unit Name *</Label>
              <Input
                value={courseUnitForm.courseName}
                onChange={(event) =>
                  setCourseUnitForm((previous) => ({
                    ...previous,
                    courseName: event.target.value,
                  }))
                }
                placeholder="Introduction to Programming"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instructor *</Label>
                <Input
                  value={courseUnitForm.instructor}
                  onChange={(event) =>
                    setCourseUnitForm((previous) => ({
                      ...previous,
                      instructor: event.target.value,
                    }))
                  }
                  placeholder="Dr. Jane Doe"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label>Semester *</Label>
                <select
                  value={selectedSemesterValue}
                  onChange={(event) => handleSemesterChange(event.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-secondary px-3 text-sm"
                  disabled={submitting || semesterOptions.length === 0}
                >
                  {semesterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prerequisites</Label>
              <Input
                value={courseUnitForm.prerequisites}
                onChange={(event) =>
                  setCourseUnitForm((previous) => ({
                    ...previous,
                    prerequisites: event.target.value,
                  }))
                }
                placeholder="CSC100"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={courseUnitForm.status === "active"}
                  onCheckedChange={(checked) =>
                    setCourseUnitForm((previous) => ({
                      ...previous,
                      status: checked ? "active" : "inactive",
                    }))
                  }
                  disabled={submitting}
                />
                <span className="text-sm">
                  {courseUnitForm.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCourseUnitDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCourseUnit} disabled={submitting}>
                {submitting ? "Saving..." : "Save Course Unit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
