import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { displayName } = await req.json();
  if (!displayName?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  await UserService.update({ id: session.id, displayName: displayName.trim() });
  return NextResponse.json({ ok: true });
}
