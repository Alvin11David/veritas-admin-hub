import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "toggle" | "date" | "email" | "number";
  placeholder?: string;
  options?: string[];
}

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export function FormDialog({
  open,
  onClose,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = "Save",
  disabled = false,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {field.label}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="bg-secondary border-border min-h-[100px]"
                  disabled={disabled}
                />
              ) : field.type === "toggle" ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!values[field.key]}
                    onCheckedChange={(v) => onChange(field.key, v)}
                    disabled={disabled}
                  />
                  <span className="text-sm text-foreground">
                    {values[field.key] ? "Yes" : "No"}
                  </span>
                </div>
              ) : (
                <>
                  <Input
                    type={field.type}
                    list={field.options?.length ? `${field.key}-options` : undefined}
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      onChange(
                        field.key,
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                      )
                    }
                    className="bg-secondary border-border"
                    disabled={disabled}
                  />
                  {field.options?.length ? (
                    <datalist id={`${field.key}-options`}>
                      {field.options.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  ) : null}
                </>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border"
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={disabled}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
