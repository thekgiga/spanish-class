import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Gift, Users, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ReferralLinkGenerator from "@/components/referrals/ReferralLinkGenerator";
import { getReferralStats } from "@/lib/api";

export function ReferralPage() {
  const { t } = useTranslation("common");

  const { data: stats } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: getReferralStats,
  });

  const statItems = [
    { label: t("referral.stats.total"), value: stats?.totalReferrals ?? 0, icon: Users, color: "text-spanish-teal-600" },
    { label: t("referral.stats.completed"), value: stats?.completedReferrals ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: t("referral.stats.pending"), value: stats?.pendingReferrals ?? 0, icon: Clock, color: "text-amber-600" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 flex items-center justify-center">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            {t("referral.page_title")}
          </h1>
          <p className="text-slate-500 text-sm">{t("referral.description")}</p>
        </div>
      </div>

      <ReferralLinkGenerator />

      <Card className="border-2 border-slate-100">
        <CardHeader>
          <CardTitle className="text-base">{t("referral.stats.title")}</CardTitle>
          <CardDescription>Track who you've referred to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {statItems.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center space-y-1">
                <div className={`flex justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
