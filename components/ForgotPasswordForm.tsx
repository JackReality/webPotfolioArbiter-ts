"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function ForgotPasswordForm({ lang }: { lang: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function post(body: object) {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = await post({ action: "send-code", email });
    setLoading(false);
    if (data.error) { setError(t(data.error, lang)); return; }
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = await post({ action: "verify", email, code, newPassword, confirmPassword });
    setLoading(false);
    if (data.error) { setError(t(data.error, lang)); return; }
    setSuccess(true);
  }

  async function handleResend() {
    setError(null);
    setCode("");
    await post({ action: "send-code", email });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold">{t("auth.resetTitle", lang)}</h2>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>{t("auth.passwordUpdated", lang)}</AlertDescription>
              </Alert>
              <Link href="/login" className={buttonVariants({ variant: "outline" }) + " w-full text-center"}>{t("auth.backToLogin", lang)}</Link>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {step === 1 ? (
                <form onSubmit={handleStep1} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{t("auth.resetSubtitle", lang)}</p>
                  <div className="space-y-1">
                    <Label>{t("auth.email", lang)}</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "..." : t("auth.sendResetLink", lang)}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleStep2} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{t("auth.resetSent", lang)}</p>
                  <div className="space-y-1">
                    <Label>Code</Label>
                    <Input value={code} onChange={e => setCode(e.target.value)} maxLength={6} autoComplete="one-time-code" required />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("auth.newPassword", lang)}</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("auth.confirmPassword", lang)}</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "..." : t("auth.updatePassword", lang)}
                  </Button>
                  <button type="button" onClick={handleResend} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                    {t("resetPassword.resendCode", lang)}
                  </button>
                </form>
              )}
              <p className="mt-4 text-sm text-center">
                <Link href="/login" className="text-muted-foreground hover:text-foreground">{t("auth.backToLogin", lang)}</Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
