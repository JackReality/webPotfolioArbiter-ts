import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as UserService from "@/services/UserService";

const VALID_LANGUAGES = ["fr", "en", "es"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { language } = await req.json();
  if (!VALID_LANGUAGES.includes(language))
    return NextResponse.json({ error: "Langue invalide" }, { status: 400 });

  await UserService.update({ id: session.id, language });
  return NextResponse.json({ ok: true });
}
