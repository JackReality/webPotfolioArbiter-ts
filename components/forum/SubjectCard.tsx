"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { t } from "@/lib/i18n";

const TYPE_PICTO: Record<string, string> = {
  question: "❓",
  share: "💬",
  request: "🙋",
  bug: "🐛",
  announcement: "📢",
};

export type SubjectData = {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  status: string;
  isPinned: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  _count: { comments: number };
};

export type CommentData = {
  id: number;
  forumSubjectId: number;
  forumCommentId: number | null;
  userId: number;
  displayName: string;
  addressedTo: string | null;
  content: string;
  status: string;
  isPinned: boolean;
  likes: number[];
  createdAt: string;
  updatedAt: string | null;
};

type Props = {
  subject: SubjectData;
  userId: number;
  userRole: string;
  displayName: string;
  isMod: boolean;
  lang: string;
  initialExpanded?: boolean;
  highlightCommentId?: number;
  onRefreshList?: () => void;
};

const URL_REGEX = /https?:\/\/[^\s]+/g;

function renderWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  const urls = text.match(URL_REGEX) ?? [];
  return parts.flatMap((part, i) => {
    const nodes: React.ReactNode[] = [part];
    if (urls[i]) {
      nodes.push(
        <a
          key={i}
          href={urls[i]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {urls[i]}
        </a>
      );
    }
    return nodes;
  });
}

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

export default function SubjectCard({ subject, userId, userRole, displayName, isMod, lang, initialExpanded = false, highlightCommentId, onRefreshList }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(initialExpanded);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<CommentData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);

  const isSubjectOwner = subject.userId === userId;
  const [withinEditWindowSubject, setWithinEditWindowSubject] = useState(false);
  useEffect(() => {
    setWithinEditWindowSubject(Date.now() - new Date(subject.createdAt).getTime() < 3_600_000);
  }, [subject.createdAt]);
  const canEditSubject = isSubjectOwner && withinEditWindowSubject;
  const canDeleteSubject = isSubjectOwner;
  const isHiddenSubject = subject.status === "hidden";

  const [subjectContentExpanded, setSubjectContentExpanded] = useState(false);
  const isSubjectLong = subject.content.length > 200 || subject.content.split("\n").length > 3;
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editTitle, setEditTitle] = useState(subject.title);
  const [editContent, setEditContent] = useState(subject.content);
  const [savingSubject, setSavingSubject] = useState(false);
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState(false);
  const [commentText, setCommentText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const picto = TYPE_PICTO[subject.type] ?? "📝";
  const isClosed = subject.status === "closed" || subject.status === "archived";

  async function loadComments() {
    setLoading(true);
    const res = await fetch(`/api/forum/subjects/${subject.id}/comments`);
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    if (initialExpanded) loadComments();
  }, []);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [comments]);

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && comments === null) await loadComments();
  }

  async function handleSaveSubject() {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSavingSubject(true);
    await fetch(`/api/forum/subjects/${subject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", title: editTitle.trim(), content: editContent.trim() }),
    });
    setSavingSubject(false);
    setIsEditingSubject(false);
    router.refresh();
  }

  async function handleDeleteSubject() {
    await fetch(`/api/forum/subjects/${subject.id}`, { method: "DELETE" });
    router.refresh();
    onRefreshList?.();
  }

  async function handleToggleHideSubject() {
    await fetch(`/api/forum/subjects/${subject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isHiddenSubject ? "unhide" : "hide" }),
    });
    router.refresh();
    onRefreshList?.();
  }

  function handleReply(comment: CommentData) {
    setReplyTo(comment);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function handleLike(commentId: number) {
    await fetch(`/api/forum/comments/${commentId}/like`, { method: "POST" });
    await loadComments();
  }

  async function handleSubmitComment() {
    if (!commentText.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/forum/subjects/${subject.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim(), forumCommentId: replyTo?.id ?? null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(t(data.error, lang));
    } else {
      setCommentText("");
      setReplyTo(null);
      await loadComments();
    }
    setSubmitting(false);
  }

  const level0 = (comments ?? []).filter((c) => c.forumCommentId === null);
  const getReplies = (id: number) => (comments ?? []).filter((c) => c.forumCommentId === id);

  return (
    <Card className={subject.status === "hidden" ? "border-red-200 opacity-75" : ""}>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={handleExpand}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{picto}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight">{subject.title}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {subject.isPinned && <Badge variant="secondary">📌 {t("forum.pinned", lang)}</Badge>}
              {subject.status === "closed" && <Badge variant="outline">{t("forum.closed", lang)}</Badge>}
              {subject.status === "hidden" && isMod && <Badge variant="destructive">🚫 {t("forum.hidden", lang)}</Badge>}
              <span className="text-xs text-muted-foreground">
                {subject._count.comments} {t(subject._count.comments === 1 ? "forum.comment" : "forum.comments", lang)}
                {" · "}
                {formatDate(subject.createdAt, lang)}
              </span>
              <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                {canEditSubject && !isEditingSubject && (
                  <button onClick={() => { setIsEditingSubject(true); setExpanded(true); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">✏️</button>
                )}
                {canDeleteSubject && (
                  confirmDeleteSubject ? (
                    <>
                      <button onClick={() => setConfirmDeleteSubject(false)} className="text-red-500 hover:text-red-600 transition-colors text-xs">✖</button>
                      <button onClick={handleDeleteSubject} className="text-green-500 hover:text-green-600 transition-colors text-xs">✔</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDeleteSubject(true)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">🗑️</button>
                  )
                )}
                {isMod && (
                  <button onClick={handleToggleHideSubject} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {isHiddenSubject ? "✅" : "🚫"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 mt-1 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-1 pt-0 pb-3">
          {isEditingSubject ? (
            <div className="space-y-2 pb-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-sm font-semibold"
                maxLength={255}
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSubject} disabled={savingSubject || !editTitle.trim() || !editContent.trim()}>
                  {savingSubject ? "…" : t("forum.save", lang)}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setIsEditingSubject(false); setEditTitle(subject.title); setEditContent(subject.content); }}>
                  {t("forum.cancel", lang)}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className={`text-sm whitespace-pre-wrap ${!subjectContentExpanded && isSubjectLong ? "overflow-hidden max-h-[3.75rem]" : ""}`}>
                {renderWithLinks(subject.content)}
              </p>
              {isSubjectLong && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSubjectContentExpanded((v) => !v); }}
                  className="text-yellow-400 hover:text-yellow-500 transition-colors leading-none"
                >
                  {subjectContentExpanded ? "▲" : "▼"}
                </button>
              )}
            </>
          )}
          <Separator />

          {loading && <p className="text-sm text-muted-foreground">{t("common.loading", lang)}</p>}

          {!loading && comments !== null && comments.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("forum.noComments", lang)}</p>
          )}

          {(() => {
            const pinned = level0.filter((c) => c.isPinned);
            const regular = level0.filter((c) => !c.isPinned);

            const renderComment = (comment: CommentData, isPinned = false) => {
              const isHighlighted = comment.id === highlightCommentId;
              return (
              <div
                key={comment.id}
                ref={isHighlighted ? highlightRef : undefined}
                className={
                  isHighlighted
                    ? "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-md pl-3 py-1"
                    : isPinned
                    ? "border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-r-md pl-3 py-1"
                    : "border-b border-border/30 last:border-0"
                }
              >
                <CommentRow
                  comment={comment}
                  hasReplies={getReplies(comment.id).length > 0}
                  userId={userId}
                  isMod={isMod}
                  lang={lang}
                  onLike={handleLike}
                  onReply={handleReply}
                  onRefresh={loadComments}
                />
                {getReplies(comment.id).length > 0 && (
                  <div className="ml-7 mt-2 space-y-3 border-l-2 border-muted pl-3">
                    {getReplies(comment.id).map((reply) => {
                      const isReplyHighlighted = reply.id === highlightCommentId;
                      return (
                        <div
                          key={reply.id}
                          ref={isReplyHighlighted ? highlightRef : undefined}
                          className={isReplyHighlighted ? "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-md -ml-3 pl-3 py-1" : ""}
                        >
                          <CommentRow
                            comment={reply}
                            parentComment={comment}
                            userId={userId}
                            isMod={isMod}
                            lang={lang}
                            onLike={handleLike}
                            onReply={handleReply}
                            onRefresh={loadComments}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              );
            };

            return (
              <>
                {pinned.map((c) => renderComment(c, true))}
                {pinned.length > 0 && regular.length > 0 && (
                  <Separator className="my-1" />
                )}
                {regular.map((c) => renderComment(c, false))}
              </>
            );
          })()}

          {!isClosed && (
            <div className="space-y-2 pt-2">
              {replyTo && (
                <p className="text-xs text-muted-foreground">
                  ↩️ {t("forum.replyTo", lang)}{" "}
                  <strong>{replyTo.displayName}</strong>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-2 underline"
                  >
                    {t("forum.cancel", lang)}
                  </button>
                </p>
              )}
              <Textarea
                ref={textareaRef}
                placeholder={t("forum.writeComment", lang)}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? "…" : t("forum.send", lang)}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

type CommentRowProps = {
  comment: CommentData;
  parentComment?: CommentData | null;
  hasReplies?: boolean;
  userId: number;
  isMod: boolean;
  lang: string;
  onLike: (id: number) => void;
  onReply: (c: CommentData) => void;
  onRefresh: () => void;
};

function CommentRow({ comment, parentComment, hasReplies = false, userId, isMod, lang, onLike, onReply, onRefresh }: CommentRowProps) {
  const likes = Array.isArray(comment.likes) ? (comment.likes as number[]) : [];
  const liked = likes.includes(userId);
  const isLevel1 = comment.forumCommentId !== null;
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isLong = comment.content.length > 200 || comment.content.split("\n").length > 3;

  const isOwner = comment.userId === userId;
  const [withinEditWindow, setWithinEditWindow] = useState(false);
  useEffect(() => {
    setWithinEditWindow(Date.now() - new Date(comment.createdAt).getTime() < 3_600_000);
  }, [comment.createdAt]);
  const canEdit = isOwner && withinEditWindow;
  const canDelete = isOwner && !hasReplies;
  const isHidden = comment.status === "hidden";

  if (isHidden && !isMod) return null;

  async function handleSaveEdit() {
    if (!editText.trim()) return;
    setSaving(true);
    await fetch(`/api/forum/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", content: editText.trim() }),
    });
    setSaving(false);
    setIsEditing(false);
    onRefresh();
  }

  async function handleDelete() {
    await fetch(`/api/forum/comments/${comment.id}`, { method: "DELETE" });
    onRefresh();
  }

  async function handleToggleHide() {
    await fetch(`/api/forum/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isHidden ? "unhide" : "hide" }),
    });
    onRefresh();
  }

  return (
    <div className={`flex gap-2 ${isHidden ? "text-red-400" : ""}`}>
      <span className="text-base mt-0.5">{isLevel1 ? "↩️" : "🗨️"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 flex-wrap text-xs text-muted-foreground">
          <span className="font-medium">{comment.displayName}</span>
          <span>· {formatDate(comment.createdAt, lang)}</span>
          {isLevel1 && comment.addressedTo && parentComment && (
            <span className="text-xs text-muted-foreground">
              (→ {comment.addressedTo} · {formatDate(parentComment.createdAt, lang)})
            </span>
          )}
          {isHidden && isMod && <span className="text-xs text-destructive">🚫</span>}
          <div className="flex gap-3 items-center">
            <button onClick={() => onLike(comment.id)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {liked ? "❤️" : "🤍"}{likes.length > 0 ? ` ${likes.length}` : ""}
            </button>
            {!isEditing && (
              <button onClick={() => onReply(comment)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ↩️
              </button>
            )}
            {canEdit && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ✏️
              </button>
            )}
            {canDelete && (
              confirmDelete ? (
                <>
                  <button onClick={() => setConfirmDelete(false)} className="text-red-500 hover:text-red-600 transition-colors text-xs">✖</button>
                  <button onClick={handleDelete} className="text-green-500 hover:text-green-600 transition-colors text-xs">✔</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                  🗑️
                </button>
              )
            )}
            {isMod && !isLevel1 && (
              <button
                onClick={async () => {
                  await fetch(`/api/forum/comments/${comment.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: comment.isPinned ? "unpin" : "pin" }),
                  });
                  onRefresh();
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {comment.isPinned ? "📌" : "📍"}
              </button>
            )}
            {isMod && (
              <button onClick={handleToggleHide} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {isHidden ? "✅" : "🚫"}
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-1 space-y-1">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={saving || !editText.trim()}>
                {saving ? "…" : t("forum.save", lang)}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditText(comment.content); }}>
                {t("forum.cancel", lang)}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className={`text-sm mt-0.5 whitespace-pre-wrap ${!expanded && isLong ? "overflow-hidden max-h-[3.75rem]" : ""}`}>
              {renderWithLinks(comment.content)}
            </p>
            {isLong && (
              <button onClick={() => setExpanded((v) => !v)} className="text-yellow-400 hover:text-yellow-500 transition-colors leading-none">
                {expanded ? "▲" : "▼"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
