import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { ArrowLeft, Calendar, Check } from "lucide-react";
import {
  bulkCreateSlotSchema,
  type BulkCreateSlotInput,
} from "@spanish-class/shared";
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
import { cn } from "@/lib/utils";
import { professorApi } from "@/lib/api";

const daysOfWeek = [
  { value: 1, labelKey: "slots.form.weekdays.mon" },
  { value: 2, labelKey: "slots.form.weekdays.tue" },
  { value: 3, labelKey: "slots.form.weekdays.wed" },
  { value: 4, labelKey: "slots.form.weekdays.thu" },
  { value: 5, labelKey: "slots.form.weekdays.fri" },
  { value: 6, labelKey: "slots.form.weekdays.sat" },
  { value: 0, labelKey: "slots.form.weekdays.sun" },
];

export function BulkSlotPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const [slotType, setSlotType] = useState<"INDIVIDUAL" | "GROUP">(
    "INDIVIDUAL",
  );
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BulkCreateSlotInput>({
    resolver: zodResolver(bulkCreateSlotSchema),
    defaultValues: {
      slotType: "INDIVIDUAL",
      maxParticipants: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  });

  const createMutation = useMutation({
    mutationFn: professorApi.createBulkSlots,
    onSuccess: (data) => {
      toast.success(t("slots.bulk_page.success", { count: data.length }));
      navigate("/admin/slots");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("slots.bulk_page.error"));
    },
  });

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    setValue("daysOfWeek", newDays);
  };

  const onSubmit = (data: BulkCreateSlotInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("slots.bulk_page.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("slots.bulk_page.subtitle")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("slots.bulk_page.card_title")}
          </CardTitle>
          <CardDescription>
            {t("slots.bulk_page.card_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Range */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  {t("slots.bulk_page.start_date")}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  error={errors.startDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("slots.bulk_page.end_date")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  error={errors.endDate?.message}
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <Label>{t("slots.bulk_page.days_of_week")}</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      selectedDays.includes(day.value)
                        ? "bg-navy-800 text-white border-navy-800"
                        : "bg-white text-navy-600 border-gray-200 hover:border-navy-300",
                    )}
                  >
                    {selectedDays.includes(day.value) && (
                      <Check className="inline-block mr-1 h-3 w-3" />
                    )}
                    {t(day.labelKey)}
                  </button>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="text-sm text-destructive">
                  {errors.daysOfWeek.message}
                </p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  {t("slots.bulk_page.start_time")}
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  error={errors.startTime?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  {t("slots.form.date_time.duration")}
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  error={errors.endTime?.message}
                />
              </div>
            </div>

            {/* Slot Type */}
            <div className="space-y-2">
              <Label>{t("slots.bulk_page.slot_type")}</Label>
              <Select
                value={slotType}
                onValueChange={(value: "INDIVIDUAL" | "GROUP") => {
                  setSlotType(value);
                  setValue("slotType", value);
                  setValue("maxParticipants", value === "INDIVIDUAL" ? 1 : 5);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">
                    {t("slots.bulk_page.individual")}
                  </SelectItem>
                  <SelectItem value="GROUP">
                    {t("slots.bulk_page.group")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Participants (for group) */}
            {slotType === "GROUP" && (
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">
                  {t("slots.bulk_page.max_participants")}
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={2}
                  max={20}
                  {...register("maxParticipants", { valueAsNumber: true })}
                  error={errors.maxParticipants?.message}
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                {t("slots.bulk_page.title_optional")}
              </Label>
              <Input
                id="title"
                placeholder={t("slots.bulk_page.title_placeholder")}
                {...register("title")}
                error={errors.title?.message}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t("slots.bulk_page.description_optional")}
              </Label>
              <Textarea
                id="description"
                placeholder={t("slots.bulk_page.description_placeholder")}
                {...register("description")}
                error={errors.description?.message}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                {t("slots.form.buttons.back")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={createMutation.isPending}
              >
                {t("slots.bulk_page.create_button")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
