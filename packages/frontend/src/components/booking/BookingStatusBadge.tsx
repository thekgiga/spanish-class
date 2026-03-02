import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle, Ban } from "lucide-react";
import { BookingStatus } from "@spanish-class/shared";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export default function BookingStatusBadge({
  status,
  className,
}: BookingStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: CheckCircle,
          variant: "default" as const,
          className:
            "bg-edu-emerald-100 text-edu-emerald-800 hover:bg-edu-emerald-100 border-edu-emerald-200",
        };
      case "PENDING_CONFIRMATION":
        return {
          label: "Pending",
          icon: Clock,
          variant: "outline" as const,
          className: "bg-amber-50 text-amber-800 border-amber-300",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: XCircle,
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
        };
      case "EXPIRED":
        return {
          label: "Expired",
          icon: AlertCircle,
          variant: "neutral" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "CANCELLED_BY_STUDENT":
      case "CANCELLED_BY_PROFESSOR":
        return {
          label: "Cancelled",
          icon: Ban,
          variant: "neutral" as const,
          className: "bg-gray-100 text-gray-600 border-gray-200",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          icon: CheckCircle,
          variant: "neutral" as const,
          className: "bg-edu-blue-100 text-edu-blue-800 border-edu-blue-200",
        };
      case "NO_SHOW":
        return {
          label: "No Show",
          icon: AlertCircle,
          variant: "destructive" as const,
          className:
            "bg-edu-orange-100 text-edu-orange-800 hover:bg-edu-orange-100 border-edu-orange-200",
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          variant: "neutral" as const,
          className: "",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
