import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

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
