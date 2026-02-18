import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import type { AstroFormSchemaType } from "@/lib/zod";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AstroFormForm from "../../../components/astro-form-form";

export const metadata: Metadata = {
  title: "Edit Astro Chart | WowDash Admin Dashboard",
  description: "Edit Astro report chart and regenerate report.",
};

type PageProps = {
  params: Promise<{ reportId: string }>;
};

const EditAstroChartPage = async ({ params }: PageProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { reportId: reportIdParam } = await params;
  const reportId = Number(reportIdParam);
  if (Number.isNaN(reportId)) {
    notFound();
  }

  const report = await prisma.astroFormReport.findFirst({
    where: { id: reportId, userId: session.user.id },
    select: {
      id: true,
      name: true,
      gender: true,
      placeOfBirth: true,
      latitudeDeg: true,
      latitudeMin: true,
      latitudeDir: true,
      longitudeDeg: true,
      longitudeMin: true,
      longitudeDir: true,
      timezone: true,
      chartStyle: true,
      kpHoraryNumber: true,
      birthDate: true,
      birthTime: true,
    },
  });

  if (!report) {
    notFound();
  }

  const initialValues: Partial<AstroFormSchemaType> = {
    name: report.name,
    gender:
      report.gender === "male" || report.gender === "female" || report.gender === "other"
        ? report.gender
        : "male",
    placeOfBirth: report.placeOfBirth,
    latitudeDeg: String(report.latitudeDeg),
    latitudeMin: String(report.latitudeMin),
    latitudeDir: report.latitudeDir === "S" ? "S" : "N",
    longitudeDeg: String(report.longitudeDeg),
    longitudeMin: String(report.longitudeMin),
    longitudeDir: report.longitudeDir === "W" ? "W" : "E",
    timezoneOffset: String(report.timezone),
    chartStyle: report.chartStyle === "South Indian" ? "South Indian" : "North Indian",
    kpHoraryNumber: String(report.kpHoraryNumber),
    birthDate: report.birthDate.toISOString().slice(0, 10),
    birthTime: report.birthTime,
  };

  return (
    <>
      <DashboardBreadcrumb title="Edit Chart" text="Edit Chart" />
      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Edit Chart</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/astro-form/reports/${reportId}`}>Back to Report</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AstroFormForm
            initialValues={initialValues}
            submitUrl={`/api/astro-form/${reportId}`}
            submitButtonText="Update Report"
            pendingButtonText="Updating..."
            successMessage="Report updated successfully."
            successRedirectPath={`/astro-form/reports/${reportId}`}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default EditAstroChartPage;
