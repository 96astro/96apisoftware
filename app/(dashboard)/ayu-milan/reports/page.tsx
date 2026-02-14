import { auth } from "@/auth";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import DeleteReportButton from "@/components/reports/delete-report-button";
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
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ayu Milan Reports | WowDash Admin Dashboard",
  description: "Ayu Milan reports history.",
};

const AyuMilanReportsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const reports = await prisma.ayuMilanReport.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      boyName: true,
      girlName: true,
      apiStatus: true,
      createdAt: true,
    },
  });

  return (
    <>
      <DashboardBreadcrumb title="Ayu Milan Reports" text="Ayu Milan Reports" />

      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Saved Reports</CardTitle>
          <Button asChild size="sm">
            <Link href="/ayu-milan">New Report</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              No reports yet. Submit the Ayu Milan form to generate one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boy Name</TableHead>
                  <TableHead>Girl Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.boyName}</TableCell>
                    <TableCell>{report.girlName}</TableCell>
                    <TableCell>{report.apiStatus ?? "-"}</TableCell>
                    <TableCell>{format(report.createdAt, "dd MMM yyyy, hh:mm a")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/ayu-milan/reports/${report.id}`}>View Report</Link>
                        </Button>
                        <DeleteReportButton
                          endpoint={`/api/ayu-milan/${report.id}`}
                          confirmText="Delete this Ayu Milan report?"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AyuMilanReportsPage;
