import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { View } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarToolbarProps {
  view: View;
  onViewChange: (view: View) => void;
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onCreateSlot: () => void;
}

export function CalendarToolbar({
  view,
  onViewChange,
  date,
  onNavigate,
  onCreateSlot,
}: CalendarToolbarProps) {
  const viewButtons: { value: View; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "day", label: "Day" },
    { value: "agenda", label: "Agenda" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Left: Date Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("TODAY")}
          className="font-medium"
        >
          Today
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("PREV")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("NEXT")}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          {format(date, "MMMM yyyy")}
        </h2>
      </div>

      {/* Right: View Switcher & Actions */}
      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
          {viewButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => onViewChange(btn.value)}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                view === btn.value
                  ? "bg-spanish-teal-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Create Slot Button */}
        <Button variant="primary" onClick={onCreateSlot}>
          <Plus className="h-4 w-4 mr-2" />
          Create Slot
        </Button>
      </div>
    </div>
  );
}
