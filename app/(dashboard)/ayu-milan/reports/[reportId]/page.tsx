import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decompressFromBase64, joinChunks } from "@/lib/compression";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import JsonViewer from "./components/json-viewer";

export const metadata: Metadata = {
  title: "Ayu Milan Report | WowDash Admin Dashboard",
  description: "Ayu Milan detailed report.",
};

type PageProps = {
  params: Promise<{ reportId: string }>;
};

const OverviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-border py-3 last:border-b-0">
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-sm text-neutral-700 dark:text-neutral-200">{value}</p>
  </div>
);

const AyuMilanReportPage = async ({ params }: PageProps) => {
  const { reportId: reportIdParam } = await params;
  const reportId = Number(reportIdParam);
  if (Number.isNaN(reportId)) {
    notFound();
  }
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const report = await prisma.ayuMilanReport.findFirst({
    where: { id: reportId, userId: session.user.id },
    include: {
      responseChunks: {
        orderBy: { chunkIndex: "asc" },
        select: { data: true },
      },
    },
  });

  if (!report) {
    notFound();
  }

  let responseData: unknown = report.responseJson;
  try {
    const rawText = report.responseRaw;
    responseData = rawText ? JSON.parse(rawText) : null;
  } catch {
    try {
      const legacyChunkText = report.responseChunks.length
        ? joinChunks(report.responseChunks.map((chunk) => chunk.data))
        : report.responseRaw;
      const fallback = decompressFromBase64(legacyChunkText);
      responseData = fallback ? JSON.parse(fallback) : report.responseJson;
    } catch {
      responseData = report.responseJson;
    }
  }

  return (
    <>
      <DashboardBreadcrumb title="Ayu Milan Report" text="Ayu Milan Report" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/ayu-milan/reports">Back to Reports</Link>
        </Button>
        <Button asChild>
          <Link href="/ayu-milan">New Report</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="card">
          <CardHeader>
            <CardTitle>Ayu Milan Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <OverviewRow label="Boy Name" value={report.boyName} />
              <OverviewRow label="Girl Name" value={report.girlName} />
              <OverviewRow label="Boy DOB / Time" value={`${format(report.boyBirthDate, "dd MMM yyyy")} ${report.boyBirthTime}`} />
              <OverviewRow label="Girl DOB / Time" value={`${format(report.girlBirthDate, "dd MMM yyyy")} ${report.girlBirthTime}`} />
              <OverviewRow label="Boy Place" value={report.boyPlaceOfBirth} />
              <OverviewRow label="Girl Place" value={report.girlPlaceOfBirth} />
              <OverviewRow label="API Status" value={report.apiStatus ?? "-"} />
              <OverviewRow label="Job ID" value={report.apiJobId ?? "-"} />
              <OverviewRow label="Created" value={format(report.createdAt, "dd MMM yyyy, hh:mm a")} />
              <OverviewRow label="Updated" value={format(report.updatedAt, "dd MMM yyyy, hh:mm a")} />
            </div>
          </CardContent>
        </Card>

        <JsonViewer title="Request Payload" data={report.requestPayload} />
        <JsonViewer title="Response Report" data={responseData} />
      </div>
    </>
  );
};

export default AyuMilanReportPage;
