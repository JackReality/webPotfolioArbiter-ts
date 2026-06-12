import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

async function logout(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  const session = await getSessionFromRequest(req, res);
  session.destroy();
  return res;
}

export { logout as GET, logout as POST };
