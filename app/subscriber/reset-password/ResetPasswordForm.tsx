"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

export default function ResetPasswordForm({ lang }: { lang: string }) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function translateError(code: string): string {
    const translated = t(code, lang);
    return translated !== code ? translated : code;
  }

  async function sendCode() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/profile/send-code", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      setCodeSent(true);
      setCode("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(translateError(data.error ?? "ERR_EMAIL_SEND"));
    }
  }

  async function handleSubmit() {
    setError("");
    if (!code || !newPassword || !confirm) {
      setError(t("ERR_FIELDS_REQUIRED", lang));
      return;
    }
    if (newPassword !== confirm) {
      setError(t("ERR_PASSWORD_MISMATCH", lang));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json().catch(() => ({}));
      const errCode = data.error ?? "Erreur";
      if (errCode === "ERR_CODE_MAX_ATTEMPTS") {
        setCodeSent(false);
        setCode("");
      }
      setError(translateError(errCode));
    }
  }

  return (
    <main className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("resetPassword.title", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <>
              <p className="text-sm text-green-600">{t("resetPassword.success", lang)}</p>
              <Link href="/subscriber/profile" className="text-sm text-muted-foreground underline">
                {t("resetPassword.backToProfile", lang)}
              </Link>
            </>
          ) : !codeSent ? (
            <>
              <p className="text-sm text-muted-foreground">
                {t("resetPassword.codeInfo", lang)}
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={sendCode} disabled={loading}>
                {loading ? t("resetPassword.sending", lang) : t("resetPassword.sendCode", lang)}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t("resetPassword.codeSentInfo", lang)}
              </p>
              <div className="space-y-1">
                <Label htmlFor="code">{t("resetPassword.codeLabel", lang)}</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">{t("auth.newPassword", lang)}</Label>
                <Input
                  id="new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm">{t("auth.confirmPassword", lang)}</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? t("resetPassword.verifying", lang) : t("resetPassword.confirm", lang)}
              </Button>
              <button
                onClick={sendCode}
                className="text-sm text-muted-foreground underline"
                disabled={loading}
              >
                {t("resetPassword.resendCode", lang)}
              </button>
            </>
          )}
          {!success && (
            <Link href="/subscriber/profile" className="block text-sm text-muted-foreground underline">
              {t("resetPassword.backToProfile", lang)}
            </Link>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
