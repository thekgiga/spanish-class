import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCalendarDragOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  hourHeight: number;
  startHour: number;
  onComplete: (start: Date, end: Date, dayDate: Date) => void;
}

export interface UseCalendarDragReturn {
  isDragging: boolean;
  dragDayDate: Date | null;
  selectionStyle: { top: number; height: number } | null;
  handlers: {
    onMouseDown: (e: React.MouseEvent, dayDate: Date) => void;
  };
}

function snapToNearest15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

function pixelsToMinutes(pixels: number, hourHeight: number, startHour: number): number {
  return (pixels / hourHeight) * 60 + startHour * 60;
}

export function useCalendarDrag({
  hourHeight,
  startHour,
  onComplete,
}: UseCalendarDragOptions): UseCalendarDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDayDate, setDragDayDate] = useState<Date | null>(null);
  const [selectionStyle, setSelectionStyle] = useState<{ top: number; height: number } | null>(null);

  const dragStartPixel = useRef<number>(0);
  const dragDay = useRef<Date | null>(null);
  const isActiveRef = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent, dayDate: Date) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const columnEl = e.currentTarget as HTMLElement;
      const rect = columnEl.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;

      dragStartPixel.current = offsetY;
      dragDay.current = dayDate;
      isActiveRef.current = true;

      setIsDragging(true);
      setDragDayDate(dayDate);
      setSelectionStyle({ top: offsetY, height: 0 });

      const moveHandler = (moveEvent: MouseEvent) => {
        if (!isActiveRef.current) return;
        const currentOffsetY = moveEvent.clientY - rect.top;

        const top = Math.min(dragStartPixel.current, currentOffsetY);
        const height = Math.abs(currentOffsetY - dragStartPixel.current);
        setSelectionStyle({ top, height });
      };

      const upHandler = (upEvent: MouseEvent) => {
        if (!isActiveRef.current || !dragDay.current) return;
        isActiveRef.current = false;
        setIsDragging(false);

        const endOffsetY = upEvent.clientY - rect.top;
        const startPx = dragStartPixel.current;
        const endPx = endOffsetY;

        const startMinsRaw = pixelsToMinutes(Math.min(startPx, endPx), hourHeight, startHour);
        const endMinsRaw = pixelsToMinutes(Math.max(startPx, endPx), hourHeight, startHour);

        let startMins = snapToNearest15(startMinsRaw);
        let endMins = snapToNearest15(endMinsRaw);

        if (endMins <= startMins) {
          endMins = startMins + 15;
        }

        const currentDay = dragDay.current;
        const startDate = new Date(currentDay);
        startDate.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0);

        const endDate = new Date(currentDay);
        endDate.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

        onComplete(startDate, endDate, currentDay);

        setSelectionStyle(null);
        setDragDayDate(null);
        dragDay.current = null;

        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    },
    [hourHeight, startHour, onComplete]
  );

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  return {
    isDragging,
    dragDayDate,
    selectionStyle,
    handlers: { onMouseDown },
  };
}
