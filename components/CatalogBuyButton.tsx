"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CatalogBuyButton({
  trainingId,
  lang,
  isFree = false,
}: {
  trainingId: number;
  lang: string;
  isFree?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainingId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.status === 401) { window.location.href = "/login"; return; }
    if (data.error) { setError(t(data.error, lang)); return; }
    if (data.url) window.location.href = data.url;
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleBuy} disabled={loading} size="lg">
        {loading ? "..." : t(isFree ? "catalog.getFree" : "catalog.buy", lang)}
      </Button>
    </div>
  );
}
