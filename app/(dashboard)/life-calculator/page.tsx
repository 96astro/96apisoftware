import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LifeCalculatorForm from "@/app/(dashboard)/life-calculator/components/life-calculator-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Calculator | WowDash Admin Dashboard",
  description: "Life Calculator page.",
};

const LifeCalculatorPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Life Calculator" text="Life Calculator" />

      <Card className="card">
        <CardHeader>
          <CardTitle>Life Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <LifeCalculatorForm />
        </CardContent>
      </Card>
    </>
  );
};

export default LifeCalculatorPage;
