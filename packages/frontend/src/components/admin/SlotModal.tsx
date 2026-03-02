import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { format, parse, addMinutes } from "date-fns";
import {
  Users,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Repeat,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { professorApi } from "@/lib/api";
import { DURATION_PRESETS, detectSlotConflicts } from "@/utils/slot-utils";
import { StudentSelector } from "./StudentSelector";
import { RecurringPatternForm } from "./RecurringPatternForm";
import type { AvailabilitySlot } from "@spanish-class/shared";

const slotFormSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  slotType: z.enum(["INDIVIDUAL", "GROUP"]),
  maxParticipants: z.number().int().min(1).max(20),
  title: z.string().optional(),
  description: z.string().optional(),
  isPrivate: z.boolean(),
  isRecurring: z.boolean(),
});

type SlotFormData = z.infer<typeof slotFormSchema>;

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime?: string;
  selectedEndTime?: string;
  existingSlot?: AvailabilitySlot | null;
  mode: "create" | "edit";
}

export function SlotModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  selectedEndTime,
  existingSlot,
  mode,
}: SlotModalProps) {
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState(60);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [accessMode, setAccessMode] = useState<"public" | "private" | "direct">(
    "public",
  );
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [activeTab, setActiveTab] = useState("details");
  const [isInitialized, setIsInitialized] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<SlotFormData>({
      resolver: zodResolver(slotFormSchema),
      defaultValues: {
        startTime: selectedTime || "09:00",
        endTime: selectedEndTime || "10:00",
        slotType: "INDIVIDUAL",
        maxParticipants: 1,
        title: "",
        description: "",
        isPrivate: false,
        isRecurring: false,
      },
    });

  const startTime = watch("startTime");
  const slotType = watch("slotType");
  const isRecurring = watch("isRecurring");

  // Load existing slot data or calendar selection
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      return;
    }

    if (existingSlot && mode === "edit") {
      const start = new Date(existingSlot.startTime);
      const end = new Date(existingSlot.endTime);

      reset({
        startTime: format(start, "HH:mm"),
        endTime: format(end, "HH:mm"),
        slotType: existingSlot.slotType,
        maxParticipants: existingSlot.maxParticipants,
        title: existingSlot.title || "",
        description: existingSlot.description || "",
        isPrivate: existingSlot.isPrivate,
        isRecurring: false,
      });

      const durationMinutes = (end.getTime() - start.getTime()) / 60000;
      setDuration(durationMinutes);
      setIsInitialized(true);
    } else if (mode === "create" && selectedTime && selectedEndTime) {
      // User clicked on a calendar slot - pre-fill with exact times
      const [startHours, startMinutes] = selectedTime.split(":").map(Number);
      const [endHours, endMinutes] = selectedEndTime.split(":").map(Number);

      const start = new Date(selectedDate);
      start.setHours(startHours, startMinutes, 0, 0);

      const end = new Date(selectedDate);
      end.setHours(endHours, endMinutes, 0, 0);

      const durationMinutes = (end.getTime() - start.getTime()) / 60000;
      setDuration(durationMinutes);

      setValue("startTime", selectedTime);
      setValue("endTime", selectedEndTime);
      setIsInitialized(true);
    } else if (mode === "create" && selectedTime && !selectedEndTime) {
      // Only start time provided - use default duration
      setValue("startTime", selectedTime);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const start = new Date(selectedDate);
      start.setHours(hours, minutes, 0, 0);
      const end = addMinutes(start, duration);
      setValue("endTime", format(end, "HH:mm"));
      setIsInitialized(true);
    } else if (mode === "create") {
      setIsInitialized(true);
    }
  }, [
    isOpen,
    existingSlot,
    mode,
    reset,
    selectedTime,
    selectedEndTime,
    selectedDate,
    duration,
    setValue,
  ]);

  // Auto-calculate end time when start time changes (NOT when duration changes - that's handled by buttons)
  useEffect(() => {
    if (isInitialized && startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const start = new Date(selectedDate);
      start.setHours(hours, minutes, 0, 0);
      const end = addMinutes(start, duration);
      setValue("endTime", format(end, "HH:mm"));
    }
    // Note: duration is intentionally NOT in dependencies - duration buttons handle end time directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, startTime, selectedDate, setValue]);

  // Auto-set max participants based on slot type
  useEffect(() => {
    if (slotType === "INDIVIDUAL") {
      setValue("maxParticipants", 1);
    }
  }, [slotType, setValue]);

  // Sync isPrivate with accessMode
  useEffect(() => {
    setValue("isPrivate", accessMode === "private");
  }, [accessMode, setValue]);

  // Get all slots for conflict detection
  const { data: slotsData } = useQuery({
    queryKey: ["professor-slots"],
    queryFn: () => professorApi.getSlots({ limit: 1000 }),
  });

  // Detect conflicts
  const conflicts = detectSlotConflicts(
    {
      startTime: parse(startTime, "HH:mm", selectedDate),
      endTime: parse(watch("endTime"), "HH:mm", selectedDate),
    },
    slotsData?.data?.filter((s) => s.id !== existingSlot?.id) || [],
  );

  // Create/Update mutations
  const createSlotMutation = useMutation({
    mutationFn: async (data: SlotFormData) => {
      const startDateTime = parse(data.startTime, "HH:mm", selectedDate);
      const endDateTime = parse(data.endTime, "HH:mm", selectedDate);

      if (data.isRecurring) {
        // Create recurring pattern
        return professorApi.createRecurringPattern({
          daysOfWeek: recurringDays,
          startTime: data.startTime,
          endTime: data.endTime,
          startDate: format(selectedDate, "yyyy-MM-dd"),
          endDate: null,
          generateWeeksAhead: weeksAhead,
          slotType: data.slotType,
          maxParticipants: data.maxParticipants,
          title: data.title,
          description: data.description,
          isPrivate: data.isPrivate,
          allowedStudentIds:
            accessMode === "private"
              ? selectedStudents.map((s) => s.id)
              : undefined,
        });
      } else {
        // Create single slot
        return professorApi.createSlot({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          slotType: data.slotType,
          maxParticipants: data.maxParticipants,
          title: data.title,
          description: data.description,
          isPrivate: data.isPrivate,
          allowedStudentIds:
            accessMode === "private"
              ? selectedStudents.map((s) => s.id)
              : undefined,
          bookForStudentId:
            accessMode === "direct" && selectedStudents[0]
              ? selectedStudents[0].id
              : undefined,
        });
      }
    },
    onSuccess: async (data: any) => {
      if (isRecurring) {
        const slotsCount = data?.slots?.length || data?.slotsCreated || 0;
        toast.success(`Recurring pattern created with ${slotsCount} slots!`);
      } else if (accessMode === "direct") {
        toast.success(`Slot created and invitation sent!`);
      } else {
        toast.success("Slot created successfully!");
      }
      // Invalidate all professor-slots queries to refresh calendar
      await queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create slot");
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: async (data: SlotFormData) => {
      if (!existingSlot) return;

      const startDateTime = parse(data.startTime, "HH:mm", selectedDate);
      const endDateTime = parse(data.endTime, "HH:mm", selectedDate);

      return professorApi.updateSlot(existingSlot.id, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotType: data.slotType,
        maxParticipants: data.maxParticipants,
        title: data.title,
        description: data.description,
      });
    },
    onSuccess: async () => {
      toast.success("Slot updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update slot");
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: () => {
      if (!existingSlot) return Promise.reject();
      return professorApi.deleteSlot(existingSlot.id);
    },
    onSuccess: async () => {
      toast.success("Slot cancelled successfully!");
      await queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to cancel slot");
    },
  });

  const onSubmit = (data: SlotFormData) => {
    if (mode === "create") {
      createSlotMutation.mutate(data);
    } else {
      updateSlotMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to cancel this slot?")) {
      deleteSlotMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Slot" : "Edit Slot"}
          </DialogTitle>
          <DialogDescription>
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="recurring" disabled={mode === "edit"}>
                <Repeat className="h-4 w-4 mr-1" />
                Recurring
              </TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              {mode === "edit" && (
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
              )}
            </TabsList>

            {/* Tab 1: Details */}
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Time & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    step="60"
                    value={startTime}
                    onChange={(e) => setValue("startTime", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    step="60"
                    value={watch("endTime")}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      setValue("endTime", newEndTime);

                      // Calculate and update duration based on new end time
                      if (startTime && newEndTime) {
                        const [startHours, startMinutes] = startTime
                          .split(":")
                          .map(Number);
                        const [endHours, endMinutes] = newEndTime
                          .split(":")
                          .map(Number);

                        const start = new Date(selectedDate);
                        start.setHours(startHours, startMinutes, 0, 0);

                        const end = new Date(selectedDate);
                        end.setHours(endHours, endMinutes, 0, 0);

                        const durationMinutes =
                          (end.getTime() - start.getTime()) / 60000;
                        if (durationMinutes > 0) {
                          setDuration(durationMinutes);
                        }
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Duration Presets */}
              <div>
                <Label>Quick Duration (adjusts end time)</Label>
                <div className="flex gap-2 items-end mt-2">
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setDuration(preset.value);
                          // Immediately calculate and set end time
                          if (startTime) {
                            const [hours, minutes] = startTime
                              .split(":")
                              .map(Number);
                            const start = new Date(selectedDate);
                            start.setHours(hours, minutes, 0, 0);
                            const end = addMinutes(start, preset.value);
                            setValue("endTime", format(end, "HH:mm"));
                          }
                        }}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          duration === preset.value
                            ? "border-spanish-teal-500 bg-spanish-teal-50 text-spanish-teal-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Duration */}
                  <div className="flex gap-2 items-center">
                    <Label
                      htmlFor="customDuration"
                      className="text-xs whitespace-nowrap"
                    >
                      Custom:
                    </Label>
                    <Input
                      id="customDuration"
                      type="number"
                      min="5"
                      max="240"
                      step="5"
                      value={duration}
                      onChange={(e) => {
                        const customDuration = parseInt(e.target.value) || 60;
                        setDuration(customDuration);
                        // Immediately calculate and set end time
                        if (startTime) {
                          const [hours, minutes] = startTime
                            .split(":")
                            .map(Number);
                          const start = new Date(selectedDate);
                          start.setHours(hours, minutes, 0, 0);
                          const end = addMinutes(start, customDuration);
                          setValue("endTime", format(end, "HH:mm"));
                        }
                      }}
                      className="w-20"
                      placeholder="min"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                </div>
              </div>

              {/* Slot Type */}
              <div>
                <Label>Slot Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setValue("slotType", "INDIVIDUAL")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      slotType === "INDIVIDUAL"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <User className="h-5 w-5 mx-auto mb-2" />
                    <p className="font-medium text-sm">Individual</p>
                    <p className="text-xs text-muted-foreground">
                      1-on-1 session
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("slotType", "GROUP")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      slotType === "GROUP"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Users className="h-5 w-5 mx-auto mb-2" />
                    <p className="font-medium text-sm">Group</p>
                    <p className="text-xs text-muted-foreground">
                      Multiple students
                    </p>
                  </button>
                </div>
              </div>

              {/* Max Participants (for GROUP) */}
              {slotType === "GROUP" && (
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min={2}
                    max={20}
                    {...register("maxParticipants", { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Title & Description */}
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Spanish Conversation Practice"
                  {...register("title")}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add details about this session..."
                  rows={3}
                  {...register("description")}
                  className="mt-1"
                />
              </div>

              {/* Conflicts Warning */}
              {conflicts.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Time Conflict Detected</p>
                    <p className="text-xs mt-1">
                      This overlaps with {conflicts.length} existing slot
                      {conflicts.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Recurring */}
            <TabsContent value="recurring" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="isRecurring"
                  {...register("isRecurring")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isRecurring" className="font-medium">
                  Create recurring pattern
                </Label>
              </div>

              {isRecurring ? (
                <RecurringPatternForm
                  startDate={selectedDate}
                  startTime={startTime}
                  endTime={watch("endTime")}
                  selectedDays={recurringDays}
                  onDaysChange={setRecurringDays}
                  weeksAhead={weeksAhead}
                  onWeeksAheadChange={setWeeksAhead}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Enable recurring to create multiple slots at once
                </p>
              )}
            </TabsContent>

            {/* Tab 3: Access */}
            <TabsContent value="access" className="space-y-4 mt-4">
              <div>
                <Label className="mb-3 block">Access Control</Label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setAccessMode("public")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      accessMode === "public"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-muted-foreground">
                          Any student can book this slot
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessMode("private")}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      accessMode === "private"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-muted-foreground">
                          Only selected students can see and book
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessMode("direct")}
                    disabled={slotType === "GROUP"}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      accessMode === "direct"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${slotType === "GROUP" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Direct Booking</p>
                        <p className="text-xs text-muted-foreground">
                          Book this slot for a specific student
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Student Selector */}
              {(accessMode === "private" || accessMode === "direct") && (
                <div className="mt-4">
                  <Label className="mb-2 block">
                    {accessMode === "private" ? "Allowed Students" : "Book For"}
                  </Label>
                  <StudentSelector
                    selectedStudents={selectedStudents}
                    onStudentsChange={setSelectedStudents}
                    multiSelect={accessMode === "private"}
                    placeholder={
                      accessMode === "private"
                        ? "Select students who can book..."
                        : "Select student to book for..."
                    }
                  />
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Bookings (Edit Mode Only) */}
            {mode === "edit" && (
              <TabsContent value="bookings" className="space-y-4 mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Bookings list coming soon</p>
                  <p className="text-xs mt-1">
                    {existingSlot?.currentParticipants || 0} /{" "}
                    {existingSlot?.maxParticipants || 0} booked
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-6 gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
                isLoading={deleteSlotMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Slot
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={
                createSlotMutation.isPending || updateSlotMutation.isPending
              }
            >
              {mode === "create" ? "Create Slot" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
