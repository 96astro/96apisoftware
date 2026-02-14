import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    const rawOrCompressed = report.responseChunks.length
      ? joinChunks(report.responseChunks.map((chunk) => chunk.data))
      : report.responseRaw;
    const rawText = rawOrCompressed;
    responseData = rawText ? JSON.parse(rawText) : null;
  } catch {
    try {
      const rawOrCompressed = report.responseChunks.length
        ? joinChunks(report.responseChunks.map((chunk) => chunk.data))
        : report.responseRaw;
      const fallback = decompressFromBase64(rawOrCompressed);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Boy Name</TableCell>
                  <TableCell>{report.boyName}</TableCell>
                  <TableCell className="font-medium">Girl Name</TableCell>
                  <TableCell>{report.girlName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Boy DOB / Time</TableCell>
                  <TableCell>{format(report.boyBirthDate, "dd MMM yyyy")} {report.boyBirthTime}</TableCell>
                  <TableCell className="font-medium">Girl DOB / Time</TableCell>
                  <TableCell>{format(report.girlBirthDate, "dd MMM yyyy")} {report.girlBirthTime}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Boy Place</TableCell>
                  <TableCell>{report.boyPlaceOfBirth}</TableCell>
                  <TableCell className="font-medium">Girl Place</TableCell>
                  <TableCell>{report.girlPlaceOfBirth}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">API Status</TableCell>
                  <TableCell>{report.apiStatus ?? "-"}</TableCell>
                  <TableCell className="font-medium">Job ID</TableCell>
                  <TableCell>{report.apiJobId ?? "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Created</TableCell>
                  <TableCell>{format(report.createdAt, "dd MMM yyyy, hh:mm a")}</TableCell>
                  <TableCell className="font-medium">Updated</TableCell>
                  <TableCell>{format(report.updatedAt, "dd MMM yyyy, hh:mm a")}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <JsonViewer title="Request Payload" data={report.requestPayload} />
        <JsonViewer title="Response Report" data={responseData} />
      </div>
    </>
  );
};

export default AyuMilanReportPage;
