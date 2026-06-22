import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as ForumSubjectService from "@/services/ForumSubjectService";
import * as ForumCommentService from "@/services/ForumCommentService";
import { logError } from "@/services/LogService";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    const { id } = await params;
    const isMod = session.role === "admin" || session.role === "moderator";
    const comments = await ForumCommentService.getBySubject(Number(id), isMod);
    return NextResponse.json(comments);
  } catch (e) {
    console.error("[forum/subjects/comments GET]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { id } = await params;
    const subjectId = Number(id);
    const subject = await ForumSubjectService.getById(subjectId);
    if (!subject) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });
    if (subject.status === "archived")
      return NextResponse.json({ error: "ERR_SUBJECT_CLOSED" }, { status: 403 });

    const { content, forumCommentId } = await req.json();
    if (!content) return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });

    const isStaff = session.role === "admin" || session.role === "moderator";
    let parentId: number | null = null;
    let addressedTo: string | null = null;
    let destUserId: number | null = null;

    if (forumCommentId) {
      const target = await ForumCommentService.getBySubject(subjectId).then((cs) =>
        cs.find((c) => c.id === Number(forumCommentId))
      );
      if (!target) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });
      // Flattening : si le commentaire cible est déjà niveau 1, on remonte au parent
      parentId = target.forumCommentId ?? target.id;
      addressedTo = target.displayName;
      // Notifier l'auteur du commentaire ciblé (pas soi-même)
      if (target.userId !== session.id) destUserId = target.userId;
    } else {
      // Commentaire niveau 0 : notifier le propriétaire du sujet (pas soi-même)
      if (subject.userId !== session.id) destUserId = subject.userId;
    }

    const commentId = await ForumCommentService.add(
      subjectId,
      parentId,
      session.id,
      session.displayName ?? "",
      addressedTo,
      content,
      destUserId,
      isStaff
    );
    return NextResponse.json({ id: commentId });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/subjects/comments POST]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/subjects/[id]/comments", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
