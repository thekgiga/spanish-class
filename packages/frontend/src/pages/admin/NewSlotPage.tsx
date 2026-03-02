import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Lock,
  Repeat,
  Send,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  User,
  Check,
  AlertTriangle,
  Trash2,
  Loader2,
  Mail,
  Video,
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { professorApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const DURATION_PRESETS = [
  { labelKey: "slots.form.duration_presets.30_min", value: 30 },
  { labelKey: "slots.form.duration_presets.45_min", value: 45 },
  {
    labelKey: "slots.form.duration_presets.60_min",
    value: 60,
    recommended: true,
  },
  { labelKey: "slots.form.duration_presets.90_min", value: 90 },
  { labelKey: "slots.form.duration_presets.120_min", value: 120 },
];

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7; // Start from 7 AM
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

const DAYS_OF_WEEK = [
  { labelKey: "slots.form.weekdays.sun", value: 0 },
  { labelKey: "slots.form.weekdays.mon", value: 1 },
  { labelKey: "slots.form.weekdays.tue", value: 2 },
  { labelKey: "slots.form.weekdays.wed", value: 3 },
  { labelKey: "slots.form.weekdays.thu", value: 4 },
  { labelKey: "slots.form.weekdays.fri", value: 5 },
  { labelKey: "slots.form.weekdays.sat", value: 6 },
];

type Mode = "single" | "recurring";
type SlotType = "INDIVIDUAL" | "GROUP";

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function NewSlotPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const { id: slotId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = !!slotId && slotId !== "new";

  // Mode: single slot or recurring
  const [mode, setMode] = useState<Mode>("single");

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Time state
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState(60);

  // Slot details
  const [slotType, setSlotType] = useState<SlotType>("INDIVIDUAL");
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Private slot
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  // Direct booking
  const [bookForStudent, setBookForStudent] = useState<StudentOption | null>(
    null,
  );

  // Recurring pattern
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
  const [generateWeeksAhead, setGenerateWeeksAhead] = useState(4);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Fetch existing slot for edit mode
  const { data: existingSlot, isLoading: isLoadingSlot } = useQuery({
    queryKey: ["professor-slot", slotId],
    queryFn: () => professorApi.getSlot(slotId!),
    enabled: isEditMode,
  });

  // Populate form when existing slot loads
  useEffect(() => {
    if (existingSlot) {
      const startDate = new Date(existingSlot.startTime);
      const endDate = new Date(existingSlot.endTime);

      setSelectedDate(startDate);
      setCalendarMonth(
        new Date(startDate.getFullYear(), startDate.getMonth(), 1),
      );

      const hours = startDate.getHours().toString().padStart(2, "0");
      const minutes = startDate.getMinutes().toString().padStart(2, "0");
      setStartTime(`${hours}:${minutes}`);

      const durationMs = endDate.getTime() - startDate.getTime();
      const durationMinutes = Math.round(durationMs / 60000);
      setDuration(durationMinutes);

      setSlotType(existingSlot.slotType as SlotType);
      setMaxParticipants(existingSlot.maxParticipants);
      setTitle(existingSlot.title || "");
      setDescription(existingSlot.description || "");
      setIsPrivate(existingSlot.isPrivate || false);
    }
  }, [existingSlot]);

  // Fetch existing slots for selected day (only in create mode)
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const { data: daySlots } = useQuery({
    queryKey: ["professor-slots-day", selectedDateStr],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      return professorApi.getSlots({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        limit: 50,
      });
    },
    enabled: !isEditMode,
  });

  const existingSlotsForDay = useMemo(() => {
    return (daySlots?.data || [])
      .filter((slot) => slot.status !== "CANCELLED")
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [daySlots?.data]);

  // Fetch students for selection
  const { data: studentsData } = useQuery({
    queryKey: ["professor-students"],
    queryFn: () => professorApi.getStudents({ limit: 100 }),
  });

  const students = useMemo(() => {
    const list = studentsData?.data || [];

    // Sort alphabetically by first name, then last name
    const sortedList = [...list].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Filter by search if provided
    if (!studentSearch) return sortedList;
    const search = studentSearch.toLowerCase();
    return sortedList.filter(
      (s: StudentOption) =>
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search),
    );
  }, [studentsData?.data, studentSearch]);

  // Calculate end time
  const endTime = useMemo(() => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  }, [startTime, duration]);

  // Check for overlap with existing slots
  const hasOverlap = useMemo(() => {
    if (isEditMode || existingSlotsForDay.length === 0) return false;

    const [h, m] = startTime.split(":").map(Number);
    const newStart = h * 60 + m;
    const [eh, em] = endTime.split(":").map(Number);
    const newEnd = eh * 60 + em;

    return existingSlotsForDay.some((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      const existingStart = slotStart.getHours() * 60 + slotStart.getMinutes();
      const existingEnd = slotEnd.getHours() * 60 + slotEnd.getMinutes();

      // Check if ranges overlap
      return newStart < existingEnd && newEnd > existingStart;
    });
  }, [isEditMode, existingSlotsForDay, startTime, endTime]);

  // Create slot mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = new Date(selectedDate);
      const [h, m] = startTime.split(":").map(Number);
      startDateTime.setHours(h, m, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [eh, em] = endTime.split(":").map(Number);
      endDateTime.setHours(eh, em, 0, 0);

      return professorApi.createSlot({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotType,
        maxParticipants: slotType === "INDIVIDUAL" ? 1 : maxParticipants,
        title: title || undefined,
        description: description || undefined,
        isPrivate,
        allowedStudentIds: isPrivate
          ? selectedStudents.map((s) => s.id)
          : undefined,
        bookForStudentId: bookForStudent?.id,
      });
    },
    onSuccess: () => {
      if (bookForStudent) {
        toast.success(
          t("slots.create_success") + ` (${bookForStudent.firstName})`,
        );
      } else {
        toast.success(t("slots.create_success"));
      }
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      navigate("/admin/slots");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("slots.create_success"));
    },
  });

  // Create recurring pattern mutation
  const createRecurringMutation = useMutation({
    mutationFn: async () => {
      const startDateStr = selectedDate.toISOString().split("T")[0];
      const endDateStr = recurringEndDate
        ? recurringEndDate.toISOString().split("T")[0]
        : null;

      return professorApi.createRecurringPattern({
        daysOfWeek: recurringDays,
        startTime,
        endTime,
        startDate: startDateStr,
        endDate: endDateStr,
        slotType,
        maxParticipants: slotType === "INDIVIDUAL" ? 1 : maxParticipants,
        title: title || undefined,
        description: description || undefined,
        isPrivate,
        allowedStudentIds: isPrivate
          ? selectedStudents.map((s) => s.id)
          : undefined,
        generateWeeksAhead,
      });
    },
    onSuccess: (data) => {
      toast.success(
        t("slots.create_success") + ` (${data.slots.length} slots)`,
      );
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      navigate("/admin/slots");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("slots.create_success"));
    },
  });

  // Update slot mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = new Date(selectedDate);
      const [h, m] = startTime.split(":").map(Number);
      startDateTime.setHours(h, m, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [eh, em] = endTime.split(":").map(Number);
      endDateTime.setHours(eh, em, 0, 0);

      return professorApi.updateSlot(slotId!, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotType,
        maxParticipants: slotType === "INDIVIDUAL" ? 1 : maxParticipants,
        title: title || undefined,
        description: description || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Slot updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      queryClient.invalidateQueries({ queryKey: ["professor-slot", slotId] });
      navigate("/admin/slots");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update slot");
    },
  });

  // Cancel slot with bookings mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return professorApi.cancelSlotWithBookings(
        slotId!,
        cancelReason || undefined,
      );
    },
    onSuccess: (data) => {
      if (data.cancelledBookingsCount > 0) {
        toast.success(
          `Slot cancelled and ${data.cancelledBookingsCount} student(s) notified`,
        );
      } else {
        toast.success("Slot cancelled successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      setShowCancelDialog(false);
      navigate("/admin/slots");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to cancel slot");
    },
  });

  const handleSubmit = () => {
    if (isEditMode) {
      updateMutation.mutate();
    } else if (mode === "single") {
      createMutation.mutate();
    } else {
      if (recurringDays.length === 0) {
        toast.error("Please select at least one day for recurring slots");
        return;
      }
      createRecurringMutation.mutate();
    }
  };

  // Calendar navigation
  const prevMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCalendarMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCalendarMonth(newMonth);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Padding for days before the first
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [calendarMonth]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const toggleStudent = (student: StudentOption) => {
    if (selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter((s) => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const toggleRecurringDay = (day: number) => {
    if (recurringDays.includes(day)) {
      setRecurringDays(recurringDays.filter((d) => d !== day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };

  // Show loading state while fetching slot
  if (isEditMode && isLoadingSlot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const confirmedBookingsCount =
    existingSlot?.bookings?.filter(
      (b: { status: string }) => b.status === "CONFIRMED",
    ).length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {isEditMode ? t("slots.actions.edit") : t("slots.create_button")}
          </h1>
          <parameter name="text-muted-foreground">
            {isEditMode
              ? t("slots.form.date_time.subtitle_single")
              : t("slots.subtitle")}
          </p>
        </div>
      </div>

      {/* Mode Toggle - only show in create mode */}
      {!isEditMode && (
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setMode("single")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === "single"
                ? "bg-white text-navy-800 shadow-sm"
                : "text-muted-foreground hover:text-navy-800",
            )}
          >
            <Calendar className="inline-block w-4 h-4 mr-2" />
            {t("slots.form.mode.single")}
          </button>
          <button
            onClick={() => setMode("recurring")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              mode === "recurring"
                ? "bg-white text-navy-800 shadow-sm"
                : "text-muted-foreground hover:text-navy-800",
            )}
          >
            <Repeat className="inline-block w-4 h-4 mr-2" />
            {t("slots.form.mode.recurring")}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Date & Time */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold-500" />
                {t("slots.form.date_time.select_date")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="font-semibold">
                  {calendarMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {[
                  "slots.form.weekdays.sun",
                  "slots.form.weekdays.mon",
                  "slots.form.weekdays.tue",
                  "slots.form.weekdays.wed",
                  "slots.form.weekdays.thu",
                  "slots.form.weekdays.fri",
                  "slots.form.weekdays.sat",
                ].map((dayKey) => (
                  <div
                    key={dayKey}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {t(dayKey)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => (
                  <button
                    key={i}
                    disabled={!date || isPast(date)}
                    onClick={() => date && setSelectedDate(date)}
                    className={cn(
                      "aspect-square p-2 text-sm rounded-lg transition-all",
                      !date && "invisible",
                      date &&
                        isPast(date) &&
                        "text-muted-foreground/50 cursor-not-allowed",
                      date && !isPast(date) && "hover:bg-muted",
                      date &&
                        isToday(date) &&
                        "ring-2 ring-gold-500 ring-offset-2",
                      date &&
                        isSelected(date) &&
                        "bg-navy-800 text-white hover:bg-navy-700",
                    )}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>

              {/* Selected date display */}
              <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="font-semibold text-navy-800">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold-500" />
                {t("slots.form.date_time.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Start Time */}
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t("slots.form.date_time.start_time")}
                </Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Presets */}
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t("slots.form.date_time.duration")}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setDuration(preset.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all border-2",
                        duration === preset.value
                          ? "border-gold-500 bg-gold-50 text-navy-800"
                          : "border-transparent bg-muted text-muted-foreground hover:border-gray-300",
                      )}
                    >
                      {t(preset.labelKey)}
                      {preset.recommended && (
                        <Badge variant="warning" className="ml-2 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Summary */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg",
                  hasOverlap
                    ? "bg-red-50 border-2 border-red-200"
                    : "bg-navy-50",
                )}
              >
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-xl font-bold text-navy-800">{startTime}</p>
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="text-xl font-bold text-navy-800">{endTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold text-gold-600">
                    {duration} min
                  </p>
                </div>
              </div>

              {/* Overlap Warning */}
              {hasOverlap && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">
                    {t("slots.form.date_time.overlap_warning")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Slots for Day (only in create mode) */}
          {!isEditMode && mode === "single" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gold-500" />
                  {t("slots.form.existing_slots.title")}
                </CardTitle>
                <CardDescription>
                  {t("slots.form.existing_slots.subtitle", {
                    date: selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }),
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingSlotsForDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("slots.form.existing_slots.no_slots")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {existingSlotsForDay.map((slot) => {
                      const slotStartTime = new Date(slot.startTime);
                      const slotEndTime = new Date(slot.endTime);
                      const formatTime = (d: Date) =>
                        `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

                      return (
                        <div
                          key={slot.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border text-sm",
                            slot.status === "FULLY_BOOKED"
                              ? "bg-amber-50 border-amber-200"
                              : "bg-gray-50 border-gray-200",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatTime(slotStartTime)} -{" "}
                              {formatTime(slotEndTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground truncate max-w-[120px]">
                              {slot.title || t("slots.form.existing_slots.spanish_class")}
                            </span>
                            <Badge
                              variant={
                                slot.status === "FULLY_BOOKED"
                                  ? "warning"
                                  : "neutral"
                              }
                              className="text-xs"
                            >
                              {slot.status === "FULLY_BOOKED"
                                ? t("slots.form.existing_slots.booked")
                                : t("slots.form.existing_slots.open")}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recurring Days (only in recurring mode) */}
          <AnimatePresence>
            {mode === "recurring" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Repeat className="h-5 w-5 text-gold-500" />
                      {t("slots.form.recurring.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("slots.form.recurring.subtitle")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleRecurringDay(day.value)}
                          className={cn(
                            "w-12 h-12 rounded-full text-sm font-medium transition-all",
                            recurringDays.includes(day.value)
                              ? "bg-navy-800 text-white"
                              : "bg-muted text-muted-foreground hover:bg-gray-200",
                          )}
                        >
                          {t(day.labelKey)}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          {t("slots.form.recurring.end_date")}
                        </Label>
                        <Input
                          type="date"
                          value={
                            recurringEndDate
                              ? recurringEndDate.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setRecurringEndDate(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                          min={selectedDate.toISOString().split("T")[0]}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          {t("slots.form.recurring.weeks_ahead")}
                        </Label>
                        <Select
                          value={generateWeeksAhead.toString()}
                          onValueChange={(v) =>
                            setGenerateWeeksAhead(Number(v))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8, 12].map((w) => (
                              <SelectItem key={w} value={w.toString()}>
                                {t("slots.form.recurring.weeks_count", { count: w })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Slot Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-gold-500" />
                {t("slots.form.session_type.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSlotType("INDIVIDUAL");
                    setMaxParticipants(1);
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    slotType === "INDIVIDUAL"
                      ? "border-gold-500 bg-gold-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <User className="h-8 w-8 mb-2 text-navy-800" />
                  <p className="font-semibold text-navy-800">{t("slots.form.session_type.individual")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("slots.form.session_type.individual_desc")}
                  </p>
                </button>
                <button
                  onClick={() => {
                    setSlotType("GROUP");
                    setMaxParticipants(5);
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    slotType === "GROUP"
                      ? "border-gold-500 bg-gold-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <Users className="h-8 w-8 mb-2 text-navy-800" />
                  <p className="font-semibold text-navy-800">{t("slots.form.session_type.group")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("slots.form.session_type.group_desc")}
                  </p>
                </button>
              </div>

              {slotType === "GROUP" && (
                <div>
                  <Label>{t("slots.form.session_type.max_participants")}</Label>
                  <Input
                    type="number"
                    min={2}
                    max={20}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booked Students - only in edit mode */}
          {isEditMode && existingSlot && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold-500" />
                  {t("slots.form.booked_students.title")}
                </CardTitle>
                <CardDescription>
                  {confirmedBookingsCount === 0
                    ? t("slots.form.booked_students.no_bookings")
                    : confirmedBookingsCount > 1
                      ? t("slots.form.booked_students.count_plural", { count: confirmedBookingsCount })
                      : t("slots.form.booked_students.count", { count: confirmedBookingsCount })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingSlot.bookings && existingSlot.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {existingSlot.bookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          booking.status === "CONFIRMED"
                            ? "bg-green-50 border-green-200"
                            : booking.status === "COMPLETED"
                              ? "bg-gray-50 border-gray-200"
                              : "bg-red-50 border-red-200",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-navy-600" />
                          </div>
                          <div>
                            <p className="font-medium text-navy-800">
                              {booking.student?.firstName}{" "}
                              {booking.student?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.student?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              booking.status === "CONFIRMED"
                                ? "success"
                                : booking.status === "COMPLETED"
                                  ? "neutral"
                                  : "destructive"
                            }
                          >
                            {booking.status.replace(/_/g, " ")}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/admin/students/${booking.student?.id}`}>
                              {t("slots.form.booked_students.view_student")}
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">{t("slots.form.booked_students.no_bookings_yet")}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("slots.form.booked_students.can_book")}
                    </p>
                  </div>
                )}

                {/* Video Meeting Link */}
                {existingSlot.meetLink && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Video className="h-4 w-4" />
                        <span>Jitsi Meet</span>
                      </div>
                      <Button size="sm" variant="primary" asChild>
                        <a
                          href={existingSlot.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="mr-1 h-4 w-4" />
                          {t("slots.form.booked_students.join_meeting")}
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Title & Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("slots.form.details.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("slots.form.details.title_label")}</Label>
                <Input
                  placeholder={t("slots.form.details.title_placeholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("slots.form.details.description_label")}</Label>
                <Textarea
                  placeholder={t("slots.form.details.description_placeholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Private Slot */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gold-500" />
                  {t("slots.form.private_slot.title")}
                </CardTitle>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    isPrivate ? "bg-gold-500" : "bg-gray-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                      isPrivate ? "translate-x-7" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
              <CardDescription>
                {t("slots.form.private_slot.subtitle")}
              </CardDescription>
            </CardHeader>
            <AnimatePresence>
              {isPrivate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="space-y-4">
                    <Input
                      placeholder={t("slots.form.private_slot.search_placeholder")}
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />

                    {/* Selected Students */}
                    {selectedStudents.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedStudents.map((student) => (
                          <Badge
                            key={student.id}
                            variant="neutral"
                            className="flex items-center gap-1 pr-1"
                          >
                            {student.firstName} {student.lastName}
                            <button
                              onClick={() => toggleStudent(student)}
                              className="ml-1 p-0.5 hover:bg-gray-300 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Student List */}
                    <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t("slots.form.private_slot.no_students")}
                        </p>
                      ) : (
                        students.map((student: StudentOption) => (
                          <button
                            key={student.id}
                            onClick={() => toggleStudent(student)}
                            className={cn(
                              "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors",
                              selectedStudents.find((s) => s.id === student.id)
                                ? "bg-gold-50"
                                : "hover:bg-muted",
                            )}
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                            {selectedStudents.find(
                              (s) => s.id === student.id,
                            ) && <Check className="h-4 w-4 text-gold-600" />}
                          </button>
                        ))
                      )}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Direct Booking (only for single individual slots in create mode) */}
          {!isEditMode && mode === "single" && slotType === "INDIVIDUAL" && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-gold-500" />
                    {t("slots.form.direct_booking.title")}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t("slots.form.direct_booking.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookForStudent ? (
                  <div className="flex items-center justify-between p-3 bg-gold-50 rounded-lg border-2 border-gold-200">
                    <div>
                      <p className="font-medium">
                        {bookForStudent.firstName} {bookForStudent.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bookForStudent.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBookForStudent(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder={t("slots.form.direct_booking.search_placeholder")}
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {students.slice(0, 5).map((student: StudentOption) => (
                        <button
                          key={student.id}
                          onClick={() => setBookForStudent(student)}
                          className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Danger Zone - Cancel Slot (only in edit mode) */}
          {isEditMode && existingSlot?.status !== "CANCELLED" && (
            <Card className="border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Cancel this slot. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {confirmedBookingsCount > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">
                        This slot has {confirmedBookingsCount} active booking(s)
                      </p>
                      <p>Cancelling will notify all students via email.</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("slots.form.buttons.cancel_slot")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 sticky bottom-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(-1)}
        >
          {t("slots.form.buttons.back")}
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleSubmit}
          isLoading={
            createMutation.isPending ||
            createRecurringMutation.isPending ||
            updateMutation.isPending
          }
          disabled={!isEditMode && mode === "single" && hasOverlap}
        >
          {isEditMode ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t("slots.form.buttons.save")}
            </>
          ) : mode === "recurring" ? (
            <>
              <Repeat className="mr-2 h-4 w-4" />
              {t("slots.form.buttons.create")}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {t("slots.form.buttons.create")}
            </>
          )}
        </Button>
      </div>

      {/* Cancel Slot Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("slots.form.cancel_dialog.title")}
            </DialogTitle>
            <DialogDescription>
              {confirmedBookingsCount > 1
                ? t("slots.form.cancel_dialog.message_plural", { count: confirmedBookingsCount })
                : confirmedBookingsCount === 1
                  ? t("slots.form.cancel_dialog.message", { count: confirmedBookingsCount })
                  : t("slots.form.cancel_dialog.message", { count: 0 })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label
              htmlFor="cancelReason"
              className="text-sm text-muted-foreground"
            >
              {t("slots.form.cancel_dialog.reason_label")}
            </Label>
            <Textarea
              id="cancelReason"
              placeholder={t("slots.form.cancel_dialog.reason_placeholder")}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>
              {t("slots.form.cancel_dialog.button_cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              isLoading={cancelMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("slots.form.cancel_dialog.button_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
