import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp } from "lucide-react";

export function AdminInsightsPage() {
  return (
    <div>
      <PageHeader
        title="Insights"
        description="Teaching analytics and student engagement overview."
      />
      <div className="mt-8">
        <EmptyState
          icon={<TrendingUp className="h-10 w-10" />}
          title="Insights coming soon"
          description="Detailed teaching analytics will be available in a future update."
        />
      </div>
    </div>
  );
}
