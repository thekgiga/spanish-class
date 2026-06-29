import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Globe,
  Plus,
  Edit,
  Trash2,
  Clock,
  Phone,
  BookOpen,
  Target,
  MessageSquare,
  Reply,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { professorApi, feedbackApi } from "@/lib/api";
import { getInitials, formatDate, formatTime } from "@/lib/utils";
import { MeetingNotesEditor } from "@/components/professor/MeetingNotesEditor";

function FeedbackCard({ fb, studentId }: { fb: any; studentId: string }) {
  const { t } = useTranslation("admin");
  const queryClient = useQueryClient();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState(fb.professorResponse ?? "");

  const responseMutation = useMutation({
    mutationFn: (response: string) => feedbackApi.respondToFeedback(fb.id, response),
    onSuccess: () => {
      toast.success(t("feedback.response_saved"));
      queryClient.invalidateQueries({ queryKey: ["student-feedback", studentId] });
      setShowResponseForm(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to save response"),
  });

  return (
    <Card className="border border-slate-100">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-lg ${s <= fb.rating ? "text-yellow-400" : "text-slate-200"}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {fb.booking?.slot?.startTime ? formatDate(fb.booking.slot.startTime) : ""}
          </span>
        </div>
        {fb.booking?.slot?.title && (
          <p className="text-xs text-slate-500 font-medium">{fb.booking.slot.title}</p>
        )}
        {fb.whatWasGood && (
          <div className="bg-green-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-green-700 mb-0.5">{t("feedback.what_was_good")}</p>
            <p className="text-sm text-slate-700">{fb.whatWasGood}</p>
          </div>
        )}
        {fb.whatCouldBeImproved && (
          <div className="bg-amber-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-amber-700 mb-0.5">{t("feedback.what_could_improve")}</p>
            <p className="text-sm text-slate-700">{fb.whatCouldBeImproved}</p>
          </div>
        )}

        {/* SF5: Professor response */}
        {fb.professorResponse && !showResponseForm && (
          <div className="bg-spanish-teal-50 border border-spanish-teal-200 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-spanish-teal-700">{t("feedback.professor_response_label")}</span>
              <button
                type="button"
                onClick={() => { setResponseText(fb.professorResponse ?? ""); setShowResponseForm(true); }}
                className="text-xs text-spanish-teal-600 hover:text-spanish-teal-800 underline"
              >
                {t("feedback.edit_response_button")}
              </button>
            </div>
            <p className="text-xs text-slate-700">{fb.professorResponse}</p>
          </div>
        )}

        {showResponseForm ? (
          <div className="space-y-2 pt-1">
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={t("feedback.response_placeholder")}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-spanish-teal-600 hover:bg-spanish-teal-700"
                disabled={!responseText.trim() || responseMutation.isPending}
                onClick={() => responseMutation.mutate(responseText.trim())}
              >
                {responseMutation.isPending
                  ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{t("feedback.submitting_response")}</>
                  : t("feedback.submit_response")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowResponseForm(false)} disabled={responseMutation.isPending}>
                {t("feedback.cancel")}
              </Button>
            </div>
          </div>
        ) : !fb.professorResponse ? (
          <button
            type="button"
            onClick={() => { setResponseText(""); setShowResponseForm(true); }}
            className="flex items-center gap-1 text-xs text-spanish-teal-600 hover:text-spanish-teal-800"
          >
            <Reply className="h-3 w-3" />
            {t("feedback.add_response_button")}
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StudentDetailPage() {
  const { t } = useTranslation("admin");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [noteContent, setNoteContent] = useState("");
  const [meetingNotesBookingId, setMeetingNotesBookingId] = useState<string | null>(null);
  const [meetingNotesTitle, setMeetingNotesTitle] = useState<string | undefined>();
  const [genericOpen, setGenericOpen] = useState(true);
  const [bookingNotesOpen, setBookingNotesOpen] = useState(true);
  const [bookingNotesPage, setBookingNotesPage] = useState(1);
  const [allBookingNotes, setAllBookingNotes] = useState<any[]>([]);

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => professorApi.getStudent(id!),
    enabled: !!id,
  });

  // Fetch feedback for this student (professor viewing their own student's feedback)
  const { data: feedbackData } = useQuery({
    queryKey: ["student-feedback", id],
    queryFn: () => feedbackApi.getMyFeedbackAsProf(1, id),
    enabled: !!id,
  });

  const { data: bookingNotesData, isFetching: bookingNotesFetching } = useQuery({
    queryKey: ["student-booking-notes", id, bookingNotesPage],
    queryFn: () => professorApi.getStudentBookingNotes(id!, bookingNotesPage, 10),
    enabled: !!id,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (bookingNotesData?.data) {
      if (bookingNotesPage === 1) {
        setAllBookingNotes(bookingNotesData.data);
      } else {
        setAllBookingNotes((prev) => {
          const existingIds = new Set(prev.map((n: any) => n.id));
          const fresh = bookingNotesData.data.filter((n: any) => !existingIds.has(n.id));
          return [...prev, ...fresh];
        });
      }
    }
  }, [bookingNotesData, bookingNotesPage]);

  // Accumulate booking notes across pages
  const prevBookingPageRef = { current: 0 };
  if (bookingNotesData && bookingNotesData.pagination.page > prevBookingPageRef.current) {
    prevBookingPageRef.current = bookingNotesData.pagination.page;
  }

  const createNoteMutation = useMutation({
    mutationFn: (content: string) => professorApi.createNote(id!, content),
    onSuccess: () => {
      toast.success(t("students.table.actions"));
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      setNoteDialogOpen(false);
      setNoteContent("");
    },
    onError: () => toast.error(t("students.table.actions")),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      professorApi.updateNote(id!, noteId, content),
    onSuccess: () => {
      toast.success(t("students.table.actions"));
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      setEditingNote(null);
      setNoteContent("");
    },
    onError: () => toast.error(t("students.table.actions")),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => professorApi.deleteNote(id!, noteId),
    onSuccess: () => {
      toast.success(t("students.table.actions"));
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
    onError: () => toast.error(t("students.table.actions")),
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    if (editingNote) {
      updateNoteMutation.mutate({
        noteId: editingNote.id,
        content: noteContent,
      });
    } else {
      createNoteMutation.mutate(noteContent);
    }
  };

  const openEditNote = (note: any) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteDialogOpen(true);
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteContent("");
    setNoteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/admin/students")}
        >
          Back to Students
        </Button>
      </div>
    );
  }

  const confirmedBookings = student.bookings.filter(
    (b) => b.status === "CONFIRMED",
  );
  const pastBookings = student.bookings.filter((b) => b.status !== "CONFIRMED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("students.detail.title")}
          </h1>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-navy-100 text-navy-700 text-2xl">
                {getInitials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-navy-800">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {student.timezone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t("students.detail.joined")}{" "}
                  {formatDate(student.createdAt, {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-navy-800">
                  {confirmedBookings.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("students.detail.upcoming")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-navy-800">
                  {pastBookings.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("students.detail.completed")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            {t("students.detail.tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="bookings">
            {t("students.detail.tabs.bookings")}
          </TabsTrigger>
          <TabsTrigger value="notes">
            {t("students.detail.tabs.notes")} ({student.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            Feedback ({feedbackData?.data?.total || 0})
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab (US-19) */}
        <TabsContent value="profile" className="mt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Personal Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t("students.detail.personal_details.title")}
                </h3>
                <div className="space-y-3">
                  {student.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">
                          {t("students.detail.personal_details.dob")}{" "}
                        </span>
                        {formatDate(student.dateOfBirth)}
                      </span>
                    </div>
                  )}
                  {student.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{student.phoneNumber}</span>
                    </div>
                  )}
                  {student.aboutMe ? (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("students.detail.personal_details.about")}
                      </p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">
                        {student.aboutMe}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {t("students.detail.personal_details.no_details")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t("students.detail.learning_preferences.title")}
                </h3>
                <div className="space-y-3">
                  {student.spanishLevel && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "students.detail.learning_preferences.spanish_level",
                        )}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {student.spanishLevel.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  )}
                  {student.preferredClassTypes &&
                    student.preferredClassTypes.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {t(
                            "students.detail.learning_preferences.preferred_class_types",
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {student.preferredClassTypes.map((type: string) => (
                            <Badge
                              key={type}
                              variant="neutral"
                              className="text-xs"
                            >
                              {type.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {!student.spanishLevel &&
                    !student.preferredClassTypes?.length && (
                      <p className="text-sm text-muted-foreground italic">
                        {t(
                          "students.detail.learning_preferences.no_preferences",
                        )}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Goals */}
            {student.learningGoals && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t("students.detail.learning_goals.title")}
                  </h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {student.learningGoals}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Availability Notes */}
            {student.availabilityNotes && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t("students.detail.availability_notes.title")}
                  </h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {student.availabilityNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6 space-y-4">
          {student.bookings.length > 0 ? (
            student.bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-navy-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-navy-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-800">
                        {booking.slot?.title ||
                          t("students.detail.bookings_tab.spanish_class")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.slot?.startTime)} at{" "}
                        {formatTime(booking.slot?.startTime)}
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
                      {booking.status}
                    </Badge>
                    {booking.status === "CONFIRMED" &&
                      booking.slot?.startTime &&
                      new Date(booking.slot.startTime) < new Date() && (
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                          onClick={async () => {
                            if (!confirm("Mark this booking as no-show?")) return;
                            try {
                              const result = await professorApi.markNoShow(booking.id);
                              toast.success(
                                result.atThreshold
                                  ? `Marked as no-show. Student has reached the no-show threshold (${result.noShowCount}/${result.threshold}).`
                                  : `Marked as no-show (${result.noShowCount}/${result.threshold} no-shows).`,
                              );
                              queryClient.invalidateQueries({ queryKey: ["student", id] });
                            } catch (err: any) {
                              toast.error(err?.response?.data?.error || "Failed to mark no-show");
                            }
                          }}
                        >
                          Mark No-Show
                        </button>
                      )}
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded border border-spanish-teal-300 text-spanish-teal-700 hover:bg-spanish-teal-50 transition-colors"
                      onClick={() => {
                        setMeetingNotesBookingId(booking.id);
                        setMeetingNotesTitle(booking.slot?.title || undefined);
                      }}
                    >
                      {t("students.detail.bookings_tab.meeting_notes")}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t("students.detail.bookings_tab.no_bookings")}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6 space-y-3">
          <div className="flex justify-end">
            <Button variant="primary" onClick={openNewNote}>
              <Plus className="mr-2 h-4 w-4" />
              {t("students.detail.notes_tab.add_note")}
            </Button>
          </div>

          {/* Generic Notes Accordion — amber accent */}
          <div className="border-2 border-amber-200 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
              onClick={() => setGenericOpen((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-amber-900 text-sm">
                  {t("students.detail.notes_tab.generic_notes")}
                </span>
                <span className="text-xs bg-amber-200 text-amber-800 rounded-full px-2 py-0.5 font-medium">
                  {student.notes?.length || 0}
                </span>
              </div>
              {genericOpen ? (
                <ChevronDown className="h-4 w-4 text-amber-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-amber-600" />
              )}
            </button>
            {genericOpen && (
              <div className="p-4 space-y-3 bg-white">
                {student.notes && student.notes.length > 0 ? (
                  student.notes.map((note: any) => (
                    <div key={note.id} className="border border-amber-100 rounded-lg p-4 bg-amber-50/40">
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-amber-700">
                          {formatDate(note.createdAt, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("students.detail.notes_tab.no_generic_notes")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Booking/Class Notes Accordion — teal accent */}
          <div className="border-2 border-spanish-teal-200 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 bg-spanish-teal-50 hover:bg-spanish-teal-100 transition-colors text-left"
              onClick={() => setBookingNotesOpen((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-spanish-teal-600" />
                <span className="font-semibold text-spanish-teal-900 text-sm">
                  {t("students.detail.notes_tab.booking_notes")}
                </span>
                <span className="text-xs bg-spanish-teal-200 text-spanish-teal-800 rounded-full px-2 py-0.5 font-medium">
                  {bookingNotesData?.pagination.total ?? 0}
                </span>
              </div>
              {bookingNotesOpen ? (
                <ChevronDown className="h-4 w-4 text-spanish-teal-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-spanish-teal-600" />
              )}
            </button>
            {bookingNotesOpen && (
              <div className="p-4 space-y-3 bg-white">
                {allBookingNotes.length > 0 ? (
                  <>
                    {allBookingNotes.map((note: any) => (
                      <div key={note.id} className="border border-spanish-teal-100 rounded-lg overflow-hidden">
                        {/* Clickable header — opens Meeting Notes modal for this booking */}
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-3 bg-spanish-teal-50/60 hover:bg-spanish-teal-100/70 transition-colors text-left"
                          onClick={() => {
                            setMeetingNotesBookingId(note.bookingId);
                            setMeetingNotesTitle(note.booking?.slot?.title || undefined);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-spanish-teal-500 shrink-0" />
                            <span className="text-sm font-semibold text-spanish-teal-900">
                              {note.booking?.slot?.title || t("students.detail.bookings_tab.spanish_class")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {note.booking?.slot?.startTime && (
                              <div className="text-right">
                                <p className="text-xs font-medium text-spanish-teal-800">
                                  {formatDate(note.booking.slot.startTime, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-spanish-teal-600">
                                  {formatTime(note.booking.slot.startTime)}
                                  {note.booking.slot.endTime ? ` – ${formatTime(note.booking.slot.endTime)}` : ""}
                                </p>
                              </div>
                            )}
                            <Edit className="h-3.5 w-3.5 text-spanish-teal-400 shrink-0" />
                          </div>
                        </button>
                        {/* Note content */}
                        <div className="px-4 py-3 space-y-2">
                          {note.agendaNotes && (
                            <div className="bg-blue-50 rounded-lg px-3 py-2">
                              <p className="text-xs font-medium text-blue-700 mb-0.5">
                                {t("students.detail.notes_tab.agenda_notes")}
                              </p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.agendaNotes}</p>
                            </div>
                          )}
                          {note.sessionNotes && (
                            <div className="bg-green-50 rounded-lg px-3 py-2">
                              <p className="text-xs font-medium text-green-700 mb-0.5">
                                {t("students.detail.notes_tab.session_notes")}
                              </p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.sessionNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {bookingNotesData && allBookingNotes.length < bookingNotesData.pagination.total && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={bookingNotesFetching}
                          onClick={() => setBookingNotesPage((p) => p + 1)}
                        >
                          {bookingNotesFetching ? (
                            <><Loader2 className="h-3 w-3 mr-2 animate-spin" />{t("students.detail.notes_tab.loading")}</>
                          ) : (
                            t("students.detail.notes_tab.load_more")
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("students.detail.notes_tab.no_booking_notes")}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-6 space-y-4">
          {feedbackData?.data?.feedback?.length > 0 ? (
            feedbackData.data.feedback.map((fb: any) => (
              <FeedbackCard key={fb.id} fb={fb} studentId={id!} />
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm">No feedback submitted yet for this student's sessions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNote
                ? t("students.detail.notes_tab.edit_note")
                : t("students.detail.notes_tab.add_note")}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={t("student_detail.notes_tab.note_placeholder")}
            rows={6}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>
              {t("students.detail.notes_tab.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNote}
              isLoading={
                createNoteMutation.isPending || updateNoteMutation.isPending
              }
            >
              {editingNote
                ? t("students.detail.notes_tab.update")
                : t("students.detail.notes_tab.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {meetingNotesBookingId && (
        <MeetingNotesEditor
          open={!!meetingNotesBookingId}
          onOpenChange={(open) => { if (!open) setMeetingNotesBookingId(null); }}
          bookingId={meetingNotesBookingId}
          sessionTitle={meetingNotesTitle}
        />
      )}
    </div>
  );
}
