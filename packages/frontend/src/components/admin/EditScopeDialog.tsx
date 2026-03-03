import { Calendar, Repeat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditScopeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScope: (scope: "single" | "series") => void;
}

export function EditScopeDialog({
  isOpen,
  onClose,
  onSelectScope,
}: EditScopeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Recurring Slot</DialogTitle>
          <DialogDescription>
            This slot is part of a recurring series. What would you like to
            edit?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <button
            onClick={() => onSelectScope("single")}
            className="w-full p-4 rounded-lg border-2 border-gray-300 hover:border-spanish-teal-500 hover:bg-spanish-teal-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-spanish-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Edit This Slot Only</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Changes will only affect this specific slot. It will be
                  detached from the recurring series.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectScope("series")}
            className="w-full p-4 rounded-lg border-2 border-gray-300 hover:border-spanish-teal-500 hover:bg-spanish-teal-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <Repeat className="h-5 w-5 text-spanish-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Edit Entire Series</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Changes will apply to all future available slots in this
                  recurring series. Booked slots remain unchanged.
                </p>
              </div>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
