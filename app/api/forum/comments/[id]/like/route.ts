import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as ForumCommentService from "@/services/ForumCommentService";
import { logError } from "@/services/LogService";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { id } = await params;
    await ForumCommentService.toggleLike(Number(id), session.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/comments/like POST]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/comments/[id]/like", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
