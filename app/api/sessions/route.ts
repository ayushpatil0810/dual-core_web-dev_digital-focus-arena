import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
import { focusSession } from "@/lib/auth-schema";
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
      focusScore: focusScore.toString(),
      tabSwitches: tabSwitches.toString(),
      idleMinutes: idleMinutes.toString(),
      tasksCompleted: tasksCompleted.toString(),
      totalTasks: totalTasks.toString(),
      pomodoroEnabled,
      cyclesCompleted: cyclesCompleted.toString(),
      breakMinutes: breakMinutes.toString(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
