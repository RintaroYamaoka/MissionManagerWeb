import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { sortTasksByDueAndIncomplete } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; direction: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    const { id, direction } = await params;
    if (direction !== "up" && direction !== "down") {
      return NextResponse.json({ error: "direction は up または down です" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { mission: { include: { genre: true } } },
    });
    if (!task || task.mission.genre.userId !== session.user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const siblings = await prisma.task.findMany({
      where: { missionId: task.missionId },
      orderBy: { order: "asc" },
    });
    const sorted = sortTasksByDueAndIncomplete(siblings);
    const idx = sorted.findIndex((t) => t.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) {
      return NextResponse.json({ error: "これ以上移動できません" }, { status: 400 });
    }

    const a = sorted[idx];
    const b = sorted[swapIdx];
    if (a.done !== b.done) {
      return NextResponse.json(
        { error: "期限が優先されます" },
        { status: 400 }
      );
    }
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (aDue !== bDue) {
      return NextResponse.json(
        { error: "期限が優先されます" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.task.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.task.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/tasks/[id]/move/[direction]:", error);
    return NextResponse.json(
      { error: "順序変更に失敗しました" },
      { status: 500 }
    );
  }
}
