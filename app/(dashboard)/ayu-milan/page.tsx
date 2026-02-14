import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import AyuMilanForm from "@/app/(dashboard)/ayu-milan/components/ayu-milan-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ayu Milan | WowDash Admin Dashboard",
  description: "Ayu Milan page.",
};

const AyuMilanPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Ayu Milan" text="Ayu Milan" />

      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Ayu Milan</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/ayu-milan/reports">View Reports</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AyuMilanForm />
        </CardContent>
      </Card>
    </>
  );
};

export default AyuMilanPage;
