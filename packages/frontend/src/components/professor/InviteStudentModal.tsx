import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { professorApi } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteStudentModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation("professor");
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const result = await professorApi.inviteStudent(email.trim());
      toast.success(result.message || t("invite_student_modal.submit_button"));
      queryClient.invalidateQueries({ queryKey: ["professor-students"] });
      queryClient.invalidateQueries({ queryKey: ["professor-pending-invitations"] });
      setEmail("");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-spanish-teal-600" />
            {t("invite_student_modal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("invite_student_modal.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">{t("invite_student_modal.email_label")}</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("invite_student_modal.email_placeholder")}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              {t("invite_student_modal.cancel_button")}
            </Button>
            <Button type="submit" disabled={!email.trim() || loading} className="flex-1 bg-spanish-teal-600 hover:bg-spanish-teal-700">
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("invite_student_modal.submit_loading")}</>
                : t("invite_student_modal.submit_button")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
