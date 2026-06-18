import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import { AppError } from "@/lib/AppError";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session.role !== "admin") return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const { role } = await req.json();
    if (!role) return NextResponse.json({ error: "ERR_FIELDS_REQUIRED" }, { status: 400 });

    await UserService.changeRole(Number(id), role);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[admin/users/role]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
