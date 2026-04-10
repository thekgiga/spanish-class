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
  Mail,
  Trash2,
  AlertTriangle,
  Repeat,
  CheckCircle,
  XCircle,
  Clock,
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
import { detectSlotConflicts } from "@/utils/slot-utils";
import { RecurringPatternForm } from "./RecurringPatternForm";
import { CancelSlotModal } from "./CancelSlotModal";
import { EditScopeDialog } from "./EditScopeDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StudentProfileModal } from "./StudentProfileModal";
import { StudentSelector } from "./StudentSelector";
import { Badge } from "@/components/ui/badge";
import type { AvailabilitySlot } from "@spanish-class/shared";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const slotFormSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  slotType: z.enum(["INDIVIDUAL", "GROUP"]),
  maxParticipants: z.number().int().min(1).max(20),
  title: z.string().optional(),
  description: z.string().optional(),
  isRecurring: z.boolean(),
});

type SlotFormData = z.infer<typeof slotFormSchema>;

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
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [weeksAhead, setWeeksAhead] = useState(4);
  const [activeTab, setActiveTab] = useState("details");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEditScopeDialog, setShowEditScopeDialog] = useState(false);
  const [editScope, setEditScope] = useState<"single" | "series" | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  // Scheduling mode: "available" or "direct"
  const [schedulingMode, setSchedulingMode] = useState<"available" | "direct">(
    "available",
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  const openStudentModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setStudentModalOpen(true);
  };
  const [pendingFormData, setPendingFormData] = useState<SlotFormData | null>(
    null,
  );

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
      // In direct mode, limit to 1 student for individual sessions
      if (schedulingMode === "direct" && selectedStudents.length > 1) {
        setSelectedStudents([selectedStudents[0]]);
      }
    }
  }, [slotType, setValue, schedulingMode, selectedStudents]);

  // Get all slots for conflict detection
  const { data: slotsData } = useQuery({
    queryKey: ["professor-slots"],
    queryFn: () => professorApi.getSlots({ limit: 1000 }),
  });

  // Fetch detailed slot with bookings for edit mode
  const { data: slotWithBookings } = useQuery({
    queryKey: ["professor-slot", existingSlot?.id],
    queryFn: () => professorApi.getSlot(existingSlot!.id),
    enabled: mode === "edit" && !!existingSlot?.id,
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
          isPrivate: false, // Always public now
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
          isPrivate: false, // Always public now
        });
      }
    },
    onSuccess: async (data: any) => {
      if (isRecurring) {
        const slotsCount = data?.slots?.length || data?.slotsCreated || 0;
        toast.success(`Recurring pattern created with ${slotsCount} slots!`);
      } else {
        toast.success("Slot created successfully!");
      }
      // Refetch all professor-slots queries to refresh calendar immediately
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "professor-slots",
      });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create slot");
    },
  });

  // Direct scheduling mutation
  const directScheduleMutation = useMutation({
    mutationFn: async (data: SlotFormData) => {
      if (selectedStudents.length === 0) {
        throw new Error("Please select at least one student");
      }

      const startDateTime = parse(data.startTime, "HH:mm", selectedDate);
      const endDateTime = parse(data.endTime, "HH:mm", selectedDate);

      return professorApi.scheduleDirectSession({
        studentIds: selectedStudents.map((s) => s.id),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotType: data.slotType,
        maxParticipants: data.maxParticipants,
        title: data.title,
        description: data.description,
      });
    },
    onSuccess: async () => {
      const studentCount = selectedStudents.length;
      toast.success(`Session scheduled with ${studentCount} student(s)!`);

      // Refetch all professor-slots queries to refresh calendar
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "professor-slots",
      });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to schedule session");
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({
      data,
      scope,
    }: {
      data: SlotFormData;
      scope?: "single" | "series";
    }) => {
      if (!existingSlot) return;

      const startDateTime = parse(data.startTime, "HH:mm", selectedDate);
      const endDateTime = parse(data.endTime, "HH:mm", selectedDate);

      // If editing series, update the recurring pattern instead
      if (scope === "series" && existingSlot.recurringPatternId) {
        return professorApi.updateRecurringPattern(
          existingSlot.recurringPatternId,
          {
            startTime: data.startTime,
            endTime: data.endTime,
            slotType: data.slotType,
            maxParticipants: data.maxParticipants,
            title: data.title,
            description: data.description,
          },
        );
      }

      // Otherwise update the individual slot
      return professorApi.updateSlot(existingSlot.id, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotType: data.slotType,
        maxParticipants: data.maxParticipants,
        title: data.title,
        description: data.description,
        editScope: scope,
      });
    },
    onSuccess: async (data: any) => {
      if (editScope === "series") {
        const slotsUpdated = data?.slotsUpdated || 0;
        toast.success(
          `Recurring pattern updated! ${slotsUpdated} future slots updated.`,
        );
      } else if (editScope === "single") {
        toast.success("Slot updated and detached from series!");
      } else {
        toast.success("Slot updated successfully!");
      }
      // Refetch all professor-slots queries to refresh calendar immediately
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "professor-slots",
      });
      // Also invalidate the specific slot query
      await queryClient.invalidateQueries({
        queryKey: ["professor-slot", existingSlot?.id],
      });
      setEditScope(null);
      onClose();
    },
    onError: (error: any) => {
      // Bug Fix #13: Parse backend errors and show friendly messages
      const errorMessage =
        error.response?.data?.error || "Failed to update slot";

      if (errorMessage.includes("max participants")) {
        toast.error("Cannot reduce capacity below current bookings");
      } else if (errorMessage.includes("past")) {
        toast.error("Cannot edit slots in the past");
      } else if (errorMessage.includes("completed or cancelled")) {
        toast.error("Cannot edit completed or cancelled slots");
      } else if (errorMessage.includes("overlaps")) {
        toast.error("This time slot conflicts with another slot");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: () => {
      if (!existingSlot) return Promise.reject();
      return professorApi.deleteSlot(existingSlot.id);
    },
    onSuccess: async (response) => {
      // Check if the slot was hidden (CANCELLED slot) or just cancelled
      if (response.slotTime) {
        // Slot was hidden from calendar
        toast.success("Slot hidden from calendar!");

        // Ask if user wants to create a new slot at this time
        const createNew = confirm(
          "Would you like to create a new available slot at this same time?",
        );

        if (createNew) {
          // Reopen modal in create mode with pre-filled data
          await queryClient.refetchQueries({
            predicate: (query) => query.queryKey[0] === "professor-slots",
          });
          onClose(); // Close current modal first

          // Small delay to allow modal to close before reopening
          setTimeout(() => {
            // This would need to be implemented via a callback to parent
            // For now, just show success message
            toast("Please create a new slot for this time using the calendar");
          }, 300);
        } else {
          await queryClient.refetchQueries({
            predicate: (query) => query.queryKey[0] === "professor-slots",
          });
          onClose();
        }
      } else {
        // Slot was cancelled (not hidden)
        toast.success("Slot cancelled successfully!");
        await queryClient.refetchQueries({
          predicate: (query) => query.queryKey[0] === "professor-slots",
        });
        onClose();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to cancel slot");
    },
  });

  const confirmBookingMutation = useMutation({
    mutationFn: (bookingId: string) => professorApi.confirmBooking(bookingId),
    onSuccess: async () => {
      toast.success("Booking confirmed!");
      await queryClient.invalidateQueries({
        queryKey: ["professor-slot", existingSlot?.id],
      });
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "professor-slots",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to confirm booking");
    },
  });

  const rejectBookingMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason: string;
    }) => professorApi.rejectBooking(bookingId, reason),
    onSuccess: async () => {
      toast.success("Booking rejected");
      await queryClient.invalidateQueries({
        queryKey: ["professor-slot", existingSlot?.id],
      });
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "professor-slots",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to reject booking");
    },
  });

  const onSubmit = (data: SlotFormData) => {
    if (mode === "create") {
      // Check scheduling mode
      if (schedulingMode === "direct") {
        // Direct scheduling - validate students selected
        if (selectedStudents.length === 0) {
          toast.error("Please select at least one student");
          return;
        }
        directScheduleMutation.mutate(data);
      } else {
        // Available slot - create normally
        createSlotMutation.mutate(data);
      }
    } else {
      // Edit mode - only available slots can be edited
      // Check if this is a recurring slot
      if (existingSlot?.recurringPatternId) {
        // Show edit scope dialog
        setPendingFormData(data);
        setShowEditScopeDialog(true);
      } else {
        // Non-recurring slot - update directly
        updateSlotMutation.mutate({ data });
      }
    }
  };

  const handleEditScopeSelected = (scope: "single" | "series") => {
    setEditScope(scope);
    setShowEditScopeDialog(false);
    if (pendingFormData) {
      updateSlotMutation.mutate({ data: pendingFormData, scope });
      setPendingFormData(null);
    }
  };

  const handleDelete = () => {
    const isCancelled = existingSlot?.status === "CANCELLED";
    const hasBookings = (existingSlot?.currentParticipants || 0) > 0;

    if (isCancelled) {
      // CANCELLED slot - offer to hide from calendar
      if (
        confirm(
          "Hide this cancelled slot from your calendar? It will remain in booking history.",
        )
      ) {
        deleteSlotMutation.mutate();
      }
    } else if (hasBookings) {
      // Active slot with bookings - show cancel-with-bookings modal
      setShowCancelModal(true);
    } else {
      // Active empty slot - cancel it
      if (confirm("Cancel this slot?")) {
        deleteSlotMutation.mutate();
      }
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {mode === "create" ? "Create Slot" : "Edit Slot"}
              {mode === "edit" && existingSlot?.recurringPatternId && (
                <Badge
                  variant="neutral"
                  className="bg-purple-100 text-purple-700 border-purple-200"
                >
                  <Repeat className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
              {mode === "edit" && existingSlot?.recurringPatternId && (
                <span className="text-purple-600 ml-2">
                  • Part of recurring series
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Scheduling Mode Toggle - Only in Create Mode */}
            {mode === "create" && (
              <div className="mb-4">
                <Label className="mb-2 block">Scheduling Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSchedulingMode("available");
                      setSelectedStudents([]);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      schedulingMode === "available"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Available Slot</p>
                        <p className="text-xs text-muted-foreground">
                          Anyone can book
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSchedulingMode("direct")}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      schedulingMode === "direct"
                        ? "border-spanish-teal-500 bg-spanish-teal-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Direct Schedule</p>
                        <p className="text-xs text-muted-foreground">
                          Schedule with specific students
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger
                  value="recurring"
                  disabled={mode === "edit" || schedulingMode === "direct"}
                >
                  <Repeat className="h-4 w-4 mr-1" />
                  Recurring
                </TabsTrigger>
                {mode === "edit" && (
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                )}
              </TabsList>

              {/* Tab 1: Details */}
              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Warning for booked slots - Bug Fix #3 */}
                {mode === "edit" &&
                  (existingSlot?.currentParticipants || 0) > 0 && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Students are booked for this slot</AlertTitle>
                      <AlertDescription>
                        {existingSlot?.currentParticipants || 0} student(s) will
                        be automatically notified of any time changes via email.
                      </AlertDescription>
                    </Alert>
                  )}

                {/* Student Selector - Only in Direct Schedule Mode */}
                {mode === "create" && schedulingMode === "direct" && (
                  <div>
                    <Label className="mb-2 block">
                      Select Student(s) <span className="text-red-500">*</span>
                    </Label>
                    <StudentSelector
                      selectedStudents={selectedStudents}
                      onStudentsChange={setSelectedStudents}
                      multiSelect={slotType === "GROUP"}
                      placeholder="Search for students..."
                    />
                    {selectedStudents.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        Please select at least one student
                      </p>
                    )}
                    {selectedStudents.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedStudents.length}{" "}
                        {selectedStudents.length === 1 ? "student" : "students"}{" "}
                        selected
                      </p>
                    )}
                  </div>
                )}

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

              {/* Tab 3: Bookings (Edit Mode Only) */}
              {mode === "edit" && (
                <TabsContent value="bookings" className="space-y-4 mt-4">
                  {!slotWithBookings?.bookings ||
                  slotWithBookings.bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No bookings yet</p>
                      <p className="text-xs mt-1">
                        {existingSlot?.currentParticipants || 0} /{" "}
                        {existingSlot?.maxParticipants || 0} booked
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slotWithBookings.bookings.map((booking) => {
                        const statusConfig = {
                          CONFIRMED: {
                            icon: CheckCircle,
                            color: "text-green-600",
                            bg: "bg-green-50",
                            border: "border-green-200",
                            label: "Confirmed",
                          },
                          PENDING_CONFIRMATION: {
                            icon: Clock,
                            color: "text-amber-600",
                            bg: "bg-amber-50",
                            border: "border-amber-200",
                            label: "Pending",
                          },
                          CANCELLED_BY_STUDENT: {
                            icon: XCircle,
                            color: "text-red-600",
                            bg: "bg-red-50",
                            border: "border-red-200",
                            label: "Cancelled",
                          },
                          CANCELLED_BY_PROFESSOR: {
                            icon: XCircle,
                            color: "text-red-600",
                            bg: "bg-red-50",
                            border: "border-red-200",
                            label: "Cancelled",
                          },
                          COMPLETED: {
                            icon: CheckCircle,
                            color: "text-blue-600",
                            bg: "bg-blue-50",
                            border: "border-blue-200",
                            label: "Completed",
                          },
                          REJECTED: {
                            icon: XCircle,
                            color: "text-red-600",
                            bg: "bg-red-50",
                            border: "border-red-200",
                            label: "Rejected",
                          },
                        };

                        const config =
                          statusConfig[
                            booking.status as keyof typeof statusConfig
                          ];
                        const StatusIcon = config?.icon || Clock;

                        return (
                          <div
                            key={booking.id}
                            className={`p-4 rounded-lg border-2 ${config?.bg || "bg-gray-50"} ${config?.border || "border-gray-200"}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <button
                                    onClick={() =>
                                      openStudentModal(booking.student.id)
                                    }
                                    className="font-medium hover:underline text-left"
                                  >
                                    {booking.student.firstName}{" "}
                                    {booking.student.lastName}
                                  </button>
                                  <Badge
                                    variant="neutral"
                                    className={`${config?.color} ${config?.bg} border ${config?.border}`}
                                  >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {config?.label || booking.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span>{booking.student.email}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Booked{" "}
                                  {format(new Date(booking.bookedAt), "PPp")}
                                </p>
                              </div>

                              {/* Actions for PENDING bookings */}
                              {booking.status === "PENDING_CONFIRMATION" && (
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() =>
                                      confirmBookingMutation.mutate(booking.id)
                                    }
                                    isLoading={confirmBookingMutation.isPending}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      const reason = prompt(
                                        "Reason for rejection (optional):",
                                      );
                                      if (reason !== null) {
                                        rejectBookingMutation.mutate({
                                          bookingId: booking.id,
                                          reason: reason || "",
                                        });
                                      }
                                    }}
                                    isLoading={rejectBookingMutation.isPending}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  {existingSlot?.status === "CANCELLED"
                    ? "Hide from Calendar"
                    : (existingSlot?.currentParticipants || 0) > 0
                      ? "Cancel Slot"
                      : "Cancel Slot"}
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

      {/* Cancel Slot Modal - Bug Fix #5 */}
      {existingSlot && (
        <CancelSlotModal
          slot={existingSlot}
          open={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            onClose(); // Close parent modal too after cancellation
          }}
        />
      )}

      {/* Edit Scope Dialog - for recurring slots */}
      <EditScopeDialog
        isOpen={showEditScopeDialog}
        onClose={() => {
          setShowEditScopeDialog(false);
          setPendingFormData(null);
        }}
        onSelectScope={handleEditScopeSelected}
      />

      <StudentProfileModal
        open={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        studentId={selectedStudentId}
      />
    </>
  );
}
