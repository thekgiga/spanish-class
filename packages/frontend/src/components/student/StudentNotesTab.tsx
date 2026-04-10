import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { professorApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  createdAt: string | Date;
}

interface StudentNotesTabProps {
  studentId: string;
  notes: Note[];
}

export function StudentNotesTab({ studentId, notes }: StudentNotesTabProps) {
  const { t } = useTranslation("admin");
  const queryClient = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const createNoteMutation = useMutation({
    mutationFn: (content: string) =>
      professorApi.createNote(studentId, content),
    onSuccess: () => {
      toast.success(t("students.table.actions"));
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      setNoteDialogOpen(false);
      setNoteContent("");
    },
    onError: () => toast.error(t("students.table.actions")),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      professorApi.updateNote(studentId, noteId, content),
    onSuccess: () => {
      toast.success(t("students.table.actions"));
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      setEditingNote(null);
      setNoteContent("");
      setNoteDialogOpen(false);
    },
    onError: () => toast.error(t("students.table.actions")),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => professorApi.deleteNote(studentId, noteId),
    onSuccess: () => {
      toast.success(t("students.table.actions"));
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
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

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteDialogOpen(true);
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteContent("");
    setNoteDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={openNewNote}>
          <Plus className="mr-2 h-4 w-4" />
          {t("students.detail.notes_tab.add_note")}
        </Button>
      </div>

      {notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note: Note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground">
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
                <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("students.detail.notes_tab.no_notes")}
          </CardContent>
        </Card>
      )}

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
    </>
  );
}
