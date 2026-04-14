import { FormEvent, useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_SOFTWARE_NAME, useAppSettings } from "@/lib/app-settings";

export default function SettingsPage() {
  const { settings, setSoftwareName } = useAppSettings();
  const [softwareName, setSoftwareNameInput] = useState(settings.softwareName);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setSoftwareNameInput(settings.softwareName);
  }, [settings.softwareName]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = setSoftwareName(softwareName);
    setSoftwareNameInput(updated.softwareName);
    setStatusMessage("Software name saved.");
  };

  const onReset = () => {
    const updated = setSoftwareName(DEFAULT_SOFTWARE_NAME);
    setSoftwareNameInput(updated.softwareName);
    setStatusMessage("Software name reset to default.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace-level settings for the admin software.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Software Branding</CardTitle>
          <CardDescription>
            Choose the software name displayed in the sidebar and browser tab
            title.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="software-name">Software name</Label>
              <Input
                id="software-name"
                value={softwareName}
                onChange={(event) => {
                  setSoftwareNameInput(event.target.value);
                  if (statusMessage) {
                    setStatusMessage("");
                  }
                }}
                placeholder="Enter software name"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground">
                Empty values automatically fall back to the default name.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm">
                <Save className="h-4 w-4" /> Save Name
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <RotateCcw className="h-4 w-4" /> Reset Default
              </Button>
            </div>
            {statusMessage && (
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
