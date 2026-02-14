import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, Check } from 'lucide-react';
import { bulkCreateSlotSchema, type BulkCreateSlotInput } from '@spanish-class/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { professorApi } from '@/lib/api';

const daysOfWeek = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export function BulkSlotPage() {
  const navigate = useNavigate();
  const [slotType, setSlotType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BulkCreateSlotInput>({
    resolver: zodResolver(bulkCreateSlotSchema),
    defaultValues: {
      slotType: 'INDIVIDUAL',
      maxParticipants: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  });

  const createMutation = useMutation({
    mutationFn: professorApi.createBulkSlots,
    onSuccess: (data) => {
      toast.success(`Created ${data.length} slots successfully!`);
      navigate('/admin/slots');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create slots');
    },
  });

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    setValue('daysOfWeek', newDays);
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
            Create Recurring Slots
          </h1>
          <p className="text-muted-foreground">
            Set up multiple slots at once for a date range
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Schedule
          </CardTitle>
          <CardDescription>
            Create the same time slot across multiple days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Range */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  error={errors.startDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  error={errors.endDate?.message}
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                      selectedDays.includes(day.value)
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-600 border-gray-200 hover:border-navy-300'
                    )}
                  >
                    {selectedDays.includes(day.value) && (
                      <Check className="inline-block mr-1 h-3 w-3" />
                    )}
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="text-sm text-destructive">{errors.daysOfWeek.message}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                  error={errors.startTime?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                  error={errors.endTime?.message}
                />
              </div>
            </div>

            {/* Slot Type */}
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select
                value={slotType}
                onValueChange={(value: 'INDIVIDUAL' | 'GROUP') => {
                  setSlotType(value);
                  setValue('slotType', value);
                  setValue('maxParticipants', value === 'INDIVIDUAL' ? 1 : 5);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual (1-on-1)</SelectItem>
                  <SelectItem value="GROUP">Group Session</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Participants (for group) */}
            {slotType === 'GROUP' && (
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={2}
                  max={20}
                  {...register('maxParticipants', { valueAsNumber: true })}
                  error={errors.maxParticipants?.message}
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Morning Conversation Practice"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What will these sessions cover?"
                {...register('description')}
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
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={createMutation.isPending}
              >
                Create Slots
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
