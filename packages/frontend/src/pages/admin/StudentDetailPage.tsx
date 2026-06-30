/**
 * StudentDetailPage — professor view of a student.
 *
 * STUDENT-P-001: Combines goals, next lesson, recent activity, and notes.
 *
 * Tabs: Overview | Lessons | Notes
 */
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Plus, Edit, Trash2, Target, BookOpen, Globe, Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { InlineAlert, uiToast } from "@/components/ui/inline-alert";
import { BookingRequestCard } from "@/components/ui/booking-request-card";
import { professorApi } from "@/lib/api";
import { getInitials, formatDate, formatTime } from "@/lib/utils";
import { bookingStatusToUi, isBookingConfirmed, isBookingPending } from "@/lib/ui-system/status";
import type { BookingWithSlot } from "@spanish-class/shared";

export function StudentDetailPage() {
  const { t }          = useTranslation(["student", "admin"]);
  const { id }         = useParams<{ id: string }>();
  const navigate       = useNavigate();
  const qc             = useQueryClient();
  const [editingNote, setEditingNote]   = useState<any>(null);
  const [noteContent, setNoteContent]   = useState("");
  const [addingNote, setAddingNote]     = useState(false);
  const [noteError, setNoteError]       = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn:  () => professorApi.getStudent(id!),
    enabled: !!id,
  });
  const student = (data as any)?.data ?? (data as any);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["student", id] });

  const createMutation = useMutation({
    mutationFn: (content: string) => professorApi.createNote(id!, content),
    onSuccess: () => { invalidate(); setAddingNote(false); setNoteContent(""); uiToast.success(t("detail.note_saved")); },
    onError:   () => uiToast.error(t("admin:students.error_generic", { defaultValue: "Error saving note." })),
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      professorApi.updateNote(id!, noteId, content),
    onSuccess: () => { invalidate(); setEditingNote(null); setNoteContent(""); uiToast.success(t("detail.note_saved")); },
    onError:   () => uiToast.error(t("admin:students.error_generic", { defaultValue: "Error saving note." })),
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => professorApi.deleteNote(id!, noteId),
    onSuccess: () => { invalidate(); uiToast.success(t("detail.note_deleted")); },
    onError:   () => uiToast.error(t("admin:students.error_generic", { defaultValue: "Error deleting note." })),
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) { setNoteError(t("detail.note_required")); return; }
    if (editingNote) {
      updateMutation.mutate({ noteId: editingNote.id, content: noteContent.trim() });
    } else {
      createMutation.mutate(noteContent.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  if (!student) return null;

  const bookings: BookingWithSlot[] = student.bookings ?? [];
  const now = new Date();
  const nextLesson = bookings.find((b) => isBookingConfirmed(b) && new Date(b.slot.startTime) > now)
    ?? bookings.find((b) => isBookingPending(b));
  const notes = student.notes ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
      {/* Back + header */}
      <Button variant="quiet" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/admin/students")}>
        <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
        {t("admin:students.back")}
      </Button>

      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description={student.email}
        action={
          <Button variant="primary" size="sm" asChild>
            <Link to="/admin/slots/new" state={{ scheduleStudent: true, studentId: id }}>
              {t("detail.schedule_lesson")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("detail.overview_tab")}</TabsTrigger>
            <TabsTrigger value="lessons">
              {t("detail.lessons_tab")} {bookings.length > 0 && `(${bookings.length})`}
            </TabsTrigger>
            <TabsTrigger value="notes">
              {t("detail.notes_tab")} {notes.length > 0 && `(${notes.length})`}
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ───────────────────────────────────────────── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Next lesson */}
            {nextLesson ? (
              <section>
                <p className="text-caption text-ink-tertiary uppercase tracking-wide font-semibold mb-2">
                  {t("detail.next_lesson")}
                </p>
                <BookingRequestCard booking={nextLesson} variant="compact" />
              </section>
            ) : (
              <InlineAlert variant="info">{t("detail.no_upcoming")}</InlineAlert>
            )}

            {/* Identity */}
            <Card variant="plain">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 shrink-0">
                    <AvatarFallback className="bg-brand text-brand-contrast text-title font-semibold">
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-title font-semibold text-ink">
                      {student.firstName} {student.lastName}
                    </p>
                    <a href={`mailto:${student.email}`} className="text-small text-brand hover:text-brand-hover flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      {student.email}
                    </a>
                    {student.timezone && (
                      <p className="text-small text-ink-secondary flex items-center gap-1 mt-0.5">
                        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                        {student.timezone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning goals */}
            {student.learningGoals && (
              <Card variant="plain">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-title">
                    <Target className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
                    {t("detail.learning_goals_label")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-small text-ink-secondary whitespace-pre-wrap">{student.learningGoals}</p>
                </CardContent>
              </Card>
            )}

            {/* Availability notes */}
            {student.availabilityNotes && (
              <Card variant="plain">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-title">
                    <BookOpen className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
                    {t("detail.availability_notes_label")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-small text-ink-secondary whitespace-pre-wrap">{student.availabilityNotes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Lessons ────────────────────────────────────────────── */}
          <TabsContent value="lessons" className="mt-4">
            {bookings.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-10 w-10" />}
                title={t("detail.lessons_empty_title")}
                description={t("detail.lessons_empty_description")}
              />
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => {
                  const uiStatus = bookingStatusToUi(b.status);
                  return (
                    <Card key={b.id} variant="plain">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-small font-medium text-ink">
                            {formatDate(b.slot.startTime)}
                          </p>
                          <p className="text-caption text-ink-secondary ui-tabular">
                            {formatTime(b.slot.startTime)} – {formatTime(b.slot.endTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={uiStatus} variant="pill" />
                          {uiStatus === 'confirmed' && (
                            <Button
                              variant="quiet"
                              size="sm"
                              onClick={() => professorApi.markNoShow(b.id).then(() => qc.invalidateQueries({ queryKey: ["student", id] }))}
                            >
                              {t("detail.mark_no_show")}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Notes ──────────────────────────────────────────────── */}
          <TabsContent value="notes" className="mt-4 space-y-3">
            {/* Add note form */}
            {addingNote ? (
              <div className="space-y-2">
                <Textarea
                  autoFocus
                  value={noteContent}
                  onChange={(e) => { setNoteContent(e.target.value); setNoteError(""); }}
                  placeholder={t("detail.note_placeholder")}
                  rows={4}
                  error={noteError}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={createMutation.isPending}
                    onClick={handleSaveNote}
                  >
                    {t("detail.save_note")}
                  </Button>
                  <Button variant="quiet" size="sm" onClick={() => { setAddingNote(false); setNoteContent(""); }}>
                    {t("detail.cancel_note")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setAddingNote(true)}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                {t("detail.add_note")}
              </Button>
            )}

            {notes.length === 0 && !addingNote ? (
              <EmptyState title={t("detail.no_notes")} />
            ) : (
              notes.map((note: any) => (
                editingNote?.id === note.id ? (
                  <div key={note.id} className="space-y-2">
                    <Textarea
                      autoFocus
                      value={noteContent}
                      onChange={(e) => { setNoteContent(e.target.value); setNoteError(""); }}
                      placeholder={t("detail.note_placeholder")}
                      rows={4}
                      error={noteError}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updateMutation.isPending}
                        onClick={handleSaveNote}
                      >
                        {t("detail.save_note")}
                      </Button>
                      <Button variant="quiet" size="sm" onClick={() => { setEditingNote(null); setNoteContent(""); }}>
                        {t("detail.cancel_note")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card key={note.id} variant="plain">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-small text-ink whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-caption text-ink-tertiary">{formatDate(note.createdAt)}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="quiet"
                            size="sm"
                            onClick={() => { setEditingNote(note); setNoteContent(note.content); }}
                          >
                            <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="sr-only">{t("detail.edit_note")}</span>
                          </Button>
                          <Button
                            variant="quiet"
                            size="sm"
                            isLoading={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(note.id)}
                            className="text-feedback-danger hover:bg-feedback-danger/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="sr-only">{t("detail.delete_note")}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
