/**
 * SlotFormDrawer — unified professor slot creation, scheduling, and editing.
 *
 * Replaces NewSlotPage and PrivateInvitationModal with a single contextual drawer.
 *
 * Modes:
 *   availability  → create an open slot (single or recurring), with visibility control
 *   schedule      → create a slot and immediately confirm it for a specific student
 *   edit          → modify an existing slot's date/time/title/visibility (when slotId provided)
 *
 * Entry points:
 *   - "Add slot" button in CalendarPage header → opens create, availability tab
 *   - Drag-to-select → opens create with prefill (start/end), either tab
 *   - SlotEventDrawer "Edit" → opens edit mode with slotId
 */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Check, Repeat, Users, User, Lock, Globe, X, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerBody, DrawerFooter, DrawerCloseButton,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InlineAlert, uiToast } from '@/components/ui/inline-alert';
import { RecurringPreview } from '@/components/ui/recurring-preview';
import { professorApi } from '@/lib/api';
import { SlotType } from '@spanish-class/shared';

// ── Constants ──────────────────────────────────────────────────────────────

const DURATION_PRESETS = [45, 60, 90] as const;
const DEFAULT_DURATION = 60;

const TIME_SLOTS = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const DAYS_OF_WEEK_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// ── Types ──────────────────────────────────────────────────────────────────

type FormMode = 'availability' | 'schedule';

export interface SlotFormDrawerPrefill {
  startTime?: string;
  endTime?: string;
  date?: Date;
  scheduleStudent?: boolean;
  blockTime?: boolean;
}

export interface SlotFormDrawerProps {
  open: boolean;
  onClose: () => void;
  prefill?: SlotFormDrawerPrefill;
  slotId?: string;
}

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toDateInputValue(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function extractTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function computeEndTime(startTime: string, durationMins: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMins;
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

/**
 * Convert a local "HH:mm" time on a given local date string to the equivalent
 * "HH:mm" in UTC.  The recurring-pattern API stores times as bare HH:mm strings
 * and the backend applies them in UTC (server timezone = UTC), so we must
 * convert before sending.
 */
function localTimeToUTC(localDate: string, localHHmm: string): string {
  const [h, m] = localHHmm.split(':').map(Number);
  const d = new Date(localDate + 'T00:00:00');
  d.setHours(h, m, 0, 0);
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}

// ── Main component ─────────────────────────────────────────────────────────

export function SlotFormDrawer({ open, onClose, prefill, slotId }: SlotFormDrawerProps) {
  const { t } = useTranslation('admin');
  const qc = useQueryClient();
  const isEditMode = !!slotId;

  // ── Form state ──────────────────────────────────────────────────────────
  const [mode, setMode] = React.useState<FormMode>(() =>
    prefill?.scheduleStudent ? 'schedule' : 'availability'
  );
  const [date, setDate] = React.useState<string>(() => {
    if (prefill?.date) return toDateInputValue(prefill.date);
    if (prefill?.startTime) return format(new Date(prefill.startTime), 'yyyy-MM-dd');
    return toDateInputValue(new Date());
  });
  const [startTime, setStartTime] = React.useState<string>(() => {
    if (prefill?.startTime) return extractTime(prefill.startTime);
    return '10:00';
  });
  const [duration, setDuration] = React.useState<number>(() => {
    if (prefill?.startTime && prefill.endTime) {
      const diff = Math.round(
        (new Date(prefill.endTime).getTime() - new Date(prefill.startTime).getTime()) / 60000
      );
      return diff > 0 ? diff : DEFAULT_DURATION;
    }
    return DEFAULT_DURATION;
  });
  const [isCustomDuration, setIsCustomDuration] = React.useState(false);
  const [customDurationInput, setCustomDurationInput] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [allDay, setAllDay] = React.useState(false);

  // Recurrence
  const [recurs, setRecurs] = React.useState(false);
  const [recurringDays, setRecurringDays] = React.useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = React.useState('');
  const [weeksAhead, setWeeksAhead] = React.useState(4);

  // Student scheduling (schedule mode — single confirmed booking)
  const [studentId, setStudentId] = React.useState('');
  const [studentSearch, setStudentSearch] = React.useState('');

  // Session type (availability tab only)
  const [slotType, setSlotType] = React.useState<SlotType>(() =>
    prefill?.blockTime ? SlotType.BLOCKED : SlotType.INDIVIDUAL
  );
  const [maxParticipants, setMaxParticipants] = React.useState(2);

  // Visibility (availability + edit modes)
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [allowedStudentIds, setAllowedStudentIds] = React.useState<string[]>([]);
  const [allowedSearch, setAllowedSearch] = React.useState('');

  // Validation error
  const [error, setError] = React.useState('');

  const isBlocked = slotType === SlotType.BLOCKED;

  const endTime = React.useMemo(() => {
    if (isBlocked && allDay) return '23:59';
    return computeEndTime(startTime, duration);
  }, [isBlocked, allDay, startTime, duration]);

  // All-day effective start time for blocked slot
  const effectiveStartTime = (isBlocked && allDay) ? '00:00' : startTime;

  // ── Reset when drawer re-opens ─────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    setMode(prefill?.scheduleStudent ? 'schedule' : 'availability');
    setDate(() => {
      if (prefill?.date) return toDateInputValue(prefill.date);
      if (prefill?.startTime) return format(new Date(prefill.startTime), 'yyyy-MM-dd');
      return toDateInputValue(new Date());
    });
    setStartTime(() => {
      if (prefill?.startTime) return extractTime(prefill.startTime);
      return '10:00';
    });
    setDuration(() => {
      if (prefill?.startTime && prefill?.endTime) {
        const diff = Math.round(
          (new Date(prefill.endTime).getTime() - new Date(prefill.startTime).getTime()) / 60000
        );
        return diff > 0 ? diff : DEFAULT_DURATION;
      }
      return DEFAULT_DURATION;
    });
    setIsCustomDuration(() => {
      if (prefill?.startTime && prefill?.endTime) {
        const diff = Math.round(
          (new Date(prefill.endTime).getTime() - new Date(prefill.startTime).getTime()) / 60000
        );
        return diff > 0 && !(DURATION_PRESETS as readonly number[]).includes(diff);
      }
      return false;
    });
    setCustomDurationInput('');
    setTitle('');
    setAllDay(false);
    setRecurs(false);
    setRecurringDays([]);
    setRecurringEndDate('');
    setWeeksAhead(4);
    setStudentId('');
    setStudentSearch('');
    setSlotType(prefill?.blockTime ? SlotType.BLOCKED : SlotType.INDIVIDUAL);
    setMaxParticipants(2);
    setIsPrivate(false);
    setAllowedStudentIds([]);
    setAllowedSearch('');
    setError('');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load existing slot for edit mode ──────────────────────────────────
  const { data: existingSlot } = useQuery({
    queryKey: ['professor-slot', slotId],
    queryFn: () => professorApi.getSlot(slotId!),
    enabled: isEditMode && open,
  });

  React.useEffect(() => {
    if (!existingSlot || !isEditMode) return;
    const s = new Date(existingSlot.startTime);
    const e = new Date(existingSlot.endTime);
    setDate(toDateInputValue(s));
    setStartTime(extractTime(existingSlot.startTime as unknown as string));
    const diff = Math.round((e.getTime() - s.getTime()) / 60000);
    setDuration(diff > 0 ? diff : DEFAULT_DURATION);
    const isCustom = diff > 0 && !(DURATION_PRESETS as readonly number[]).includes(diff);
    setIsCustomDuration(isCustom);
    setCustomDurationInput(isCustom ? String(diff) : '');
    setTitle(existingSlot.title ?? '');
    setMode('availability');
    setSlotType(existingSlot.slotType as SlotType ?? SlotType.INDIVIDUAL);
    if (existingSlot.slotType !== SlotType.BLOCKED) {
      setIsPrivate(existingSlot.isPrivate ?? false);
      setAllowedStudentIds(
        (existingSlot.allowedStudents as { studentId: string }[] | undefined)?.map(s => s.studentId) ?? []
      );
    }
  }, [existingSlot, isEditMode]);

  // ── Overlap check for the selected day ────────────────────────────────
  const { data: daySlots } = useQuery({
    queryKey: ['professor-slots-day', date],
    queryFn: async () => {
      const d = new Date(date + 'T00:00:00');
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d);   end.setHours(23, 59, 59, 999);
      return professorApi.getSlots({ startDate: start.toISOString(), endDate: end.toISOString(), limit: 50 });
    },
    enabled: !isEditMode && !!date,
  });

  const existingSlotsList = React.useMemo(
    () => (daySlots?.data ?? []).filter(s => s.status !== 'CANCELLED'),
    [daySlots],
  );

  const hasOverlap = React.useMemo(() => {
    if (isEditMode || existingSlotsList.length === 0) return false;
    const [h, m] = effectiveStartTime.split(':').map(Number);
    const newStart = h * 60 + m;
    const [eh, em] = endTime.split(':').map(Number);
    const newEnd = eh * 60 + em;
    return existingSlotsList.some(slot => {
      const ss = new Date(slot.startTime);
      const se = new Date(slot.endTime);
      const es = ss.getHours() * 60 + ss.getMinutes();
      const ee = se.getHours() * 60 + se.getMinutes();
      return newStart < ee && newEnd > es;
    });
  }, [isEditMode, existingSlotsList, effectiveStartTime, endTime]);

  // ── Student list (schedule mode + visibility picker) ───────────────────
  const needsStudentList = (mode === 'schedule' && !isEditMode) || (!isBlocked && isPrivate);
  const { data: studentsData } = useQuery({
    queryKey: ['professor-students'],
    queryFn: () => professorApi.getStudents({ limit: 100 }),
    enabled: needsStudentList && open,
  });

  const allStudents = React.useMemo<StudentOption[]>(() => {
    return (studentsData?.data ?? []).map((s: StudentOption) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
    })).sort((a: StudentOption, b: StudentOption) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
  }, [studentsData]);

  // Filtered list for the single-select schedule picker
  const scheduleStudents = React.useMemo<StudentOption[]>(() => {
    if (!studentSearch) return allStudents;
    const q = studentSearch.toLowerCase();
    return allStudents.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [allStudents, studentSearch]);

  // Filtered list for the multi-select allowed-students picker
  const allowedStudentOptions = React.useMemo<StudentOption[]>(() => {
    if (!allowedSearch) return allStudents;
    const q = allowedSearch.toLowerCase();
    return allStudents.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [allStudents, allowedSearch]);

  const selectedScheduleStudent = allStudents.find(s => s.id === studentId) ??
    (studentsData?.data ?? []).find((s: StudentOption) => s.id === studentId) as StudentOption | undefined;

  const toggleAllowedStudent = (id: string) => {
    setAllowedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const removeAllowedStudent = (id: string) => {
    setAllowedStudentIds(prev => prev.filter(x => x !== id));
  };

  // ── Invalidation helper ───────────────────────────────────────────────
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['professor-slots'] });
    qc.invalidateQueries({ queryKey: ['professor-slots-day'] });
    qc.invalidateQueries({ queryKey: ['professor-dashboard'] });
  };

  // ── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => {
      const d = new Date(date + 'T00:00:00');
      const [sh, sm] = effectiveStartTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const s = new Date(d); s.setHours(sh, sm, 0, 0);
      const e = new Date(d); e.setHours(eh, em, 0, 0);
      return professorApi.createSlot({
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        slotType,
        maxParticipants: slotType === SlotType.GROUP ? maxParticipants : 1,
        title: title.trim() || undefined,
        isPrivate: isBlocked ? false : isPrivate,
        allowedStudentIds: (!isBlocked && isPrivate) ? allowedStudentIds : undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      onClose();
      uiToast.success(isBlocked ? t('calendar.blocked_created') : t('slot_form.success_created'));
    },
    onError: () => uiToast.error(t('calendar.error_generic')),
  });

  const recurringMutation = useMutation({
    mutationFn: () => {
      const utcStart = localTimeToUTC(date, startTime);
      const utcEnd   = localTimeToUTC(date, endTime);
      const [h, m] = startTime.split(':').map(Number);
      const localStartDate = new Date(date + 'T00:00:00');
      localStartDate.setHours(h, m, 0, 0);
      const utcStartDate = localStartDate.toISOString().slice(0, 10);
      const utcEndDate = recurringEndDate
        ? (() => {
            const [eh, em] = endTime.split(':').map(Number);
            const d = new Date(recurringEndDate + 'T00:00:00');
            d.setHours(eh, em, 0, 0);
            return d.toISOString().slice(0, 10);
          })()
        : null;
      // Shift day-of-week indices from local to UTC. The backend iterates UTC
      // dates and checks getDay() in UTC, so if the chosen local time crosses
      // midnight when converted to UTC, the day index must shift accordingly.
      const tzOffsetMins = localStartDate.getTimezoneOffset();
      const utcTotalMins = (h * 60 + m) + tzOffsetMins;
      const dayShift = utcTotalMins < 0 ? -1 : utcTotalMins >= 1440 ? 1 : 0;
      const utcDaysOfWeek = recurringDays.map(d => (d + dayShift + 7) % 7);
      return professorApi.createRecurringPattern({
        daysOfWeek: utcDaysOfWeek,
        startTime: utcStart,
        endTime: utcEnd,
        startDate: utcStartDate,
        endDate: utcEndDate,
        slotType,
        maxParticipants: slotType === SlotType.GROUP ? maxParticipants : 1,
        title: title.trim() || undefined,
        isPrivate: isBlocked ? false : isPrivate,
        allowedStudentIds: (!isBlocked && isPrivate) ? allowedStudentIds : undefined,
        generateWeeksAhead: weeksAhead,
      });
    },
    onSuccess: (data) => {
      invalidate();
      onClose();
      uiToast.success(t('slot_form.success_recurring') + ` (${data.slots.length})`);
    },
    onError: () => uiToast.error(t('calendar.error_generic')),
  });

  const scheduleMutation = useMutation({
    mutationFn: () => {
      const d = new Date(date + 'T00:00:00');
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const s = new Date(d); s.setHours(sh, sm, 0, 0);
      const e = new Date(d); e.setHours(eh, em, 0, 0);
      return professorApi.createSlot({
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        slotType: 'INDIVIDUAL',
        maxParticipants: 1,
        title: title.trim() || undefined,
        isPrivate: false,
        bookForStudentId: studentId,
      });
    },
    onSuccess: () => { invalidate(); onClose(); uiToast.success(t('slot_form.success_scheduled')); },
    onError: () => uiToast.error(t('calendar.error_generic')),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      const d = new Date(date + 'T00:00:00');
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const s = new Date(d); s.setHours(sh, sm, 0, 0);
      const e = new Date(d); e.setHours(eh, em, 0, 0);
      return professorApi.updateSlot(slotId!, {
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        title: title.trim() || undefined,
        isPrivate,
        allowedStudentIds: isPrivate ? allowedStudentIds : [],
      });
    },
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['professor-slot', slotId] });
      onClose();
      uiToast.success(t('slot_form.success_updated'));
    },
    onError: () => uiToast.error(t('calendar.error_generic')),
  });

  const anyPending = createMutation.isPending || recurringMutation.isPending ||
    scheduleMutation.isPending || updateMutation.isPending;

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setError('');
    if (!date) { setError(t('slot_form.date_label')); return; }

    if (isEditMode) { updateMutation.mutate(); return; }

    // Validate visibility (only when not blocked)
    if (!isBlocked && isPrivate && allowedStudentIds.length === 0) {
      setError(t('slot_form.visibility_error'));
      return;
    }

    if (mode === 'availability') {
      if (recurs) {
        if (recurringDays.length === 0) {
          setError(t('slot_form.repeat_on'));
          return;
        }
        recurringMutation.mutate();
      } else {
        createMutation.mutate();
      }
    } else {
      if (!studentId) { setError(t('slot_form.student_label')); return; }
      scheduleMutation.mutate();
    }
  };

  const toggleDay = (day: number) => {
    setRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // ── Labels ─────────────────────────────────────────────────────────────
  const drawerTitle = isEditMode
    ? t('slot_form.title_edit')
    : t('slot_form.title_create');

  const submitLabel = (() => {
    if (anyPending) return isEditMode ? t('slot_form.saving') : t('slot_form.creating');
    if (isEditMode) return t('slot_form.save');
    if (mode === 'schedule') return t('slot_form.create_schedule');
    if (isBlocked) return t('slot_form.create_block');
    return t('slot_form.create_availability');
  })();

  // Chips: selected allowed students with their names resolved
  const allowedChips = allowedStudentIds.map(id => {
    const found = allStudents.find(s => s.id === id);
    return found ?? { id, firstName: '…', lastName: '', email: '' };
  });

  // ── Visibility section — availability tab and edit mode ───────────────
  const showVisibility = (mode === 'availability' || isEditMode) && !isBlocked;

  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent busy={anyPending}>
        <DrawerHeader>
          <div className="flex-1 min-w-0">
            <DrawerTitle className="text-h3">{drawerTitle}</DrawerTitle>
          </div>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {/* Mode tabs — hidden in edit mode */}
          {!isEditMode && (
            <div
              role="tablist"
              aria-label={t('slot_form.mode_tablist_label')}
              className="flex rounded-ui-sm border border-line overflow-hidden"
            >
              {(['availability', 'schedule'] as FormMode[]).map(m => (
                <button
                  key={m}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={cn(
                    'flex-1 px-3 py-2 text-small font-semibold transition-colors duration-micro',
                    mode === m
                      ? 'bg-brand text-brand-contrast'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-muted',
                  )}
                >
                  {m === 'availability' ? t('slot_form.tab_availability') : t('slot_form.tab_schedule')}
                </button>
              ))}
            </div>
          )}

          {/* Date + Start time — single row; start time hidden in all-day blocked mode */}
          <div className={cn("grid gap-3", isBlocked && allDay ? "grid-cols-1" : "grid-cols-2")}>
            <div className="space-y-1.5">
              <Label htmlFor="sf-date">{t('slot_form.date_label')}</Label>
              <Input
                id="sf-date"
                type="date"
                value={date}
                min={toDateInputValue(new Date())}
                onChange={e => setDate(e.target.value)}
                disabled={anyPending}
              />
            </div>
            {!(isBlocked && allDay) && (
              <div className="space-y-1.5">
                <Label htmlFor="sf-start">{t('slot_form.start_time_label')}</Label>
                <Select value={startTime} onValueChange={setStartTime} disabled={anyPending}>
                  <SelectTrigger id="sf-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* All-day toggle — blocked slot only */}
          {isBlocked && (
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="sf-all-day"
                  checked={allDay}
                  onCheckedChange={v => setAllDay(!!v)}
                  disabled={anyPending}
                />
                <label
                  htmlFor="sf-all-day"
                  className="text-small font-medium text-ink cursor-pointer select-none"
                >
                  {t('slot_form.all_day_label')}
                </label>
              </div>
              {allDay && (
                <p className="text-caption text-ink-tertiary pl-7">
                  {t('slot_form.all_day_hint')}
                </p>
              )}
            </div>
          )}

          {/* Duration — hidden in all-day blocked mode */}
          {!(isBlocked && allDay) && (
          <div className="space-y-1.5">
            <Label>{t('slot_form.duration_label')}</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('slot_form.duration_label')}>
              {DURATION_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  disabled={anyPending}
                  onClick={() => { setDuration(preset); setIsCustomDuration(false); setCustomDurationInput(''); }}
                  aria-pressed={!isCustomDuration && duration === preset}
                  className={cn(
                    'px-3 py-1.5 rounded-ui-full text-caption font-semibold border transition-colors duration-micro',
                    !isCustomDuration && duration === preset
                      ? 'bg-brand text-brand-contrast border-transparent'
                      : 'border-line text-ink-secondary bg-surface hover:bg-surface-raised',
                    preset === DEFAULT_DURATION && (isCustomDuration || duration !== preset) && 'border-brand/40 text-brand',
                  )}
                >
                  {preset}m{preset === DEFAULT_DURATION && <span className="ml-1 opacity-60">★</span>}
                </button>
              ))}
              <button
                type="button"
                disabled={anyPending}
                onClick={() => { setIsCustomDuration(true); setCustomDurationInput(''); }}
                aria-pressed={isCustomDuration}
                className={cn(
                  'px-3 py-1.5 rounded-ui-full text-caption font-semibold border transition-colors duration-micro',
                  isCustomDuration
                    ? 'bg-brand text-brand-contrast border-transparent'
                    : 'border-line text-ink-secondary bg-surface hover:bg-surface-raised',
                )}
              >
                {t('slot_form.duration_custom')}
              </button>
            </div>
            {isCustomDuration && (
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  type="number"
                  min={1}
                  max={480}
                  step={1}
                  value={customDurationInput}
                  onChange={e => {
                    const raw = e.target.value;
                    setCustomDurationInput(raw);
                    const parsed = parseInt(raw, 10);
                    if (!isNaN(parsed) && parsed > 0) setDuration(parsed);
                  }}
                  placeholder="e.g. 75"
                  className="w-24 text-small"
                  aria-label={t('slot_form.duration_custom_label')}
                  disabled={anyPending}
                  autoFocus
                />
                <span className="text-caption text-ink-tertiary">{t('slot_form.duration_minutes_unit')}</span>
              </div>
            )}
            <p className="text-caption text-ink-tertiary">
              {t('slot_form.end_time_computed', { time: endTime })}
            </p>
          </div>
          )}
          {hasOverlap && (
            <InlineAlert variant="warning">
              {t('slot_form.overlap_warning')}
            </InlineAlert>
          )}

          {/* Session type — availability tab only, hidden in edit and schedule */}
          {mode === 'availability' && !isEditMode && (
            <div className="space-y-1.5">
              <Label>{t('slot_form.session_type_label')}</Label>
              <div className="flex rounded-ui-sm border border-line overflow-hidden" role="group" aria-label={t('slot_form.session_type_label')}>
                {([SlotType.INDIVIDUAL, SlotType.GROUP, SlotType.BLOCKED] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={slotType === type}
                    disabled={anyPending}
                    onClick={() => { setSlotType(type); if (type !== SlotType.BLOCKED) setAllDay(false); setError(''); }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-small font-semibold transition-colors duration-micro',
                      slotType === type
                        ? 'bg-brand text-brand-contrast'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface-muted',
                    )}
                  >
                    {type === SlotType.INDIVIDUAL && <><User className="h-3.5 w-3.5" aria-hidden="true" />{t('slot_form.session_type_individual')}</>}
                    {type === SlotType.GROUP      && <><Users className="h-3.5 w-3.5" aria-hidden="true" />{t('slot_form.session_type_group')}</>}
                    {type === SlotType.BLOCKED    && <><Ban className="h-3.5 w-3.5" aria-hidden="true" />{t('slot_form.session_type_blocked')}</>}
                  </button>
                ))}
              </div>

              {slotType === SlotType.GROUP && (
                <div className="flex items-center gap-3 pt-1">
                  <Label htmlFor="sf-max-p" className="shrink-0">{t('slot_form.max_participants_label')}</Label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={anyPending || maxParticipants <= 2}
                      onClick={() => setMaxParticipants(p => Math.max(2, p - 1))}
                      aria-label={t('slot_form.max_participants_decrease')}
                      className="h-11 w-11 rounded-ui-sm border border-line flex items-center justify-center text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
                    >−</button>
                    <input
                      id="sf-max-p"
                      type="number"
                      min={2}
                      max={20}
                      value={maxParticipants}
                      onChange={e => setMaxParticipants(Math.min(20, Math.max(2, Number(e.target.value))))}
                      disabled={anyPending}
                      className="w-12 text-center text-small font-semibold border border-line rounded-ui-sm bg-surface text-ink py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                    <button
                      type="button"
                      disabled={anyPending || maxParticipants >= 20}
                      onClick={() => setMaxParticipants(p => Math.min(20, p + 1))}
                      aria-label={t('slot_form.max_participants_increase')}
                      className="h-11 w-11 rounded-ui-sm border border-line flex items-center justify-center text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sf-title">{t('slot_form.title_optional')}</Label>
            <Input
              id="sf-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('slot_form.title_optional')}
              disabled={anyPending}
              maxLength={100}
            />
          </div>

          {/* ── Visibility — availability tab and edit mode ─────────────── */}
          {showVisibility && (
            <div className="space-y-2">
              <Label id="sf-visibility-label">{t('slot_form.visibility_label')}</Label>
              <div
                role="group"
                aria-labelledby="sf-visibility-label"
                className="flex rounded-ui-sm border border-line overflow-hidden"
              >
                <button
                  type="button"
                  aria-pressed={!isPrivate}
                  disabled={anyPending}
                  onClick={() => { setIsPrivate(false); setAllowedSearch(''); setError(''); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-small font-semibold transition-colors duration-micro',
                    !isPrivate
                      ? 'bg-brand text-brand-contrast'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-muted',
                  )}
                >
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('slot_form.visibility_everyone')}
                </button>
                <button
                  type="button"
                  aria-pressed={isPrivate}
                  disabled={anyPending}
                  onClick={() => { setIsPrivate(true); setError(''); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-small font-semibold transition-colors duration-micro',
                    isPrivate
                      ? 'bg-brand text-brand-contrast'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-muted',
                  )}
                >
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('slot_form.visibility_specific')}
                </button>
              </div>

              {/* Allowed-student multi-select — shown when Specific students is active */}
              {isPrivate && (
                <div className="space-y-2 pt-1">
                  {/* Selected student chips */}
                  {allowedChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5" role="list" aria-label={t('slot_form.visibility_specific')}>
                      {allowedChips.map(chip => (
                        <div
                          key={chip.id}
                          role="listitem"
                          className="flex items-center gap-1 px-2 py-1 rounded-ui-full bg-surface-raised border border-line text-caption font-medium text-ink max-w-40"
                        >
                          <span className="truncate">{chip.firstName} {chip.lastName}</span>
                          <button
                            type="button"
                            onClick={() => removeAllowedStudent(chip.id)}
                            disabled={anyPending}
                            aria-label={`${t('slot_form.remove_student')} ${chip.firstName} ${chip.lastName}`}
                            className="shrink-0 h-4 w-4 flex items-center justify-center rounded-full text-ink-tertiary hover:text-ink hover:bg-surface-muted transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search + list */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary pointer-events-none" aria-hidden="true" />
                    <Input
                      value={allowedSearch}
                      onChange={e => setAllowedSearch(e.target.value)}
                      placeholder={t('slot_form.student_search_placeholder')}
                      className="pl-9"
                      disabled={anyPending}
                      aria-label={t('slot_form.student_search_placeholder')}
                    />
                  </div>
                  <div
                    className="max-h-44 overflow-y-auto rounded-ui-sm border border-line bg-surface divide-y divide-line"
                    role="listbox"
                    aria-multiselectable="true"
                    aria-label={t('slot_form.visibility_specific')}
                  >
                    {allowedStudentOptions.length === 0 ? (
                      <p className="px-3 py-3 text-small text-ink-tertiary text-center">
                        {t('slot_form.no_students')}
                      </p>
                    ) : (
                      allowedStudentOptions.map(s => {
                        const selected = allowedStudentIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            role="option"
                            aria-selected={selected}
                            type="button"
                            onClick={() => toggleAllowedStudent(s.id)}
                            disabled={anyPending}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                          >
                            <div className={cn(
                              'h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors',
                              selected
                                ? 'bg-brand border-brand'
                                : 'border-line bg-surface',
                            )} aria-hidden="true">
                              {selected && <Check className="h-3 w-3 text-brand-contrast" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-small font-medium text-ink truncate">
                                {s.firstName} {s.lastName}
                              </p>
                              <p className="text-caption text-ink-tertiary truncate">{s.email}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  {allowedChips.length === 0 && (
                    <p className="text-caption text-ink-tertiary">
                      {t('slot_form.allowed_students_hint')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Availability-only fields (recurrence) — not shown for blocked slots */}
          {mode === 'availability' && !isEditMode && !isBlocked && (
            <>
              {/* Recurrence toggle */}
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="sf-recurs"
                  checked={recurs}
                  onCheckedChange={v => { setRecurs(!!v); setRecurringDays([]); }}
                  disabled={anyPending}
                />
                <label
                  htmlFor="sf-recurs"
                  className="flex items-center gap-1.5 text-small font-medium text-ink cursor-pointer"
                >
                  <Repeat className="h-3.5 w-3.5 text-ink-secondary" aria-hidden="true" />
                  {t('slot_form.recurs_toggle')}
                </label>
              </div>

              {/* Recurring fields */}
              {recurs && (
                <div className="space-y-4 pl-6 border-l-2 border-line">
                  {/* Day-of-week picker */}
                  <div className="space-y-1.5">
                    <Label>{t('slot_form.repeat_on')}</Label>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('slot_form.repeat_on')}>
                      {DAYS_OF_WEEK_KEYS.map((key, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={anyPending}
                          onClick={() => toggleDay(i)}
                          aria-pressed={recurringDays.includes(i)}
                          className={cn(
                            'w-9 h-9 rounded-full text-caption font-semibold border transition-colors duration-micro',
                            recurringDays.includes(i)
                              ? 'bg-brand text-brand-contrast border-transparent'
                              : 'border-line text-ink-secondary bg-surface hover:bg-surface-raised',
                          )}
                        >
                          {t(`slots.form.weekdays.${key}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weeks ahead */}
                  <div className="space-y-1.5">
                    <Label htmlFor="sf-weeks">{t('slot_form.weeks_ahead_label')}</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(weeksAhead)}
                        onValueChange={v => setWeeksAhead(Number(v))}
                        disabled={anyPending}
                      >
                        <SelectTrigger id="sf-weeks" className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 4, 6, 8].map(w => (
                            <SelectItem key={w} value={String(w)}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-small text-ink-secondary">{t('slot_form.weeks_ahead_suffix')}</span>
                    </div>
                  </div>

                  {/* Optional end date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="sf-end-date">{t('slot_form.end_date_label')}</Label>
                    <Input
                      id="sf-end-date"
                      type="date"
                      value={recurringEndDate}
                      min={date}
                      onChange={e => setRecurringEndDate(e.target.value)}
                      disabled={anyPending}
                    />
                  </div>

                  {/* Recurring preview */}
                  {recurringDays.length > 0 && date && (
                    <RecurringPreview
                      daysOfWeek={recurringDays}
                      startDate={new Date(date + 'T00:00:00')}
                      weeksAhead={weeksAhead}
                      startTime={startTime}
                      endTime={endTime}
                      existingSlots={existingSlotsList}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* Schedule-mode: student picker */}
          {mode === 'schedule' && !isEditMode && (
            <div className="space-y-2">
              <Label>{t('slot_form.student_label')}</Label>

              {/* Selected student chip */}
              {selectedScheduleStudent && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-ui-sm bg-surface-raised border border-line">
                  <Check className="h-4 w-4 text-status-confirmed-foreground shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-semibold text-ink truncate">
                      {selectedScheduleStudent.firstName} {selectedScheduleStudent.lastName}
                    </p>
                    <p className="text-caption text-ink-tertiary truncate">{selectedScheduleStudent.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStudentId('')}
                    className="text-caption text-ink-tertiary hover:text-ink transition-colors"
                  >
                    {t('calendar.back')}
                  </button>
                </div>
              )}

              {/* Search input + list */}
              {!selectedScheduleStudent && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary pointer-events-none" aria-hidden="true" />
                    <Input
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder={t('slot_form.student_search_placeholder')}
                      className="pl-9"
                      disabled={anyPending}
                    />
                  </div>
                  <div
                    className="max-h-48 overflow-y-auto rounded-ui-sm border border-line bg-surface divide-y divide-line"
                    role="listbox"
                    aria-label={t('slot_form.student_label')}
                  >
                    {scheduleStudents.length === 0 ? (
                      <p className="px-3 py-3 text-small text-ink-tertiary text-center">
                        {t('slot_form.no_students')}
                      </p>
                    ) : (
                      scheduleStudents.map(s => (
                        <button
                          key={s.id}
                          role="option"
                          aria-selected={s.id === studentId}
                          type="button"
                          onClick={() => { setStudentId(s.id); setStudentSearch(''); }}
                          disabled={anyPending}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-raised transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-small font-medium text-ink truncate">
                              {s.firstName} {s.lastName}
                            </p>
                            <p className="text-caption text-ink-tertiary truncate">{s.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Validation error */}
          {error && (
            <InlineAlert variant="error">{error}</InlineAlert>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Button variant="secondary" onClick={onClose} disabled={anyPending}>
            {t('slots.form.buttons.cancel')}
          </Button>
          <Button
            variant="primary"
            isLoading={anyPending}
            onClick={handleSubmit}
            disabled={anyPending}
          >
            {submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
