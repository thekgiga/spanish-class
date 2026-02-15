import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { studentApi } from "@/lib/api";
import { SpanishLevelValues, ClassTypeValues } from "@spanish-class/shared";
import type {
  ProfileCompletion,
  SpanishLevel,
  ClassType,
} from "@spanish-class/shared";

const spanishLevels: {
  value: SpanishLevel;
  label: string;
  description: string;
}[] = [
  {
    value: SpanishLevelValues.I_DONT_KNOW,
    label: "I don't know",
    description: "Not sure about my level",
  },
  {
    value: SpanishLevelValues.BEGINNER,
    label: "Beginner (A1)",
    description: "Just starting out",
  },
  {
    value: SpanishLevelValues.ELEMENTARY,
    label: "Elementary (A2)",
    description: "Basic phrases and expressions",
  },
  {
    value: SpanishLevelValues.INTERMEDIATE,
    label: "Intermediate (B1)",
    description: "Can handle most situations",
  },
  {
    value: SpanishLevelValues.UPPER_INTERMEDIATE,
    label: "Upper Intermediate (B2)",
    description: "Fluent in familiar topics",
  },
  {
    value: SpanishLevelValues.ADVANCED,
    label: "Advanced (C1)",
    description: "Express ideas fluently",
  },
  {
    value: SpanishLevelValues.NATIVE,
    label: "Native (C2)",
    description: "Native or near-native",
  },
];

const classTypes: { value: ClassType; label: string }[] = [
  { value: ClassTypeValues.PRIVATE_LESSONS, label: "Private Lessons" },
  { value: ClassTypeValues.GROUP_CLASSES, label: "Group Classes" },
  {
    value: ClassTypeValues.CONVERSATION_PRACTICE,
    label: "Conversation Practice",
  },
  { value: ClassTypeValues.EXAM_PREPARATION, label: "Exam Preparation" },
  { value: ClassTypeValues.BUSINESS_SPANISH, label: "Business Spanish" },
  { value: ClassTypeValues.GRAMMAR_FOCUS, label: "Grammar Focus" },
  { value: ClassTypeValues.PRONUNCIATION, label: "Pronunciation" },
  { value: ClassTypeValues.WRITING_SKILLS, label: "Writing Skills" },
];

interface ProfileFormData {
  dateOfBirth: string;
  phoneNumber: string;
  aboutMe: string;
  spanishLevel: SpanishLevel | "";
  preferredClassTypes: ClassType[];
  learningGoals: string;
  availabilityNotes: string;
}

export function StudentProfilePage() {
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
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
      toast.error(error.response?.data?.error || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
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
        toast.success(
          "🎉 Congratulations! Your profile is now 100% complete!",
          {
            duration: 5000,
          },
        );
      } else {
        toast.success("Profile updated successfully");
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
        toast.error(error.response?.data?.error || "Failed to update profile");
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
        <h1 className="text-2xl font-display font-bold text-navy-800">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Complete your profile to help your professor personalize your learning
          experience
        </p>
      </div>

      {/* Profile Completion Indicator */}
      {completion && (
        <Card
          className={
            completion.percentage === 100 ? "border-2 border-green-500" : ""
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-800">
                    Profile Completion
                  </h3>
                  {completion.percentage === 100 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {completion.completedCount} of {completion.totalCount} fields
                  completed
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
                    Personal Details
                  </CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
                <Button onClick={handleEdit} variant="outline">
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <p className="font-medium">
                    {formatDateForDisplay(profileData.dateOfBirth)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <p className="font-medium">
                    {profileData.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">About Me</Label>
                <p className="font-medium whitespace-pre-wrap">
                  {profileData.aboutMe || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Preferences
              </CardTitle>
              <CardDescription>Your learning preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Spanish Level</Label>
                <p className="font-medium">
                  {getLevelLabel(profileData.spanishLevel)}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  Preferred Class Types
                </Label>
                <p className="font-medium">
                  {getClassTypeLabels(profileData.preferredClassTypes)}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Learning Goals
                </Label>
                <p className="font-medium whitespace-pre-wrap">
                  {profileData.learningGoals || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Availability Notes
                </Label>
                <p className="font-medium whitespace-pre-wrap">
                  {profileData.availabilityNotes || "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Details (US-18) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
              <CardDescription>Tell us a bit about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    placeholder="+1 (555) 000-0000"
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
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea
                  id="aboutMe"
                  placeholder="Tell us a bit about yourself, your background, and why you're learning Spanish..."
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
                <Label>Spanish Level</Label>
                <Controller
                  name="spanishLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current level" />
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
                <Label>Preferred Class Types</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select the types of classes you're interested in
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
                  placeholder="What do you hope to achieve? (e.g., prepare for DELE exam, business communication, travel, etc.)"
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
                  placeholder="Let us know your preferred times or any scheduling constraints..."
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
