import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import LifeCalculatorForm from "@/app/(dashboard)/life-calculator/components/life-calculator-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Life Calculator | WowDash Admin Dashboard",
  description: "Life Calculator page.",
};

const LifeCalculatorPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Life Calculator" text="Life Calculator" />

      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Life Calculator</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/life-calculator/reports">View Reports</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <LifeCalculatorForm />
        </CardContent>
      </Card>
    </>
  );
};

export default LifeCalculatorPage;
