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
import { decompressFromBase64 } from "@/lib/compression";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import JsonViewer from "./components/json-viewer";

export const metadata: Metadata = {
  title: "Life Calculator Report | WowDash Admin Dashboard",
  description: "Life Calculator detailed report.",
};

type PageProps = {
  params: Promise<{ reportId: string }>;
};

const LifeCalculatorReportPage = async ({ params }: PageProps) => {
  const { reportId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const report = await prisma.lifeCalculatorReport.findFirst({
    where: {
      id: reportId,
      userId: session.user.id,
    },
  });

  if (!report) {
    notFound();
  }

  let responseData: unknown = report.responseJson;
  try {
    const rawText = decompressFromBase64(report.responseRaw);
    responseData = rawText ? JSON.parse(rawText) : null;
  } catch {
    responseData = report.responseJson;
  }

  return (
    <>
      <DashboardBreadcrumb title="Life Calculator Report" text="Life Calculator Report" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/life-calculator/reports">Back to Reports</Link>
        </Button>
        <Button asChild>
          <Link href="/life-calculator">New Report</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="card">
          <CardHeader>
            <CardTitle>Astro Data Overview</CardTitle>
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
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>{report.name}</TableCell>
                  <TableCell className="font-medium">Gender</TableCell>
                  <TableCell className="capitalize">{report.gender}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Place of Birth</TableCell>
                  <TableCell>{report.placeOfBirth}</TableCell>
                  <TableCell className="font-medium">Birth Date</TableCell>
                  <TableCell>{format(report.birthDate, "dd MMM yyyy")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Birth Time</TableCell>
                  <TableCell>{report.birthTime}</TableCell>
                  <TableCell className="font-medium">Timezone</TableCell>
                  <TableCell>UTC{report.timezone >= 0 ? "+" : ""}{report.timezone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Latitude</TableCell>
                  <TableCell>{report.latitudeDeg} deg {report.latitudeMin} min {report.latitudeDir}</TableCell>
                  <TableCell className="font-medium">Longitude</TableCell>
                  <TableCell>{report.longitudeDeg} deg {report.longitudeMin} min {report.longitudeDir}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Chart Style</TableCell>
                  <TableCell>{report.chartStyle}</TableCell>
                  <TableCell className="font-medium">KP Horary Number</TableCell>
                  <TableCell>{report.kpHoraryNumber}</TableCell>
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

export default LifeCalculatorReportPage;
