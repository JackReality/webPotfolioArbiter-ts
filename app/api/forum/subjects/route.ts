import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as ForumSubjectService from "@/services/ForumSubjectService";
import * as UserService from "@/services/UserService";
import { logError } from "@/services/LogService";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    const isMod = session.role === "admin" || session.role === "moderator";
    const filter = req.nextUrl.searchParams.get("filter");

    if (filter === "archived") {
      return NextResponse.json(await ForumSubjectService.getArchived());
    }
    if (filter === "hidden") {
      if (!isMod) return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });
      return NextResponse.json(await ForumSubjectService.getHidden());
    }
    return NextResponse.json(await ForumSubjectService.getActive());
  } catch (e) {
    console.error("[forum/subjects GET]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { type, title, content } = await req.json();
    if (!type || !title || !content)
      return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });

    const allowedTypes = ["question", "share", "request", "bug", "announcement"];
    if (!allowedTypes.includes(type))
      return NextResponse.json({ error: "ERR_INVALID_TYPE" }, { status: 400 });

    if (type === "announcement" && !["admin", "moderator"].includes(session.role ?? ""))
      return NextResponse.json({ error: "ERR_FORBIDDEN" }, { status: 403 });

    const user = await UserService.getById(session.id);
    if (!user) return NextResponse.json({ error: "ERR_USER_NOT_FOUND" }, { status: 404 });

    const expiresAt =
      ["admin", "moderator"].includes(user.role) ? null : (user.axsCommunityExpire ?? null);
    const isStaff = session.role === "admin" || session.role === "moderator";

    const id = await ForumSubjectService.add(session.id, session.displayName ?? "", type, title, content, expiresAt, isStaff);
    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/subjects POST]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/subjects", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
