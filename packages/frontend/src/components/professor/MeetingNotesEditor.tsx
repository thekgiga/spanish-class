import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FileText, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { professorApi } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  sessionTitle?: string;
}

export function MeetingNotesEditor({ open, onOpenChange, bookingId, sessionTitle }: Props) {
  const { t } = useTranslation("professor");
  const queryClient = useQueryClient();
  const [agendaNotes, setAgendaNotes] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  const { data: existingNote, isLoading } = useQuery({
    queryKey: ["meeting-note", bookingId],
    queryFn: () => professorApi.getMeetingNote(bookingId),
    enabled: open && !!bookingId,
  });

  useEffect(() => {
    if (existingNote) {
      setAgendaNotes(existingNote.agendaNotes ?? "");
      setSessionNotes(existingNote.sessionNotes ?? "");
    } else if (!existingNote && !isLoading) {
      setAgendaNotes("");
      setSessionNotes("");
    }
  }, [existingNote, isLoading]);

  const saveMutation = useMutation({
    mutationFn: () => professorApi.saveMeetingNote(bookingId, { agendaNotes: agendaNotes || undefined, sessionNotes: sessionNotes || undefined }),
    onSuccess: () => {
      toast.success(t("meeting_notes.saved"));
      queryClient.invalidateQueries({ queryKey: ["meeting-note", bookingId] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || t("meeting_notes.save_error"));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-spanish-teal-600" />
            {t("meeting_notes.title")}
          </DialogTitle>
          {sessionTitle && (
            <DialogDescription>{sessionTitle}</DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-spanish-teal-500" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="agenda-notes">{t("meeting_notes.agenda_label")}</Label>
              <Textarea
                id="agenda-notes"
                value={agendaNotes}
                onChange={(e) => setAgendaNotes(e.target.value)}
                placeholder={t("meeting_notes.agenda_placeholder")}
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-notes">{t("meeting_notes.session_label")}</Label>
              <Textarea
                id="session-notes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder={t("meeting_notes.session_placeholder")}
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saveMutation.isPending}>
                {t("meeting_notes.cancel")}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-spanish-teal-600 hover:bg-spanish-teal-700"
                disabled={saveMutation.isPending || (!agendaNotes && !sessionNotes)}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("meeting_notes.saving")}</>
                  : <><Save className="h-4 w-4 mr-2" /> {t("meeting_notes.save")}</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
