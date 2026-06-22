"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type SuiviSubject = {
  id: number;
  type: string;
  title: string;
  content: string;
  status: string;
  isStaff: boolean;
  displayName: string;
  createdAt: string;
};

type SuiviData = {
  date: string;
  prev: string | null;
  next: string | null;
  subjects: SuiviSubject[];
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
    try {
      const res = await fetch(`/api/forum/suivi?date=${date}`);
      const json: SuiviData = await res.json();
      setData(json);
    } catch (e) {
      console.error("[SuiviTab] fetch error", e);
    } finally {
      setLoading(false);
    }
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

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = data.date === todayStr;
  const hasContent = data.subjects.length > 0 || data.comments.length > 0;

  function handleToday() {
    load(todayStr, true);
  }

  // Merge subjects + comments, sort chronologically (asc)
  type FeedItem =
    | { kind: "subject"; item: SuiviSubject }
    | { kind: "comment"; item: CommentWithContext };

  const feed: FeedItem[] = [
    ...data.subjects.map(s => ({ kind: "subject" as const, item: s })),
    ...data.comments.map(c => ({ kind: "comment" as const, item: c })),
  ].sort((a, b) => a.item.createdAt.localeCompare(b.item.createdAt));

  return (
    <div className="space-y-4">
      {/* Navigation date — centrée */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            disabled={!data.prev}
            onClick={() => data.prev && load(data.prev, false)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium capitalize min-w-[220px] text-center">
            {formatDay(data.date)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => load(data.next ?? todayStr, true)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {!isToday && (
          <button
            onClick={handleToday}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            {t("forum.today", lang)}
          </button>
        )}
        {!data.prev && (
          <p className="text-xs text-muted-foreground">{t("forum.noPriorPosts", lang)}</p>
        )}
      </div>

      {!hasContent && (
        <p className="text-sm text-muted-foreground text-center py-6">
          {isToday ? t("forum.noPostsThisDay", lang) : t("forum.noPostsSince", lang)}
        </p>
      )}

      {/* Feed 3 colonnes */}
      <div className="space-y-2">
        {feed.map(entry => {
          if (entry.kind === "subject") {
            const s = entry.item;
            return (
              <div key={`s-${s.id}`} className="grid grid-cols-3 gap-2 items-start">
                <div className={`border rounded p-2 ${s.isStaff ? "border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40" : "bg-card"}`}>
                  <div className="flex gap-2">
                    <span className="text-base">{TYPE_PICTO[s.type] ?? "📝"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{s.title}</span>
                        <span>· {s.displayName}</span>
                        <span>· {formatDate(s.createdAt, lang)}</span>
                        {s.status === "hidden" && isMod && <span className="text-destructive">🚫</span>}
                        <button
                          onClick={() => { setOpenSubjectId(s.id); setOpenCommentId(null); }}
                          className="hover:text-foreground transition-colors"
                          title={t("forum.viewSubject", lang)}
                        >👁️</button>
                      </div>
                      <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">{s.content}</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2" />
              </div>
            );
          }

          const c = entry.item;
          const isLevel1 = c.forumCommentId !== null;
          const likes = Array.isArray(c.likes) ? (c.likes as number[]) : [];
          const liked = likes.includes(userId);

          return (
            <div key={`c-${c.id}`} className="grid grid-cols-3 gap-2 items-start">
              {/* Gauche : le commentaire (plus spécifique) */}
              <div className={`border rounded p-2 ${c.isStaff ? "border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40" : "bg-card"} ${c.status === "hidden" ? "opacity-60" : ""}`}>
                <div className="flex gap-2">
                  <span className="text-sm mt-0.5">{isLevel1 ? "↩️" : "🗨️"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{c.displayName}</span>
                      <span>· {formatDate(c.createdAt, lang)}</span>
                      {isLevel1 && c.addressedTo && <span>(→ {c.addressedTo})</span>}
                      {c.status === "hidden" && isMod && <span className="text-destructive">🚫</span>}
                      <span>{liked ? "❤️" : "🤍"}{likes.length > 0 ? ` ${likes.length}` : ""}</span>
                      <button
                        onClick={() => { setOpenSubjectId(c.subject.id); setOpenCommentId(c.id); }}
                        className="hover:text-foreground transition-colors"
                        title={t("forum.viewSubject", lang)}
                      >👁️</button>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2">{c.content}</p>
                  </div>
                </div>
              </div>

              {/* Milieu : parent du commentaire (si niveau 1) ou sujet (si niveau 0) */}
              <div className="border rounded p-2 bg-muted/20 text-muted-foreground">
                {isLevel1 && c.parent ? (
                  <div className="flex gap-2">
                    <span className="text-sm mt-0.5">🗨️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{c.parent.displayName}</p>
                      <p className="text-xs mt-0.5 line-clamp-2">{c.parent.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span className="text-sm">{TYPE_PICTO[c.subject.type] ?? "📝"}</span>
                    <p className="text-xs font-medium line-clamp-2">{c.subject.title}</p>
                  </div>
                )}
              </div>

              {/* Droite : sujet (uniquement si niveau 1) */}
              {isLevel1 ? (
                <div className="border rounded p-2 bg-muted/10 text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="text-sm">{TYPE_PICTO[c.subject.type] ?? "📝"}</span>
                    <p className="text-xs font-medium line-clamp-2">{c.subject.title}</p>
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>

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
