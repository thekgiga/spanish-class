import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Star, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { feedbackApi, studentApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function FeedbackPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("student");

  const [booking, setBooking] = useState<any>(null);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [whatWasGood, setWhatWasGood] = useState("");
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    Promise.all([
      studentApi.getBooking(bookingId).catch(() => null),
      feedbackApi.getBookingFeedback(bookingId).catch(() => null),
    ]).then(([b, f]) => {
      setBooking(b);
      setExistingFeedback(f);
      setLoading(false);
    });
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        bookingId: bookingId!,
        rating,
        whatWasGood: whatWasGood.trim() || undefined,
        whatCouldBeImproved: whatCouldBeImproved.trim() || undefined,
      });
      toast.success(t("feedback.success"));
      navigate("/dashboard/bookings", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-spanish-teal-500" />
      </div>
    );
  }

  if (existingFeedback) {
    return (
      <div className="max-w-lg mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center border-2 border-green-200">
            <CardContent className="pt-10 pb-8 space-y-4">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">{t("feedback.already_submitted")}</h2>
              <p className="text-slate-500 text-sm">
                You rated this session{" "}
                <span className="font-semibold text-yellow-500">{"★".repeat(existingFeedback.rating)}</span>
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard/bookings">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Bookings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const sessionTitle = booking?.slot?.title || "Spanish Class";
  const professorName = booking?.slot?.professor
    ? `${booking.slot.professor.firstName} ${booking.slot.professor.lastName}`
    : "your professor";
  const sessionDate = booking?.slot?.startTime
    ? new Date(booking.slot.startTime).toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric",
      })
    : "";

  return (
    <div className="max-w-lg mx-auto pt-4">
      <Link
        to="/dashboard/bookings"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 border-spanish-teal-200">
          <CardHeader>
            <CardTitle className="text-xl">{t("feedback.page_title")}</CardTitle>
            <CardDescription>
              {sessionTitle}
              {sessionDate && ` · ${sessionDate}`}
              {` · with ${professorName}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("feedback.rating_label")}</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-300",
                        )}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-slate-500 self-center">
                      {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* What was good */}
              <div className="space-y-1.5">
                <Label htmlFor="whatWasGood" className="text-sm font-medium">
                  {t("feedback.what_was_good_label")}
                </Label>
                <Textarea
                  id="whatWasGood"
                  rows={3}
                  placeholder={t("feedback.what_was_good_placeholder")}
                  value={whatWasGood}
                  onChange={(e) => setWhatWasGood(e.target.value)}
                  maxLength={2000}
                />
              </div>

              {/* What could be improved */}
              <div className="space-y-1.5">
                <Label htmlFor="whatCouldBeImproved" className="text-sm font-medium">
                  {t("feedback.what_could_improve_label")}
                </Label>
                <Textarea
                  id="whatCouldBeImproved"
                  rows={3}
                  placeholder={t("feedback.what_could_improve_placeholder")}
                  value={whatCouldBeImproved}
                  onChange={(e) => setWhatCouldBeImproved(e.target.value)}
                  maxLength={2000}
                />
              </div>

              <Button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full bg-spanish-teal-600 hover:bg-spanish-teal-700"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
                ) : (
                  t("feedback.submit_button")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
