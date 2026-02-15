import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle, Ban } from "lucide-react";
import { BookingStatus } from "@spanish-class/shared";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export default function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: CheckCircle,
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case "PENDING_CONFIRMATION":
        return {
          label: "Pending",
          icon: Clock,
          variant: "outline" as const,
          className: "bg-yellow-50 text-yellow-800 border-yellow-300",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: XCircle,
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-100",
        };
      case "EXPIRED":
        return {
          label: "Expired",
          icon: AlertCircle,
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800",
        };
      case "CANCELLED_BY_STUDENT":
      case "CANCELLED_BY_PROFESSOR":
        return {
          label: "Cancelled",
          icon: Ban,
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-600",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          icon: CheckCircle,
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800",
        };
      case "NO_SHOW":
        return {
          label: "No Show",
          icon: AlertCircle,
          variant: "destructive" as const,
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          variant: "secondary" as const,
          className: "",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ""}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
