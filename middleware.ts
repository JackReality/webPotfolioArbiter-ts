import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";

const ROUTE_ROLES: [string, string[]][] = [
  ["/admin", ["admin"]],
  ["/moderator", ["moderator", "admin"]],
  ["/trainings/private", ["client", "moderator", "admin"]],
  ["/subscriber", ["subscriber", "client", "moderator", "admin"]],
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/trainings/private/")) {
    const code = pathname.split("/")[3]?.toUpperCase();
    if (!code || !session.trainings?.includes(code)) {
      if (!session.id) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
  }

  if (pathname.startsWith("/community")) {
    if (!session.communityAccess) {
      if (!session.id) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }
  }

  for (const [route, allowedRoles] of ROUTE_ROLES) {
    if (pathname.startsWith(route)) {
      if (!session.role || !allowedRoles.includes(session.role)) {
        if (!session.role) {
          const loginUrl = new URL("/login", req.url);
          loginUrl.searchParams.set("returnUrl", pathname);
          return NextResponse.redirect(loginUrl);
        }
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
      break;
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/moderator/:path*",
    "/trainings/private/:path*",
    "/subscriber/:path*",
    "/community/:path*",
  ],
};
