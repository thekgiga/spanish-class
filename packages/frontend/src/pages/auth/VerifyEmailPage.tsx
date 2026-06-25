import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

type State = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, user } = useAuthStore();
  const [state, setState] = useState<State>(token ? "loading" : "no-token");
  const [error, setError] = useState<string>("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("no-token");
      return;
    }

    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setState("success");
          setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { response?: { data?: { error?: string } }; message?: string };
          setError(e.response?.data?.error || e.message || "Verification failed.");
          setState("error");
        }
      });

    return () => { cancelled = true; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    const email = user?.email;
    if (!email) return;
    setResending(true);
    try {
      await resendVerification(email);
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-spanish-teal-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          {state === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-spanish-teal-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Verifying your email…</h1>
              <p className="text-slate-500 text-sm">Just a moment.</p>
            </>
          )}

          {state === "success" && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Email verified!</h1>
              <p className="text-slate-500 text-sm mb-4">
                Your email has been verified. Redirecting you to your dashboard…
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </motion.div>
          )}

          {state === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Verification failed</h1>
              <p className="text-slate-500 text-sm mb-6">{error}</p>
              <div className="space-y-3">
                {user && (
                  <Button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-spanish-teal-600 hover:bg-spanish-teal-700 text-white"
                  >
                    {resending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                    ) : (
                      <><RefreshCw className="w-4 h-4 mr-2" /> Resend verification email</>
                    )}
                  </Button>
                )}
                <Link
                  to="/auth"
                  className="block text-sm text-slate-500 hover:text-slate-700"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}

          {state === "no-token" && (
            <>
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid verification link</h1>
              <p className="text-slate-500 text-sm mb-6">
                This verification link is missing or malformed. Please use the link from your
                verification email, or request a new one.
              </p>
              <Link to="/auth" className="text-sm text-spanish-teal-600 hover:text-spanish-teal-700 font-medium">
                Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
