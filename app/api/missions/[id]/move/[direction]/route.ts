import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

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

    const mission = await prisma.mission.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!mission || mission.genre.userId !== session.user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const siblings = await prisma.mission.findMany({
      where: { genreId: mission.genreId },
      orderBy: { order: "asc" },
    });
    const idx = siblings.findIndex((m) => m.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "ミッションが見つかりません" }, { status: 404 });
    }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      return NextResponse.json({ error: "これ以上移動できません" }, { status: 400 });
    }

    const [a, b] = [siblings[idx], siblings[swapIdx]];
    await prisma.$transaction([
      prisma.mission.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.mission.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/missions/[id]/move/[direction]:", error);
    return NextResponse.json(
      { error: "順序変更に失敗しました" },
      { status: 500 }
    );
  }
}
