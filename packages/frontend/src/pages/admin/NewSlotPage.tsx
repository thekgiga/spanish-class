import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { professorApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const DURATION_PRESETS = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60, recommended: true },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
];

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7; // Start from 7 AM
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

type Mode = 'single' | 'recurring';
type SlotType = 'INDIVIDUAL' | 'GROUP';

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function NewSlotPage() {
  const navigate = useNavigate();

  // Mode: single slot or recurring
  const [mode, setMode] = useState<Mode>('single');

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Time state
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(60);

  // Slot details
  const [slotType, setSlotType] = useState<SlotType>('INDIVIDUAL');
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Private slot
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Direct booking
  const [bookForStudent, setBookForStudent] = useState<StudentOption | null>(null);

  // Recurring pattern
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
  const [generateWeeksAhead, setGenerateWeeksAhead] = useState(4);

  // Fetch students for selection
  const { data: studentsData } = useQuery({
    queryKey: ['professor-students'],
    queryFn: () => professorApi.getStudents({ limit: 100 }),
  });

  const students = useMemo(() => {
    const list = studentsData?.data || [];
    if (!studentSearch) return list;
    const search = studentSearch.toLowerCase();
    return list.filter(
      (s: StudentOption) =>
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
    );
  }, [studentsData?.data, studentSearch]);

  // Calculate end time
  const endTime = useMemo(() => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }, [startTime, duration]);

  // Create slot mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = new Date(selectedDate);
      const [h, m] = startTime.split(':').map(Number);
      startDateTime.setHours(h, m, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [eh, em] = endTime.split(':').map(Number);
      endDateTime.setHours(eh, em, 0, 0);

      return professorApi.createSlot({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotType,
        maxParticipants: slotType === 'INDIVIDUAL' ? 1 : maxParticipants,
        title: title || undefined,
        description: description || undefined,
        isPrivate,
        allowedStudentIds: isPrivate ? selectedStudents.map((s) => s.id) : undefined,
        bookForStudentId: bookForStudent?.id,
      });
    },
    onSuccess: (data) => {
      if (bookForStudent) {
        toast.success(`Slot created and invitation sent to ${bookForStudent.firstName}!`);
      } else {
        toast.success('Slot created successfully!');
      }
      navigate('/admin/slots');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create slot');
    },
  });

  // Create recurring pattern mutation
  const createRecurringMutation = useMutation({
    mutationFn: async () => {
      const startDateStr = selectedDate.toISOString().split('T')[0];
      const endDateStr = recurringEndDate
        ? recurringEndDate.toISOString().split('T')[0]
        : null;

      return professorApi.createRecurringPattern({
        daysOfWeek: recurringDays,
        startTime,
        endTime,
        startDate: startDateStr,
        endDate: endDateStr,
        slotType,
        maxParticipants: slotType === 'INDIVIDUAL' ? 1 : maxParticipants,
        title: title || undefined,
        description: description || undefined,
        isPrivate,
        allowedStudentIds: isPrivate ? selectedStudents.map((s) => s.id) : undefined,
        generateWeeksAhead,
      });
    },
    onSuccess: (data) => {
      toast.success(`Created recurring pattern with ${data.slots.length} slots!`);
      navigate('/admin/slots');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create recurring pattern');
    },
  });

  const handleSubmit = () => {
    if (mode === 'single') {
      createMutation.mutate();
    } else {
      if (recurringDays.length === 0) {
        toast.error('Please select at least one day for recurring slots');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">Create Availability</h1>
          <p className="text-muted-foreground">Schedule new class slots for your students</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setMode('single')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'single'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-muted-foreground hover:text-navy-800'
          )}
        >
          <Calendar className="inline-block w-4 h-4 mr-2" />
          Single Slot
        </button>
        <button
          onClick={() => setMode('recurring')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'recurring'
              ? 'bg-white text-navy-800 shadow-sm'
              : 'text-muted-foreground hover:text-navy-800'
          )}
        >
          <Repeat className="inline-block w-4 h-4 mr-2" />
          Recurring
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Date & Time */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold-500" />
                {mode === 'single' ? 'Select Date' : 'Start Date'}
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
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
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
                      'aspect-square p-2 text-sm rounded-lg transition-all',
                      !date && 'invisible',
                      date && isPast(date) && 'text-muted-foreground/50 cursor-not-allowed',
                      date && !isPast(date) && 'hover:bg-muted',
                      date && isToday(date) && 'ring-2 ring-gold-500 ring-offset-2',
                      date && isSelected(date) && 'bg-navy-800 text-white hover:bg-navy-700'
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
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
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
                Time & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Start Time */}
              <div>
                <Label className="text-sm text-muted-foreground">Start Time</Label>
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
                <Label className="text-sm text-muted-foreground">Duration</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setDuration(preset.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
                        duration === preset.value
                          ? 'border-gold-500 bg-gold-50 text-navy-800'
                          : 'border-transparent bg-muted text-muted-foreground hover:border-gray-300'
                      )}
                    >
                      {preset.label}
                      {preset.recommended && (
                        <Badge variant="gold" className="ml-2 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Summary */}
              <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
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
                  <p className="text-lg font-semibold text-gold-600">{duration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Days (only in recurring mode) */}
          <AnimatePresence>
            {mode === 'recurring' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Repeat className="h-5 w-5 text-gold-500" />
                      Repeat On
                    </CardTitle>
                    <CardDescription>Select which days this slot repeats</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleRecurringDay(day.value)}
                          className={cn(
                            'w-12 h-12 rounded-full text-sm font-medium transition-all',
                            recurringDays.includes(day.value)
                              ? 'bg-navy-800 text-white'
                              : 'bg-muted text-muted-foreground hover:bg-gray-200'
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">End Date (optional)</Label>
                        <Input
                          type="date"
                          value={recurringEndDate ? recurringEndDate.toISOString().split('T')[0] : ''}
                          onChange={(e) =>
                            setRecurringEndDate(e.target.value ? new Date(e.target.value) : null)
                          }
                          min={selectedDate.toISOString().split('T')[0]}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Generate weeks ahead</Label>
                        <Select
                          value={generateWeeksAhead.toString()}
                          onValueChange={(v) => setGenerateWeeksAhead(Number(v))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8, 12].map((w) => (
                              <SelectItem key={w} value={w.toString()}>
                                {w} weeks
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
                Session Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSlotType('INDIVIDUAL');
                    setMaxParticipants(1);
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    slotType === 'INDIVIDUAL'
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <User className="h-8 w-8 mb-2 text-navy-800" />
                  <p className="font-semibold text-navy-800">Individual</p>
                  <p className="text-sm text-muted-foreground">1-on-1 session</p>
                </button>
                <button
                  onClick={() => {
                    setSlotType('GROUP');
                    setMaxParticipants(5);
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    slotType === 'GROUP'
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Users className="h-8 w-8 mb-2 text-navy-800" />
                  <p className="font-semibold text-navy-800">Group</p>
                  <p className="text-sm text-muted-foreground">Multiple students</p>
                </button>
              </div>

              {slotType === 'GROUP' && (
                <div>
                  <Label>Maximum Participants</Label>
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

          {/* Title & Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Conversation Practice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="What will this session cover?"
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
                  Private Slot
                </CardTitle>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    isPrivate ? 'bg-gold-500' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      isPrivate ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              <CardDescription>Only visible to selected students</CardDescription>
            </CardHeader>
            <AnimatePresence>
              {isPrivate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />

                    {/* Selected Students */}
                    {selectedStudents.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedStudents.map((student) => (
                          <Badge
                            key={student.id}
                            variant="secondary"
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
                          No students found
                        </p>
                      ) : (
                        students.map((student: StudentOption) => (
                          <button
                            key={student.id}
                            onClick={() => toggleStudent(student)}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors',
                              selectedStudents.find((s) => s.id === student.id)
                                ? 'bg-gold-50'
                                : 'hover:bg-muted'
                            )}
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                            {selectedStudents.find((s) => s.id === student.id) && (
                              <Check className="h-4 w-4 text-gold-600" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Direct Booking (only for single individual slots) */}
          {mode === 'single' && slotType === 'INDIVIDUAL' && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-gold-500" />
                    Send Invitation
                  </CardTitle>
                </div>
                <CardDescription>
                  Book this slot for a student and send them an invitation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookForStudent ? (
                  <div className="flex items-center justify-between p-3 bg-gold-50 rounded-lg border-2 border-gold-200">
                    <div>
                      <p className="font-medium">
                        {bookForStudent.firstName} {bookForStudent.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{bookForStudent.email}</p>
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
                      placeholder="Search students to invite..."
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
                            <p className="text-xs text-muted-foreground">{student.email}</p>
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
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 sticky bottom-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border">
        <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleSubmit}
          isLoading={createMutation.isPending || createRecurringMutation.isPending}
        >
          {mode === 'recurring' ? (
            <>
              <Repeat className="mr-2 h-4 w-4" />
              Create Recurring Slots
            </>
          ) : bookForStudent ? (
            <>
              <Send className="mr-2 h-4 w-4" />
              Create & Send Invitation
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Slot
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
