import { useState } from "react";
import { format, addWeeks, eachDayOfInterval, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecurringPatternFormProps {
  startDate: Date;
  startTime: string;
  endTime: string;
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
  weeksAhead: number;
  onWeeksAheadChange: (weeks: number) => void;
}

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function RecurringPatternForm({
  startDate,
  startTime,
  endTime,
  selectedDays,
  onDaysChange,
  weeksAhead,
  onWeeksAheadChange,
}: RecurringPatternFormProps) {
  const [showPreview, setShowPreview] = useState(false);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  // Calculate preview slots
  const previewSlots = () => {
    if (selectedDays.length === 0 || weeksAhead === 0) return [];

    const endDate = addWeeks(startDate, weeksAhead);
    const allDays = eachDayOfInterval({ start: startOfDay(startDate), end: endDate });

    return allDays.filter((day) => selectedDays.includes(day.getDay()));
  };

  const slots = previewSlots();

  return (
    <div className="space-y-4">
      {/* Days of Week Selector */}
      <div>
        <Label className="mb-2 block">Repeat on</Label>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "h-10 rounded-lg border-2 font-medium text-sm transition-colors",
                selectedDays.includes(day.value)
                  ? "bg-spanish-teal-500 border-spanish-teal-500 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:border-spanish-teal-300"
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weeks Ahead */}
      <div>
        <Label htmlFor="weeks-ahead">Generate slots for</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="weeks-ahead"
            type="number"
            min={1}
            max={12}
            value={weeksAhead}
            onChange={(e) => onWeeksAheadChange(parseInt(e.target.value) || 1)}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">weeks ahead</span>
        </div>
      </div>

      {/* Preview */}
      {slots.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-spanish-teal-600" />
              <p className="font-medium text-sm">
                This will create {slots.length} slot{slots.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  Hide <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {showPreview && (
            <div className="max-h-48 overflow-y-auto space-y-1 mt-3">
              {slots.slice(0, 20).map((date, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground flex items-center justify-between py-1"
                >
                  <span>{format(date, "EEEE, MMM d, yyyy")}</span>
                  <Badge variant="neutral" className="text-xs">
                    {startTime} - {endTime}
                  </Badge>
                </div>
              ))}
              {slots.length > 20 && (
                <p className="text-xs text-muted-foreground italic pt-2">
                  ...and {slots.length - 20} more
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {selectedDays.length === 0 && (
        <p className="text-sm text-amber-600">
          Please select at least one day of the week
        </p>
      )}
    </div>
  );
}
