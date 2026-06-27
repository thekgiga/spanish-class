import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

type State = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailChangePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [state, setState] = useState<State>(token ? "loading" : "no-token");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("no-token");
      return;
    }

    let cancelled = false;
    authApi
      .verifyEmailChange(token)
      .then(async () => {
        if (!cancelled) {
          setState("success");
          // Clear all local auth state — user must log in with new email
          await logout().catch(() => {});
          setTimeout(() => navigate("/auth", { replace: true }), 2500);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { response?: { data?: { error?: string } }; message?: string };
          setError(e.response?.data?.error || e.message || "Verification failed.");
          setState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
              <h1 className="text-xl font-bold text-slate-900 mb-2">Updating your email…</h1>
              <p className="text-slate-500 text-sm">Just a moment.</p>
            </>
          )}

          {state === "success" && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Email address updated!</h1>
              <p className="text-slate-500 text-sm mb-4">
                Your email address has been changed. Please log in with your new email address.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                />
              </div>
            </motion.div>
          )}

          {state === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Verification failed</h1>
              <p className="text-slate-500 text-sm mb-6">{error}</p>
              <Link
                to="/auth"
                className="block text-sm text-spanish-teal-600 hover:text-spanish-teal-700 font-medium"
              >
                Back to login
              </Link>
            </>
          )}

          {state === "no-token" && (
            <>
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid verification link</h1>
              <p className="text-slate-500 text-sm mb-6">
                This email change verification link is missing or malformed. Please use the link
                from your verification email.
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
