import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

async function logout(req: NextRequest) {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(new URL("/", req.url), 303);
}

export { logout as GET, logout as POST };
