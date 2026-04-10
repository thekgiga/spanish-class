# Unified Slot Creation Modal

**Date:** 2026-03-05
**Status:** ✅ Complete

## Overview

Simplified the slot creation interface by combining "Available Slot" and "Direct Schedule" functionality into a single unified modal. Users now have ONE "Create Slot" button that opens a modal with two modes.

## What Changed

### Removed
- ❌ DirectSchedulingModal component (deleted)
- ❌ "Schedule Session" buttons from AdminDashboard and CalendarPage
- ❌ Separate direct scheduling UI

### Modified
- ✅ SlotModal now supports two scheduling modes
- ✅ Added mode toggle at the top of the modal
- ✅ Integrated student selector for direct scheduling
- ✅ Added direct scheduling mutation

## New UI Flow

### Before (Confusing - 2 Buttons)
```
Admin Dashboard:
├── "Create Slot" button → Opens SlotModal → Create available slot
└── "Schedule Session" button → Opens DirectSchedulingModal → Direct schedule

Calendar Page:
├── "Create Slot" button → Opens SlotModal → Create available slot
└── "Schedule Session" button → Opens DirectSchedulingModal → Direct schedule
```

### After (Simple - 1 Button)
```
Admin Dashboard:
└── "Create Slot" button → Opens SlotModal
    ├── Mode: "Available Slot" → Anyone can book
    └── Mode: "Direct Schedule" → Schedule with specific students

Calendar Page:
└── "Create Slot" button → Opens SlotModal
    ├── Mode: "Available Slot" → Anyone can book
    └── Mode: "Direct Schedule" → Schedule with specific students
```

## SlotModal Modes

### Available Slot Mode (Default)
- Creates a public slot
- Anyone can book it
- Can be recurring
- No students pre-selected

### Direct Schedule Mode
- Select specific student(s)
- Immediately confirmed (no approval needed)
- Cannot be recurring
- Auto-sends email notifications

## Implementation Details

### 1. Scheduling Mode Toggle

Added at the top of the modal (create mode only):

```tsx
<div className="mb-4">
  <Label>Scheduling Mode</Label>
  <div className="grid grid-cols-2 gap-3">
    {/* Available Slot Button */}
    <button onClick={() => setSchedulingMode("available")}>
      <Clock className="h-5 w-5" />
      <p>Available Slot</p>
      <p className="text-xs">Anyone can book</p>
    </button>

    {/* Direct Schedule Button */}
    <button onClick={() => setSchedulingMode("direct")}>
      <Mail className="h-5 w-5" />
      <p>Direct Schedule</p>
      <p className="text-xs">Schedule with specific students</p>
    </button>
  </div>
</div>
```

### 2. Student Selector

Shows only in "Direct Schedule" mode:

```tsx
{schedulingMode === "direct" && (
  <div>
    <Label>Select Student(s) *</Label>
    <StudentSelector
      selectedStudents={selectedStudents}
      onStudentsChange={setSelectedStudents}
      multiSelect={slotType === "GROUP"}
    />
  </div>
)}
```

### 3. Recurring Tab Disabled

Recurring slots disabled in direct schedule mode:

```tsx
<TabsTrigger
  value="recurring"
  disabled={mode === "edit" || schedulingMode === "direct"}
>
  Recurring
</TabsTrigger>
```

### 4. Submit Logic

```tsx
const onSubmit = (data: SlotFormData) => {
  if (mode === "create") {
    if (schedulingMode === "direct") {
      // Validate students selected
      if (selectedStudents.length === 0) {
        toast.error("Please select at least one student");
        return;
      }
      directScheduleMutation.mutate(data);
    } else {
      // Create available slot
      createSlotMutation.mutate(data);
    }
  } else {
    // Edit mode (always available slots)
    updateSlotMutation.mutate({ data });
  }
};
```

### 5. Direct Schedule Mutation

```tsx
const directScheduleMutation = useMutation({
  mutationFn: async (data: SlotFormData) => {
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
    toast.success(`Session scheduled with ${selectedStudents.length} student(s)!`);
    await queryClient.refetchQueries({
      predicate: (query) => query.queryKey[0] === "professor-slots",
    });
    onClose();
  },
});
```

## State Management

### New State Variables

```tsx
// Scheduling mode
const [schedulingMode, setSchedulingMode] = useState<"available" | "direct">("available");

// Selected students for direct scheduling
const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
```

### Auto-Reset on Mode Switch

When switching from "Direct Schedule" to "Available Slot":
```tsx
onClick={() => {
  setSchedulingMode("available");
  setSelectedStudents([]); // Clear selected students
}}
```

### Individual Session Limit

When session type is "Individual" in direct mode:
```tsx
useEffect(() => {
  if (slotType === "INDIVIDUAL") {
    if (schedulingMode === "direct" && selectedStudents.length > 1) {
      setSelectedStudents([selectedStudents[0]]); // Keep only first student
    }
  }
}, [slotType, schedulingMode, selectedStudents]);
```

## Files Modified

### Deleted (1 file)
- `packages/frontend/src/components/admin/DirectSchedulingModal.tsx`

### Modified (3 files)
- `packages/frontend/src/components/admin/SlotModal.tsx`
  - Added scheduling mode toggle
  - Added student selector integration
  - Added direct scheduling mutation
  - Modified submit handler

- `packages/frontend/src/pages/admin/AdminDashboard.tsx`
  - Removed "Schedule Session" button
  - Removed DirectSchedulingModal import & usage

- `packages/frontend/src/pages/admin/CalendarPage.tsx`
  - Removed "Schedule Session" button
  - Removed DirectSchedulingModal import & usage

## User Experience

### Before (Confusing)
- Two buttons with similar purposes
- Users unsure which to use
- Separate interfaces
- More clicks to accomplish task

### After (Clear)
- One "Create Slot" button
- Clear choice at the top of modal
- Unified interface
- Faster workflow

## Build Status

✅ **All packages build successfully**
- shared: ✅
- backend: ✅
- frontend: ✅

No TypeScript errors, no build failures.

## Testing Checklist

- [ ] Click "Create Slot" button
- [ ] Toggle between "Available Slot" and "Direct Schedule" modes
- [ ] Create available slot (mode: available)
- [ ] Create direct schedule (mode: direct, select students)
- [ ] Verify recurring tab disabled in direct mode
- [ ] Verify student selector appears only in direct mode
- [ ] Verify individual session limits students to 1 in direct mode
- [ ] Verify emails sent in direct mode
- [ ] Verify session appears on calendar in both modes

## Benefits

1. **Simpler UX** - One button instead of two
2. **Clearer Intent** - Mode choice is explicit and visible
3. **Less Code** - Removed entire DirectSchedulingModal component
4. **Consistent UI** - All slot creation in one place
5. **Faster Workflow** - No need to decide which button to click

## Migration

**No breaking changes:**
- Existing functionality preserved
- Backend endpoint unchanged
- Database schema unchanged
- Users will see simplified UI immediately

## Summary

✅ **Unified Slot Creation Complete!**

Successfully combined two separate flows into one intuitive interface:
- Deleted DirectSchedulingModal component
- Enhanced SlotModal with mode toggle
- Removed duplicate "Schedule Session" buttons
- Maintained all functionality
- Improved user experience

The slot creation interface is now **simpler**, **clearer**, and **more intuitive**!
