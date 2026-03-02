import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import PriceInputField from "@/components/forms/PriceInputField";
import { createStudentPricing, updateStudentPricing } from "@/lib/api";
import type { StudentPricing } from "@spanish-class/shared";

interface StudentPricingModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  existingPricing?: StudentPricing | null;
  onSuccess?: () => void;
}

export default function StudentPricingModal({
  open,
  onClose,
  studentId,
  studentName,
  existingPricing,
  onSuccess,
}: StudentPricingModalProps) {
  const { t } = useTranslation(["professor", "common"]);
  const [priceRSD, setPriceRSD] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingPricing) {
      setPriceRSD(existingPricing.priceRSD);
      setNotes(existingPricing.notes || "");
    } else {
      setPriceRSD(0);
      setNotes("");
    }
  }, [existingPricing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (existingPricing) {
        await updateStudentPricing(studentId, priceRSD, notes || undefined);
      } else {
        await createStudentPricing(studentId, priceRSD, notes || undefined);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error || t("professor:student_pricing.save_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingPricing
              ? t("professor:student_pricing.modal_title_update", {
                  studentName,
                })
              : t("professor:student_pricing.modal_title_set", { studentName })}
          </DialogTitle>
          <DialogDescription>
            {t("professor:student_pricing.modal_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">
                {t("professor:student_pricing.price_field_label")}
              </Label>
              <PriceInputField
                value={priceRSD}
                onChange={setPriceRSD}
                placeholder={t("professor:student_pricing.price_placeholder")}
              />
              <p className="text-sm text-gray-500">
                {t("professor:student_pricing.price_recommendation")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                {t("professor:student_pricing.notes_label")}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("professor:student_pricing.notes_placeholder")}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("professor:student_pricing.saving")}
                </>
              ) : (
                t("common:actions.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
