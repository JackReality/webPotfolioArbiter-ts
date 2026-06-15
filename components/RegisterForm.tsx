"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function RegisterForm({ lang }: { lang: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function post(body: object) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, lang }),
    });
    return res.json();
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName || !email || !password || !passwordConfirm) {
      setError(t("ERR_FIELDS_REQUIRED", lang));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t("ERR_PASSWORD_MISMATCH", lang));
      return;
    }
    setLoading(true);
    const data = await post({ action: "send-code", display_name: displayName, email, password, passwordConfirm });
    setLoading(false);
    if (data.error) { setError(t(data.error, lang)); return; }
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = await post({ action: "verify", email, code, display_name: displayName, password });
    setLoading(false);
    if (data.error) { setError(t(data.error, lang)); return; }
    router.push("/login?registered=1");
  }

  async function handleResend() {
    setError(null);
    setCode("");
    await post({ action: "send-code", display_name: displayName, email, password, passwordConfirm });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.signUp", lang)}</CardTitle>
          <CardDescription>{t("auth.signupSubtitle", lang)}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>{t("auth.signupSuccess", lang)}</AlertDescription>
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
                  <div className="space-y-1">
                    <Label>{t("auth.displayName", lang)}</Label>
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} required autoComplete="name" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("auth.email", lang)}</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("auth.password", lang)}</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("auth.confirmPassword", lang)}</Label>
                    <Input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required autoComplete="new-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "..." : t("auth.signUp", lang)}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleStep2} className="space-y-4">
                  <p className="text-sm text-muted-foreground">{t("auth.signupSentTitle", lang)} — {email}</p>
                  <div className="space-y-1">
                    <Label>{t("auth.verificationCode", lang)}</Label>
                    <Input value={code} onChange={e => setCode(e.target.value)} maxLength={6} autoComplete="one-time-code" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "..." : t("auth.verify", lang)}
                  </Button>
                  <button type="button" onClick={handleResend} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                    {t("resetPassword.resendCode", lang)}
                  </button>
                </form>
              )}
              <p className="mt-4 text-sm text-center text-muted-foreground">
                {t("auth.alreadyHaveAccount", lang)}{" "}
                <Link href="/login" className="text-foreground hover:underline">{t("auth.signIn", lang)}</Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
