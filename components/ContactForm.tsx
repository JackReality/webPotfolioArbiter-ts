"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ContactForm({ lang }: { lang: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message, trap }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(t(data.error, lang)); return; }
    setSuccess(true);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("contact.title", lang)}</CardTitle>
          <CardDescription>{t("contact.description", lang)}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-lg">{t("contact.successTitle", lang)}</p>
              <p className="text-sm text-muted-foreground">{t("contact.successDetail", lang)}</p>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={trap}
                  onChange={e => setTrap(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none" }}
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <Label>{t("contact.name", lang)}</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                </div>
                <div className="space-y-1">
                  <Label>{t("auth.email", lang)}</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-1">
                  <Label>{t("contact.subject", lang)}</Label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} required maxLength={150} />
                </div>
                <div className="space-y-1">
                  <Label>{t("contact.message", lang)}</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("contact.sending", lang) : t("contact.send", lang)}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
