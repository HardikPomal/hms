import { NextResponse } from "next/server";
import { getDB } from "@/lib/db/db";

export async function GET() {
  try {
    const db = await getDB();
    const all = await db.getAll("medical_entities");
    const afp = all.filter(e => e.name.includes("Alpha-Fetoprotein"));
    return NextResponse.json({ afp });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
