"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError("");

    if (next !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const res = await fetch("/api/profile/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/subscriber/profile"), 2000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur");
    }
  }

  return (
    <main className="container mx-auto py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <p className="text-sm text-green-600">
              Mot de passe modifié. Redirection…
            </p>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="current">Mot de passe actuel</Label>
                <Input
                  id="current"
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">Nouveau mot de passe</Label>
                <Input
                  id="new"
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={handleSubmit}>
                Confirmer
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
