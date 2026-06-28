import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  Video,
  MoreVertical,
  Trash2,
  Edit,
  User,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { professorApi } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import type { AvailabilitySlot } from "@spanish-class/shared";

export function SlotsPage() {
  const { t } = useTranslation("admin");
  const [deleteSlot, setDeleteSlot] = useState<AvailabilitySlot | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  // S2/S3: Recurring pattern state
  const [editPattern, setEditPattern] = useState<any | null>(null);
  const [patternTitle, setPatternTitle] = useState("");
  const [patternDescription, setPatternDescription] = useState("");
  const [patternMaxParticipants, setPatternMaxParticipants] = useState(1);
  const [confirmDeletePattern, setConfirmDeletePattern] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["professor-slots"],
    queryFn: () => professorApi.getSlots({ limit: 100 }),
  });

  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ["recurring-patterns"],
    queryFn: professorApi.getRecurringPatterns,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => professorApi.deleteSlot(id),
    onSuccess: () => {
      toast.success(t("slots.delete_success"));
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      setDeleteSlot(null);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("slots.delete_success"));
    },
  });

  const cancelWithBookingsMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      professorApi.cancelSlotWithBookings(id, reason),
    onSuccess: (data) => {
      if (data.cancelledBookingsCount > 0) {
        toast.success(
          t("slots.delete_success") +
            ` (${data.cancelledBookingsCount} students notified)`,
        );
      } else {
        toast.success(t("slots.delete_success"));
      }
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      setDeleteSlot(null);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("slots.delete_success"));
    },
  });

  // S2: Update recurring pattern + all future slots
  const updatePatternMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      professorApi.updateRecurringPattern(id, data),
    onSuccess: () => {
      toast.success(t("slots.patterns.update_success"));
      queryClient.invalidateQueries({ queryKey: ["recurring-patterns"] });
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      setEditPattern(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to update pattern"),
  });

  // S3: Delete/deactivate recurring pattern
  const deletePatternMutation = useMutation({
    mutationFn: (id: string) => professorApi.deleteRecurringPattern(id),
    onSuccess: () => {
      toast.success(t("slots.patterns.delete_success"));
      queryClient.invalidateQueries({ queryKey: ["recurring-patterns"] });
      queryClient.invalidateQueries({ queryKey: ["professor-slots"] });
      setConfirmDeletePattern(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to delete pattern"),
  });

  const handleCancelSlot = () => {
    if (!deleteSlot) return;
    if (deleteSlot.currentParticipants > 0) {
      cancelWithBookingsMutation.mutate({ id: deleteSlot.id, reason: cancelReason || undefined });
    } else {
      deleteMutation.mutate(deleteSlot.id);
    }
  };

  const openEditPattern = (pattern: any) => {
    setPatternTitle(pattern.title ?? "");
    setPatternDescription(pattern.description ?? "");
    setPatternMaxParticipants(pattern.maxParticipants ?? 1);
    setEditPattern(pattern);
  };

  const handleUpdatePattern = () => {
    if (!editPattern) return;
    updatePatternMutation.mutate({
      id: editPattern.id,
      data: {
        title: patternTitle || null,
        description: patternDescription || null,
        maxParticipants: patternMaxParticipants,
      },
    });
  };

  const now = new Date();
  const upcomingSlots =
    data?.data?.filter(
      (slot) => new Date(slot.startTime) >= now && slot.status !== "CANCELLED",
    ) || [];
  const pastSlots =
    data?.data?.filter(
      (slot) => new Date(slot.startTime) < now || slot.status === "CANCELLED",
    ) || [];

  const renderSlotCard = (slot: AvailabilitySlot) => (
    <motion.div
      key={slot.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">
                  {slot.title || t("slots.table.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(slot.startTime)}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {slot.slotType === "GROUP" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {slot.currentParticipants}/{slot.maxParticipants}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  slot.status === "AVAILABLE"
                    ? "success"
                    : slot.status === "FULLY_BOOKED"
                      ? "warning"
                      : slot.status === "CANCELLED"
                        ? "destructive"
                        : "neutral"
                }
              >
                {slot.status.replace("_", " ")}
              </Badge>
              {slot.meetLink &&
                new Date(slot.startTime) > new Date() &&
                slot.status !== "CANCELLED" && (
                  <a
                    href={slot.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-spanish-teal-500 to-spanish-teal-600 text-white hover:from-spanish-teal-600 hover:to-spanish-teal-700 shadow-lg h-9 px-4"
                  >
                    <Video className="mr-1 h-4 w-4" />
                    {t("slots.actions.view")}
                  </a>
                )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/admin/slots/${slot.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("slots.actions.edit")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteSlot(slot)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("slots.actions.cancel")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {slot.description && (
            <p className="mt-3 text-sm text-muted-foreground">
              {slot.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("slots.title")}
          </h1>
          <p className="text-muted-foreground">{t("slots.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/slots/bulk">{t("slots.bulk_create")}</Link>
          </Button>
          <Button variant="primary" asChild>
            <Link to="/admin/slots/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("slots.create_button")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            {t("slots.filters.upcoming")} ({upcomingSlots.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            {t("slots.filters.past")} ({pastSlots.length})
          </TabsTrigger>
          {/* S2/S3: Recurring patterns tab */}
          <TabsTrigger value="patterns">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            {t("slots.patterns.tab_label")} ({patternsData?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : upcomingSlots.length > 0 ? (
            <div className="space-y-4">{upcomingSlots.map(renderSlotCard)}</div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{t("slots.no_slots")}</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/admin/slots/new">{t("slots.create_button")}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : pastSlots.length > 0 ? (
            <div className="space-y-4">{pastSlots.map(renderSlotCard)}</div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t("slots.no_slots")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* S2/S3: Recurring patterns management tab */}
        <TabsContent value="patterns" className="mt-6 space-y-4">
          {patternsLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : patternsData && patternsData.length > 0 ? (
            patternsData.map((pattern: any, i: number) => (
              <motion.div key={pattern.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="h-4 w-4 text-navy-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy-800 truncate">{pattern.title || t("slots.patterns.untitled")}</p>
                        <p className="text-xs text-slate-500">
                          {pattern.startTime} – {pattern.endTime} · {pattern.slotType} · {t("slots.patterns.max_participants", { count: pattern.maxParticipants })}
                        </p>
                        {!pattern.isActive && (
                          <Badge variant="neutral" className="text-xs mt-0.5">{t("slots.patterns.inactive")}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEditPattern(pattern)}>
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        {t("slots.patterns.edit_button")}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setConfirmDeletePattern(pattern)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {t("slots.patterns.delete_button")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{t("slots.patterns.empty")}</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/admin/slots/bulk">{t("slots.bulk_create")}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Slot Dialog */}
      <Dialog
        open={!!deleteSlot}
        onOpenChange={(open) => {
          if (!open) { setDeleteSlot(null); setCancelReason(""); }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deleteSlot && deleteSlot.currentParticipants > 0 && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {t("slots.actions.cancel")}
            </DialogTitle>
            <DialogDescription>
              {deleteSlot && deleteSlot.currentParticipants > 0
                ? t("slots.delete_success")
                : t("slots.delete_success")}
            </DialogDescription>
          </DialogHeader>
          {deleteSlot && deleteSlot.currentParticipants > 0 && (
            <div className="py-2">
              <Label htmlFor="cancelReason" className="text-sm text-muted-foreground">
                {t("slots.table.actions")}
              </Label>
              <Textarea
                id="cancelReason"
                placeholder={t("slots.create_button")}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteSlot(null); setCancelReason(""); }}>
              {t("slots.actions.view")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSlot}
              isLoading={deleteMutation.isPending || cancelWithBookingsMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("slots.actions.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* S2: Edit Recurring Pattern Dialog */}
      <Dialog open={!!editPattern} onOpenChange={(open) => { if (!open) setEditPattern(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {t("slots.patterns.edit_title")}
            </DialogTitle>
            <DialogDescription>{t("slots.patterns.edit_description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>{t("slots.patterns.title_label")}</Label>
              <Input value={patternTitle} onChange={(e) => setPatternTitle(e.target.value)} placeholder={t("slots.patterns.title_placeholder")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("slots.patterns.description_label")}</Label>
              <Textarea value={patternDescription} onChange={(e) => setPatternDescription(e.target.value)} rows={3} placeholder={t("slots.patterns.description_placeholder")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("slots.patterns.max_participants_label")}</Label>
              <Input type="number" min={1} max={20} value={patternMaxParticipants} onChange={(e) => setPatternMaxParticipants(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditPattern(null)} disabled={updatePatternMutation.isPending}>
              {t("slots.patterns.cancel")}
            </Button>
            <Button
              className="bg-spanish-teal-600 hover:bg-spanish-teal-700"
              onClick={handleUpdatePattern}
              disabled={updatePatternMutation.isPending}
            >
              {updatePatternMutation.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("slots.patterns.saving")}</>
                : t("slots.patterns.save_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* S3: Confirm Delete Pattern Dialog */}
      <Dialog open={!!confirmDeletePattern} onOpenChange={(open) => { if (!open) setConfirmDeletePattern(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("slots.patterns.confirm_delete_title")}
            </DialogTitle>
            <DialogDescription>{t("slots.patterns.confirm_delete_description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDeletePattern(null)}>
              {t("slots.patterns.cancel")}
            </Button>
            <Button
              variant="destructive"
              isLoading={deletePatternMutation.isPending}
              onClick={() => confirmDeletePattern && deletePatternMutation.mutate(confirmDeletePattern.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("slots.patterns.confirm_delete_button")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
