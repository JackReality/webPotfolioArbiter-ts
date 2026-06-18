import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";
import { AppError } from "@/lib/AppError";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (session.role !== "admin") return NextResponse.json({ error: "ERR_UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    await UserService.remove(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: 400 });
    console.error("[admin/users/delete]", e);
    return NextResponse.json({ error: "ERR_SYSTEM" }, { status: 500 });
  }
}
