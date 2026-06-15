import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";

const ROUTE_ROLES: [string, string[]][] = [
  ["/admin", ["admin"]],
  ["/moderator", ["moderator", "admin"]],
  ["/training_portfolio", ["client", "moderator", "admin"]],
  ["/training_photoshop", ["client", "moderator", "admin"]],
  ["/subscriber", ["subscriber", "client", "moderator", "admin"]],
];

const TRAINING_ROUTES: [string, string][] = [
  ["/training_portfolio", "PORTFOLIO"],
  ["/training_photoshop", "PHOTOSHOP"],
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const { pathname } = req.nextUrl;

  for (const [route, code] of TRAINING_ROUTES) {
    if (pathname.startsWith(route)) {
      if (!session.trainings?.includes(code)) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
      break;
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
    "/training_portfolio/:path*",
    "/training_photoshop/:path*",
    "/subscriber/:path*",
  ],
};
