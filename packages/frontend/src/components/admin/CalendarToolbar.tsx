import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { View } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarToolbarProps {
  view: View;
  onViewChange: (view: View) => void;
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onCreateSlot: () => void;
  statusFilter?: string | null;
  typeFilter?: string | null;
  onStatusFilterChange: (value: string | null) => void;
  onTypeFilterChange: (value: string | null) => void;
}

export function CalendarToolbar({
  view,
  onViewChange,
  date,
  onNavigate,
  onCreateSlot,
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange,
}: CalendarToolbarProps) {
  const viewButtons: { value: View; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "day", label: "Day" },
    { value: "agenda", label: "Agenda" },
  ];

  return (
    <div className="space-y-3">
      {/* Filters - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Filter className="hidden sm:block h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={statusFilter || ""}
            onChange={(e) => onStatusFilterChange(e.target.value || null)}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 border rounded-lg text-xs sm:text-sm bg-white min-w-0"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="FULLY_BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={typeFilter || ""}
            onChange={(e) => onTypeFilterChange(e.target.value || null)}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 border rounded-lg text-xs sm:text-sm bg-white min-w-0"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GROUP">Group</option>
          </select>
        </div>
      </div>

      {/* Date Navigation & View Switcher - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        {/* Date Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("TODAY")}
            className="font-medium text-xs sm:text-sm px-2 sm:px-4"
          >
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("PREV")}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm sm:text-lg font-semibold text-slate-900 px-2 whitespace-nowrap">
              {format(date, "MMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("NEXT")}
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Switcher & Create Button */}
        <div className="flex items-center justify-between gap-2">
          {/* View Switcher - Compact on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1 border rounded-lg p-0.5 sm:p-1 bg-white">
            {viewButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => onViewChange(btn.value)}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                  view === btn.value
                    ? "bg-spanish-teal-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Create Slot Button - Icon only on mobile */}
          <Button
            variant="primary"
            onClick={onCreateSlot}
            className="px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Create Slot</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
