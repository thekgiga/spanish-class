import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { getMyReferralCode } from "@/lib/api";

export default function ReferralLinkGenerator() {
  const { t } = useTranslation("common");
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferralCode = async () => {
      try {
        const data = await getMyReferralCode();
        setReferralCode(data.referralCode);
      } catch (error) {
        console.error("Failed to load referral code:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReferralCode();
  }, []);

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading) {
    return <div>{t("referral.loading")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("referral.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{t("referral.description")}</p>

        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold">
            {t("referral.your_code", { code: referralCode })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
