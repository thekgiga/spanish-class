import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      setError("Invalid or missing confirmation token");
    }
  }, [token]);

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
      setError(err.response?.data?.error || "Failed to confirm booking");
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
      setError(err.response?.data?.error || "Failed to reject booking");
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
            <p className="text-gray-600">Invalid or missing confirmation token</p>
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
                <h2 className="text-2xl font-bold mb-2">{t("bookingConfirmed")}</h2>
                <p className="text-gray-600">
                  The student has been notified. Redirecting to dashboard...
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t("bookingRejected")}</h2>
                <p className="text-gray-600">
                  The student has been notified. Redirecting to dashboard...
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
          <CardTitle>Booking Confirmation</CardTitle>
          <CardDescription>
            Please confirm or reject this booking request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Rejection (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason if rejecting..."
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
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t("common:confirm")} Booking
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
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Booking
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
