import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
import { focusSession } from "@/lib/auth-schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      // Guests don't get saved history in this MVP config unless explicit, but let's just abort for unauthenticated
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      roomCode,
      focusScore,
      tabSwitches,
      idleMinutes,
      tasksCompleted,
      totalTasks,
      pomodoroEnabled = false,
      cyclesCompleted = 0,
      breakMinutes = 0,
    } = body;

    await db.insert(focusSession).values({
      id: nanoid(),
      roomCode,
      userId: session.user.id,
      userName: session.user.name || "Operative",
      focusScore: Number(focusScore) || 0,
      tabSwitches: Number(tabSwitches) || 0,
      idleMinutes: Number(idleMinutes) || 0,
      tasksCompleted: Number(tasksCompleted) || 0,
      totalTasks: Number(totalTasks) || 0,
      pomodoroEnabled,
      cyclesCompleted: Number(cyclesCompleted) || 0,
      breakMinutes: Number(breakMinutes) || 0,
    });

    return NextResponse.json({ success: true }, { status: 201 });
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
    const roomCode = searchParams.get("roomCode");

    if (!roomCode) {
      return NextResponse.json({ error: "roomCode is required" }, { status: 400 });
    }

    const sessions = await db.query.focusSession.findMany({
      where: eq(focusSession.roomCode, roomCode),
      orderBy: [desc(focusSession.focusScore), desc(focusSession.createdAt)],
      limit: 50,
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
