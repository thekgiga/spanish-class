import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, Mail, Globe, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { professorApi } from '@/lib/api';
import { getInitials, formatDate, formatTime } from '@/lib/utils';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => professorApi.getStudent(id!),
    enabled: !!id,
  });

  const createNoteMutation = useMutation({
    mutationFn: (content: string) => professorApi.createNote(id!, content),
    onSuccess: () => {
      toast.success('Note added');
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      setNoteDialogOpen(false);
      setNoteContent('');
    },
    onError: () => toast.error('Failed to add note'),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      professorApi.updateNote(id!, noteId, content),
    onSuccess: () => {
      toast.success('Note updated');
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      setEditingNote(null);
      setNoteContent('');
    },
    onError: () => toast.error('Failed to update note'),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => professorApi.deleteNote(id!, noteId),
    onSuccess: () => {
      toast.success('Note deleted');
      queryClient.invalidateQueries({ queryKey: ['student', id] });
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    if (editingNote) {
      updateNoteMutation.mutate({ noteId: editingNote.id, content: noteContent });
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
    setNoteContent('');
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
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/students')}>
          Back to Students
        </Button>
      </div>
    );
  }

  const confirmedBookings = student.bookings.filter((b) => b.status === 'CONFIRMED');
  const pastBookings = student.bookings.filter((b) => b.status !== 'CONFIRMED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">Student Profile</h1>
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
                  Joined {formatDate(student.createdAt, { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-navy-800">{confirmedBookings.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-navy-800">{pastBookings.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="notes">Notes ({student.notes?.length || 0})</TabsTrigger>
        </TabsList>

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
                        {booking.slot?.title || 'Spanish Class'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.slot?.startTime)} at{' '}
                        {formatTime(booking.slot?.startTime)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      booking.status === 'CONFIRMED'
                        ? 'success'
                        : booking.status === 'COMPLETED'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {booking.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No bookings yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={openNewNote}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {student.notes && student.notes.length > 0 ? (
            student.notes.map((note: any) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(note.createdAt, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditNote(note)}>
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
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No notes yet. Add a note to track this student's progress.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your note here..."
            rows={6}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNote}
              isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
            >
              {editingNote ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
