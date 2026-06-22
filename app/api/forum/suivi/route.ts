import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as ForumCommentService from "@/services/ForumCommentService";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const dateParam = req.nextUrl.searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const [data, prev, next] = await Promise.all([
      ForumCommentService.getSince(date),
      ForumCommentService.getPrevDate(date),
      ForumCommentService.getNextDate(date),
    ]);

    return NextResponse.json({
      date: date.toISOString().split("T")[0],
      prev: prev ? (prev instanceof Date ? prev.toISOString().split("T")[0] : String(prev).split("T")[0]) : null,
      next: next ? (next instanceof Date ? next.toISOString().split("T")[0] : String(next).split("T")[0]) : null,
      subjects: data.subjects,
      comments: data.comments,
    });
  } catch (e) {
    console.error("[forum/suivi GET]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
