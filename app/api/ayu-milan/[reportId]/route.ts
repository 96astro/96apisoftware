import { auth } from "@/auth";
import { decompressFromBase64, joinChunks } from "@/lib/compression";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

function parseResponse(raw: string | null, json: unknown, chunks: string[]) {
  try {
    return raw ? JSON.parse(raw) : json;
  } catch {
    try {
      const legacyChunkText = chunks.length ? joinChunks(chunks) : raw ?? "";
      const fallback = decompressFromBase64(legacyChunkText);
      return fallback ? JSON.parse(fallback) : json;
    } catch {
      return json;
    }
  }
}

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId: reportIdParam } = await context.params;
  const reportId = Number(reportIdParam);

  if (Number.isNaN(reportId)) {
    return NextResponse.json({ error: "Invalid report id." }, { status: 400 });
  }

  const report = await prisma.ayuMilanReport.findFirst({
    where: { id: reportId, userId: session.user.id },
    select: {
      responseRaw: true,
      responseJson: true,
      responseChunks: {
        orderBy: { chunkIndex: "asc" },
        select: { data: true },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({
    data: parseResponse(
      report.responseRaw,
      report.responseJson,
      report.responseChunks.map((chunk) => chunk.data)
    ),
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId: reportIdParam } = await context.params;
  const reportId = Number(reportIdParam);

  if (Number.isNaN(reportId)) {
    return NextResponse.json({ error: "Invalid report id." }, { status: 400 });
  }

  const report = await prisma.ayuMilanReport.findFirst({
    where: {
      id: reportId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  await prisma.ayuMilanReport.delete({
    where: { id: report.id },
  });

  return NextResponse.json({ success: true });
}
