"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { CommentData } from "./SubjectCard";
import SubjectDialog from "./SubjectDialog";

const MONTHS: Record<string, string[]> = {
  fr: ["jan.", "fév.", "mar.", "avr.", "mai", "juin", "juil.", "août", "sep.", "oct.", "nov.", "déc."],
  es: ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

function formatDate(iso: string, lang: string) {
  const d = new Date(iso);
  const months = MONTHS[lang] ?? MONTHS.en;
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const TYPE_PICTO: Record<string, string> = {
  question: "❓", share: "💬", request: "🙋", bug: "🐛", announcement: "📢",
};

type SubjectSnap = { id: number; type: string; title: string; status: string };

type CommentWithContext = CommentData & {
  subject: SubjectSnap;
  parent: { id: number; displayName: string; content: string; status: string } | null;
};

type SuiviData = {
  date: string;
  prev: string | null;
  next: string | null;
  subjects: Array<{ id: number; type: string; title: string; content: string; status: string; createdAt: string }>;
  comments: CommentWithContext[];
};

type Props = {
  initialDate: string | null;
  suiviKey: number;
  lang: string;
  userId: number;
  userRole: string;
  displayName: string;
  isMod: boolean;
};

export default function SuiviTab({ initialDate, suiviKey, lang, userId, userRole, displayName, isMod }: Props) {
  const [data, setData] = useState<SuiviData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSubjectId, setOpenSubjectId] = useState<number | null>(null);
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);

  async function load(date: string, updateLastRead: boolean) {
    setLoading(true);
    const res = await fetch(`/api/forum/suivi?date=${date}`);
    const json: SuiviData = await res.json();
    setData(json);
    setLoading(false);
    if (updateLastRead) {
      await fetch("/api/forum/last-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
    }
  }

  useEffect(() => {
    const startDate = initialDate ?? new Date().toISOString().split("T")[0];
    load(startDate, false);
  }, [initialDate]);

  useEffect(() => {
    if (suiviKey === 0) return;
    const dateToLoad = data?.date ?? initialDate ?? new Date().toISOString().split("T")[0];
    load(dateToLoad, false);
  }, [suiviKey]);

  function formatDay(iso: string) {
    return new Date(iso).toLocaleDateString(
      lang === "fr" ? "fr-CH" : lang === "es" ? "es-ES" : "en-GB",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    );
  }

  if (loading || !data) {
    return <p className="text-sm text-muted-foreground py-4">{t("common.loading", lang)}</p>;
  }

  const hasContent = data.subjects.length > 0 || data.comments.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={!data.prev}
          onClick={() => data.prev && load(data.prev, false)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="flex-1 text-center text-sm font-medium capitalize">
          {formatDay(data.date)}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={!data.next}
          onClick={() => data.next && load(data.next, true)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {!hasContent && (
        <p className="text-sm text-muted-foreground text-center py-6">
          {t("forum.noPostsThisDay", lang)}
        </p>
      )}

      {data.subjects.filter((s) => isMod || s.status !== "hidden").map((s) => (
        <Card key={`s-${s.id}`}>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <span className="text-xl">{TYPE_PICTO[s.type] ?? "📝"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-tight">{s.title}</p>
                <div className="flex items-baseline gap-1 flex-wrap text-xs text-muted-foreground mt-1">
                  <span>· {formatDate(s.createdAt, lang)}</span>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => { setOpenSubjectId(s.id); setOpenCommentId(null); }}
                      className="hover:text-foreground transition-colors"
                      title={t("forum.viewSubject", lang)}
                    >
                      👁️
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{s.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {data.comments.map((c) => {
        if (c.status === "hidden" && !isMod) return null;
        const likes = Array.isArray(c.likes) ? (c.likes as number[]) : [];
        const liked = likes.includes(userId);
        const isLevel1 = c.forumCommentId !== null;

        return (
          <Card key={`c-${c.id}`} className={c.status === "hidden" ? "border-red-200 opacity-75" : ""}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex gap-2">
                <span className="text-base mt-0.5">{isLevel1 ? "↩️" : "🗨️"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 flex-wrap text-xs text-muted-foreground">
                    <span className="font-medium">{c.displayName}</span>
                    <span>· {formatDate(c.createdAt, lang)}</span>
                    {isLevel1 && c.addressedTo && (
                      <span>(→ {c.addressedTo})</span>
                    )}
                    {c.status === "hidden" && isMod && <span className="text-destructive">🚫</span>}
                    <div className="flex gap-3 items-center">
                      <span>{liked ? "❤️" : "🤍"}{likes.length > 0 ? ` ${likes.length}` : ""}</span>
                      <button
                        onClick={() => { setOpenSubjectId(c.subject.id); setOpenCommentId(c.id); }}
                        className="hover:text-foreground transition-colors"
                        title={t("forum.viewSubject", lang)}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>

              {c.parent && (
                <details className="ml-7">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    🗨️ {c.parent.displayName}
                  </summary>
                  <p className="text-xs mt-1 text-muted-foreground pl-2">{c.parent.content}</p>
                </details>
              )}

              <details className="ml-7">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  {TYPE_PICTO[c.subject.type] ?? "📝"} {c.subject.title}
                </summary>
              </details>
            </CardContent>
          </Card>
        );
      })}

      <SubjectDialog
        subjectId={openSubjectId}
        highlightCommentId={openCommentId}
        lang={lang}
        userId={userId}
        userRole={userRole}
        displayName={displayName}
        isMod={isMod}
        onClose={() => { setOpenSubjectId(null); setOpenCommentId(null); }}
      />
    </div>
  );
}
