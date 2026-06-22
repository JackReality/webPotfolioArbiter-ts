"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Props {
  displayName: string;
  email: string;
  language: string;
  role: string;
  lang: string;
}

function refreshAndRedirect(lang?: string) {
  const url = lang
    ? `/api/auth/refresh-claims?returnUrl=/subscriber/profile&lang=${lang}`
    : `/api/auth/refresh-claims?returnUrl=/subscriber/profile`;
  window.location.href = url;
}

export default function ProfileForms({ displayName, email, language, role, lang }: Props) {
  const [name, setName] = useState(displayName);
  const [nameError, setNameError] = useState("");

  const [emailStep, setEmailStep] = useState<"idle" | "code-sent">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");

  async function handleUpdateName() {
    setNameError("");
    const res = await fetch("/api/profile/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name }),
    });
    if (res.ok) {
      refreshAndRedirect();
    } else {
      const data = await res.json();
      setNameError(t(data.error ?? "ERR_SYSTEM", lang));
    }
  }

  async function handleSetLanguage(lang: string) {
    await fetch("/api/profile/set-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    });
    refreshAndRedirect(lang);
  }

  async function handleRequestEmailChange() {
    setEmailError("");
    const res = await fetch("/api/profile/request-email-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail }),
    });
    if (res.ok) {
      setEmailStep("code-sent");
    } else {
      const data = await res.json();
      setEmailError(t(data.error ?? "ERR_SYSTEM", lang));
    }
  }

  async function handleConfirmEmailChange() {
    setEmailError("");
    const res = await fetch("/api/profile/confirm-email-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, code: otp }),
    });
    if (res.ok) {
      refreshAndRedirect();
    } else {
      const data = await res.json();
      setEmailError(t(data.error ?? "ERR_SYSTEM", lang));
    }
  }

  return (
    <div className="space-y-6">
      {/* Nom affiché */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.displayName", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="display-name">{t("profile.name", lang)}</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          <Button onClick={handleUpdateName}>{t("common.save", lang)}</Button>
        </CardContent>
      </Card>

      {/* Langue */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.language", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue={language ?? "fr"} onValueChange={(v) => v && handleSetLanguage(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Changement d'email */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.email", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("profile.currentEmail", lang)} : {email}</p>
          {emailStep === "idle" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="new-email">{t("profile.newEmail", lang)}</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              <Button onClick={handleRequestEmailChange}>{t("profile.sendCode", lang)}</Button>
            </>
          ) : (
            <>
              <p className="text-sm">{t("profile.codeSentTo", lang)} {newEmail}.</p>
              <div className="space-y-1">
                <Label htmlFor="otp">{t("profile.verificationCode", lang)}</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleConfirmEmailChange}>{t("profile.confirm", lang)}</Button>
                <Button
                  variant="outline"
                  onClick={() => { setEmailStep("idle"); setEmailError(""); setOtp(""); }}
                >
                  {t("common.cancel", lang)}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.security", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/subscriber/reset-password" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            {t("profile.changePassword", lang)}
          </Link>
          {role === "admin" && (
            <Link href="/admin/dashboard" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              {t("profile.administration", lang)}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
