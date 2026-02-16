import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

function parseResponse(raw: string | null, json: unknown) {
  try {
    return raw ? JSON.parse(raw) : json;
  } catch {
    return json;
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

  const report = await prisma.astroFormReport.findFirst({
    where: { id: reportId, userId: session.user.id },
    select: {
      responseRaw: true,
      responseJson: true,
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({
    data: parseResponse(report.responseRaw, report.responseJson),
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

  const report = await prisma.astroFormReport.findFirst({
    where: {
      id: reportId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  await prisma.astroFormReport.delete({
    where: { id: report.id },
  });

  return NextResponse.json({ success: true });
}
