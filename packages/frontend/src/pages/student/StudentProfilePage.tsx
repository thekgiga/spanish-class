import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  User,
  Calendar,
  Phone,
  BookOpen,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Mail,
  Globe,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { SpanishLevelValues, ClassTypeValues } from "@spanish-class/shared";
import type {
  ProfileCompletion,
  SpanishLevel,
  ClassType,
} from "@spanish-class/shared";

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

// Helper function to get Spanish levels with translations
const getSpanishLevels = (
  t: any,
): {
  value: SpanishLevel;
  label: string;
  description: string;
}[] => [
  {
    value: SpanishLevelValues.I_DONT_KNOW,
    label: t("spanish_levels.UNKNOWN.label"),
    description: t("spanish_levels.UNKNOWN.description"),
  },
  {
    value: SpanishLevelValues.BEGINNER,
    label: t("spanish_levels.BEGINNER.label"),
    description: t("spanish_levels.BEGINNER.description"),
  },
  {
    value: SpanishLevelValues.ELEMENTARY,
    label: t("spanish_levels.ELEMENTARY.label"),
    description: t("spanish_levels.ELEMENTARY.description"),
  },
  {
    value: SpanishLevelValues.INTERMEDIATE,
    label: t("spanish_levels.INTERMEDIATE.label"),
    description: t("spanish_levels.INTERMEDIATE.description"),
  },
  {
    value: SpanishLevelValues.UPPER_INTERMEDIATE,
    label: t("spanish_levels.UPPER_INTERMEDIATE.label"),
    description: t("spanish_levels.UPPER_INTERMEDIATE.description"),
  },
  {
    value: SpanishLevelValues.ADVANCED,
    label: t("spanish_levels.ADVANCED.label"),
    description: t("spanish_levels.ADVANCED.description"),
  },
  {
    value: SpanishLevelValues.NATIVE,
    label: t("spanish_levels.NATIVE.label"),
    description: t("spanish_levels.NATIVE.description"),
  },
];

// Helper function to get class types with translations
const getClassTypes = (t: any): { value: ClassType; label: string }[] => [
  {
    value: ClassTypeValues.PRIVATE_LESSONS,
    label: t("class_types.PRIVATE_LESSONS"),
  },
  {
    value: ClassTypeValues.GROUP_CLASSES,
    label: t("class_types.GROUP_CLASSES"),
  },
  {
    value: ClassTypeValues.CONVERSATION_PRACTICE,
    label: t("class_types.CONVERSATION_PRACTICE"),
  },
  {
    value: ClassTypeValues.EXAM_PREPARATION,
    label: t("class_types.EXAM_PREPARATION"),
  },
  {
    value: ClassTypeValues.BUSINESS_SPANISH,
    label: t("class_types.BUSINESS_SPANISH"),
  },
  {
    value: ClassTypeValues.GRAMMAR_FOCUS,
    label: t("class_types.GRAMMAR_FOCUS"),
  },
  {
    value: ClassTypeValues.PRONUNCIATION,
    label: t("class_types.PRONUNCIATION"),
  },
  {
    value: ClassTypeValues.WRITING_SKILLS,
    label: t("class_types.WRITING_SKILLS"),
  },
];

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
  dateOfBirth: string;
  phoneNumber: string;
  aboutMe: string;
  spanishLevel: SpanishLevel | "";
  preferredClassTypes: ClassType[];
  learningGoals: string;
  availabilityNotes: string;
}

export function StudentProfilePage() {
  const { t } = useTranslation("student");
  const { user, setUser } = useAuthStore();
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);

  // Get translated options
  const spanishLevels = getSpanishLevels(t);
  const classTypes = getClassTypes(t);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      timezone: "",
      dateOfBirth: "",
      phoneNumber: "",
      aboutMe: "",
      spanishLevel: "",
      preferredClassTypes: [],
      learningGoals: "",
      availabilityNotes: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await studentApi.getProfile();
      setCompletion(data.completion);

      // Prepare profile data
      const formData = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        timezone: user?.timezone || "Europe/Madrid",
        dateOfBirth: data.profile.dateOfBirth
          ? new Date(data.profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        phoneNumber: data.profile.phoneNumber || "",
        aboutMe: data.profile.aboutMe || "",
        spanishLevel: (data.profile.spanishLevel || "") as SpanishLevel | "",
        preferredClassTypes: (data.profile.preferredClassTypes ||
          []) as ClassType[],
        learningGoals: data.profile.learningGoals || "",
        availabilityNotes: data.profile.availabilityNotes || "",
      };

      // Store for view mode and reset form
      setProfileData(formData);
      reset(formData);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || t("profile.personal_info.error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update account settings (first name, last name, timezone)
      const updatedUser = await authApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        timezone: data.timezone,
      });
      setUser(updatedUser);

      // Update student profile
      const updateData = {
        dateOfBirth: data.dateOfBirth || null,
        phoneNumber: data.phoneNumber || null,
        aboutMe: data.aboutMe || null,
        spanishLevel: data.spanishLevel || null,
        preferredClassTypes:
          data.preferredClassTypes.length > 0 ? data.preferredClassTypes : null,
        learningGoals: data.learningGoals || null,
        availabilityNotes: data.availabilityNotes || null,
      };

      const wasComplete = completion?.percentage === 100;
      const result = await studentApi.updateProfile(updateData);
      const isNowComplete = result.completion.percentage === 100;

      setCompletion(result.completion);
      setProfileData(data);
      setIsEditing(false);

      // Show celebration toast if profile just reached 100%
      if (!wasComplete && isNowComplete) {
        toast.success(t("profile.personal_info.success") + " 🎉", {
          duration: 5000,
        });
      } else {
        toast.success(t("profile.personal_info.success"));
      }
    } catch (error: any) {
      // Handle validation errors with field-specific messages
      if (
        error.response?.data?.details &&
        Array.isArray(error.response.data.details)
      ) {
        // Set form errors for each field
        error.response.data.details.forEach((detail: any) => {
          const fieldName = detail.field as keyof ProfileFormData;
          const message = detail.message || "Invalid value";

          if (fieldName) {
            setError(fieldName, {
              type: "server",
              message: message,
            });
          }
        });

        // Also show a toast with summary
        const fieldErrors = error.response.data.details
          .map((detail: any) => {
            const fieldName = detail.field || "Unknown field";
            const message = detail.message || "Invalid value";

            // Make field names more user-friendly
            const friendlyFieldNames: Record<string, string> = {
              dateOfBirth: "Date of Birth",
              phoneNumber: "Phone Number",
              aboutMe: "About Me",
              spanishLevel: "Spanish Level",
              preferredClassTypes: "Preferred Class Types",
              learningGoals: "Learning Goals",
              availabilityNotes: "Availability Notes",
            };

            const displayName = friendlyFieldNames[fieldName] || fieldName;
            return `• ${displayName}: ${message}`;
          })
          .join("\n");

        toast.error(`Please fix the following errors:\n${fieldErrors}`, {
          duration: 8000,
        });
      } else {
        toast.error(
          error.response?.data?.error || t("profile.personal_info.error"),
        );
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profileData) {
      reset(profileData);
    }
    setIsEditing(false);
  };

  const toggleClassType = (classType: ClassType, currentTypes: ClassType[]) => {
    if (currentTypes.includes(classType)) {
      return currentTypes.filter((t) => t !== classType);
    }
    return [...currentTypes, classType];
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLevelLabel = (value: string) => {
    const level = spanishLevels.find((l) => l.value === value);
    return level ? level.label : "Not selected";
  };

  const getClassTypeLabels = (values: ClassType[]) => {
    if (!values || values.length === 0) return "None selected";
    return values
      .map((v) => classTypes.find((ct) => ct.value === v)?.label)
      .filter(Boolean)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">
          {t("profile.title")}
        </h1>
        <p className="text-slate-600">{t("profile.subtitle")}</p>
      </div>

      {/* Profile Completion Indicator */}
      {completion && (
        <Card
          className={
            completion.percentage === 100
              ? "border-2 border-green-500"
              : "border-2 border-spanish-teal-200"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {t("profile.completion_title")}
                  </h3>
                  {completion.percentage === 100 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("profile.completion_complete")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("profile.completion_fields", {
                    completed: completion.completedCount,
                    total: completion.totalCount,
                  })}
                </p>
              </div>
              <div
                className={`text-3xl font-bold ${completion.percentage === 100 ? "text-green-600" : "text-gold-600"}`}
              >
                {completion.percentage}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  completion.percentage === 100
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : "bg-gradient-to-r from-gold-400 to-gold-600"
                }`}
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            {/* Completion Items */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {completion.items?.map((item: any) => (
                <div
                  key={item.field}
                  className={`flex items-center gap-2 text-sm p-2 rounded ${
                    item.completed
                      ? "text-green-700 bg-green-50"
                      : "text-gray-500 bg-gray-50"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isEditing && profileData ? (
        /* View Mode */
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t("profile.personal_info.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("profile.personal_info.description")}
                  </CardDescription>
                </div>
                <Button onClick={handleEdit} variant="outline">
                  {t("profile.edit_profile")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {t("profile.personal_info.first_name")}
                  </Label>
                  <p className="font-medium">
                    {profileData.firstName ||
                      t("profile.personal_info.not_provided")}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {t("profile.personal_info.last_name")}
                  </Label>
                  <p className="font-medium">
                    {profileData.lastName ||
                      t("profile.personal_info.not_provided")}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t("profile.personal_info.date_of_birth")}
                  </Label>
                  <p className="font-medium">
                    {formatDateForDisplay(profileData.dateOfBirth)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {t("profile.personal_info.phone")}
                  </Label>
                  <p className="font-medium">
                    {profileData.phoneNumber ||
                      t("profile.personal_info.not_provided")}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  {t("profile.personal_info.about_me")}
                </Label>
                <p className="font-medium whitespace-pre-wrap">
                  {profileData.aboutMe ||
                    t("profile.personal_info.not_provided")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t("profile.preferences.title")}
              </CardTitle>
              <CardDescription>
                {t("profile.preferences.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  {t("profile.preferences.spanish_level")}
                </Label>
                <p className="font-medium">
                  {getLevelLabel(profileData.spanishLevel)}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  {t("profile.preferences.preferred_class_types")}
                </Label>
                <p className="font-medium">
                  {getClassTypeLabels(profileData.preferredClassTypes)}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  {t("profile.preferences.learning_goals")}
                </Label>
                <p className="font-medium whitespace-pre-wrap">
                  {profileData.learningGoals ||
                    t("profile.personal_info.not_provided")}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t("profile.preferences.availability_notes")}
                </Label>
                <p className="font-medium whitespace-pre-wrap">
                  {profileData.availabilityNotes ||
                    t("profile.personal_info.not_provided")}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Settings */}
          <Card className="border-2 border-spanish-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("profile.account_settings.title")}
              </CardTitle>
              <CardDescription>
                {t("profile.account_settings.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-spanish-coral-600" />
                  {t("profile.personal_info.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-600">
                  {t("profile.personal_info.email_note")}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-spanish-teal-600" />
                  {t("profile.personal_info.timezone")}
                </Label>
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
                  {t("profile.personal_info.timezone_note")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details (US-18) */}
          <Card className="border-2 border-spanish-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("profile.personal_info.title")}
              </CardTitle>
              <CardDescription>
                {t("profile.personal_info.description_edit")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("profile.personal_info.first_name")}
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName", {
                      required: t("profile.personal_info.first_name_required"),
                    })}
                    className={
                      errors.firstName
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("profile.personal_info.last_name")}
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName", {
                      required: t("profile.personal_info.last_name_required"),
                    })}
                    className={
                      errors.lastName ? "border-red-500 focus:ring-red-500" : ""
                    }
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={
                      errors.dateOfBirth
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t("profile.personal_info.phone_placeholder")}
                    {...register("phoneNumber")}
                    className={
                      errors.phoneNumber
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutMe">
                  {t("profile.personal_info.about_me")}
                </Label>
                <Textarea
                  id="aboutMe"
                  placeholder={t("profile.personal_info.about_me_placeholder")}
                  className={`min-h-[100px] ${errors.aboutMe ? "border-red-500 focus:ring-red-500" : ""}`}
                  {...register("aboutMe")}
                />
                {errors.aboutMe ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.aboutMe.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    This helps your professor understand your background and
                    personalize lessons
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences (US-17) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Preferences
              </CardTitle>
              <CardDescription>
                Help us tailor your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("profile.preferences.spanish_level")}</Label>
                <Controller
                  name="spanishLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "profile.preferences.spanish_level_placeholder",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {spanishLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <span className="font-medium">{level.label}</span>
                              <span className="text-muted-foreground ml-2">
                                - {level.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("profile.preferences.preferred_class_types")}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("profile.preferences.preferred_class_types_note")}
                </p>
                <Controller
                  name="preferredClassTypes"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {classTypes.map((classType) => {
                        const isSelected = field.value.includes(
                          classType.value,
                        );
                        return (
                          <button
                            key={classType.value}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                toggleClassType(classType.value, field.value),
                              )
                            }
                            className={`p-3 text-sm rounded-lg border transition-all ${
                              isSelected
                                ? "bg-gold-50 border-gold-500 text-gold-800"
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {classType.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="learningGoals"
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Learning Goals
                </Label>
                <Textarea
                  id="learningGoals"
                  placeholder={t(
                    "profile.preferences.learning_goals_placeholder",
                  )}
                  className={`min-h-[100px] ${errors.learningGoals ? "border-red-500 focus:ring-red-500" : ""}`}
                  {...register("learningGoals")}
                />
                {errors.learningGoals && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.learningGoals.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="availabilityNotes"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Availability Notes
                </Label>
                <Textarea
                  id="availabilityNotes"
                  placeholder={t(
                    "profile.preferences.availability_notes_placeholder",
                  )}
                  className={`min-h-[80px] ${errors.availabilityNotes ? "border-red-500 focus:ring-red-500" : ""}`}
                  {...register("availabilityNotes")}
                />
                {errors.availabilityNotes && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.availabilityNotes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save and Cancel Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Save Profile
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
