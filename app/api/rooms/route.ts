import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
import { headers } from "next/headers";
import { room } from "@/lib/auth-schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, duration, maxMembers } = await req.json();

    const code = nanoid(6).toUpperCase();

    await db.insert(room).values({
      id: nanoid(),
      code,
      name: name || "Sprint Session",
      hostId: session.user.id,
      duration: duration.toString(),
      maxMembers: maxMembers.toString(),
      status: "waiting",
    });

    return NextResponse.json({ code }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const existingRoom = await db.query.room.findFirst({
      where: eq(room.code, code.toUpperCase()),
      with: {
        host: true,
      }
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room: existingRoom }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
