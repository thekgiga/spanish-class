import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Settings,
  Clock,
  AlertTriangle,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { professorApi } from "@/lib/api";

const WINDOW_OPTIONS = [
  { value: 2, label: "2 hours" },
  { value: 4, label: "4 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours (recommended)" },
  { value: 48, label: "48 hours" },
];

export default function ProfessorSettingsPage() {
  const [cancellationWindowHours, setCancellationWindowHours] = useState(24);
  const [noShowThreshold, setNoShowThreshold] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    professorApi
      .getSettings()
      .then((data: any) => {
        const s = data.settings;
        setCancellationWindowHours(s.cancellationWindowHours);
        setNoShowThreshold(s.noShowThreshold);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await professorApi.updateSettings({
        cancellationWindowHours,
        noShowThreshold,
      });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-7 h-7 text-spanish-teal-600" />
        <h1 className="text-2xl font-bold text-slate-900">Professor Settings</h1>
      </div>

      {/* Cancellation window */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5 text-slate-500" />
            Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="window">Minimum notice for cancellation</Label>
            <Select
              value={String(cancellationWindowHours)}
              onValueChange={(v) => setCancellationWindowHours(Number(v))}
            >
              <SelectTrigger id="window" className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WINDOW_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Students must cancel at least this many hours before the class starts. Admin
              cancellations bypass this restriction.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* No-show threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            No-Show Threshold
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Alert after this many no-shows</Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              max={10}
              value={noShowThreshold}
              onChange={(e) => setNoShowThreshold(Number(e.target.value))}
              className="w-24"
            />
            <p className="text-xs text-slate-500">
              When a student reaches this number of no-shows, you'll be notified in the
              Mark No-Show response. Range: 1–10.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-spanish-teal-600 hover:bg-spanish-teal-700 text-white"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save settings
        </Button>
      </div>
    </div>
  );
}
