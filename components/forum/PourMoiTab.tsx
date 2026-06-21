"use client";

import { useState, useEffect } from "react";
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

type Props = {
  lang: string;
  userId: number;
  userRole: string;
  displayName: string;
  isMod: boolean;
};

export default function PourMoiTab({ lang, userId, userRole, displayName, isMod }: Props) {
  const [comments, setComments] = useState<CommentWithContext[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSubjectId, setOpenSubjectId] = useState<number | null>(null);
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/forum/for-me")
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch((e) => console.error("[PourMoiTab] fetch error", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground py-4">{t("common.loading", lang)}</p>;
  }

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{t("forum.pourMoiEmpty", lang)}</p>;
  }

  return (
    <div className="space-y-2">
      {comments.map((c) => {
        const isLevel1 = c.forumCommentId !== null;
        const likes = Array.isArray(c.likes) ? (c.likes as number[]) : [];
        const liked = likes.includes(userId);

        return (
          <div key={c.id} className="grid grid-cols-3 gap-2 items-start">
            {/* Gauche : le commentaire (plus spécifique) */}
            <div className={`border rounded p-2 ${c.isStaff ? "border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40" : "bg-card"}`}>
              <div className="flex gap-2">
                <span className="text-sm mt-0.5">{isLevel1 ? "↩️" : "🗨️"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{c.displayName}</span>
                    <span>· {formatDate(c.createdAt, lang)}</span>
                    {isLevel1 && c.addressedTo && <span>(→ {c.addressedTo})</span>}
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

            {/* Milieu : parent (si niveau 1) ou sujet (si niveau 0) */}
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
