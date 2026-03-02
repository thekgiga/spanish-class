import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { loginSchema, type LoginInput } from "@spanish-class/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrimaryButton } from "@/components/ui/premium";
import { useAuthStore } from "@/stores/auth";

export function LoginPage() {
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
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
              {t("login.title")}
            </h1>
            <p className="text-slate-600">{t("login.subtitle")}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            autoComplete="on"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                {t("login.email_label")}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.email_placeholder")}
                  autoComplete="username email"
                  className="pl-10 bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                {t("login.password_label")}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.password_placeholder")}
                  autoComplete="current-password"
                  className="pl-10 pr-12 bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                  {...register("password")}
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
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <PrimaryButton
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-spanish-coral-500 to-spanish-orange-500 hover:from-spanish-coral-600 hover:to-spanish-orange-600 shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-spanish-teal-100">
            <p className="text-center text-sm text-slate-600">
              {t("login.switch_text")}{" "}
              <Link
                to="/register"
                className="font-semibold text-spanish-teal-600 hover:text-spanish-teal-700 transition-colors"
              >
                {t("login.switch_link")}
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-4 -right-4 bg-gradient-to-br from-spanish-coral-500 to-spanish-coral-600 text-white px-4 py-2 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {t("register.switch_link")}
        </motion.div>
      </motion.div>
    </div>
  );
}
