import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, Shield, AlertTriangle, Eye, EyeOff, Loader2, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth";
import { authApi, notificationApi } from "@/lib/api";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { DeleteAccountDialog } from "@/components/shared/DeleteAccountDialog";

const timezones = [
  "Europe/Madrid",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangeEmailFormData {
  newEmail: string;
  currentPassword: string;
}

export function SettingsPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { user, setUser, logoutAll, changePassword, changeEmail } = useAuthStore();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isLogoutAllLoading, setIsLogoutAllLoading] = useState(false);
  const [isEmailChangePending, setIsEmailChangePending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Notification preferences (N2)
  const queryClient = useQueryClient();
  const { data: notifPrefs } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationApi.getPreferences,
  });
  const togglePrefMutation = useMutation({
    mutationFn: ({ type, enabled }: { type: string; enabled: boolean }) =>
      notificationApi.updatePreference(type, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
    onError: () => toast.error("Failed to update preference"),
  });

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    control,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      timezone: user?.timezone || "Europe/Madrid",
    },
  });

  // Change-password form
  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: isPwSubmitting },
  } = useForm<ChangePasswordFormData>();

  const newPasswordValue = watchPw("newPassword") ?? "";

  // Change-email form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm<ChangeEmailFormData>();

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await authApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        timezone: data.timezone,
      });
      setUser(updatedUser);
      toast.success(t("settings.success"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || t("settings.error"));
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      toast.success(t("settings.password.success"));
      resetPw();
      // changePassword clears auth state — redirect to login
      navigate("/auth", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; rateLimitMessage?: string };
      toast.error(err.rateLimitMessage || err.response?.data?.error || t("settings.password.error"));
    }
  };

  const onChangeEmail = async (data: ChangeEmailFormData) => {
    setIsEmailChangePending(true);
    try {
      await changeEmail(data.newEmail, data.currentPassword);
      toast.success(t("settings.email_change.success"));
      resetEmail();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; rateLimitMessage?: string };
      toast.error(err.rateLimitMessage || err.response?.data?.error || t("settings.email_change.error"));
    } finally {
      setIsEmailChangePending(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLogoutAllLoading(true);
    try {
      await logoutAll();
      toast.success(t("settings.security.logout_all_success"));
      navigate("/auth", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || t("settings.security.logout_all_error"));
    } finally {
      setIsLogoutAllLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">
          {t("settings.title")}
        </h1>
        <p className="text-slate-600">{t("settings.subtitle")}</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-2 border-spanish-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("settings.profile.title")}
          </CardTitle>
          <CardDescription>{t("settings.profile.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("settings.profile.first_name")}</Label>
                <Input
                  id="firstName"
                  {...registerProfile("firstName", { required: "First name is required" })}
                  error={profileErrors.firstName?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("settings.profile.last_name")}</Label>
                <Input
                  id="lastName"
                  {...registerProfile("lastName", { required: "Last name is required" })}
                  error={profileErrors.lastName?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("settings.profile.email")}</Label>
              <Input
                id="email"
                type="email"
                {...registerProfile("email")}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                {t("settings.email_change.title") + " — "}
                <span className="text-slate-600">{t("settings.profile.email_note")}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.profile.timezone")}</Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-slate-600">Set your timezone for accurate session times</p>
            </div>

            <Button type="submit" isLoading={isProfileSubmitting}>
              {t("settings.profile.save_button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("settings.password.title")}
          </CardTitle>
          <CardDescription>{t("settings.password.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("settings.password.current_password")}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  {...registerPw("currentPassword", { required: "Current password is required" })}
                  error={pwErrors.currentPassword?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.password.new_password")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10"
                  {...registerPw("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Must be at least 8 characters" },
                  })}
                  error={pwErrors.newPassword?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrengthMeter password={newPasswordValue} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("settings.password.confirm_password")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10"
                  {...registerPw("confirmPassword", { required: "Please confirm your password" })}
                  error={pwErrors.confirmPassword?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isPwSubmitting}>
              {t("settings.password.submit_button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Address Change */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("settings.email_change.title")}
          </CardTitle>
          <CardDescription>{t("settings.email_change.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit(onChangeEmail)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.email_change.current_email")}</Label>
              <Input value={user?.email || ""} disabled className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">{t("settings.email_change.new_email")}</Label>
              <Input
                id="newEmail"
                type="email"
                autoComplete="email"
                {...registerEmail("newEmail", {
                  required: "New email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                })}
                error={emailErrors.newEmail?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailCurrentPassword">{t("settings.email_change.current_password")}</Label>
              <div className="relative">
                <Input
                  id="emailCurrentPassword"
                  type={showEmailPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  {...registerEmail("currentPassword", { required: "Password is required" })}
                  error={emailErrors.currentPassword?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                >
                  {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isEmailChangePending}>
              {t("settings.email_change.submit_button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("settings.security.title")}
          </CardTitle>
          <CardDescription>{t("settings.security.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-800 text-sm">{t("settings.security.logout_all_button")}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t("settings.security.logout_all_confirm")}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              disabled={isLogoutAllLoading}
              className="ml-4 whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              {isLogoutAllLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing out…</>
              ) : (
                t("settings.security.logout_all_button")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences (N2) */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose which notifications you receive in-app.</CardDescription>
        </CardHeader>
        <CardContent>
          {notifPrefs && notifPrefs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifPrefs.map((pref) => (
                <div key={pref.type} className="flex items-center justify-between py-2.5">
                  <label
                    htmlFor={`notif-${pref.type}`}
                    className="text-sm text-slate-700 cursor-pointer select-none"
                  >
                    {pref.label}
                  </label>
                  <Checkbox
                    id={`notif-${pref.type}`}
                    checked={pref.enabled}
                    onCheckedChange={(checked) =>
                      togglePrefMutation.mutate({ type: pref.type, enabled: !!checked })
                    }
                    disabled={togglePrefMutation.isPending}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading preferences…</p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {t("settings.danger_zone.title")}
          </CardTitle>
          <CardDescription className="text-red-600/80">
            {t("settings.danger_zone.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 text-sm">{t("settings.danger_zone.delete_button")}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t("settings.danger_zone.delete_dialog_description")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="ml-4 whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              {t("settings.danger_zone.delete_button")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
