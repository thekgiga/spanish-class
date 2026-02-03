import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { professorApi } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import type { AvailabilitySlot } from '@spanish-class/shared';

export function SlotsPage() {
  const [deleteSlot, setDeleteSlot] = useState<AvailabilitySlot | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['professor-slots'],
    queryFn: () => professorApi.getSlots({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => professorApi.deleteSlot(id),
    onSuccess: () => {
      toast.success('Slot cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['professor-slots'] });
      setDeleteSlot(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel slot');
    },
  });

  const cancelWithBookingsMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      professorApi.cancelSlotWithBookings(id, reason),
    onSuccess: (data) => {
      if (data.cancelledBookingsCount > 0) {
        toast.success(`Slot cancelled and ${data.cancelledBookingsCount} student(s) notified`);
      } else {
        toast.success('Slot cancelled successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['professor-slots'] });
      setDeleteSlot(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel slot');
    },
  });

  const handleCancelSlot = () => {
    if (!deleteSlot) return;

    if (deleteSlot.currentParticipants > 0) {
      cancelWithBookingsMutation.mutate({
        id: deleteSlot.id,
        reason: cancelReason || undefined,
      });
    } else {
      deleteMutation.mutate(deleteSlot.id);
    }
  };

  const now = new Date();
  const upcomingSlots = data?.data?.filter(
    (slot) => new Date(slot.startTime) >= now && slot.status !== 'CANCELLED'
  ) || [];
  const pastSlots = data?.data?.filter(
    (slot) => new Date(slot.startTime) < now || slot.status === 'CANCELLED'
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
                  {slot.title || 'Spanish Class'}
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
                    {slot.slotType === 'GROUP' ? (
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
                  slot.status === 'AVAILABLE'
                    ? 'success'
                    : slot.status === 'FULLY_BOOKED'
                    ? 'warning'
                    : slot.status === 'CANCELLED'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {slot.status.replace('_', ' ')}
              </Badge>
              {slot.googleMeetLink && (
                <Button size="sm" variant="outline" asChild>
                  <a href={slot.googleMeetLink} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4" />
                  </a>
                </Button>
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
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteSlot(slot)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {slot.description && (
            <p className="mt-3 text-sm text-muted-foreground">{slot.description}</p>
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
          <h1 className="text-2xl font-display font-bold text-navy-800">Availability</h1>
          <p className="text-muted-foreground">Manage your teaching schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/slots/bulk">Create Recurring</Link>
          </Button>
          <Button variant="primary" asChild>
            <Link to="/admin/slots/new">
              <Plus className="mr-2 h-4 w-4" />
              New Slot
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSlots.length})</TabsTrigger>
          <TabsTrigger value="past">Past & Cancelled ({pastSlots.length})</TabsTrigger>
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
                <p className="text-muted-foreground">No upcoming slots</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/admin/slots/new">Create Your First Slot</Link>
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
                <p className="text-muted-foreground">No past sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteSlot} onOpenChange={(open) => {
        if (!open) {
          setDeleteSlot(null);
          setCancelReason('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deleteSlot && deleteSlot.currentParticipants > 0 && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              Cancel Slot
            </DialogTitle>
            <DialogDescription>
              {deleteSlot && deleteSlot.currentParticipants > 0
                ? `This slot has ${deleteSlot.currentParticipants} active booking(s). All students will be notified via email.`
                : 'Are you sure you want to cancel this slot? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          {deleteSlot && deleteSlot.currentParticipants > 0 && (
            <div className="py-2">
              <Label htmlFor="cancelReason" className="text-sm text-muted-foreground">
                Reason for cancellation (optional)
              </Label>
              <Textarea
                id="cancelReason"
                placeholder="e.g., Schedule conflict, emergency..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setDeleteSlot(null);
              setCancelReason('');
            }}>
              Keep Slot
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSlot}
              isLoading={deleteMutation.isPending || cancelWithBookingsMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteSlot && deleteSlot.currentParticipants > 0
                ? 'Cancel & Notify Students'
                : 'Cancel Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
