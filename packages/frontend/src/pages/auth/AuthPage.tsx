import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@spanish-class/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register" | "register-success" | "totp";

export function AuthPage() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() =>
    searchParams.get("tab") === "register" ? "register" : "login",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const totpInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { login, register: registerUser, setUser } = useAuthStore();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Show invitation feedback toasts from backend redirects
  useEffect(() => {
    if (searchParams.get("invitation_expired") === "1") {
      toast.error(t("invitation.expired"));
    } else if (searchParams.get("invitation_already_accepted") === "1") {
      toast(t("invitation.already_accepted"));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Register form — pre-fill from invitation URL params
  const urlEmail = searchParams.get("email") ?? "";
  const urlInviteToken = searchParams.get("invite") ?? "";
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      email: urlEmail || undefined,
      inviteToken: urlInviteToken || undefined,
    },
  });

  const onLogin = async (data: LoginInput) => {
    // Warm the code-split chunks for the destination shell + landing page
    // before the redirect fires. Vite marks these as prefetch hints without
    // blocking submission — if they resolve first (usually), the post-login
    // Suspense fallback is skipped entirely and content is visible in one
    // paint. If the network beats them, the nested Suspense in
    // DashboardLayout still renders a geometry-matched skeleton.
    void import("@/pages/student/StudentDashboard");
    void import("@/pages/admin/CalendarPage");
    try {
      const result = await login(data.email, data.password);
      if (result?.totpRequired) {
        setMode("totp");
        setTimeout(() => totpInputRef.current?.focus(), 100);
        return;
      }
      toast.success(t("login.success_message"));
      const { user } = useAuthStore.getState();
      const defaultDest = user?.isAdmin ? "/admin" : "/dashboard";
      navigate(from === "/dashboard" ? defaultDest : from, { replace: true });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
        rateLimitMessage?: string;
      };
      console.error("Login error:", error);
      const errorMessage =
        err.rateLimitMessage || err.response?.data?.error || err.message || t("login.error_default");
      toast.error(errorMessage);
    }
  };

  const onRegister = async (data: RegisterInput) => {
    try {
      const result = await registerUser(data);
      if (result?.requiresEmailVerification) {
        setMode("register-success");
      } else {
        toast.success(t("register.success_message"));
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; rateLimitMessage?: string };
      toast.error(err.rateLimitMessage || err.response?.data?.error || t("register.error_default"));
    }
  };

  const onTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) return;
    setTotpLoading(true);
    try {
      const res = await api.post("/auth/2fa/verify", { code: totpCode });
      const { user, token } = res.data?.data ?? {};
      if (token) localStorage.setItem("token", token);
      if (user) setUser({ ...user, twoFactorEnabled: true });
      toast.success("Logged in successfully");
      const { user: authedUser } = useAuthStore.getState();
      const defaultDest = authedUser?.isAdmin ? "/admin" : "/dashboard";
      navigate(from === "/dashboard" ? defaultDest : from, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; rateLimitMessage?: string };
      toast.error(err.rateLimitMessage || err.response?.data?.error || "Invalid code. Please try again.");
      setTotpCode("");
      totpInputRef.current?.focus();
    } finally {
      setTotpLoading(false);
    }
  };

  const isLoading =
    loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-spanish-teal-50 via-white to-spanish-coral-50 relative overflow-hidden">
      {/* Decorative colorful blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-teal-400 to-spanish-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-coral-400 to-spanish-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-spanish-sunshine-300 to-spanish-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-spanish-teal-200">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-3 mb-6 group"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-display text-3xl font-bold">
                  S
                </span>
              </div>
            </Link>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
              {mode === "login" ? t("login.title") : t("register.title")}
            </h1>
            <p className="text-slate-600">
              {mode === "login" ? t("login.subtitle") : t("register.subtitle")}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 p-1 bg-gradient-to-r from-spanish-teal-50 to-spanish-coral-50 rounded-2xl border-2 border-spanish-teal-200">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200",
                mode === "register"
                  ? "bg-white text-spanish-coral-600 shadow-lg"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {t("register.tab_label")}
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200",
                mode === "login"
                  ? "bg-white text-spanish-teal-600 shadow-lg"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {t("login.tab_label")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "register" ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Benefits */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-spanish-teal-50 to-spanish-coral-50 border-2 border-spanish-teal-200">
                  <p className="font-semibold text-spanish-coral-600 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {t("register.benefits_title")}
                  </p>
                  <ul className="space-y-2">
                    {[
                      t("register.benefit_1"),
                      t("register.benefit_2"),
                      t("register.benefit_3"),
                      t("register.benefit_4"),
                    ].map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-5 w-5 text-spanish-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Register Form */}
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-slate-700 font-medium"
                      >
                        {t("register.first_name_label")}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input
                          id="firstName"
                          placeholder={t("register.first_name_placeholder")}
                          className="pl-10 bg-white border-spanish-coral-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-coral-500 focus:ring-spanish-coral-500/20"
                          {...registerForm.register("firstName")}
                        />
                      </div>
                      {registerForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500">
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-slate-700 font-medium"
                      >
                        {t("register.last_name_label")}
                      </Label>
                      <Input
                        id="lastName"
                        placeholder={t("register.last_name_placeholder")}
                        className="bg-white border-spanish-coral-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-coral-500 focus:ring-spanish-coral-500/20"
                        {...registerForm.register("lastName")}
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500">
                          {registerForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-email"
                      className="text-slate-700 font-medium"
                    >
                      {t("register.email_label")}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t("register.email_placeholder")}
                        className="pl-10 bg-white border-spanish-coral-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-coral-500 focus:ring-spanish-coral-500/20"
                        {...registerForm.register("email")}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-password"
                      className="text-slate-700 font-medium"
                    >
                      {t("register.password_label")}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("register.password_placeholder")}
                        className="pl-10 pr-12 bg-white border-spanish-coral-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-coral-500 focus:ring-spanish-coral-500/20"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {urlInviteToken && (
                    <p className="text-xs text-spanish-teal-600">
                      ✓ {t("invitation.applied")}
                    </p>
                  )}

                  <Button variant="primary"
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      t("register.submit_loading")
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        {t("register.submit_button")}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Switch to Login */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    {t("register.switch_text")}{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-spanish-teal-600 hover:text-spanish-teal-700 transition-colors underline"
                    >
                      {t("register.switch_link")}
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Login Form */}
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-slate-700 font-medium"
                    >
                      {t("login.email_label")}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t("login.email_placeholder")}
                        className="pl-10 bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-slate-700 font-medium"
                    >
                      {t("login.password_label")}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("login.password_placeholder")}
                        className="pl-10 pr-12 bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-xs text-slate-500 hover:text-spanish-teal-600 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <Button variant="primary"
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      t("login.submit_loading")
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        {t("login.submit_button")}
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Switch to Register */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    {t("login.switch_text")}{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-semibold text-spanish-coral-600 hover:text-spanish-coral-700 transition-colors underline"
                    >
                      {t("login.switch_link")}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {mode === "register-success" && (
              <motion.div
                key="register-success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-4 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
                <p className="text-slate-500 text-sm mb-6">
                  We've sent a verification email to your inbox. Click the link in the email to
                  activate your account and start learning.
                </p>
                <p className="text-xs text-slate-400 mb-6">
                  Don't see it? Check your spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-spanish-teal-600 hover:text-spanish-teal-700 font-medium"
                >
                  Go to login
                </button>
              </motion.div>
            )}

            {mode === "totp" && (
              <motion.div
                key="totp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-spanish-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-spanish-teal-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Two-Factor Authentication</h2>
                  <p className="text-sm text-slate-500">Enter the 6-digit code from your authenticator app</p>
                </div>

                <form onSubmit={onTotpSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="totp-code" className="text-slate-700 font-medium">
                      Authentication Code
                    </Label>
                    <Input
                      id="totp-code"
                      ref={totpInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-[0.5em] font-mono bg-white border-spanish-teal-200 focus:border-spanish-teal-500"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <Button variant="primary"
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-spanish-teal-500 to-spanish-teal-600 hover:from-spanish-teal-600 hover:to-spanish-teal-700 shadow-xl"
                    disabled={totpLoading || totpCode.length !== 6}
                  >
                    {totpLoading ? "Verifying..." : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Verify & Sign In
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setTotpCode(""); }}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
