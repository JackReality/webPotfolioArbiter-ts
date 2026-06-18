"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ContactForm({ lang }: { lang: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState(""); // honeypot
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
      body: JSON.stringify({ name, email, message, trap }),
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
          <CardTitle>Contact</CardTitle>
          <CardDescription>Envoyez-nous un message.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert>
              <AlertDescription>Message envoyé ! Nous vous répondrons sous peu.</AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot invisible */}
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
                  <Label>Nom</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                </div>
                <div className="space-y-1">
                  <Label>{t("auth.email", lang)}</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-1">
                  <Label>Message</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "..." : "Envoyer"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
