import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import AstroFormForm from "@/app/(dashboard)/astro-form/components/astro-form-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Astro Form | WowDash Admin Dashboard",
  description: "Astro Form page.",
};

const AstroFormPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Astro Form" text="Astro Form" />

      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Astro Form</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/astro-form/reports">View Reports</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AstroFormForm />
        </CardContent>
      </Card>
    </>
  );
};

export default AstroFormPage;
