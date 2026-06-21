"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import SubjectCard, { type SubjectData } from "./SubjectCard";

type Props = {
  subjectId: number | null;
  highlightCommentId?: number | null;
  lang: string;
  userId: number;
  userRole: string;
  displayName: string;
  isMod: boolean;
  onClose: () => void;
};

export default function SubjectDialog({ subjectId, highlightCommentId, lang, userId, userRole, displayName, isMod, onClose }: Props) {
  const [subject, setSubject] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) { setSubject(null); return; }
    setLoading(true);
    fetch(`/api/forum/subjects/${subjectId}`)
      .then((r) => r.json())
      .then((data) => setSubject(data.error ? null : data))
      .finally(() => setLoading(false));
  }, [subjectId]);

  return (
    <Dialog open={subjectId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[75vw] max-w-[75vw] max-h-[85vh] overflow-y-auto">
        {loading && (
          <p className="text-sm text-muted-foreground py-4">{t("common.loading", lang)}</p>
        )}
        {!loading && subject && (
          <SubjectCard
            subject={subject}
            userId={userId}
            userRole={userRole}
            displayName={displayName}
            isMod={isMod}
            lang={lang}
            initialExpanded
            highlightCommentId={highlightCommentId ?? undefined}
            readOnly={subject.status === "archived" || subject.status === "hidden"}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
