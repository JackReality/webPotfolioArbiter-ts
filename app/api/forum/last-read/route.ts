import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/AppError";
import * as UserService from "@/services/UserService";
import { logError } from "@/services/LogService";

export async function PATCH(req: NextRequest) {
  let userId: number | undefined;
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });
    userId = session.id;

    const { date } = await req.json();
    if (!date) return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });

    await UserService.update({ id: session.id, forumLastReadDate: new Date(date) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[forum/last-read PATCH]", e);
    if (process.env.NODE_ENV === "production") await logError("/api/forum/last-read", e, userId);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
