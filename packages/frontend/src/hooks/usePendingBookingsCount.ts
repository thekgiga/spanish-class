import { useQuery } from "@tanstack/react-query";
import { professorApi } from "@/lib/api";

export function usePendingBookingsCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ["professor-pending-bookings-count"],
    queryFn: async () => {
      const allSlots = await professorApi.getSlots({
        page: 1,
        limit: 100,
      });
      let pendingCount = 0;
      allSlots.data?.forEach((slot: any) => {
        if (slot.bookings) {
          const pending = slot.bookings.filter(
            (b: any) => b.status === "PENDING_CONFIRMATION",
          );
          pendingCount += pending.length;
        }
      });
      return { count: pendingCount };
    },
    enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
