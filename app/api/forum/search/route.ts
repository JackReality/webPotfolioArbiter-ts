import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as ForumSearchService from "@/services/ForumSearchService";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id || !session.communityAccess)
      return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const isMod = session.role === "admin" || session.role === "moderator";
    const { searchParams } = req.nextUrl;

    const q = searchParams.get("q") ?? undefined;
    const author = searchParams.get("author") ?? undefined;
    const addressee = searchParams.get("addressee") ?? undefined;
    const staffOnly = searchParams.get("staff") === "1";

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const dateFrom = fromParam ? new Date(fromParam) : threeMonthsAgo;
    const dateTo = toParam ? new Date(toParam) : new Date();
    dateTo.setHours(23, 59, 59, 999);

    const results = await ForumSearchService.search({ query: q, dateFrom, dateTo, author, addressee, staffOnly, includeHidden: isMod });
    return NextResponse.json(results);
  } catch (e) {
    console.error("[forum/search GET]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
