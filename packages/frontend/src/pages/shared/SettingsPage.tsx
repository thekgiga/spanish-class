import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { User } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/api";

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

export function SettingsPage() {
  const { t } = useTranslation("common");
  const { user, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      timezone: user?.timezone || "Europe/Madrid",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await authApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        timezone: data.timezone,
      });
      setUser(updatedUser);
      toast.success(t("settings.success"));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("settings.error"));
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("settings.profile.first_name")}
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  error={errors.firstName?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t("settings.profile.last_name")}
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("settings.profile.email")}</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-600">
                {t("settings.profile.email_note")}
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
              <p className="text-xs text-slate-600">
                Set your timezone for accurate session times
              </p>
            </div>

            <Button type="submit" isLoading={isSubmitting}>
              {t("settings.profile.save_button")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
