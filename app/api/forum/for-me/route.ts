import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as ForumCommentService from "@/services/ForumCommentService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const comments = await ForumCommentService.getForMe(session.id);
    return NextResponse.json(comments);
  } catch (e) {
    console.error("[forum/for-me GET]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
