"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0];
}

type SubjectSnap = { id: number; type: string; title: string; status: string };

type CommentWithContext = CommentData & {
  subject: SubjectSnap;
  parent: { id: number; displayName: string; content: string; status: string } | null;
};

type SearchSubject = {
  id: number;
  type: string;
  title: string;
  displayName: string;
  content: string;
  status: string;
  isStaff: boolean;
  createdAt: string;
  _count: { comments: number };
};

type SearchResults = { subjects: SearchSubject[]; comments: CommentWithContext[] };

type Props = {
  lang: string;
  userId: number;
  userRole: string;
  displayName: string;
  isMod: boolean;
};

export default function RechercheTab({ lang, userId, userRole, displayName, isMod }: Props) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [addressee, setAddressee] = useState("");
  const [staffOnly, setStaffOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState(toDateInput(threeMonthsAgo));
  const [dateTo, setDateTo] = useState(toDateInput(new Date()));

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSubjectId, setOpenSubjectId] = useState<number | null>(null);
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);

  async function handleSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (author.trim()) params.set("author", author.trim());
      if (addressee.trim()) params.set("addressee", addressee.trim());
      if (staffOnly) params.set("staff", "1");
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/forum/search?${params}`);
      const data = await res.json();
      setResults(data.error ? null : data);
    } catch (e) {
      console.error("[RechercheTab] fetch error", e);
    } finally {
      setLoading(false);
    }
  }

  // Merged feed sorted recent→old
  type FeedItem =
    | { kind: "subject"; item: SearchSubject }
    | { kind: "comment"; item: CommentWithContext };

  const feed: FeedItem[] = results
    ? [
        ...results.subjects.map((s) => ({ kind: "subject" as const, item: s })),
        ...results.comments.map((c) => ({ kind: "comment" as const, item: c })),
      ].sort((a, b) => b.item.createdAt.localeCompare(a.item.createdAt))
    : [];

  return (
    <div className="space-y-4">
      {/* Formulaire */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("forum.searchQuery", lang)}</label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("forum.searchPlaceholder", lang)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("forum.searchAuthor", lang)}</label>
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("forum.searchAddressee", lang)}</label>
          <Input value={addressee} onChange={(e) => setAddressee(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="staff-only"
            checked={staffOnly}
            onChange={(e) => setStaffOnly(e.target.checked)}
            className="w-4 h-4 accent-teal-500"
          />
          <label htmlFor="staff-only" className="text-sm cursor-pointer">{t("forum.searchStaff", lang)}</label>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("forum.searchFrom", lang)}</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text.xs text-muted-foreground">{t("forum.searchTo", lang)}</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>
      <Button onClick={handleSearch} disabled={loading} size="sm">
        {loading ? "…" : t("forum.searchButton", lang)}
      </Button>

      {/* Résultats */}
      {results !== null && feed.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">{t("forum.searchEmpty", lang)}</p>
      )}

      <div className="space-y-2">
        {feed.map((entry) => {
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
              {/* Gauche : commentaire */}
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

              {/* Droite : sujet (si niveau 1) */}
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
