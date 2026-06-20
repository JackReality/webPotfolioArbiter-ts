import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as ForumSubjectService from "@/services/ForumSubjectService";
import * as ForumCommentService from "@/services/ForumCommentService";
import { logError } from "@/services/LogService";

type Ctx = { params: Promise<{ id: string }> };

function isEditable(createdAt: Date) {
  return Date.now() - createdAt.getTime() < 60 * 60 * 1000;
}

function isMod(role: string) {
  return role === "admin" || role === "moderator";
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { id } = await params;
    const commentId = Number(id);
    const comment = await ForumCommentService.getById(commentId);
    if (!comment) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });

    const { action, content } = await req.json();
    const role = session.role ?? "";
    const isOwner = comment.userId === session.id;

    if (action === "update") {
      if (!isOwner)
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      if (!isEditable(comment.createdAt))
        return NextResponse.json({ error: "ERR_EDIT_WINDOW_EXPIRED" }, { status: 403 });
      if (!content)
        return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });
      await ForumCommentService.update({ id: commentId, content });
    } else if (action === "pin" || action === "unpin") {
      const subject = await ForumSubjectService.getById(comment.forumSubjectId);
      const isSubjectOwner = subject?.userId === session.id;
      if (!isMod(role) && !isSubjectOwner)
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      await ForumCommentService.setPin(commentId, action === "pin");
    } else if (action === "hide" || action === "unhide") {
      if (!isMod(role))
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      await ForumCommentService.setStatusCascade(commentId, action === "hide" ? "hidden" : "visible");
    } else {
      return NextResponse.json({ error: "ERR_INVALID_ACTION" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/comments PATCH]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/comments/[id]", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { id } = await params;
    const commentId = Number(id);
    const comment = await ForumCommentService.getById(commentId);
    if (!comment) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });

    if (comment.userId !== session.id)
      return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });

    if (await ForumCommentService.hasReplies(commentId))
      return NextResponse.json({ error: "ERR_HAS_REPLIES" }, { status: 400 });

    await ForumCommentService.remove(commentId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/comments DELETE]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/comments/[id]", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
