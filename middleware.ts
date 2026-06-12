import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";

const sessionOptions = {
  cookieName: "session",
  password: process.env.SESSION_SECRET ?? "changeme-au-moins-32-caracteres-secret",
  cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true },
};

// Routes et le rôle minimum requis (ordre : du plus restrictif au plus large)
const ROUTE_ROLES: [string, string[]][] = [
  ["/admin", ["admin"]],
  ["/moderator", ["moderator", "admin"]],
  ["/training_portfolio", ["client", "admin"]],
  ["/training_photoshop", ["client", "admin"]],
  ["/subscriber", ["subscriber", "client", "moderator", "admin"]],
  ["/profile", ["subscriber", "client", "moderator", "admin"]],
  ["/reset-password", ["subscriber", "client", "moderator", "admin"]],
  ["/myspace", ["subscriber", "client", "moderator", "admin"]],
  ["/download", ["subscriber", "client", "moderator", "admin"]],
];

// Codes formation requis par route
const TRAINING_ROUTES: [string, string][] = [
  ["/training_portfolio", "PORTFOLIO"],
  ["/training_photoshop", "PHOTOSHOP"],
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const { pathname } = req.nextUrl;

  // Vérification du code formation
  for (const [route, code] of TRAINING_ROUTES) {
    if (pathname.startsWith(route)) {
      if (!session.trainings?.includes(code)) {
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
      break;
    }
  }

  // Vérification du rôle
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
    "/profile",
    "/reset-password",
    "/myspace",
    "/download",
  ],
};
