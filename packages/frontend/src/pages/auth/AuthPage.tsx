import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { PrimaryButton } from "@/components/ui/premium";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

export function AuthPage() {
  const { t } = useTranslation("auth");
  const location = useLocation();
  // Default to login mode
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuthStore();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onLogin = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      toast.success(t("login.success_message"));
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Login error:", error);
      const errorMessage =
        err.response?.data?.error || err.message || t("login.error_default");
      toast.error(errorMessage);
    }
  };

  const onRegister = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      toast.success(t("register.success_message"));
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || t("register.error_default"));
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

                  <PrimaryButton
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
                  </PrimaryButton>
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
                  </div>

                  <PrimaryButton
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
                  </PrimaryButton>
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
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
