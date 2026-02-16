import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import JsonViewer from "./components/json-viewer";
import LazyResponseViewer from "./components/lazy-response-viewer";

export const metadata: Metadata = {
  title: "Astro Form Report | WowDash Admin Dashboard",
  description: "Astro Form detailed report.",
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

const AstroFormReportPage = async ({ params }: PageProps) => {
  const { reportId: reportIdParam } = await params;
  const reportId = Number(reportIdParam);
  if (Number.isNaN(reportId)) {
    notFound();
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const report = await prisma.astroFormReport.findFirst({
    where: {
      id: reportId,
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      gender: true,
      placeOfBirth: true,
      birthDate: true,
      birthTime: true,
      timezone: true,
      latitudeDeg: true,
      latitudeMin: true,
      latitudeDir: true,
      longitudeDeg: true,
      longitudeMin: true,
      longitudeDir: true,
      chartStyle: true,
      kpHoraryNumber: true,
      apiStatus: true,
      apiJobId: true,
      createdAt: true,
      updatedAt: true,
      requestPayload: true,
    },
  });

  if (!report) {
    notFound();
  }

  return (
    <>
      <DashboardBreadcrumb title="Astro Form Report" text="Astro Form Report" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/astro-form/reports">Back to Reports</Link>
        </Button>
        <Button asChild>
          <Link href="/astro-form">New Report</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="card">
          <CardHeader>
            <CardTitle>Astro Data Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <OverviewRow label="Name" value={report.name} />
              <OverviewRow label="Gender" value={report.gender} />
              <OverviewRow label="Place of Birth" value={report.placeOfBirth} />
              <OverviewRow label="Birth Date" value={format(report.birthDate, "dd MMM yyyy")} />
              <OverviewRow label="Birth Time" value={report.birthTime} />
              <OverviewRow label="Timezone" value={`UTC${report.timezone >= 0 ? "+" : ""}${report.timezone}`} />
              <OverviewRow label="Latitude" value={`${report.latitudeDeg} deg ${report.latitudeMin} min ${report.latitudeDir}`} />
              <OverviewRow label="Longitude" value={`${report.longitudeDeg} deg ${report.longitudeMin} min ${report.longitudeDir}`} />
              <OverviewRow label="Chart Style" value={report.chartStyle} />
              <OverviewRow label="KP Horary Number" value={String(report.kpHoraryNumber)} />
              <OverviewRow label="API Status" value={report.apiStatus ?? "-"} />
              <OverviewRow label="Job ID" value={report.apiJobId ?? "-"} />
              <OverviewRow label="Created" value={format(report.createdAt, "dd MMM yyyy, hh:mm a")} />
              <OverviewRow label="Updated" value={format(report.updatedAt, "dd MMM yyyy, hh:mm a")} />
            </div>
          </CardContent>
        </Card>

        <JsonViewer title="Request Payload" data={report.requestPayload} />
        <LazyResponseViewer reportId={report.id} />
      </div>
    </>
  );
};

export default AstroFormReportPage;
