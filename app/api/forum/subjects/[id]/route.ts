import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as ForumSubjectService from "@/services/ForumSubjectService";
import { logError } from "@/services/LogService";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const subject = await ForumSubjectService.getByIdWithCount(Number(id));
    if (!subject) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });

    return NextResponse.json(subject);
  } catch (e) {
    console.error("[forum/subjects GET]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}

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
    const subjectId = Number(id);
    const subject = await ForumSubjectService.getById(subjectId);
    if (!subject) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });

    const { action, title, content } = await req.json();
    const role = session.role ?? "";
    const isOwner = subject.userId === session.id;

    if (action === "update") {
      if (!isOwner && !isMod(role))
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      if (!isMod(role) && !isEditable(subject.createdAt))
        return NextResponse.json({ error: "ERR_EDIT_WINDOW_EXPIRED" }, { status: 403 });
      if (!title || !content)
        return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });
      await ForumSubjectService.update({ id: subjectId, title, content, updatedAt: new Date() });
    } else if (action === "archive") {
      if (!isOwner && !isMod(role))
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      await ForumSubjectService.setStatus(subjectId, "archived");
    } else if (action === "pin" || action === "unpin") {
      if (!isMod(role))
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      await ForumSubjectService.setPin(subjectId, action === "pin");
    } else if (action === "hide" || action === "unhide") {
      if (!isMod(role))
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      await ForumSubjectService.setStatus(subjectId, action === "hide" ? "hidden" : "open");
    } else if (action === "open") {
      if (!isOwner && !isMod(role))
        return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      if (!subject.updatedAt || subject.updatedAt < oneMonthAgo)
        return NextResponse.json({ error: "ERR_REACTIVATION_EXPIRED" }, { status: 403 });
      await ForumSubjectService.setStatus(subjectId, "open");
    } else {
      return NextResponse.json({ error: "ERR_INVALID_ACTION" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/subjects PATCH]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/subjects/[id]", e, userId);
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
    const subjectId = Number(id);
    const subject = await ForumSubjectService.getById(subjectId);
    if (!subject) return NextResponse.json({ error: "ERR_NOT_FOUND" }, { status: 404 });

    const role = session.role ?? "";
    if (subject.userId !== session.id && !isMod(role))
      return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });

    await ForumSubjectService.remove(subjectId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/subjects DELETE]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/subjects/[id]", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
