import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { professorApi, getPublicProfessors } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Array<{ id: string; firstName: string; lastName: string }>;
}

export function CreateCoverModal({ open, onOpenChange, students }: Props) {
  const { t } = useTranslation("professor");
  const queryClient = useQueryClient();
  const [coverProfessorId, setCoverProfessorId] = useState("");
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: allProfessors } = useQuery({
    queryKey: ["public-professors"],
    queryFn: getPublicProfessors,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverProfessorId || !startsAt || !endsAt) return;
    setLoading(true);
    try {
      const result = await professorApi.createCover({
        coverProfessorId,
        studentIds: applyToAll ? undefined : selectedStudentIds,
        applyToAllStudents: applyToAll,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      toast.success(result.message || t("create_cover_modal.submit_button"));
      queryClient.invalidateQueries({ queryKey: ["professor-covers"] });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to create cover period");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-spanish-teal-600" />
            {t("create_cover_modal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("create_cover_modal.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("create_cover_modal.cover_professor_label")}</Label>
            <Select value={coverProfessorId} onValueChange={setCoverProfessorId}>
              <SelectTrigger>
                <SelectValue placeholder={t("create_cover_modal.cover_professor_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {allProfessors?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cover-starts">{t("create_cover_modal.starts_at_label")}</Label>
              <Input id="cover-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover-ends">{t("create_cover_modal.ends_at_label")}</Label>
              <Input id="cover-ends" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="apply-all" checked={applyToAll} onCheckedChange={(v) => setApplyToAll(!!v)} />
            <Label htmlFor="apply-all" className="cursor-pointer">{t("create_cover_modal.apply_to_all_label")}</Label>
          </div>

          {!applyToAll && (
            <div className="space-y-2">
              <Label>{t("create_cover_modal.select_students_label")}</Label>
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`student-${s.id}`}
                      checked={selectedStudentIds.includes(s.id)}
                      onCheckedChange={(checked) => {
                        setSelectedStudentIds(prev =>
                          checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                        );
                      }}
                    />
                    <Label htmlFor={`student-${s.id}`} className="cursor-pointer text-sm">
                      {s.firstName} {s.lastName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              {t("create_cover_modal.cancel_button")}
            </Button>
            <Button
              type="submit"
              disabled={!coverProfessorId || !startsAt || !endsAt || (!applyToAll && !selectedStudentIds.length) || loading}
              className="flex-1 bg-spanish-teal-600 hover:bg-spanish-teal-700"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("create_cover_modal.submit_loading")}</>
                : t("create_cover_modal.submit_button")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
