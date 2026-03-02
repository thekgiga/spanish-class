import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { confirmBooking, rejectBooking } from "@/lib/api";

type ActionType = "confirm" | "reject" | null;

export default function BookingConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["booking", "common"]);

  const [action, setAction] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError(t("confirmation.invalid_token"));
    }
  }, [token, t]);

  const handleConfirm = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      await confirmBooking(token);
      setSuccess(true);
      setAction("confirm");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t("confirmation.confirm_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      await rejectBooking(token, reason || undefined);
      setSuccess(true);
      setAction("reject");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t("confirmation.reject_error"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t("common:error")}</h2>
            <p className="text-gray-600">{t("confirmation.invalid_token")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            {action === "confirm" ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {t("confirmation.confirmed_title")}
                </h2>
                <p className="text-gray-600">
                  {t("confirmation.confirmed_message")}
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {t("confirmation.rejected_title")}
                </h2>
                <p className="text-gray-600">
                  {t("confirmation.rejected_message")}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("confirmation.title")}</CardTitle>
          <CardDescription>{t("confirmation.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">{t("confirmation.reason_label")}</Label>
              <Textarea
                id="reason"
                placeholder={t("confirmation.reason_placeholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1"
              variant="default"
            >
              {loading && action === "confirm" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("confirmation.confirming")}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t("common:confirm")} {t("confirmation.confirm_booking")}
                </>
              )}
            </Button>

            <Button
              onClick={handleReject}
              disabled={loading}
              className="flex-1"
              variant="destructive"
            >
              {loading && action === "reject" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("confirmation.rejecting")}
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  {t("confirmation.reject_booking")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
