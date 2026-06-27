import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  ShieldOff,
  Shield,
  KeyRound,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/api";

const totpCodeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d{6}$/),
});
type TotpCodeValues = z.infer<typeof totpCodeSchema>;

type SetupState = "idle" | "loading-qr" | "qr" | "enabling";

export default function TwoFactorSetupPage() {
  const { twoFactorEnabled, setup2FA, confirm2FA, disable2FA } = useAuthStore();

  const [setupState, setSetupState] = useState<SetupState>("idle");
  const [qrData, setQrData] = useState<{ qrCodeDataUrl: string; recoveryCodes: string[] } | null>(
    null,
  );
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [showRegenSection, setShowRegenSection] = useState(false);
  const [regenCode, setRegenCode] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TotpCodeValues>({ resolver: zodResolver(totpCodeSchema) });

  const handleStartSetup = async () => {
    setSetupState("loading-qr");
    try {
      const data = await setup2FA();
      setQrData(data);
      setSetupState("qr");
    } catch {
      toast.error("Failed to generate 2FA setup. Please try again.");
      setSetupState("idle");
    }
  };

  const handleConfirm = async (values: TotpCodeValues) => {
    try {
      await confirm2FA(values.code);
      toast.success("Two-factor authentication enabled!");
      setSetupState("idle");
      setQrData(null);
      reset();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Invalid code. Please try again.");
    }
  };

  const handleDisable = async () => {
    setDisabling(true);
    try {
      await disable2FA();
      toast.success("Two-factor authentication disabled.");
      setShowDisableConfirm(false);
    } catch {
      toast.error("Failed to disable 2FA. Please try again.");
    } finally {
      setDisabling(false);
    }
  };

  const handleCopyCodes = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleRegenRecoveryCodes = async () => {
    if (!regenCode || regenCode.length !== 6) return;
    setRegenLoading(true);
    try {
      const result = await authApi.regenerateRecoveryCodes(regenCode);
      setNewRecoveryCodes(result.recoveryCodes);
      setRegenCode("");
      toast.success("New recovery codes generated. Store them securely!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; rateLimitMessage?: string };
      toast.error(err.rateLimitMessage || err.response?.data?.error || "Failed to regenerate codes. Check your TOTP code.");
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="w-7 h-7 text-spanish-teal-600" />
          Two-Factor Authentication
        </h1>
        <p className="text-slate-500 mt-2">
          Add an extra layer of security to your admin account. Once enabled, you'll need your
          authenticator app to log in.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <AnimatePresence mode="wait">
          {/* ── Enrolled state ── */}
          {twoFactorEnabled && setupState === "idle" && (
            <motion.div
              key="enrolled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">2FA is enabled</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your account is protected with two-factor authentication. You'll be prompted
                    for your authenticator code on every login.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Recovery codes</p>
                    <p className="text-xs text-slate-500">
                      Generated during setup. Store them securely.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowRegenSection(!showRegenSection); setNewRecoveryCodes(null); }}
                  className="text-xs"
                >
                  Regenerate
                </Button>
              </div>

              {showRegenSection && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Regenerating codes will invalidate all existing recovery codes. Enter your
                      authenticator code to confirm.
                    </p>
                  </div>
                  {newRecoveryCodes ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700">Your new recovery codes:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {newRecoveryCodes.map((code) => (
                          <code
                            key={code}
                            className="text-center bg-white border border-slate-200 rounded px-3 py-1.5 text-sm font-mono text-slate-700"
                          >
                            {code}
                          </code>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(newRecoveryCodes.join("\n"));
                          toast.success("Codes copied!");
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" /> Copy all codes
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={regenCode}
                        onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, ""))}
                        className="max-w-[140px] font-mono text-center"
                      />
                      <Button
                        onClick={handleRegenRecoveryCodes}
                        disabled={regenCode.length !== 6 || regenLoading}
                        size="sm"
                      >
                        {regenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setShowDisableConfirm(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Disable 2FA
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Unenrolled: start setup ── */}
          {!twoFactorEnabled && setupState === "idle" && (
            <motion.div
              key="unenrolled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">2FA is not enabled</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your admin account doesn't have two-factor authentication. We strongly
                    recommend enabling it to protect your account.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">What you'll need</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-spanish-teal-500 flex-shrink-0" />
                    An authenticator app (Google Authenticator, Authy, 1Password, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-spanish-teal-500 flex-shrink-0" />
                    30 seconds to scan a QR code
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-spanish-teal-500 flex-shrink-0" />
                    A secure place to save 8 recovery codes
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleStartSetup}
                className="bg-spanish-teal-600 hover:bg-spanish-teal-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Enable two-factor authentication
              </Button>
            </motion.div>
          )}

          {/* ── Loading QR ── */}
          {setupState === "loading-qr" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="w-8 h-8 text-spanish-teal-500 animate-spin" />
            </motion.div>
          )}

          {/* ── QR + enroll ── */}
          {setupState === "qr" && qrData && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Step 1: Scan this QR code</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Open your authenticator app and scan the QR code below.
                </p>
                <div className="flex justify-center">
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-xl inline-block">
                    <img
                      src={qrData.qrCodeDataUrl}
                      alt="2FA QR code"
                      className="w-44 h-44"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">Step 2: Save your recovery codes</h3>
                  <button
                    type="button"
                    onClick={handleCopyCodes}
                    className="flex items-center gap-1 text-xs text-spanish-teal-600 hover:text-spanish-teal-700 font-medium"
                  >
                    {copiedCodes ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy all</>
                    )}
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-3">
                  Store these somewhere safe. Each code can only be used once if you lose access to
                  your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {qrData.recoveryCodes.map((code) => (
                    <code
                      key={code}
                      className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-mono text-center"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Step 3: Enter the 6-digit code</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Enter the code from your authenticator app to confirm setup.
                </p>
                <form onSubmit={handleSubmit(handleConfirm)} className="flex items-start gap-3">
                  <div className="flex-1">
                    <Label htmlFor="totp-code" className="sr-only">Verification code</Label>
                    <Input
                      id="totp-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      autoComplete="one-time-code"
                      className="text-center text-lg tracking-[0.3em] font-mono"
                      {...register("code")}
                    />
                    {errors.code && (
                      <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-spanish-teal-600 hover:bg-spanish-teal-700 text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Disable confirm dialog */}
      <Dialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication?</DialogTitle>
            <DialogDescription>
              This will remove the extra security layer from your account. Anyone with your password
              would be able to log in without a second factor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDisableConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDisable}
              disabled={disabling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {disabling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disable 2FA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
