import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { submitRating } from "@/lib/api";

interface RateUserModalProps {
  open: boolean;
  onClose: () => void;
  rateeId: string;
  rateeName: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export default function RateUserModal({
  open,
  onClose,
  rateeId,
  rateeName,
  bookingId,
  onSuccess,
}: RateUserModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setLoading(true);
    try {
      await submitRating(
        rateeId,
        rating,
        comment || undefined,
        bookingId,
        isAnonymous,
      );
      onSuccess?.();
      onClose();
      // Reset form
      setRating(0);
      setComment("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {rateeName}</DialogTitle>
          <DialogDescription>
            How was your experience? Your feedback helps improve the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked: boolean) => setIsAnonymous(checked)}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-600">
              Submit anonymously
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || loading}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
