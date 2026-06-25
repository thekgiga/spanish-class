import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MailWarning, X, RefreshCw, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export function EmailVerificationBanner() {
  const { user, emailVerified, resendVerification } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  // Don't render if verified, dismissed, or no user
  if (!user || emailVerified !== false || dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(user.email);
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-amber-800 text-sm">
          <MailWarning className="w-4 h-4 flex-shrink-0" />
          <span>
            Please verify your email address to unlock all features.{" "}
            <Link to="/verify-email" className="underline font-medium hover:text-amber-900">
              Check inbox
            </Link>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            {resending ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</>
            ) : (
              <><RefreshCw className="w-3 h-3" /> Resend verification</>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-amber-500 hover:text-amber-700"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
