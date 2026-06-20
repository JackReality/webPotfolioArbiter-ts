"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";

const BASE_TYPES = [
  { value: "question", labelKey: "forum.typeQuestion", emoji: "❓" },
  { value: "share",    labelKey: "forum.typeShare",    emoji: "💬" },
  { value: "request",  labelKey: "forum.typeRequest",  emoji: "🙋" },
  { value: "bug",      labelKey: "forum.typeBug",      emoji: "🐛" },
];

const MOD_TYPES = [
  { value: "announcement", labelKey: "forum.typeAnnouncement", emoji: "📢" },
];

interface Props {
  lang: string;
  role: string;
}

export default function NewSubjectForm({ lang, role }: Props) {
  const router = useRouter();
  const isMod = role === "admin" || role === "moderator";
  const types = isMod ? [...BASE_TYPES, ...MOD_TYPES] : BASE_TYPES;

  const [type, setType] = useState("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/forum/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: title.trim(), content: content.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(t(data.error ?? "ERR_SYSTEM", lang));
      setSubmitting(false);
    } else {
      router.push("/community");
    }
  }

  return (
    <main className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("forum.newSubject", lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>{t("forum.newSubjectType", lang)}</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "question")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((tp) => (
                  <SelectItem key={tp.value} value={tp.value}>
                    {tp.emoji} {t(tp.labelKey, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t("forum.newSubjectTitle", lang)}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("forum.newSubjectTitle", lang)}
              maxLength={255}
            />
          </div>

          <div className="space-y-1">
            <Label>{t("forum.newSubjectContent", lang)}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("forum.newSubjectContent", lang)}
              rows={6}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !content.trim()}
            >
              {submitting ? "…" : t("forum.newSubjectSubmit", lang)}
            </Button>
            <Button variant="outline" onClick={() => router.push("/community")}>
              {t("forum.cancel", lang)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
